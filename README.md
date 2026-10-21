# HomeTogether Admin

HomeTogether 운영 관리자를 위한 Next.js BFF 대시보드입니다. 운영 주소는
`https://admin.hometogether.kr`이며 브라우저에는 API 토큰을 노출하지 않습니다.

## 로컬 실행

Node.js와 npm을 사용합니다. 로컬 관리자 앱 포트는 `3001`입니다.

```bash
npm install
cp .env.example .env.local
npm run dev -- --port 3001
```

`.env.local`의 placeholder를 실제 로컬 값으로 교체하되 비밀값은 커밋하지
않습니다. 비밀키는 다음처럼 각각 새로 생성할 수 있습니다.

```bash
node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("base64url"))'
node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("base64"))'
```

첫 번째 값은 `ADMIN_SESSION_SECRET`, 두 번째 값은
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`에 사용합니다.

## 환경변수 계약

| 변수 | 계약 |
| --- | --- |
| `ADMIN_API_BASE_URL` | 환경에서 선택하는 관리자 API origin. 현재 배포·Swagger는 `https://dev-api.hometogether.kr` |
| `ADMIN_PUBLIC_ORIGIN` | 환경별 관리자 공개 origin. dev는 `https://dev-admin.hometogether.kr`, prod는 `https://admin.hometogether.kr` |
| `ADMIN_SESSION_SECRET` | 정확히 32바이트를 padding 없는 base64url로 인코딩한 세션 암호화 키 |
| `ADMIN_SESSION_MAX_AGE_SECONDS` | 양의 정수 세션 수명. 최대 `604800`초 |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | base64 AES 키. 모든 빌드·런타임 인스턴스에 동일한 안정된 값을 공급 |

`ADMIN_API_BASE_URL`은 환경변수로 관리되며 애플리케이션의 단일 서버 전송
계층에서 읽으므로 API endpoint를 환경별로 바꿀 수 있습니다.
`https://dev-api.hometogether.kr`와
의도된 운영 alias `https://api.hometogether.kr`는 모두 승인되어 있지만, 운영
alias는 현재 retired/unavailable 상태로 사용할 수 없습니다. 배포 시에는 이름만
보고 고정하지 말고 실제로 routing 중인 HTTPS host를 선택해야 합니다. 관리자
앱의 공개 origin은 dev에서 `https://dev-admin.hometogether.kr`, prod에서
`https://admin.hometogether.kr`를 사용하며, 로컬 개발 환경에서만
localhost/loopback HTTP를 허용합니다.

## 매물 데이터 관리

`room`·`super` 관리자는 제출된 v2 매물 상세(`/rooms/:id`)에서 다음 작업을 할 수 있습니다.

- 소제목·층수: `PATCH /admin/rooms/:id/metadata`. 변경된 필드만 전송하며 빈 값은 null로 삭제합니다. 소제목 수정만으로 추정 층수를 수동 층수로 바꾸지 않습니다.
- 주소·유형·좌표 보정: `PATCH /admin/rooms/:id/address`. 건물 유형은 5종이며 기타는 자유입력이 필요합니다. 보존된 빌라는 조회 후 신규 유형으로 재선택합니다.
- 주소 확인: `POST /admin/rooms/:id/address/verify`. 주소 저장과 별도이며 저장하지 않은 변경이 있거나 필수 주소 정보가 없으면 실행할 수 없습니다.

주소 변경은 확인 상태를 초기화하고 게시된 매물을 비공개·재검토 상태로 전환합니다. 이전 건물의 좌표를 재사용하지 않도록 주소 수정 시 좌표 입력을 비웁니다. 좌표는 유효한 위도·경도 쌍으로만 저장합니다. 주소 확인 후에도 승인·게시는 별도로 실행해야 합니다.

주소 확인을 마친 v2 `submitted`·`inReview`에는 승인·게시, `hidden`에는 재게시 버튼이 활성화됩니다. 재게시도 기존 승인 API(`POST /admin/rooms/:id/approvals`)를 사용합니다. 공개 중인 v2 매물의 숨김은 super 관리자에게만 표시합니다. 이전 등록 형식은 API가 승인·재게시를 지원하지 않아 해당 버튼을 비활성화합니다.

