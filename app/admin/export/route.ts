import { prisma } from "@/lib/prisma";
import { parseDateKST, SHIFT_LABEL } from "@/lib/duty";

// 엑셀에서 수식으로 실행되지 않게 하고, CSV 규칙에 맞게 따옴표로 감싼다
function cell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const DAY_NAME = ["일", "월", "화", "수", "목", "금", "토"];

const KIND_LABEL: Record<string, string> = { makeup: "보충", absent: "결석" }; // 정규 출석은 빈칸

// 한국 시간 기준 "2026. 9. 11 오후 12:35:40" 형식
function kst(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

function formatKST(date: Date) {
  const t = kst(date);
  const hour = t.getUTCHours();
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}. ${t.getUTCMonth() + 1}. ${t.getUTCDate()} ${hour < 12 ? "오전" : "오후"} ${hour12}:${pad(t.getUTCMinutes())}:${pad(t.getUTCSeconds())}`;
}

// 기록된 시각이 12~14시면 점심, 17~19시면 저녁, 그 밖이면 빈칸
function recordedShift(date: Date) {
  const h = kst(date).getUTCHours();
  return h >= 12 && h < 14 ? "점심" : h >= 17 && h < 19 ? "저녁" : "";
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = parseDateKST(params.get("from") ?? "");
  const to = parseDateKST(params.get("to") ?? "");
  if (!from || !to) return new Response("시작일과 종료일을 올바르게 입력하세요.", { status: 400 });
  if (to.start < from.start) return new Response("종료일이 시작일보다 빠릅니다.", { status: 400 });

  const records = await prisma.choolsuck.findMany({
    where: { createdAt: { gte: from.start, lt: to.end } },
    include: { user: { select: { name: true, grade: true, day: true, shift: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const rows = records.map((r) => ({
    at: r.createdAt,
    kind: KIND_LABEL[r.kind] ?? "",
    // 보충 기록의 shift는 0이라 부원의 당번 시간을 쓴다
    shift: SHIFT_LABEL[r.kind === "makeup" ? r.user.shift : r.shift] ?? "",
    r,
  }));

  const lines = [["요일", "일시", "시간", "이름", "학년", "구분", "담당 요일", "담당 시간", "특이사항"].map(cell).join(",")];
  for (const { at, kind, shift, r } of rows) {
    lines.push([DAY_NAME[kst(at).getUTCDay()], formatKST(at), recordedShift(at), r.user.name, r.user.grade, kind, DAY_NAME[r.user.day], shift, r.detail].map(cell).join(","));
  }

  // BOM을 붙여야 엑셀에서 한글이 깨지지 않는다
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  const fromStr = params.get("from");
  const toStr = params.get("to");
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance_${fromStr}_${toStr}.csv"`,
    },
  });
}
