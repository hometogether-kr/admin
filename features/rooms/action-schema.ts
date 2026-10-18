import { z } from "zod";
import type { RoomDetail } from "./detail-schema";

import { REGISTRATION_BUILDING_TYPES, ROOM_NOTIFICATION_TEMPLATES } from "@/features/rooms/constants";
import type { RegistrationLocation } from "@/features/rooms/registration-schema";

const editableBuildingTypeSchema = z.enum(REGISTRATION_BUILDING_TYPES);

export const roomIdSchema = z.uuid();
export const mediaIdSchema = z.uuid();

export const reasonSchema = z.string().trim().min(1).max(1_000);
export const revisionMessageSchema = z.string().trim().min(1).max(2_000);
export const notificationTemplateSchema = z.enum(ROOM_NOTIFICATION_TEMPLATES);
export const addressHiddenSchema = z.enum(["true", "false"])
  .transform((value) => value === "true");
export const memoSchema = z.preprocess(
  (value) => typeof value === "string" ? value : undefined,
  z.string().trim().max(2_000).transform((value) => value === "" ? null : value),
);

const manwonStringSchema = (minimumKrw: number, maximumKrw: number) => z.string().trim().max(32)
  .regex(/^\d+(?:\.\d{1,4})?$/)
  .transform((value) => {
    const [whole, fraction = ""] = value.split(".");
    return Number(whole) * 10_000 + Number(fraction.padEnd(4, "0"));
  })
  .pipe(z.number().int().min(minimumKrw).max(maximumKrw));

export const roomCoreUpdateFormSchema = z.strictObject({
  monthlyRentManwon: manwonStringSchema(1, 100_000_000),
  depositManwon: manwonStringSchema(0, 1_000_000_000),
  maintenanceFeeManwon: manwonStringSchema(0, 1_000_000_000),
  description: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(2_000).nullable(),
  ),
}).transform(({ monthlyRentManwon, depositManwon, maintenanceFeeManwon, description }) => ({
  monthlyRentKrw: monthlyRentManwon,
  depositKrw: depositManwon,
  maintenanceFeeKrw: maintenanceFeeManwon,
  description,
}));

const nullableFormText = (maxLength: number) => z.string().trim().max(maxLength)
  .transform((value) => value === "" ? null : value);
const nullableFormNumber = (schema: z.ZodNumber, pattern: RegExp) => z.union([
  z.string().trim().length(0).transform(() => null),
  z.string().trim().regex(pattern).transform(Number).pipe(schema),
]);

export const roomMetadataFormSchema = z.strictObject({
  subtitle: nullableFormText(200),
  floor: nullableFormNumber(z.number().int().min(-2147483648).max(2147483647), /^-?\d+$/),
});
export type RoomMetadataValues = z.output<typeof roomMetadataFormSchema>;

export const ROOM_ADDRESS_FORM_FIELDS = [
  "buildingType", "buildingTypeOther", "addressRoad", "addressJibun", "addressDetail",
  "legalDongCode", "legalDongName", "sido", "sigungu", "buildingDong", "unitNumber",
  "latitude", "longitude",
] as const;

export const roomAddressFormSchema = z.strictObject({
  buildingType: editableBuildingTypeSchema,
  buildingTypeOther: nullableFormText(100),
  addressRoad: nullableFormText(255), addressJibun: nullableFormText(255),
  addressDetail: nullableFormText(255),
  legalDongCode: nullableFormText(10).pipe(z.string().regex(/^\d{10}$/).nullable()),
  legalDongName: nullableFormText(100), sido: nullableFormText(100), sigungu: nullableFormText(100),
  buildingDong: nullableFormText(100), unitNumber: nullableFormText(100),
  latitude: nullableFormNumber(z.number().min(-90).max(90), /^-?(?:\d+(?:\.\d*)?|\.\d+)$/),
  longitude: nullableFormNumber(z.number().min(-180).max(180), /^-?(?:\d+(?:\.\d*)?|\.\d+)$/),
}).superRefine((value, context) => {
  if (value.buildingType === "other" && value.buildingTypeOther === null) {
    context.addIssue({ code: "custom", path: ["buildingTypeOther"], message: "기타 건물 유형을 입력해 주세요." });
  }
  if ((value.latitude === null) !== (value.longitude === null)) {
    context.addIssue({ code: "custom", path: ["latitude"], message: "위도와 경도를 함께 입력하거나 모두 비워 주세요." });
    context.addIssue({ code: "custom", path: ["longitude"], message: "위도와 경도를 함께 입력하거나 모두 비워 주세요." });
  }
}).transform((value) => ({
  ...value,
  buildingTypeOther: value.buildingType === "other" ? value.buildingTypeOther : null,
}));

