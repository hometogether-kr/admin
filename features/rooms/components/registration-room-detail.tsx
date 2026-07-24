import { DetailSection } from "@/features/rooms/components/detail-section";
import { MediaSection } from "@/features/rooms/components/media-section";
import {
  booleanLabel,
  displayValue,
  formatDate,
  formatKrw,
  listLabel,
} from "@/features/rooms/format";
import type { RegistrationRoom } from "@/features/rooms/registration-schema";

type RegistrationRoomDetailProps = { readonly room: RegistrationRoom };

export function RegistrationRoomDetail({ room }: RegistrationRoomDetailProps) {
  const { data } = room;
  return (
    <div className="grid gap-8">
      <DetailSection id="registrant-heading" items={[
        { label: "등록자 관계", value: data.registrant.registrantRelationship },
      ]} title="등록자" />
      <DetailSection id="location-heading" items={[
        { label: "도로명 주소", value: data.location.addressRoad },
        { label: "상세 주소", value: data.location.addressDetail },
        { label: "지역", value: data.location.addressRegion },
        { label: "건물 유형", value: data.location.buildingType },
        { label: "기타 건물 유형", value: displayValue(data.location.buildingTypeOther) },
        { label: "근사 위치", value: displayValue(data.location.approximateLocation) },
      ]} title="위치" />
      <DetailSection id="household-heading" items={[
        { label: "면적 범위", value: data.household.areaRange },
        { label: "전체 방 수", value: data.household.totalRoomCount },
        { label: "거주자 수", value: data.household.residentCount },
        { label: "거주 형태", value: data.household.residentType },
        { label: "성별 구성", value: data.household.residentGenderComposition },
        { label: "엘리베이터", value: booleanLabel(data.household.elevatorAvailable) },
        { label: "주차", value: booleanLabel(data.household.parkingAvailable) },
        { label: "주차 설명", value: displayValue(data.household.parkingDescription) },
      ]} title="가구 정보" />
      <DetailSection id="private-space-heading" items={[
        { label: "임대 공간", value: data.privateSpace.rentalSpaceType },
        { label: "기타 임대 공간", value: displayValue(data.privateSpace.rentalSpaceTypeOther) },
        { label: "개인실 크기", value: data.privateSpace.privateRoomSize },
        { label: "개인실 옵션", value: listLabel(data.privateSpace.privateRoomOptions) },
      ]} title="개인 공간" />
      <DetailSection id="common-facilities-heading" items={[
        { label: "주방 사용", value: data.commonFacilities.kitchenUsagePolicy },
        { label: "거실 사용", value: data.commonFacilities.livingRoomUsagePolicy },
        { label: "세탁기 사용", value: data.commonFacilities.washingMachineUsagePolicy },
        { label: "욕실 사용", value: data.commonFacilities.bathroomUsageType },
        { label: "욕실 설명", value: displayValue(data.commonFacilities.bathroomDescription) },
      ]} title="공용 시설" />
      <DetailSection id="preferences-heading" items={[
        { label: "방문객 정책", value: data.preferences.visitorPolicy },
        { label: "반려동물", value: booleanLabel(data.preferences.petAllowed) },
        { label: "흡연 선호", value: data.preferences.smokingPreference },
        { label: "선호 성별", value: data.preferences.preferredGender },
        { label: "수용 인원", value: data.preferences.roomCapacity },
        { label: "교류 선호", value: data.preferences.interactionPreference },
        { label: "추가 안내", value: displayValue(data.preferences.additionalGuidance) },
      ]} title="선호 조건" />
      <DetailSection id="pricing-heading" items={[
        { label: "월세", value: formatKrw(data.pricing.monthlyRentKrw) },
        { label: "보증금", value: formatKrw(data.pricing.depositKrw) },
        { label: "관리비", value: formatKrw(data.pricing.maintenanceFeeKrw) },
        { label: "입주 가능일", value: formatDate(data.pricing.moveInAvailableAt) },
        { label: "최소 거주", value: `${data.pricing.minStayMonths}개월` },
      ]} title="가격" />
      <DetailSection id="photos-heading" items={[
        { label: "사진 ID", value: listLabel(data.photos.photoIds) },
        { label: "대표 사진 ID", value: data.photos.representativePhotoId },
      ]} title="사진" />
      <DetailSection id="descriptions-heading" items={[
        { label: "방 설명", value: displayValue(data.descriptions.roomDescription) },
        { label: "현재 거주자", value: displayValue(data.descriptions.currentResidentsDescription) },
        { label: "주의 사항", value: displayValue(data.descriptions.precautions) },
      ]} title="설명" />
      <DetailSection id="contact-heading" items={[
        { label: "담당자", value: data.contact.contactName },
        { label: "연락처", value: data.contact.contactPhone },
        { label: "선호 시간", value: data.contact.preferredContactTime },
        { label: "선호 방법", value: data.contact.preferredContactMethod },
      ]} title="연락처" />
      <MediaSection media={room.media} roomId={room.roomId} />
    </div>
  );
}
