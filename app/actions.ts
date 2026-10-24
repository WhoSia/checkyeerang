"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentShift, formatDateKST, parseDateKST } from "@/lib/duty";

export async function submitAttendance(userId: number, detail: string) {
  // 클라이언트 값은 믿지 않고, 서버에서 현재 당번 시간대와 해당 부원인지 다시 검증
  const current = getCurrentShift();
  if (!current) return { ok: false, message: "지금은 당번 시간이 아닙니다." };

  const member = await prisma.user.findFirst({
    where: { id: userId, day: current.day, shift: current.shift },
    select: { id: true },
  });
  if (!member) return { ok: false, message: "지금 당번이 아닙니다." };

  const date = formatDateKST();
  const already = await prisma.choolsuck.findFirst({
    where: { userId: member.id, date, shift: current.shift, kind: { in: ["duty", "absent"] } },
    select: { id: true },
  });
  if (already) return { ok: false, message: "오늘은 이미 출석했습니다." };

  // 출석 기록과 출석 횟수(workCount) 증가는 함께 성공/실패해야 하므로 트랜잭션으로 처리
  try {
    await prisma.$transaction([
      prisma.choolsuck.create({
        data: {
          userId: member.id,
          date,
          day: current.day,
          shift: current.shift,
          kind: "duty",
          detail: detail.trim().slice(0, 1000),
        },
      }),
      prisma.user.update({ where: { id: member.id }, data: { workCount: { increment: 1 } } }),
    ]);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { ok: false, message: "오늘은 이미 출석했습니다." };
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "출석이 기록되었습니다." };
}

// 보충 출석: 당번이 아닌 부원이 오늘 보충한 기록 (choolsuck, kind=makeup, shift=0)
export async function submitMakeup(userId: number, detail: string) {
  const date = formatDateKST();
  const today = parseDateKST(date);
  if (!today || today.day === 0) return { ok: false, message: "주말에는 보충할 수 없습니다." };

  const member = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!member) return { ok: false, message: "부원을 선택하세요." };

  // 지금 당번인 부원은 보충 불가
  const current = getCurrentShift();
  if (current) {
    const onDuty = await prisma.user.findFirst({
      where: { id: member.id, day: current.day, shift: current.shift },
      select: { id: true },
    });
    if (onDuty) return { ok: false, message: "지금 당번은 보충할 수 없습니다." };
  }

  const already = await prisma.choolsuck.findFirst({
    where: { userId: member.id, date, kind: "makeup" },
    select: { id: true },
  });
  if (already) return { ok: false, message: "오늘 보충은 이미 기록되었습니다." };

  // 보충 기록과 보충 횟수(addCount) 증가는 함께 성공/실패해야 하므로 트랜잭션으로 처리
  try {
    await prisma.$transaction([
      prisma.choolsuck.create({
        data: { userId: member.id, date, day: today.day, shift: 0, kind: "makeup", detail: detail.trim().slice(0, 1000) },
      }),
      prisma.user.update({ where: { id: member.id }, data: { addCount: { increment: 1 } } }),
    ]);
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { ok: false, message: "오늘 보충은 이미 기록되었습니다." };
    throw e;
  }
  revalidatePath("/admin");
  return { ok: true, message: "보충이 기록되었습니다." };
}
