export const PROPERTY_ROOM_ID = "10000000-0000-4000-8000-000000000001";
export const PROPERTY_ADMIN_ID = "20000000-0000-4000-8000-000000000001";
const MEDIA_ID = "30000000-0000-4000-8000-000000000001";

export function propertyRoomFixture() {
  return {
    registrationContractVersion: 2,
    roomId: PROPERTY_ROOM_ID,
    title: "마포구 연남동의 오피스텔",
    subtitle: "채광 좋은 조용한 집",
    roomStatus: "submitted",
    isPublic: false,
    submittedAt: "2026-10-04T00:00:00.000Z",
    data: {
      registrant: { registrantRelationship: "owner" },
      location: {
        addressRoad: "서울특별시 마포구 성미산로 10",
        addressJibun: "서울특별시 마포구 연남동 1",
        addressDetail: "101동 302호",
        addressRegion: "서울특별시 마포구 연남동",
        legalDongCode: "1144012400",
        legalDongName: "연남동",
        sido: "서울특별시",
        sigungu: "마포구",
        buildingDong: "101동",
        unitNumber: "302호",
        floor: 3,
        latitude: 37.56,
        longitude: 126.92,
        addressVerifiedAt: null,
        addressVerifiedBy: null,
        buildingType: "officetel",
        buildingTypeOther: null,
        approximateLocation: null,
      },
      household: {
        areaRange: "unknown", totalRoomCount: 3, residentCount: 0,
        residentType: null, residentGenderComposition: null,
        elevatorAvailable: true, parkingAvailable: false,
        parkingType: null, parkingDescription: null,
      },
      privateSpace: {
        rentalSpaceType: "onePrivateRoom", rentalSpaceTypeOther: null,
        privateRoomOptions: ["bed"],
      },
      commonFacilities: {
        kitchenUsagePolicy: "freeUse", livingRoomUsagePolicy: "freeUse",
        washingMachineUsagePolicy: "freeUse", bathroomUsageType: "tenantPrivate",
        bathroomDescription: null,
      },
      preferences: {
        visitorPolicy: "negotiable", petAllowed: false,
        smokingPreference: "nonSmokerOnly", preferredGender: "any",
        roomCapacity: "one", interactionPreference: "quiet", additionalGuidance: null,
      },
      pricing: {
        monthlyRentKrw: 500_000, depositKrw: 10_000_000, maintenanceFeeKrw: 50_000,
        moveInAvailableAt: "2026-11-01T00:00:00.000Z", minStayMonths: 6,
      },
      media: { mediaIds: [MEDIA_ID], representativeMediaId: MEDIA_ID },
      descriptions: {
        roomDescription: "조용한 주택가", currentResidentsDescription: null, precautions: null,
      },
      contact: {
        contactName: "테스트 호스트", contactPhone: "+821012345678",
        preferredContactTime: "evening", preferredContactMethod: "kakaoTalk",
        roomPublication: true, noFraudPledge: true,
      },
    },
    media: [{
      id: MEDIA_ID, displayOrder: 0, isRepresentative: true,
      mimeType: "image/jpeg", byteSize: 1024, originalFilename: "room.jpg",
      readUrl: "https://example.com/room.jpg", readUrlExpiresAt: "2026-10-04T00:15:00.000Z",
    }],
  };
}
