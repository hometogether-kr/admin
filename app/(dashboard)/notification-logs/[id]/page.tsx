import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/alert";
import { DefinitionList } from "@/components/ui/definition-list";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminApiError } from "@/lib/api/errors";

import {
  getNotificationLog,
  notificationApiErrorMessage,
} from "@/features/notification-logs/data";
import {
  CHANNEL_LABELS,
  formatNotificationDate,
  isNotificationTextTruncated,
  redactNotificationMessageValue,
  truncateNotificationText,
} from "@/features/notification-logs/format";
import { notificationLogIdSchema } from "@/features/notification-logs/schemas";
import {
  NotificationDeliveryAttempts,
  NotificationDeliveryStatus,
  NotificationResendProvider,
  ResendNotificationDialog,
} from "@/features/notification-logs/resend-dialog";

type NotificationLogDetailPageProps = {
  readonly params: Promise<{ readonly id: string }>;
};

function ErrorPanel({ message }: { readonly message: string }) {
  return <Alert title="알림 로그를 표시할 수 없습니다." variant="error">{message}</Alert>;
}

function ExpandableText({
  className,
  previewLength,
  value,
}: {
  readonly className: string;
  readonly previewLength: number;
  readonly value: string;
}) {
  if (!isNotificationTextTruncated(value, previewLength)) {
    return <span className={className}>{value}</span>;
  }

  return (
    <details className="group">
      <summary className="admin-focus cursor-pointer text-brand underline-offset-2 hover:underline">
        <span className={`${className} block text-ink-strong`}>
          {truncateNotificationText(value, previewLength)}
        </span>
        <span className="admin-keep-words mt-1 block text-compact font-semibold">
          <span className="group-open:hidden">전체 내용 보기</span>
          <span className="hidden group-open:inline">전체 내용 접기</span>
        </span>
      </summary>
      <p className={`${className} mt-3 whitespace-pre-wrap rounded-control bg-surface-subtle p-3`}>
        {value}
      </p>
    </details>
  );
}

function MessageData({
  messageData,
}: {
  readonly messageData: Readonly<Record<string, string>>;
}) {
  const entries = Object.entries(messageData).sort(([left], [right]) =>
    left.localeCompare(right),
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        description="이 알림에 저장된 메시지 데이터가 없습니다."
        title="메시지 데이터 없음"
      />
    );
  }

  return (
    <dl className="divide-y divide-line-subtle overflow-hidden rounded-panel border border-line bg-surface">
      {entries.map(([key, value]) => {
        const displayValue = redactNotificationMessageValue(key, value);
        const valueClassName = /\p{Script=Hangul}/u.test(displayValue)
          ? "admin-keep-words"
          : "admin-break-anywhere font-mono";

        return (
          <div
            className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)] sm:gap-4"
            key={key}
          >
            <dt className="admin-break-anywhere text-label font-semibold text-ink-subtle">
              메시지 데이터 키 · {key}
            </dt>
            <dd className="m-0 min-w-0 text-body text-ink-strong">
              <ExpandableText
                className={valueClassName}
                previewLength={240}
                value={displayValue}
              />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export default async function NotificationLogDetailPage({
  params,
}: NotificationLogDetailPageProps) {
  const { id } = await params;
  if (!notificationLogIdSchema.safeParse(id).success) notFound();

  let log;
  try {
    log = await getNotificationLog(id);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    if (cause instanceof AdminApiError) {
      return (
        <section className="grid gap-6">
          <PageHeader
            description="알림 전송의 원본 기록과 시도 결과를 확인합니다."
            eyebrow={
              <Link
                className="admin-focus text-brand underline-offset-2 hover:underline"
                href="/notification-logs"
              >
                알림 로그 목록
              </Link>
            }
            title="알림 로그 상세"
          />
          <ErrorPanel message={notificationApiErrorMessage(cause)} />
        </section>
      );
    }
    throw cause;
  }

  return (
    <NotificationResendProvider key={log.id}>
      <section className="grid gap-6">
        <PageHeader
          actions={<ResendNotificationDialog logId={log.id} />}
          description="알림 전송의 원본 기록과 시도 결과를 확인합니다."
          eyebrow={
            <Link
              className="admin-focus text-brand underline-offset-2 hover:underline"
              href="/notification-logs"
            >
              알림 로그 목록
            </Link>
          }
          title="알림 로그 상세"
        />

        <DefinitionList
          items={[
            {
              label: "로그 ID",
              value: <span className="font-mono">{log.id}</span>,
            },
            { label: "채널", value: CHANNEL_LABELS[log.channel] },
            {
              label: "템플릿 코드",
              value: <span className="font-mono">{log.templateCode}</span>,
            },
            {
              label: "전송 상태",
              value: <NotificationDeliveryStatus initialStatus={log.sendStatus} />,
            },
            { label: "대상 전화번호", value: log.targetPhone ?? "없음" },
            {
              label: "사용자 ID",
              value: log.userId ? <span className="font-mono">{log.userId}</span> : "없음",
            },
            {
              label: "시도 횟수",
              value: <NotificationDeliveryAttempts initialAttempts={log.attempts} />,
            },
            { label: "생성일", value: formatNotificationDate(log.createdAt) },
            {
              label: "최근 시도일",
              value: formatNotificationDate(log.lastAttemptedAt),
            },
            { label: "전송 완료일", value: formatNotificationDate(log.sentAt) },
            {
              label: "실패 사유",
              value: log.failedReason ? (
                <ExpandableText
                  className="admin-keep-words"
                  previewLength={400}
                  value={log.failedReason}
                />
              ) : "없음",
            },
          ]}
        />

        <section className="grid gap-3" aria-labelledby="notification-message-data-title">
          <div className="grid gap-1">
            <h2
              className="text-subsection font-semibold text-ink-strong"
              id="notification-message-data-title"
            >
              메시지 데이터
            </h2>
            <p className="admin-keep-words text-compact text-ink-subtle">
              API가 제공한 필드만 라벨별로 표시하며 긴 값은 펼쳐서 확인할 수
              있습니다.
            </p>
          </div>
          <MessageData messageData={log.messageData} />
        </section>
      </section>
    </NotificationResendProvider>
  );
}
