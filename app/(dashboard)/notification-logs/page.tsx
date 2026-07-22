import Link from "next/link";

import { AdminApiError } from "@/lib/api/errors";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/ui/pagination";
import {
  TableShell,
  type AdminTableRow,
} from "@/components/ui/table-shell";

import {
  getNotificationLogs,
  notificationApiErrorMessage,
} from "@/features/notification-logs/data";
import {
  buildNotificationPageHref,
  CHANNEL_LABELS,
  formatNotificationDate,
  formatNotificationNumber,
  SEND_STATUS_CLASSES,
  SEND_STATUS_LABELS,
} from "@/features/notification-logs/format";
import { parseNotificationListQuery } from "@/features/notification-logs/schemas";

type NotificationLogsPageProps = {
  readonly searchParams: Promise<{
    readonly page?: string | readonly string[];
    readonly limit?: string | readonly string[];
  }>;
};

function ErrorPanel({ message }: { readonly message: string }) {
  return <Alert title="알림 로그를 표시할 수 없습니다." variant="error">{message}</Alert>;
}

export default async function NotificationLogsPage({
  searchParams,
}: NotificationLogsPageProps) {
  const query = parseNotificationListQuery(await searchParams);

  if (query === null) {
    return (
      <section className="grid gap-6">
        <PageHeader
          description="전송 이력과 재전송 결과를 확인합니다."
          title="알림 로그"
        />
        <ErrorPanel message="페이지와 표시 개수를 확인해 주세요." />
      </section>
    );
  }

  let response;
  try {
    response = await getNotificationLogs(query);
  } catch (cause) {
    if (cause instanceof AdminApiError) {
      return (
        <section className="grid gap-6">
          <PageHeader
            description="전송 이력과 재전송 결과를 확인합니다."
            title="알림 로그"
          />
          <ErrorPanel message={notificationApiErrorMessage(cause)} />
        </section>
      );
    }
    throw cause;
  }

  const totalPages = Math.max(1, Math.ceil(response.total / response.limit));
  const currentPage = Math.min(response.page, totalPages);
  const rows: readonly AdminTableRow[] = response.items.map((item) => ({
    cells: [
      <Link
        aria-label={`알림 로그 ${item.id} 상세 보기`}
        className="admin-focus admin-break-anywhere font-mono font-semibold text-brand underline-offset-2 hover:underline"
        href={`/notification-logs/${item.id}`}
        key={item.id}
      >
        {item.id}
      </Link>,
      CHANNEL_LABELS[item.channel],
      <span className="admin-break-anywhere font-mono" key={`${item.id}-template`}>
        {item.templateCode}
      </span>,
      <Badge
        className="whitespace-nowrap"
        key={`${item.id}-status`}
        variant={SEND_STATUS_CLASSES[item.sendStatus]}
      >
        {SEND_STATUS_LABELS[item.sendStatus]}
      </Badge>,
      item.targetPhone ?? "없음",
      formatNotificationNumber(item.attempts),
      formatNotificationDate(item.createdAt),
    ],
    key: item.id,
  }));

  return (
    <section className="grid gap-6">
      <PageHeader
        description="전송 이력과 재전송 결과를 확인합니다."
        title="알림 로그"
      />
      {response.items.length === 0 ? (
        <EmptyState
          description="현재 조건에 맞는 알림 전송 이력이 없습니다."
          title="알림 로그가 없습니다"
        />
      ) : (
        <TableShell
          caption="알림 로그 목록"
          columns={[
            { key: "id", kind: "identifier", label: "로그 ID" },
            { key: "channel", label: "채널" },
            { key: "template", kind: "identifier", label: "템플릿 코드" },
            { key: "status", label: "전송 상태" },
            { key: "targetPhone", label: "대상 전화번호" },
            { key: "attempts", label: "시도 횟수" },
            { key: "createdAt", label: "생성일" },
          ]}
          rows={rows}
        />
      )}
      {response.total > 0 ? (
        <Pagination
          currentPage={currentPage}
          firstHref={
            currentPage > 1
              ? buildNotificationPageHref(1, response.limit)
              : undefined
          }
          lastHref={
            currentPage < totalPages
              ? buildNotificationPageHref(totalPages, response.limit)
              : undefined
          }
          nextHref={
            currentPage < totalPages
              ? buildNotificationPageHref(currentPage + 1, response.limit)
              : undefined
          }
          previousHref={
            currentPage > 1
              ? buildNotificationPageHref(currentPage - 1, response.limit)
              : undefined
          }
          totalPages={totalPages}
        />
      ) : null}
    </section>
  );
}
