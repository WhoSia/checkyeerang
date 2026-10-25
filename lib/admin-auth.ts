import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "checkyeerang_admin";
const SESSION_AGE = 8 * 60 * 60;

function config() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!secret || secret.length < 32 || !hash) return null;
  const [salt, digest] = hash.split(":");
  if (!salt || !digest || !/^[0-9a-f]{128}$/i.test(digest)) return null;
  return { secret, salt, digest };
}

function signature(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

export function checkAdminPassword(password: string) {
  const c = config();
  if (!c || password.length > 1024) return false;
  const actual = scryptSync(password, c.salt, 64);
  const expected = Buffer.from(c.digest, "hex");
  return timingSafeEqual(actual, expected);
}

export async function isAdmin() {
  const c = config();
  if (!c) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [timestamp, mac] = parts;
  if (!/^\d{10,}$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(mac)) return false;
  const issued = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(issued) || issued > now + 60 || now - issued > SESSION_AGE) return false;
  const expected = Buffer.from(signature(timestamp, c.secret), "hex");
  return timingSafeEqual(Buffer.from(mac, "hex"), expected);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminSession() {
  const c = config();
  if (!c) throw new Error("관리자 설정이 없습니다.");
  const timestamp = String(Math.floor(Date.now() / 1000));
  (await cookies()).set(COOKIE, timestamp + "." + signature(timestamp, c.secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production" && process.env.ADMIN_HTTPS === "true",
    path: "/",
    maxAge: SESSION_AGE,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}