매물 상세에는 공개·비공개·재검토·숨김 상태와 주소 재확인 및 게시에 필요한 다음 조치를 안내합니다. 저장하지 않은 주소 변경이 있으면 주소 확인과 게시를 막습니다. 변경 작업 중에는 상세 화면의 다른 변경 작업을 차단하고, 성공 후 상세를 다시 조회하며 재게시 성공 안내도 유지합니다.

주소/게시 오류 응답의 `code`를 검증해 `ROOM_ADDRESS_VERIFICATION_REQUIRED`, `ROOM_PUBLICATION_NOT_ALLOWED`, `ROOM_HIDE_NOT_ALLOWED`, `ROOM_ADMIN_EDIT_NOT_ALLOWED`, `ROOM_ADDRESS_INCOMPLETE`, `ROOM_ADDRESS_REGION_MISMATCH`별 한국어 안내를 제공합니다. 알 수 없는 코드·구조가 잘못된 오류 응답은 기존 상태 코드 안내를 사용하고 원문 진단 정보는 화면에 노출하지 않습니다. 인증·권한 오류 안내도 유지합니다.

매물 삭제(`DELETE /admin/rooms/:id`)의 `ROOM_ACTIVE_RESERVATIONS_EXIST`는 활성 예약으로 삭제할 수 없다는 안내와 예약 현황 확인을, `ROOM_DELETION_NOT_ALLOWED`는 작성 중 매물을 관리자에서 삭제할 수 없다는 안내와 매물 상태 확인을 제공합니다. 활성 예약 매물 삭제 허용 및 입주자 연락 이행 확인 기능은 이번 범위에 포함하지 않습니다. 배포 후 테스트용 매물의 삭제 차단 시 해당 안내가 표시되는지 확인합니다.

배포 후 테스트용 매물로 주소 보정→저장값 재조회→주소 확인→승인·게시→주소/건물 유형 변경 후 공개 중단→재확인·게시→숨김·재게시 순서를 확인합니다. 실제로 일치하는 주소 데이터를 사용하고 저장과 확인이 분리되는지, 처리 중 다른 버튼이 비활성화되는지 확인합니다.

## 매물 가격 단위

신규 v2·레거시 매물 상세와 핵심 정보 수정 폼의 월세·보증금·관리비는 모두 만원 단위를 사용합니다. API의 `monthlyRentKrw=500000`은 `50만원`, `depositKrw=1000000`은 `100만원`, `maintenanceFeeKrw=55000`은 `5.5만원`으로 표시하고 입력값은 각각 `50`, `100`, `5.5`입니다. 저장 전 소수 문자열을 원 단위 정수로 변환하며 기존 API의 세 `Krw` 필드 계약을 유지합니다. 폼의 금액 필드명은 각각 `monthlyRentManwon`, `depositManwon`, `maintenanceFeeManwon`으로 구분하여 구버전 원 단위 폼을 만원으로 오인하지 않습니다.

월세 입력은 0 초과 10,000만원 이하, 보증금·관리비는 0~100,000만원이며 소수점 최대 4자리(1원 단위)를 허용합니다. 0원은 `0만원`으로 표시하고 누락값과 구분하며 기존 금액을 변경 없이 재저장해도 보존합니다. 계약·결제 화면과 API·DB의 원 단위 저장은 기존대로 유지하며 기존 데이터 일괄 변환은 수행하지 않습니다.

배포 후 테스트 매물에서 월세 50만원·보증금 100만원·관리비 5.5만원 입력→저장→상세 표시→새로고침 및 편집 초기값 유지, 관리비 0원 저장, 설명만 수정할 때 세 금액 보존을 확인합니다.

## 사진·매물 제거 및 운영 버튼

