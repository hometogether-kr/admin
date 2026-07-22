import { DetailSection } from "@/features/rooms/components/detail-section";
import {
  booleanLabel,
  displayValue,
  formatDate,
  formatKrw,
  listLabel,
} from "@/features/rooms/format";
import type { LegacyRoom } from "@/features/rooms/legacy-schema";

type LegacyRoomDetailProps = { readonly room: LegacyRoom };

export function LegacyRoomDetail({ room }: LegacyRoomDetailProps) {
  return (
    <div className="grid gap-8">
      <DetailSection id="legacy-identity-heading" items={[
        { label: "방 ID", value: room.id },
        { label: "호스트 ID", value: room.hostId },
        { label: "제목", value: displayValue(room.title) },
        { label: "매물 유형", value: displayValue(room.propertyType) },
        { label: "방 유형", value: displayValue(room.roomType) },
      ]} title="기본 정보" />
      <DetailSection id="legacy-location-heading" items={[
        { label: "도로명 주소", value: displayValue(room.addressRoad) },
        { label: "지번 주소", value: displayValue(room.addressJibun) },
        { label: "상세 주소", value: displayValue(room.addressDetail) },
        { label: "지역", value: displayValue(room.addressRegion) },
        { label: "위도", value: displayValue(room.latitude) },
        { label: "경도", value: displayValue(room.longitude) },
        { label: "상세 주소 숨김", value: booleanLabel(room.isAddressDetailHidden) },
      ]} title="위치" />
      <DetailSection id="legacy-availability-heading" items={[
        { label: "입주 상태", value: displayValue(room.availabilityStatus) },
        { label: "입주 가능일", value: formatDate(room.availableFrom) },
        { label: "입주 종료일", value: formatDate(room.availableUntil) },
        { label: "최소 거주", value: room.minStayMonths === null ? "—" : `${room.minStayMonths}개월` },
        { label: "최대 거주", value: room.maxStayMonths === null ? "—" : `${room.maxStayMonths}개월` },
      ]} title="입주 조건" />
      <DetailSection id="legacy-pricing-heading" items={[
        { label: "보증금", value: formatKrw(room.depositKrw) },
        { label: "월세", value: formatKrw(room.monthlyRentKrw) },
        { label: "관리비", value: formatKrw(room.maintenanceFeeKrw) },
        { label: "공과금 포함", value: booleanLabel(room.utilityIncluded) },
        { label: "인터넷 포함", value: booleanLabel(room.internetIncluded) },
      ]} title="가격" />
      <DetailSection id="legacy-facilities-heading" items={[
        { label: "층", value: displayValue(room.floor) },
        { label: "전체 층", value: displayValue(room.totalFloors) },
        { label: "면적(㎡)", value: displayValue(room.areaSquareMeters) },
        { label: "욕실 수", value: room.bathroomCount },
        { label: "주방", value: booleanLabel(room.kitchenAvailable) },
        { label: "세탁", value: booleanLabel(room.laundryAvailable) },
        { label: "주차", value: booleanLabel(room.parkingAvailable) },
        { label: "편의 시설", value: listLabel(room.amenities) },
        { label: "생활 규칙", value: listLabel(room.houseRules) },
        { label: "설명", value: displayValue(room.description) },
      ]} title="시설과 설명" />
      <DetailSection id="legacy-operation-heading" items={[
        { label: "상태", value: room.roomStatus },
        { label: "공개", value: booleanLabel(room.isPublic) },
        { label: "게시일", value: formatDate(room.publishedAt) },
        { label: "임시 저장 만료", value: formatDate(room.draftExpiresAt) },
        { label: "반려 사유", value: displayValue(room.rejectReason) },
        { label: "수정 요청", value: displayValue(room.revisionMessage) },
        { label: "내부 메모", value: displayValue(room.internalMemo) },
        { label: "생성일", value: formatDate(room.createdAt) },
        { label: "수정일", value: formatDate(room.updatedAt) },
        { label: "삭제일", value: formatDate(room.deletedAt) },
        { label: "등록 계약 버전", value: "Legacy" },
      ]} title="운영 정보" />
    </div>
  );
}
