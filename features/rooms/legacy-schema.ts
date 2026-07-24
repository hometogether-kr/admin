import { z } from "zod";

import { roomStatusSchema } from "@/features/rooms/list-schema";

const nullableIsoDate = z.iso.datetime().nullable();
const nullableNumber = z.number().nullable();

export const legacyRoomSchema = z.strictObject({
  id: z.uuid(),
  hostId: z.uuid(),
  title: z.string().nullable(),
  propertyType: z.enum([
    "studio", "twoBedroom", "boardingHouse", "shareHouse", "homestay",
    "officetel", "villa", "apartment",
  ]).nullable(),
  roomType: z.enum(["private", "double", "multi", "entire", "roomShare"]).nullable(),
  addressRoad: z.string().nullable(),
  addressJibun: z.string().nullable(),
  addressDetail: z.string().nullable(),
  addressRegion: z.string().nullable(),
  latitude: z.union([z.number(), z.string()]).nullable(),
  longitude: z.union([z.number(), z.string()]).nullable(),
  availabilityStatus: z.enum(["immediate", "occupied", "scheduled"]).nullable(),
  availableFrom: nullableIsoDate,
  availableUntil: nullableIsoDate,
  depositKrw: nullableNumber,
  monthlyRentKrw: nullableNumber,
  maintenanceFeeKrw: nullableNumber,
  utilityIncluded: z.boolean(),
  internetIncluded: z.boolean(),
  minStayMonths: nullableNumber,
  maxStayMonths: nullableNumber,
  floor: nullableNumber,
  totalFloors: nullableNumber,
  areaSquareMeters: z.union([z.number(), z.string()]).nullable(),
  bathroomCount: z.number().int().nonnegative(),
  kitchenAvailable: z.boolean(),
  laundryAvailable: z.boolean(),
  parkingAvailable: z.boolean(),
  amenities: z.array(z.string()).readonly(),
  houseRules: z.array(z.string()).readonly(),
  description: z.string().nullable(),
  roomStatus: roomStatusSchema,
  isPublic: z.boolean(),
  publishedAt: nullableIsoDate,
  draftExpiresAt: nullableIsoDate,
  rejectReason: z.string().nullable(),
  revisionMessage: z.string().nullable(),
  isAddressDetailHidden: z.boolean(),
  internalMemo: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: nullableIsoDate,
  registrationContractVersion: z.null(),
}).readonly();

export type LegacyRoom = z.infer<typeof legacyRoomSchema>;