- 신규 등록 계약 v2 상세의 **방 사진**에서 등록 사진 썸네일과 대표 표시를 확인하고 사진을 누르면 확대해서 볼 수 있습니다. 가로·세로 사진 모두 잘리지 않도록 전체를 표시합니다. 확대 창은 닫기 버튼·Esc·배경 클릭으로 닫고 원래 사진 버튼으로 포커스를 돌립니다.
- 사진 로딩·불러오기 실패를 안내하고 카드·확대 창의 **사진 다시 불러오기**로 매물 상세를 재조회합니다. 서버가 반환한 최신 사진 조회 URL을 사용하며 재조회 중에는 버튼을 잠급니다. 다른 변경 작업 중이거나 저장하지 않은 주소 변경이 있으면 재조회를 막습니다.
- 사진은 서명된 HTTPS 조회 URL을 변경 없이 사용하며 이미지 최적화 프록시를 거치지 않습니다. 사진 요청에 관리자 Bearer 토큰을 추가하지 않고 referrer도 보내지 않습니다. 조회 URL 자체를 화면에 텍스트로 표시하지 않습니다.
- 레거시 상세 API에는 사진 목록·조회 URL이 없으므로 레거시 사진 열람은 이번 변경에 포함하지 않습니다. 필요하면 API 응답 확장이 선행돼야 합니다.

- v2 마지막 사진의 삭제 버튼은 비활성화하고 최소 한 장 유지 안내를 표시합니다. 오래된 화면에서 API가 `ROOM_LAST_PHOTO_REQUIRED`를 반환해도 원인별 안내를 제공합니다.
- 일반 사진 삭제 확인창은 기존 대표 사진 유지, 대표 사진 삭제 확인창은 남은 첫 사진으로 승계됨을 안내합니다. 성공 후 상세를 다시 조회하여 사진 목록·순서·대표 표시를 갱신하고 성공 안내를 유지합니다.
- 매물 삭제 성공 후 `/rooms`로 이동해 목록을 새로 조회하고 성공 안내를 표시합니다. 활성 예약이 있으면 삭제할 수 없음을 확인창에 안내하고 기존 오류 코드 안내를 사용합니다. 예약 없는 삭제 전용 테스트 매물로 목록 제외와 상세 재접근 실패를 배포 후 확인합니다.
- 수정 요청은 호스트의 제출 후 수정·재제출 기능이 이번 범위에 없으므로 준비 중 버튼으로 비활성화합니다. 해당 Server Action도 변경 요청을 보내지 않습니다. 수정 요청 알림도 재전송 대상에서 제외합니다.
- 승인·게시/재게시, 반려, 숨김, 주소 공개 설정, 내부 메모, 가격·설명 및 소제목·층수 수정은 기존 API 연결을 유지합니다. 변경 중 다른 작업의 실행을 막는 상세 화면 공통 잠금을 사진·매물 삭제에도 적용합니다.
- 승인·반려 알림 재전송은 API 요청 접수와 실제 전달 결과를 구분해 안내합니다. 실제 전달은 배포 환경의 알림 공급자 및 로그에서 별도로 확인해야 합니다.

실제 화면 검증은 일반 사진 삭제→대표 사진 유지, 대표 삭제→대표 승계, 마지막 사진 차단, 삭제 후 새로고침 유지, 매물 삭제→목록 반영 순으로 진행합니다. 활성 예약 삭제 차단 실화면 검증은 별도 보류 항목이며, 활성 예약 매물 삭제 허용·입주자 연락 이행 확인 정책은 추후 작업입니다.

사진 열람은 로컬 미리보기에서 가로·세로 썸네일/확대, 닫기·Esc와 포커스 복귀, 이미지 실패 안내, 재조회 중 잠금과 완료 후 버튼 복구를 확인했습니다. 배포 후에는 실제 v2 매물의 S3 사진 열람, 조회 URL 만료 후 다시 불러오기, 기존 대표 표시·삭제 후 사진 목록 갱신을 확인합니다. 사진 최소 수량 정책은 기존 한 장 유지 조건을 그대로 사용합니다.

저장 성공 후 상세를 다시 조회하여 서버 생성 제목·층수·확인 상태를 표시합니다. 신규 세 API는 기존 핵심 정보 수정 응답(`id`)과 다른 `roomId`, `title`, `subtitle`, `floor`, `addressVerifiedAt` 응답을 검증합니다. Legacy 상세 및 가격·설명 수정 기능은 유지합니다. Client 화면·지도 연동은 이 작업 범위에 포함하지 않습니다.

검증 명령: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## 게스트 희망 지역 요청

