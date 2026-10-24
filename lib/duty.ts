export const SHIFT_LUNCH = 1;
export const SHIFT_DINNER = 2;

// 당번 시간대 (점심 12:30 ~ 13:00, 저녁 17:40 ~ 18:00)
export const SHIFT_TIME: Record<number, string> = {
  [SHIFT_LUNCH]: "12:30 ~ 13:00",
  [SHIFT_DINNER]: "17:40 ~ 18:00",
};

export const SHIFT_LABEL: Record<number, string> = {
  [SHIFT_LUNCH]: "점심",
  [SHIFT_DINNER]: "저녁",
};

// 한국 시간 기준 현재 요일(1~5: 월~금)과 당번 종류를 반환. 해당 없으면 null.
export function getCurrentShift(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(get("weekday")) + 1;
  if (day === 0) return null; // 주말

  const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));

  // 점심 12:30 ~ 13:00, 저녁 17:40 ~ 18:00
  if (minutes >= 12 * 60 + 30 && minutes < 13 * 60) return { day, shift: SHIFT_LUNCH };
  if (minutes >= 17 * 60 + 40 && minutes < 18 * 60) return { day, shift: SHIFT_DINNER };
  return null;
}

// 한국 시간 기준 YYYY-MM-DD
export function formatDateKST(now: Date = new Date()) {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// YYYY-MM-DD(한국 날짜)를 그날의 [시작, 끝) 시각과 요일(1~5=월~금, 주말은 0)로 변환. 형식이 틀리면 null.
export function parseDateKST(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const utc = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(utc)) return null;
  const start = new Date(utc - 9 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const dow = new Date(utc).getUTCDay(); // 0 일, 6 토
  return { start, end, day: dow >= 1 && dow <= 5 ? dow : 0 };
}