export type RoomAddressValues = z.output<typeof roomAddressFormSchema>;

export function readRoomAddressForm(formData: FormData) {
  return roomAddressFormSchema.safeParse(Object.fromEntries(
    ROOM_ADDRESS_FORM_FIELDS.map((field) => [field, formData.get(field)]),
  ));
}

export function buildRoomMetadataPatch(values: RoomMetadataValues, original: RoomMetadataValues) {
  return {
    ...(values.subtitle === original.subtitle ? {} : { subtitle: values.subtitle }),
    ...(values.floor === original.floor ? {} : { floor: values.floor }),
  };
}

export function buildRoomAddressPatch(values: RoomAddressValues, original: RegistrationLocation) {
  const patch: Record<string, string | number | null> = {};
  for (const field of ROOM_ADDRESS_FORM_FIELDS) {
    if (field === "latitude" || field === "longitude") continue;
    if (values[field] !== original[field]) patch[field] = values[field];
  }
  // Unchanged coordinates must not restore an old building's location after an address edit.
  if (values.latitude !== original.latitude || values.longitude !== original.longitude) {
    patch.latitude = values.latitude;
    patch.longitude = values.longitude;
  }
  return patch;
}

export function canVerifyRoomAddress(location: RegistrationLocation): boolean {
  const address = location.addressRoad ?? location.addressJibun;
  return Boolean(
    location.sido && location.sigungu && location.legalDongName
    && /^\d{10}$/.test(location.legalDongCode ?? "")
    && editableBuildingTypeSchema.safeParse(location.buildingType).success
    && address?.includes(location.sido) && address.includes(location.sigungu),
  );
}

export function getRoomPublicationState(room: RoomDetail) {
  const isV2 = room.registrationContractVersion === 2;
  const eligible = ["submitted", "inReview", "hidden"].includes(room.roomStatus);
  const verified = isV2 && room.title !== null
    && room.data.location.addressVerifiedAt !== null
    && room.data.location.addressVerifiedBy !== null
    && canVerifyRoomAddress(room.data.location);
  const canPublish = isV2 && eligible && verified && !room.isPublic;
  const canHide = isV2 ? room.roomStatus === "published" && room.isPublic : true;
  const needsAddressVerification = isV2 && eligible && !verified;
  const publishLabel = room.roomStatus === "hidden" ? "재게시" : "승인·게시";
  let notice: string;
  if (!isV2) {
    notice = "이전 등록 형식의 매물은 현재 승인·재게시 API에서 지원하지 않습니다.";
  } else if (room.roomStatus === "published" && room.isPublic) {
    notice = "공개 중입니다. 주소·건물 유형을 변경해 저장하면 공개가 중단되며, 주소 재확인 후 다시 게시해야 합니다.";
  } else if (room.roomStatus === "hidden") {
    notice = verified
      ? "숨김 상태입니다. 주소 확인이 완료되어 재게시할 수 있습니다."
      : "숨김 상태입니다. 주소 정보를 보완하고 주소 확인을 완료한 뒤 재게시해 주세요.";
  } else if (room.roomStatus === "inReview") {
    notice = verified
      ? "현재 비공개·재검토 상태입니다. 주소 확인이 완료되어 승인·게시할 수 있습니다."
      : "현재 비공개·재검토 상태입니다. 주소 정보를 보완하고 재확인한 뒤 승인·게시해 주세요.";
  } else if (room.roomStatus === "submitted") {
    notice = verified ? "주소 확인이 완료되었습니다. 승인·게시하면 공개됩니다."
      : "현재 비공개입니다. 저장된 주소를 확인한 뒤 승인·게시해 주세요.";
  } else {
    notice = "현재 매물 상태에서는 게시할 수 없습니다.";
  }
  return { canPublish, canHide, needsAddressVerification, publishLabel, notice };
}