CS·super 관리자는 메뉴 **게스트 희망 지역 요청**(`/guest-region-requests`)에서 접수된 동네·학교명과 접수 시각을 최신순으로 확인합니다. 집주인 상담 신청과 별도 목록이며, 시각은 한국 시간으로 표시합니다.

- `GET /admin/guest-region-requests`를 기존 서버 전용 API 전송 계층으로 조회합니다. 응답의 `id`, `region`, `createdAt`과 페이지 정보를 검증하며 조회 결과를 캐시하지 않습니다.
- 페이지당 1~100건(기본 20건)을 조회합니다. 잘못된 페이지 조건은 기본값으로 보정하고, 마지막 페이지를 초과하면 마지막 유효 페이지로 이동합니다.
- 새로고침 버튼으로 신규 접수를 다시 조회하며 처리 중 중복 클릭을 방지합니다. 빈 목록·로딩·조회 실패 및 재시도 안내를 제공합니다. 조회 오류를 빈 목록으로 표시하지 않습니다.
- CS·super만 메뉴·직접 URL·API 조회를 허용합니다. 세션 갱신·재로그인 후에도 현재 목록의 페이지 조건으로 복귀합니다.
- 현재 API는 접수 목록 조회를 지원합니다. 상세 이동·수정·삭제·처리 상태 변경·연락·알림 발송 버튼은 추가하지 않습니다.

배포 전 API의 희망 지역 요청 migration과 두 API가 배포됐는지 확인합니다. 관리자 배포 후 CS·super 메뉴 표시, 다른 역할의 접근 차단, 빈 목록, 실제 접수 내용과 한국 시간, 페이지 이동·새로고침을 확인합니다. 사용자 사이트의 요청 폼 API 연결은 별도 후속 작업이므로, 두 사이트 배포 후 **사용자 폼 제출 → 관리자 새로고침 → 접수 내용 확인**까지 검증해야 합니다.

## 운영 배포 체크리스트

- 관리자 앱을 환경에 맞는 `https://dev-admin.hometogether.kr` 또는
  `https://admin.hometogether.kr`에서 HTTPS로 제공합니다.
- `ADMIN_API_BASE_URL`에는 배포 시점에 실제 routing 중인 승인된 HTTPS API
  host를 설정합니다.
- API 배포 환경의 `KAKAO_ADMIN_REDIRECT_URI`를 해당 관리자 origin의
  `/auth/kakao/callback`으로 설정하고 Kakao 개발자 콘솔에도 완전히 같은
  callback URL을 등록합니다.
- 프록시/CDN은 원래 요청의 `Host`와 `X-Forwarded-Host`를 보존합니다.
- 모든 관리자 앱 인스턴스에 같은 `ADMIN_SESSION_SECRET`과 안정된
  `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`를 공급합니다.
- `ADMIN_SESSION_SECRET`을 교체하면 기존 관리자 세션은 즉시 무효화되므로
  계획된 전체 재로그인으로 취급합니다.
- 브라우저는 API를 직접 호출하지 않습니다. 관리자 BFF가 서버에서 호출하므로
  브라우저 cross-origin CORS 허용에 의존하지 않습니다.
- 배포 전 `npm run lint`와 `npm run build`를 실행합니다. 실행 포트도
  `npm run start -- --port 3001`로 `3001`을 유지합니다.

로그아웃은 암호화된 관리자 세션 cookie만 지우는 local-only 동작입니다. 현재
API에는 토큰 폐기 endpoint가 없으므로 upstream revoke를 수행했다고 간주하면
안 됩니다.

관리자 BFF는 API의 `/admin/auth/kakao`와
`/admin/auth/kakao/callback`을 통해서만 관리자 OAuth를 처리합니다.

관리자 주소 화면에서는 법정동 이름·코드를 입력하거나 표시하지 않습니다. 주소 확인·게시에도 필수가 아니며, 기존 저장값은 보존합니다. 지번 주소의 동 이름을 자동 제목에 사용하고 동 이름이 없으면 시·군·구와 건물 유형으로 제목을 생성합니다. API의 법정동 필수 조건 제거 마이그레이션을 먼저 배포한 뒤 관리자 화면을 배포합니다.
