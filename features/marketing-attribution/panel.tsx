import { DefinitionList } from "@/components/ui/definition-list";

import type { HostFlyerAttribution } from "./schema";

const visitTime = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Seoul",
});

export function HostFlyerAttributionPanel({
  attribution,
  conversion,
}: {
  readonly attribution: HostFlyerAttribution;
  readonly conversion: "상담 접수 완료" | "방 등록 요청 완료";
}) {
  return (
    <section aria-labelledby="host-flyer-attribution-title" className="grid gap-3">
      <h2 className="text-section font-semibold text-ink-strong" id="host-flyer-attribution-title">
        광고지 유입
      </h2>
      <DefinitionList items={[
        { label: "최초 유입 경로", value: "아파트 A4 광고지" },
        { label: "최초 유입 시각 (한국 시간)", value: (
          <time dateTime={attribution.first_landed_at}>
            {visitTime.format(new Date(attribution.first_landed_at))}
          </time>
        ) },
        { label: "접수 결과", value: conversion },
        { label: "utm_source", value: attribution.utm_source },
        { label: "utm_medium", value: attribution.utm_medium },
        { label: "utm_campaign", value: attribution.utm_campaign },
        { label: "utm_content", value: attribution.utm_content },
      ]} />
    </section>
  );
}
