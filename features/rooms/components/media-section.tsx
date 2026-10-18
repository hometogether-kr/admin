import { Badge } from "@/components/ui/badge";
import { DefinitionList } from "@/components/ui/definition-list";
import { MediaDeleteAction } from "@/features/rooms/components/media-delete-action";
import { RoomPhotoPreview } from "@/features/rooms/components/room-photo-preview";
import { booleanLabel, formatDate } from "@/features/rooms/format";
import type { RoomMedia } from "@/features/rooms/registration-schema";

type MediaSectionProps = {
  readonly media: readonly RoomMedia[];
  readonly roomId: string;
};

export function MediaSection({ media, roomId }: MediaSectionProps) {
  return (
    <section aria-labelledby="room-media-heading" className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="text-section font-semibold text-ink-strong" id="room-media-heading">
          방 사진
        </h2>
        <p className="admin-keep-words text-body text-ink-subtle">
          사진을 누르면 크게 볼 수 있습니다. 삭제 후 사진 목록과 대표 표시를 갱신하며, 마지막 사진은 삭제할 수 없습니다.
        </p>
      </div>
      {media.length === 0 ? (
        <p className="rounded-panel border border-dashed border-line bg-surface-subtle p-4 text-body text-ink-subtle">
          등록된 방 사진이 없습니다.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {media.map((item) => (
            <article className="grid min-w-0 gap-3 rounded-panel border border-line bg-surface p-4" key={item.id}>
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="admin-break-anywhere text-body font-semibold text-ink-strong">
                    {item.originalFilename}
                  </h3>
                  <p className="admin-break-anywhere font-mono text-label text-ink-subtle">{item.id}</p>
                </div>
                {item.isRepresentative ? <Badge variant="accent">대표</Badge> : null}
              </div>
              <RoomPhotoPreview media={item} />
              <DefinitionList items={[
                { label: "표시 순서", value: item.displayOrder },
                { label: "대표 여부", value: booleanLabel(item.isRepresentative) },
                { label: "MIME", value: item.mimeType },
                { label: "크기", value: `${new Intl.NumberFormat("ko-KR").format(item.byteSize)} bytes` },
                { label: "URL 만료", value: formatDate(item.readUrlExpiresAt) },
              ]} />
              <div className="justify-self-start">
                <MediaDeleteAction filename={item.originalFilename} mediaId={item.id} roomId={roomId} isLastPhoto={media.length === 1} isRepresentative={item.isRepresentative} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
