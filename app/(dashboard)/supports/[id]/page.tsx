import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { dismissSupport, resolveSupport } from "@/features/supports/actions";
import { readSupport } from "@/features/supports/queries";
import { supportIdSchema } from "@/features/supports/schema";
import { SupportDetail } from "@/features/supports/support-detail";
import { AdminApiError } from "@/lib/api/errors";

export default async function SupportDetailPage(
  props: PageProps<"/supports/[id]">,
) {
  const { id } = await props.params;
  const parsedId = supportIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  let support;
  try {
    support = await readSupport(parsedId.data);
  } catch (cause) {
    if (cause instanceof AdminApiError && cause.status === 404) notFound();
    throw cause;
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        description="문의 원문, 증빙 주소, 처리 메타데이터를 검토하고 해결 또는 기각을 확정합니다."
        eyebrow={
          <Link
            className="admin-focus text-brand underline-offset-4 hover:underline"
            href="/supports"
          >
            고객 문의 목록
          </Link>
        }
        title="문의 상세"
      />
      <SupportDetail
        dismissAction={dismissSupport.bind(null, support.id)}
        resolveAction={resolveSupport.bind(null, support.id)}
        support={support}
      />
    </div>
  );
}
