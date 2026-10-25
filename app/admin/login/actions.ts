"use server";

import { checkAdminPassword, clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function loginAdmin(_previous: string, data: FormData) {
  const value = data.get("password");
  if (typeof value !== "string" || !checkAdminPassword(value)) {
    return "비밀번호를 확인하세요. 관리자 설정이 없는 경우 운영 담당자에게 문의하세요.";
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/");
}
