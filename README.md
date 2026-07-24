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

## 운영 배포 체크리스트

- 관리자 앱을 환경에 맞는 `https://dev-admin.hometogether.kr` 또는
  `https://admin.hometogether.kr`에서 HTTPS로 제공합니다.
- `ADMIN_API_BASE_URL`에는 배포 시점에 실제 routing 중인 승인된 HTTPS API
  host를 설정합니다.
- API 배포 환경의 `KAKAO_REDIRECT_URI`를 해당 관리자 origin의
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

이 관리자 대시보드 작업은 API 저장소를 변경하지 않습니다.
