import { z } from "zod";

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
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(2_000).nullable(),
);

const currencyStringSchema = (minimum: number, maximum: number) => z.string()
  .trim()
  .regex(/^\d+$/)
  .transform(Number)
  .pipe(z.number().int().min(minimum).max(maximum));

export const roomCoreUpdateFormSchema = z.strictObject({
  monthlyRentKrw: currencyStringSchema(1, 100_000_000),
  depositKrw: currencyStringSchema(0, 1_000_000_000),
  maintenanceFeeKrw: currencyStringSchema(0, 1_000_000_000),
  description: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(2_000).nullable(),
  ),
});

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
