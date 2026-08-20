import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/contracts/admin-role";

export const USER_ROLES = [
  "student",
  "host",
  "admin",
  "superAdmin",
  "roomManager",
  "reservationManager",
  "paymentManager",
  "csManager",
] as const;

export const SANCTION_TYPES = [
  "warning",
  "suspend",
  "ban",
  "payoutHold",
] as const;

export const userIdSchema = z.uuid().brand<"UserId">();
export type UserId = z.infer<typeof userIdSchema>;

export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const sanctionTypeSchema = z.enum(SANCTION_TYPES);
export type SanctionType = z.infer<typeof sanctionTypeSchema>;

export const adminUserSummarySchema = z
  .object({
    id: userIdSchema,
    name: z.string().nullable(),
    email: z.email().nullable(),
    role: userRoleSchema,
    adminRole: z.enum(ADMIN_ROLES).nullable(),
    createdAt: z.iso.datetime(),
  })
  .strict();

export type AdminUserSummary = z.infer<typeof adminUserSummarySchema>;

export const adminUserListSchema = z.array(adminUserSummarySchema).readonly();
export const adminUserDetailSchema = adminUserSummarySchema.extend({
  phone: z.string().nullable(),
  introduction: z.string().nullable(),
  onboardingCompletedAt: z.iso.datetime().nullable(),
  updatedAt: z.iso.datetime(),
});
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

export const disablementResponseSchema = z
  .object({ success: z.boolean() })
  .strict();

export const sanctionSchema = z
  .object({
    id: z.uuid(),
    userId: userIdSchema,
    sanctionType: sanctionTypeSchema,
    reason: z.string(),
    expiresAt: z.iso.datetime().nullable(),
    reportId: z.uuid().nullable(),
    appliedBy: z.uuid(),
    liftedAt: z.iso.datetime().nullable(),
    liftedBy: z.uuid().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .strict();

export type Sanction = z.infer<typeof sanctionSchema>;
export const sanctionListSchema = z.array(sanctionSchema).readonly();

export const studentProfileSchema = z
  .object({
    id: z.uuid(),
    userId: userIdSchema,
    school: z.string().nullable(),
    major: z.string().nullable(),
    studentType: z
      .enum([
        "undergraduate",
        "graduate",
        "internationalStudent",
        "exchangeStudent",
        "other",
      ])
      .nullable(),
    verificationStatus: z.enum([
      "unverified",
      "pending",
      "verified",
      "rejected",
    ]),
    studentCardImageUrl: z.string().nullable(),
    preferredMoveInDate: z.iso.date().nullable(),
    preferredStayMonths: z.number().int().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    deletedAt: z.iso.datetime().nullable(),
  })
  .strict();

export const userMutationFormSchema = z
  .object({ userId: userIdSchema })
  .strict();

export const userUpdateFormSchema = z
  .strictObject({
    userId: userIdSchema,
    name: z.string().trim().min(1).max(100),
    email: z.email().max(320),
    phone: z
      .string()
      .trim()
      .regex(/^(?:010-?\d{4}-?\d{4}|\+82\s?10-?\d{4}-?\d{4})$/u),
    introduction: z.string().trim().max(1_000),
  })
  .transform((input) => ({
    userId: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    ...(input.introduction === "" ? {} : { introduction: input.introduction }),
  }));

export const studentRejectionFormSchema = z
  .object({
    userId: userIdSchema,
    reason: z
      .string()
      .trim()
      .min(1, "반려 사유를 입력해 주세요."),
  })
  .strict();

const isoDateTimeInputSchema = z.iso.datetime({ local: true, offset: true });

export const sanctionFormSchema = z
  .object({
    userId: userIdSchema,
    sanctionType: sanctionTypeSchema,
    reason: z
      .string()
      .trim()
      .min(5, "제재 사유는 5자 이상 입력해 주세요.")
      .max(1_000, "제재 사유는 1,000자 이하로 입력해 주세요."),
    expiresAt: z.string().trim(),
    reportId: z.string().trim(),
  })
  .strict()
  .superRefine((input, context) => {
    if (input.expiresAt !== "") {
      const timestamp = Date.parse(input.expiresAt);
      if (
        !isoDateTimeInputSchema.safeParse(input.expiresAt).success ||
        Number.isNaN(timestamp) ||
        timestamp <= Date.now()
      ) {
        context.addIssue({
          code: "custom",
          message: "만료일은 현재 이후의 ISO 날짜와 시간이어야 합니다.",
          path: ["expiresAt"],
        });
      }
    }

    if (input.reportId !== "" && !z.uuid().safeParse(input.reportId).success) {
      context.addIssue({
        code: "custom",
        message: "신고 ID는 UUID 형식이어야 합니다.",
        path: ["reportId"],
      });
    }
  })
  .transform((input) => ({
    userId: input.userId,
    sanctionType: input.sanctionType,
    reason: input.reason,
    ...(input.expiresAt === ""
      ? {}
      : { expiresAt: new Date(input.expiresAt).toISOString() }),
    ...(input.reportId === "" ? {} : { reportId: input.reportId }),
  }));

export type SanctionFormInput = z.input<typeof sanctionFormSchema>;
