export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}
export function booleanLabel(value: boolean): string {
  return value ? "예" : "아니요";
}

export function formatDate(value: string | null): string {
  if (value === null) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function formatKrw(value: number | null): string {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function listLabel(values: readonly string[]): string {
  return values.length === 0 ? "—" : values.join(", ");
}

const REGISTRATION_VALUE_LABELS = {
  owner: "소유자",
  familyProxy: "가족 대리인",
  villa: "빌라",
  apartment: "아파트",
  detachedHouse: "단독 주택",
  other: "기타",
  upTo10Pyeong: "10평 이하",
  teensPyeong: "10평대",
  twentiesPyeong: "20평대",
  thirtiesPyeong: "30평대",
  fortiesPyeong: "40평대",
  fiftiesPyeong: "50평대",
  overFiftyPyeong: "50평 초과",
  unknown: "알 수 없음",
  ownerOnly: "소유자만 거주",
  withFamily: "가족과 거주",
  withOtherTenants: "다른 세입자와 거주",
  femaleOnly: "여성만 거주",
  maleOnly: "남성만 거주",
  mixed: "혼성",
  freeAvailable: "무료 주차 가능",
  freeFirstCome: "무료 선착순",
  paid: "유료",
  onePrivateRoom: "개인실 1개",
  small: "소형",
  medium: "중형",
  large: "대형",
  bed: "침대",
  desk: "책상",
  chair: "의자",
  airConditioner: "에어컨",
  wifi: "와이파이",
  doorLock: "도어록",
  wardrobe: "옷장",
  none: "없음",
  freeUse: "자유롭게 사용",
  lightCookingOnly: "간단한 조리만 가능",
  microwaveWaterPurifierOnly: "전자레인지·정수기만 사용",
  negotiable: "협의 가능",
  notAllowed: "허용하지 않음",
  sharedWithHost: "호스트와 공동 사용",
  scheduledUseOnly: "정해진 시간에만 사용",
  restrictedUse: "제한적으로 사용",
  notifyHostBeforeUse: "사용 전 호스트에게 알림",
  tenantPrivate: "세입자 전용",
  sharedAmongTenants: "세입자끼리 공동 사용",
  allowed: "허용",
  noPreference: "상관없음",
  nonSmokerOnly: "비흡연자만",
  female: "여성",
  male: "남성",
  any: "무관",
  one: "1명",
  two: "2명",
  threeOrMore: "3명 이상",
  quiet: "조용한 생활",
  moderateInteraction: "적당한 교류",
  morning: "오전",
  afternoon: "오후",
  lateAfternoon: "늦은 오후",
  evening: "저녁",
  kakaoTalk: "카카오톡",
  phoneCall: "전화",
  sms: "문자",
} as const;

type RegistrationValue = keyof typeof REGISTRATION_VALUE_LABELS;

export function registrationValueLabel(value: RegistrationValue): string {
  return REGISTRATION_VALUE_LABELS[value];
}

export function registrationValueListLabel(
  values: readonly RegistrationValue[],
): string {
  return values.length === 0
    ? "—"
    : values.map((value) => REGISTRATION_VALUE_LABELS[value]).join(", ");
}
