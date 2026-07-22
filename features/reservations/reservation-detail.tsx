"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DefinitionList, type DefinitionItem } from "@/components/ui/definition-list";
import { PageHeader } from "@/components/admin/page-header";

import {
  CONTRACT_INTENT_LABELS,
  formatReservationDate,
  formatReservationDateTime,
  formatReservationStay,
  RESERVATION_REJECT_REASONS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_VARIANTS,
} from "@/features/reservations/constants";
import type { Reservation } from "@/features/reservations/schemas";
import {
  NotificationResendForm,
  ReservationStatusForm,
} from "@/features/reservations/reservation-actions";

type ReservationDetailProps = {
  readonly reservation: Reservation;
};

function displayText(value: string | null | undefined): string {
  return value?.trim() || "없음";
}

function displayReason(value: string | null | undefined): string {
  if (value === null || value === undefined || value.length === 0) return "없음";
  return Object.entries(RESERVATION_REJECT_REASONS).find(
    ([key]) => key === value,
  )?.[1] ?? value;
}

function displayIntent(value: string | null | undefined): string {
  if (value === null || value === undefined || value.length === 0) return "없음";
  return Object.entries(CONTRACT_INTENT_LABELS).find(
    ([key]) => key === value,
  )?.[1] ?? value;
}

function displayChecklistState(value: boolean | undefined): string {
  if (value === undefined) return "미기록";
  return value ? "완료" : "미완료";
}

