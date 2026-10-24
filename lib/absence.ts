import { prisma } from "./prisma";
import { formatDateKST, parseDateKST, SHIFT_DINNER, SHIFT_LUNCH } from "./duty";

// 당번 출석 마감 시각(한국 시간): 점심 13:00, 저녁 18:00
const DEADLINE_HOUR: Record<number, number> = { [SHIFT_LUNCH]: 13, [SHIFT_DINNER]: 18 };

// 오늘 마감이 지난 당번 중 출석하지 않은 부원을 choolsuck에 결석(absent)으로 기록하고 runCount를 1 올린다.
// 같은 (부원, 날짜, 당번, 종류)는 unique 제약으로 한 번만 들어가므로 여러 번 호출해도 한 번만 반영된다.
export async function recordAbsencesToday(now: Date = new Date()) {
  const date = formatDateKST(now);
  const range = parseDateKST(date);
  if (!range || range.day === 0) return;

  for (const shift of [SHIFT_LUNCH, SHIFT_DINNER]) {
    const deadline = new Date(range.start.getTime() + DEADLINE_HOUR[shift] * 60 * 60 * 1000);
    if (now < deadline) continue;

    const missing = await prisma.user.findMany({
      where: {
        day: range.day,
        shift,
        createdAt: { lt: range.start }, // 오늘 이전에 등록된 부원만
        choolsucks: { none: { date, kind: { in: ["duty", "absent"] }, shift } },
      },
      select: { id: true },
    });

    for (const { id } of missing) {
      try {
        await prisma.$transaction([
          prisma.choolsuck.create({
            data: { userId: id, date, day: range.day, shift, kind: "absent", createdAt: deadline },
          }),
          prisma.user.update({ where: { id }, data: { runCount: { increment: 1 } } }),
        ]);
      } catch (e) {
        // 동시에 다른 요청이 먼저 기록한 경우(unique 위반)는 무시하고, 그 외 오류만 던진다
        if ((e as { code?: string }).code !== "P2002") throw e;
      }
    }
  }
}
