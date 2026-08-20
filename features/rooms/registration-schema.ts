import { z } from "zod";

import { roomStatusSchema } from "@/features/rooms/list-schema";

const registrantRelationshipSchema = z.enum(["owner", "familyProxy"]);
const buildingTypeSchema = z.enum(["villa", "apartment", "detachedHouse", "other"]);
const areaRangeSchema = z.enum([
  "upTo10Pyeong", "teensPyeong", "twentiesPyeong", "thirtiesPyeong",
  "fortiesPyeong", "fiftiesPyeong", "overFiftyPyeong", "unknown",
]);
const residentTypeSchema = z.enum(["ownerOnly", "withFamily", "withOtherTenants"]);
const residentGenderSchema = z.enum(["femaleOnly", "maleOnly", "mixed"]);
const rentalSpaceTypeSchema = z.enum(["onePrivateRoom", "other"]);
const privateRoomSizeSchema = z.enum(["small", "medium", "large", "unknown"]);
const privateRoomOptionSchema = z.enum([
  "bed", "desk", "chair", "airConditioner", "wifi", "doorLock", "wardrobe", "none",
]);
const kitchenPolicySchema = z.enum([
  "freeUse", "lightCookingOnly", "microwaveWaterPurifierOnly", "negotiable", "notAllowed",
]);
const livingRoomPolicySchema = z.enum([
  "freeUse", "sharedWithHost", "scheduledUseOnly", "restrictedUse", "notAllowed",
]);
const washingPolicySchema = z.enum([
  "freeUse", "scheduledUseOnly", "notifyHostBeforeUse", "negotiable", "notAllowed",
]);
const bathroomTypeSchema = z.enum([
  "tenantPrivate", "sharedWithHost", "sharedAmongTenants",
]);

const registrantSchema = z.strictObject({ registrantRelationship: registrantRelationshipSchema });
const locationSchema = z.strictObject({
  addressRoad: z.string().nullable(), addressDetail: z.string().nullable(),
  addressRegion: z.string().nullable(),
  buildingType: buildingTypeSchema, buildingTypeOther: z.string().nullable(),
  approximateLocation: z.string().nullable(),
});
const householdSchema = z.strictObject({
  areaRange: areaRangeSchema, totalRoomCount: z.number().int().nonnegative(),
  residentCount: z.number().int().nonnegative(), residentType: residentTypeSchema,
  residentGenderComposition: residentGenderSchema, elevatorAvailable: z.boolean(),
  parkingAvailable: z.boolean(),
  parkingType: z.enum(["freeAvailable", "freeFirstCome", "paid"]).nullable(),
  parkingDescription: z.string().nullable(),
});
const privateSpaceSchema = z.strictObject({
  rentalSpaceType: rentalSpaceTypeSchema, rentalSpaceTypeOther: z.string().nullable(),
  privateRoomSize: privateRoomSizeSchema,
  privateRoomOptions: z.array(privateRoomOptionSchema).readonly(),
});
const commonFacilitiesSchema = z.strictObject({
  kitchenUsagePolicy: kitchenPolicySchema, livingRoomUsagePolicy: livingRoomPolicySchema,
  washingMachineUsagePolicy: washingPolicySchema, bathroomUsageType: bathroomTypeSchema,
  bathroomDescription: z.string().nullable(),
});
const preferencesSchema = z.strictObject({
  visitorPolicy: z.enum(["allowed", "notAllowed", "negotiable"]), petAllowed: z.boolean(),
  smokingPreference: z.enum(["noPreference", "nonSmokerOnly"]),
  preferredGender: z.enum(["female", "male", "any"]),
  roomCapacity: z.enum(["one", "two", "threeOrMore"]),
  interactionPreference: z.enum(["quiet", "moderateInteraction", "any"]),
  additionalGuidance: z.string().nullable(),
});
const pricingSchema = z.strictObject({
  monthlyRentKrw: z.number().int().nonnegative(), depositKrw: z.number().int().nonnegative(),
  maintenanceFeeKrw: z.number().int().nonnegative(), moveInAvailableAt: z.iso.datetime(),
  minStayMonths: z.number().int().positive(),
});
const mediaSelectionSchema = z.strictObject({
  mediaIds: z.array(z.uuid()).readonly(), representativeMediaId: z.uuid(),
});
const descriptionsSchema = z.strictObject({
  roomDescription: z.string().nullable(), currentResidentsDescription: z.string().nullable(),
  precautions: z.string().nullable(),
});
const contactSchema = z.strictObject({
  contactName: z.string(), contactPhone: z.string(),
  preferredContactTime: z.enum(["morning", "afternoon", "lateAfternoon", "evening"]),
  preferredContactMethod: z.enum(["kakaoTalk", "phoneCall", "sms", "any"]),
  roomPublication: z.literal(true).nullable(), noFraudPledge: z.literal(true).nullable(),
});
export const roomMediaSchema = z.strictObject({
  id: z.uuid(), displayOrder: z.number().int().nonnegative(), isRepresentative: z.boolean(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  byteSize: z.number().int().nonnegative(), originalFilename: z.string(),
  readUrl: z.url(), readUrlExpiresAt: z.iso.datetime(),
});

export const registrationRoomSchema = z.strictObject({
  registrationContractVersion: z.literal(2), roomId: z.uuid(), roomStatus: roomStatusSchema,
  isPublic: z.boolean(), submittedAt: z.iso.datetime(),
  data: z.strictObject({
    registrant: registrantSchema, location: locationSchema, household: householdSchema,
    privateSpace: privateSpaceSchema, commonFacilities: commonFacilitiesSchema,
    preferences: preferencesSchema, pricing: pricingSchema, media: mediaSelectionSchema,
    descriptions: descriptionsSchema, contact: contactSchema,
  }),
  media: z.array(roomMediaSchema).readonly(),
}).readonly();

export type RegistrationRoom = z.infer<typeof registrationRoomSchema>;
export type RoomMedia = z.infer<typeof roomMediaSchema>;
