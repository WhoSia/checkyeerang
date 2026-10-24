// 서버가 켜져 있는 동안 1분마다 마감이 지난 미출석 당번을 결석으로 기록한다.
// (페이지를 열지 않아도 자동으로 처리되도록 하는 용도. 서버리스 환경에서는 동작하지 않는다.)
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as { __absenceTimer?: ReturnType<typeof setInterval> };
  if (g.__absenceTimer) return; // 개발 중 재실행되어도 타이머가 중복되지 않게 한다

  const { recordAbsencesToday } = await import("./lib/absence");
  const run = () => recordAbsencesToday().catch((e) => console.error("결석 자동 기록 실패:", e));

  g.__absenceTimer = setInterval(run, 60 * 1000);
  g.__absenceTimer.unref?.();
  run();
}
