"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

function getSafeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/")) {
    return "/trips";
  }

  return rawNext;
}

function buildCallbackUrl(nextPath: string) {
  const origin = window.location.origin;
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => getSafeNextPath(searchParams.get("next")), [searchParams]);
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  async function handleGoogleSignIn() {
    setGooglePending(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildCallbackUrl(nextPath),
      },
    });

    if (error) {
      setGooglePending(false);
      setErrorMessage(error.message);
    }
  }

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setErrorMessage("이메일 주소를 입력해 주세요.");
      return;
    }

    setEmailPending(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: buildCallbackUrl(nextPath),
      },
    });

    setEmailPending(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEmailSent(true);
    toast.success("로그인 링크를 보냈습니다.", {
      description: "이메일에서 인증 링크를 클릭하면 SyncTrip으로 돌아옵니다.",
    });
  }

  return (
    <div className="w-full max-w-md space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">로그인</h1>
        <p className="text-sm text-muted-foreground">
          로그인하면 여행을 저장하고 친구를 초대해 함께 편집할 수 있습니다.
        </p>
      </div>

      {callbackError ? (
        <Alert variant="destructive">
          <AlertTitle>로그인을 완료하지 못했습니다.</AlertTitle>
          <AlertDescription>다시 시도하거나 다른 로그인 방식을 사용해 주세요.</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>인증 요청에 실패했습니다.</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {emailSent ? (
        <Alert>
          <AlertTitle>이메일을 확인해 주세요.</AlertTitle>
          <AlertDescription>
            받은 편지함에서 로그인 링크를 열면 바로 SyncTrip으로 돌아옵니다.
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="h-11 w-full rounded-xl"
        onClick={handleGoogleSignIn}
        disabled={googlePending || emailPending}
      >
        {googlePending ? <Loader2 className="animate-spin" /> : null}
        Google로 계속하기
      </Button>

      <div className="relative py-1 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
        <span className="bg-background px-3">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={handleEmailSignIn}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">이메일</span>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={emailPending || googlePending}
          />
        </label>

        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-xl"
          disabled={emailPending || googlePending}
        >
          {emailPending ? <Loader2 className="animate-spin" /> : null}
          이메일 로그인 링크 보내기
        </Button>
      </form>
    </div>
  );
}
