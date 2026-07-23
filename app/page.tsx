import { HouseLineIcon } from "@phosphor-icons/react/ssr";
import { redirect } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import type { OAuthErrorCode } from "@/lib/auth/oauth";
import type { RefreshErrorCode } from "@/lib/auth/refresh";
import { ADMIN_ROLE_DEFAULT_ROUTES } from "@/lib/auth/roles";
import { readAdminSession } from "@/lib/auth/session";

type AuthQueryErrorCode = OAuthErrorCode | RefreshErrorCode;

const AUTH_ERROR_COPY = [
  { code: "oauth_start_rejected", message: "카카오 로그인을 시작하지 못했습니다. 다시 시도해 주세요." },
  { code: "oauth_start_unavailable", message: "로그인 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." },
  { code: "oauth_start_invalid_response", message: "로그인 요청을 처리하지 못했습니다. 다시 시도해 주세요." },
  { code: "oauth_callback_invalid", message: "로그인 요청을 확인할 수 없습니다. 처음부터 다시 시도해 주세요." },
  { code: "oauth_callback_rejected", message: "카카오 로그인이 완료되지 않았습니다. 다시 시도해 주세요." },
  { code: "oauth_callback_unavailable", message: "로그인 서비스가 일시적으로 응답하지 않습니다. 잠시 후 다시 시도해 주세요." },
  { code: "oauth_callback_invalid_response", message: "로그인 결과를 확인하지 못했습니다. 다시 시도해 주세요." },
  { code: "oauth_role_unsupported", message: "이 계정은 관리자 서비스에 접근할 수 없습니다." },
  { code: "refresh_session_invalid", message: "로그인 세션을 확인할 수 없습니다. 다시 로그인해 주세요." },
  { code: "refresh_rejected", message: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요." },
  { code: "refresh_unavailable", message: "세션 갱신 서비스에 연결할 수 없습니다. 잠시 후 다시 로그인해 주세요." },
  { code: "refresh_response_invalid", message: "로그인 세션을 갱신하지 못했습니다. 다시 로그인해 주세요." },
  { code: "refresh_role_unsupported", message: "현재 계정 권한으로 관리자 서비스에 접근할 수 없습니다." },
  { code: "refresh_subject_mismatch", message: "로그인 정보를 확인하지 못했습니다. 다시 로그인해 주세요." },
] as const satisfies readonly {
  readonly code: AuthQueryErrorCode;
  readonly message: string;
}[];

const UNKNOWN_AUTH_ERROR_COPY =
  "로그인 요청을 처리하지 못했습니다. 처음부터 다시 시도해 주세요.";

type HomePageProps = {
  readonly searchParams: Promise<{
    readonly authError?: string | readonly string[];
  }>;
};

function authErrorCopy(value: string | readonly string[] | undefined): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string") return UNKNOWN_AUTH_ERROR_COPY;
  return AUTH_ERROR_COPY.find((entry) => entry.code === value)?.message ??
    UNKNOWN_AUTH_ERROR_COPY;
}

export default async function Home({ searchParams }: HomePageProps) {
  const sessionResult = await readAdminSession();
  switch (sessionResult.kind) {
    case "valid":
      redirect(ADMIN_ROLE_DEFAULT_ROUTES[sessionResult.session.role]);
    case "invalid":
    case "expired":
      redirect(`/auth/refresh?${new URLSearchParams({ returnTo: "/" })}`);
    case "missing":
      break;
    default:
      sessionResult satisfies never;
  }

  const errorMessage = authErrorCopy((await searchParams).authError);

  return (
    <main className="grid min-h-[100dvb] flex-1 place-items-center px-5 py-10 sm:px-6">
      <section
        aria-labelledby="login-title"
        className="grid w-full max-w-md gap-6 rounded-dialog border border-line-subtle bg-surface p-6 sm:p-8"
      >
        <div className="grid justify-items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-panel border border-line-subtle bg-brand-soft text-brand-soft-ink">
            <HouseLineIcon
              aria-hidden="true"
              focusable="false"
              size={24}
              weight="fill"
            />
          </span>
          <div className="grid gap-2">
            <p className="text-label font-semibold text-brand-soft-ink">
              HomeTogether Admin
            </p>
            <h1
              className="admin-keep-words text-page-title font-semibold text-ink-strong"
              id="login-title"
            >
              관리자 로그인
            </h1>
            <p className="admin-keep-words text-body text-ink-subtle">
              카카오로 로그인해 관리 업무를 계속하세요.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <Alert title="로그인 안내" variant="error">
            <p>{errorMessage}</p>
          </Alert>
        ) : null}

        <a
          className="admin-focus admin-interactive flex min-h-touch w-full items-center justify-center rounded-control bg-kakao px-4 text-body font-semibold text-ink-strong hover:bg-kakao-hover"
          href="/auth/kakao"
        >
          카카오로 로그인
        </a>
      </section>
    </main>
  );
}
