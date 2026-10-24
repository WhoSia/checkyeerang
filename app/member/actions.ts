"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type MemberInput = { name: string; grade: number; day: number; shift: number };

function validate(data: MemberInput) {
  if (!data.name.trim()) return "이름을 입력하세요.";
  if (!Number.isInteger(data.grade) || data.grade < 1 || data.grade > 3) return "학년은 1~3 중에서 선택하세요.";
  if (!Number.isInteger(data.day) || data.day < 1 || data.day > 5) return "요일은 월~금 중에서 선택하세요.";
  if (data.shift !== 1 && data.shift !== 2) return "점심/저녁을 선택하세요.";
  return null;
}

export async function updateMember(id: number, data: MemberInput) {
  const error = validate(data);
  if (error) return { ok: false, message: error };
  const name = data.name.trim();

  try {
    await prisma.user.update({ where: { id }, data: { name, grade: data.grade, day: data.day, shift: data.shift } });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") return { ok: false, message: "이미 같은 이름의 부원이 있습니다." };
    if (code === "P2025") return { ok: false, message: "존재하지 않는 부원입니다." };
    throw e;
  }
  revalidatePath("/member");
  return { ok: true, message: "수정되었습니다." };
}

// 출석/보충/결석 기록이 부원을 참조하므로 함께 지운다
export async function deleteMember(id: number) {
  await prisma.$transaction([
    prisma.choolsuck.deleteMany({ where: { userId: id } }),
    prisma.user.deleteMany({ where: { id } }),
  ]);
  revalidatePath("/member");
  return { ok: true, message: "삭제되었습니다." };
}

export async function addMember(data: MemberInput) {
  const error = validate(data);
  if (error) return { ok: false, message: error };
  const name = data.name.trim();

  try {
    await prisma.user.create({ data: { name, grade: data.grade, day: data.day, shift: data.shift } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { ok: false, message: "이미 같은 이름의 부원이 있습니다." };
    throw e;
  }
  revalidatePath("/member");
  return { ok: true, message: "추가되었습니다." };
}
