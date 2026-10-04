"use client";

import { useActionState, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { ActionFeedback } from "@/components/admin/action-feedback";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updateRoomAddress, verifyRoomAddress } from "@/features/rooms/actions";
import { buildRoomAddressPatch, canVerifyRoomAddress, readRoomAddressForm, roomAddressFormSchema, ROOM_ADDRESS_FORM_FIELDS } from "@/features/rooms/action-schema";
import { ConfirmedAction } from "@/features/rooms/components/confirmed-action";
import { REGISTRATION_BUILDING_TYPES } from "@/features/rooms/constants";
import { formatDate, registrationValueLabel } from "@/features/rooms/format";
import { RoomMutationCompletion } from "@/features/rooms/mutation-receipt";
import type { RegistrationLocation } from "@/features/rooms/registration-schema";
import { INITIAL_ADMIN_ACTION_RESULT } from "@/lib/actions/result";

type RoomAddressEditFormProps = {
  readonly roomId: string;
  readonly location: RegistrationLocation;
};

const ADDRESS_TEXT_FIELDS = [
  { name: "addressRoad", label: "도로명 주소", maxLength: 255 },
  { name: "addressJibun", label: "지번 주소", maxLength: 255 },
  { name: "sido", label: "시·도", maxLength: 100 },
  { name: "sigungu", label: "시·군·구", maxLength: 100 },
  { name: "legalDongName", label: "법정동", maxLength: 100 },
  { name: "legalDongCode", label: "법정동 코드", maxLength: 10 },
  { name: "buildingDong", label: "건물 동", maxLength: 100 },
  { name: "unitNumber", label: "호수", maxLength: 100 },
  { name: "addressDetail", label: "상세 주소", maxLength: 255 },
] as const;

export function RoomAddressEditForm({ roomId, location }: RoomAddressEditFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const saveConfirmed = useRef(false);
  const [values, setValues] = useState(() => Object.fromEntries(
    ROOM_ADDRESS_FORM_FIELDS.map((field) => [field, String(location[field] ?? "")]),
  ) as Record<(typeof ROOM_ADDRESS_FORM_FIELDS)[number], string>);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, submit, pending] = useActionState(
    updateRoomAddress.bind(null, roomId, location), INITIAL_ADMIN_ACTION_RESULT,
  );

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
      if (!ROOM_ADDRESS_FORM_FIELDS.some((field) => field === target.name)) return;
      const { name, value } = target;
      setValues((previous) => ({
        ...previous,
        [name]: value,
        // A changed address cannot keep the previous building's coordinates by accident.
        ...(["latitude", "longitude"].includes(name) ? {} : { latitude: "", longitude: "" }),
      }));
    }
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!saveConfirmed.current) {
      event.preventDefault();
      return;
    }
    saveConfirmed.current = false;
    const values = readRoomAddressForm(new FormData(event.currentTarget));
    if (!values.success) {
      event.preventDefault();
      setErrors(Object.fromEntries(values.error.issues.map((issue) => [
        String(issue.path[0]), issue.code === "custom" ? issue.message : "입력값을 확인해 주세요.",
      ])));
    }
  }

  const verified = location.addressVerifiedAt !== null;
  const parsedValues = roomAddressFormSchema.safeParse(values);
  const dirty = parsedValues.success
    ? Object.keys(buildRoomAddressPatch(parsedValues.data, location)).length > 0
    : ROOM_ADDRESS_FORM_FIELDS.some((field) => values[field] !== String(location[field] ?? ""));
  const buildingType = values.buildingType;
  const readyToVerify = canVerifyRoomAddress(location);
  const options = [
    ...(location.buildingType === "villa" ? [{ label: "빌라 (유형 재선택 필요)", value: "villa", disabled: true }] : []),
    ...REGISTRATION_BUILDING_TYPES.map((value) => ({ value, label: registrationValueLabel(value) })),
  ];

  return (
    <section aria-labelledby="room-address-heading" className="grid gap-4 border-t border-line-subtle pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-section font-semibold text-ink-strong" id="room-address-heading">주소·법정동</h2>
        <Badge variant={verified ? "success" : "warning"}>{verified ? "주소 확인 완료" : "주소 미확인"}</Badge>
        {verified ? <span className="text-compact text-ink-subtle">확인일 {formatDate(location.addressVerifiedAt)}</span> : null}
      </div>
      <form action={submit} className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} ref={formRef}>
        <RoomMutationCompletion result={result} roomId={roomId} />
        <Select error={errors.buildingType} id="room-building-type" label="건물 유형" name="buildingType" onChange={handleChange} options={options} required value={buildingType} />
        <Input disabled={buildingType !== "other"} error={errors.buildingTypeOther} id="room-building-type-other" label="기타 건물 유형" maxLength={100} name="buildingTypeOther" onChange={handleChange} required={buildingType === "other"} value={values.buildingTypeOther} />
        {buildingType !== "other" ? <input name="buildingTypeOther" type="hidden" value="" /> : null}
        {ADDRESS_TEXT_FIELDS.map(({ name, label, maxLength }) => (
          <Input
            error={errors[name]} id={`room-${name}`} key={name}
            label={label} maxLength={maxLength} name={name} onChange={handleChange} value={values[name]}
            {...(name === "legalDongCode" ? { inputMode: "numeric", pattern: "[0-9]{10}" } : {})}
          />
        ))}
        <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
          <Input error={errors.latitude} id="room-latitude" label="위도" max={90} min={-90} name="latitude" onChange={handleChange} step="any" type="number" value={values.latitude} />
          <Input error={errors.longitude} id="room-longitude" label="경도" max={180} min={-180} name="longitude" onChange={handleChange} step="any" type="number" value={values.longitude} />
        </div>
        <div className="flex flex-wrap items-start justify-end gap-3 sm:col-span-2">
          <div className="min-w-0 flex-1"><ActionFeedback result={result} /></div>
          <ConfirmDialog
            confirmDisabled={pending} confirmLabel="주소 저장"
            description="주소 변경 시 확인 상태가 초기화됩니다. 게시된 매물은 비공개·재검토 상태로 전환됩니다."
            disabled={pending || !dirty} id="room-address-save-confirm"
            onConfirm={() => {
              saveConfirmed.current = true;
              formRef.current?.requestSubmit();
              saveConfirmed.current = false;
            }}
            title="주소를 변경할까요?" triggerLabel={pending ? "저장 중" : "주소 저장"} triggerVariant="primary"
          />
        </div>
      </form>
      <div className="grid gap-3 border-t border-line-subtle pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="text-body text-ink-subtle">
          {dirty ? "저장하지 않은 변경 사항이 있습니다." : !readyToVerify
            ? "주소 확인에 필요한 도로명 또는 지번 주소, 시·도, 시·군·구, 법정동·코드 및 건물 유형을 확인해 주세요."
            : verified ? "주소 확인이 완료되었습니다." : "게시 전 주소 확인이 필요합니다."}
        </div>
        <ConfirmedAction
          action={verifyRoomAddress.bind(null, roomId)} confirmLabel="주소 확인 완료"
          description="저장된 주소와 법정동을 원본 자료와 대조했는지 확인해 주세요. 이 작업만으로 매물이 게시되지는 않습니다."
          disabled={dirty || !readyToVerify || verified || pending}
          id="room-address-verify-confirm" roomId={roomId}
          title="주소·법정동 확인을 완료할까요?" triggerLabel="주소 확인 완료"
        />
      </div>
    </section>
  );
}
