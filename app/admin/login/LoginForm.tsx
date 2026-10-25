"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

export default function LoginForm() {
  const [message, action, pending] = useActionState(loginAdmin, "");
  return (
    <form action={action} className="card flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-2xl font-extrabold">관리자 로그인</h1>
      <label className="label">
        관리자 비밀번호
        <input className="field" type="password" name="password" autoComplete="current-password" required maxLength={1024} />
      </label>
      {message && <p role="alert" className="text-sm text-bad">{message}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? "확인 중..." : "로그인"}</button>
      <p className="text-sm text-muted">출석 제출에는 관리자 로그인이 필요하지 않습니다.</p>
    </form>
  );
}