export function ReservationDetail({ reservation }: ReservationDetailProps) {
  const [currentStatus, setCurrentStatus] = useState(
    reservation.reservationStatus,
  );
  const statusLabel = RESERVATION_STATUS_LABELS[currentStatus];
  const summaryItems: readonly DefinitionItem[] = [
    { label: "예약 ID", value: <span className="font-mono">{reservation.id}</span> },
    { label: "방 ID", value: <span className="font-mono">{reservation.roomId}</span> },
    { label: "학생 ID", value: <span className="font-mono">{reservation.studentId}</span> },
    { label: "호스트 ID", value: <span className="font-mono">{reservation.hostId}</span> },
    {
      label: "상태",
      value: (
        <Badge
          className="min-w-max whitespace-nowrap"
          variant={RESERVATION_STATUS_VARIANTS[currentStatus]}
        >
          {statusLabel}
        </Badge>
      ),
    },
    {
      label: "입주 희망일",
      value: formatReservationDate(reservation.desiredMoveInDate),
    },
    {
      label: "희망 거주 기간",
      value: formatReservationStay(reservation.desiredStayMonths),
    },
    { label: "만료일", value: formatReservationDateTime(reservation.expiresAt) },
    { label: "생성일", value: formatReservationDateTime(reservation.createdAt) },
    { label: "수정일", value: formatReservationDateTime(reservation.updatedAt) },
  ];

  const timelineItems: readonly DefinitionItem[] = [
    { label: "방문 요청 1", value: formatReservationDateTime(reservation.visitRequestDate1) },
    { label: "방문 요청 2", value: formatReservationDateTime(reservation.visitRequestDate2) },
    { label: "방문 요청 3", value: formatReservationDateTime(reservation.visitRequestDate3) },
    { label: "호스트 응답일", value: formatReservationDateTime(reservation.hostResponseAt) },
    { label: "방문 예정일", value: formatReservationDateTime(reservation.visitScheduledAt) },
    { label: "방문 알림일", value: formatReservationDateTime(reservation.visitReminderSentAt) },
    { label: "방문 완료일", value: formatReservationDateTime(reservation.visitCompletedAt) },
    { label: "체크아웃 확인일", value: formatReservationDateTime(reservation.checkoutConfirmedAt) },
    { label: "삭제일", value: formatReservationDateTime(reservation.deletedAt) },
  ];

  const checkoutItems: readonly DefinitionItem[] = reservation.checkoutData
    ? [
        {
          label: "체크아웃 · 열쇠 반납",
          value: displayChecklistState(
            reservation.checkoutData.checklist.keysReturned,
          ),
        },
        {
          label: "체크아웃 · 공과금 정산",
          value: displayChecklistState(
            reservation.checkoutData.checklist.utilitiesPaid,
          ),
        },
        {
          label: "체크아웃 · 청소 완료",
          value: displayChecklistState(
            reservation.checkoutData.checklist.cleaningCompleted,
          ),
        },
        {
          label: "체크아웃 · 손상 없음",
          value: displayChecklistState(
            reservation.checkoutData.checklist.damagesNone,
          ),
        },
        {
          label: "체크아웃 · 추가 메모",
          value: displayText(reservation.checkoutData.notes),
        },
      ]
    : [{ label: "체크아웃 정보", value: "없음" }];

  const contextItems: readonly DefinitionItem[] = [
    { label: "학생 메시지", value: displayText(reservation.studentMessage) },
    {
      label: "학생 소개 스냅샷",
      value: (
        <span className="admin-break-anywhere whitespace-pre-wrap">
          {displayText(reservation.studentIntroSnapshot)}
        </span>
      ),
    },
    { label: "거절 사유", value: displayReason(reservation.rejectReason) },
    { label: "거절 메시지", value: displayText(reservation.rejectMessage) },
    { label: "계약 의사", value: displayIntent(reservation.contractIntent) },
    {
      label: "계약 의사 요청일",
      value: formatReservationDateTime(reservation.contractIntentRequestedAt),
    },
    ...checkoutItems,
  ];

  return (
    <section className="grid gap-6">
      <PageHeader
        description="예약 상태와 방문·계약·체크아웃 타임라인을 확인하고 필요한 알림을 재발송합니다."
        eyebrow={
          <Link
            className="admin-focus text-brand underline decoration-brand/40 underline-offset-2 hover:text-brand-hover"
            href="/reservations"
          >
            예약 목록으로 돌아가기
          </Link>
        }
        title="예약 상세"
      />

      <section aria-labelledby="reservation-summary-heading" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="reservation-summary-heading"
        >
          예약 요약
        </h2>
        <DefinitionList items={summaryItems} />
      </section>

      <section aria-labelledby="reservation-timeline-heading" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="reservation-timeline-heading"
        >
          예약 타임라인
        </h2>
        <DefinitionList items={timelineItems} />
      </section>

      <section aria-labelledby="reservation-context-heading" className="grid gap-3">
        <h2
          className="text-section font-semibold text-ink-strong"
          id="reservation-context-heading"
        >
          예약 데이터
        </h2>
        <DefinitionList items={contextItems} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="reservation-status-action-heading"
          className="grid content-start gap-4 rounded-panel border border-line bg-surface p-4 sm:p-5"
        >
          <div className="grid gap-1">
            <h2
              className="text-subsection font-semibold text-ink-strong"
              id="reservation-status-action-heading"
            >
              상태 변경
            </h2>
            <p className="admin-keep-words text-compact text-ink-subtle">
              종료·취소 상태로 바꾸기 전에는 확인 대화상자가 표시됩니다.
            </p>
          </div>
          <ReservationStatusForm
            currentStatus={currentStatus}
            onStatusUpdated={setCurrentStatus}
            reservationId={reservation.id}
          />
        </section>
        <section
          aria-labelledby="reservation-notification-action-heading"
          className="grid content-start gap-4 rounded-panel border border-line bg-surface p-4 sm:p-5"
        >
          <div className="grid gap-1">
            <h2
              className="text-subsection font-semibold text-ink-strong"
              id="reservation-notification-action-heading"
            >
              알림 재발송
            </h2>
            <p className="admin-keep-words text-compact text-ink-subtle">
              공통 NotificationTemplate 값으로 예약 알림 재발송을 요청합니다.
            </p>
          </div>
          <NotificationResendForm reservationId={reservation.id} />
        </section>
      </div>
    </section>
  );
}
