import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentShift, SHIFT_LABEL, SHIFT_TIME, formatDateKST } from "@/lib/duty";
import AttendButton from "./AttendButton";
import MakeupForm from "./MakeupForm";
import { DateSkeleton, DutySkeleton, MakeupSkeleton } from "./Skeleton";
import { recordAbsencesToday } from "@/lib/absence";

async function Today() {
  await connection();

  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", ...options });

  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-muted">{fmt({ year: "numeric" })}</p>
      <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        {fmt({ month: "long", day: "numeric" })}
        <span className="ml-2 text-brand">{fmt({ weekday: "long" })}</span>
      </p>
    </div>
  );
}

async function OnDuty() {
  await connection();
  await recordAbsencesToday(); // 마감이 지난 미출석 당번 기록

  const current = getCurrentShift();
  if (!current) {
    return (
      <section className="card mt-6 w-full p-8 text-center">
        <p className="text-xl font-bold">없음</p>
      </section>
    );
  }

  const members = await prisma.user.findMany({
    where: { day: current.day, shift: current.shift },
    select: { id: true, name: true },
  });

  const attended = new Set(
    (
      await prisma.choolsuck.findMany({
        where: { userId: { in: members.map((m) => m.id) }, date: formatDateKST(), kind: "duty" },
        select: { userId: true },
      })
    ).map((r) => r.userId),
  );

  return (
    <section className="mt-6 w-full" aria-labelledby="duty-title">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 id="duty-title" className="text-lg font-bold">
          지금 {SHIFT_LABEL[current.shift]} 당번
        </h2>
        <span className="pill pill-info">{SHIFT_TIME[current.shift]}</span>
      </div>
      {members.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <li key={m.id} className="card flex flex-col items-center gap-4 p-5">
              <span className="text-4xl font-extrabold tracking-tight">{m.name}</span>
              <AttendButton userId={m.id} name={m.name} attended={attended.has(m.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-xl font-bold">오늘 {SHIFT_LABEL[current.shift]} 당번은 없어요</p>
        </div>
      )}
    </section>
  );
}

async function Makeup() {
  await connection();
  const current = getCurrentShift();
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, grade: true, day: true, shift: true },
  });
  const members = users.map((u) => ({
    id: u.id,
    name: u.name,
    grade: u.grade,
    onDuty: !!current && u.day === current.day && u.shift === current.shift,
  }));
  return <MakeupForm members={members} />;
}

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="sr-only">출석체크</h1>
      <Suspense fallback={<DateSkeleton />}>
        <Today />
      </Suspense>
      <Suspense fallback={<DutySkeleton />}>
        <OnDuty />
      </Suspense>
      <Suspense fallback={<MakeupSkeleton />}>
        <Makeup />
      </Suspense>
    </div>
  );
}
