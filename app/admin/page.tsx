import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateKST, parseDateKST, SHIFT_LABEL, SHIFT_LUNCH, SHIFT_DINNER } from "@/lib/duty";
import { recordAbsencesToday } from "@/lib/absence";
import DatePicker from "./DatePicker";
import { AdminSkeleton } from "../Skeleton";
import ExportCsv from "./ExportCsv";
import { requireAdmin } from "@/lib/admin-auth";
import { logoutAdmin } from "./login/actions";

const DAY_LABEL = ["", "월", "화", "수", "목", "금"];

function Detail({ children }: { children: string }) {
  return <p className="mt-2 rounded-lg bg-idle-soft px-3 py-2 text-sm text-muted">특이사항: {children}</p>;
}

function Name({ name, grade }: { name: string; grade: number }) {
  return (
    <span className="font-bold">
      {name} <span className="text-sm font-normal text-muted">{grade}학년</span>
    </span>
  );
}

async function Attendance({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await connection();
  const raw = (await searchParams).date;
  const requested = typeof raw === "string" ? raw : "";
  const date = parseDateKST(requested) ? requested : formatDateKST();
  const range = parseDateKST(date)!;
  if (date === formatDateKST()) await recordAbsencesToday();

  const picker = (
    <div className="flex flex-wrap items-center gap-2">
      <DatePicker value={date} today={formatDateKST()} />
      <ExportCsv today={formatDateKST()} />
    </div>
  );

  if (range.day === 0) {
    return (
      <>
        {picker}
        <div className="card mt-6 w-full p-8 text-center">
          <p className="text-lg font-bold">주말에는 당번이 없어요</p>
        </div>
      </>
    );
  }

  const [users, records] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.choolsuck.findMany({ where: { date }, orderBy: { createdAt: "asc" } }),
  ]);
  const dutyRecords = records.filter((r) => r.kind === "duty");
  const makeupRecords = records.filter((r) => r.kind === "makeup");
  const absences = records.filter((r) => r.kind === "absent");
  const onDuty = users.filter((u) => u.day === range.day);
  const madeUp = users.filter((u) => makeupRecords.some((r) => r.userId === u.id));

  return (
    <>
      {picker}
      <h2 className="mt-8 text-2xl font-extrabold">
        {date} <span className="text-brand">({DAY_LABEL[range.day]})</span> 당번
      </h2>
      {[SHIFT_LUNCH, SHIFT_DINNER].map((shift) => {
        const members = onDuty.filter((u) => u.shift === shift);
        const present = members.filter((u) => dutyRecords.some((r) => r.userId === u.id)).length;
        return (
          <section key={shift} className="mt-5 w-full">
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-lg font-bold">{SHIFT_LABEL[shift]}</h3>
              {members.length > 0 && (
                <span className="text-sm font-semibold text-muted">
                  {present} / {members.length}명 출석
                </span>
              )}
            </div>
            {members.length === 0 ? (
              <p className="card p-4 text-muted">당번 없음</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {members.map((u) => {
                  const rec = dutyRecords.find((r) => r.userId === u.id);
                  const absent = absences.some((a) => a.userId === u.id && a.shift === shift);
                  return (
                    <li key={u.id} className="card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <Name name={u.name} grade={u.grade} />
                        <span className={`pill ${rec ? "pill-ok" : absent ? "pill-bad" : "pill-idle"}`}>
                          {rec ? "출석" : absent ? "결석" : "미출석"}
                        </span>
                      </div>
                      {rec?.detail && <Detail>{rec.detail}</Detail>}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <h2 className="mt-10 text-2xl font-extrabold">보충</h2>
      <ul className="mt-3 flex w-full flex-col gap-2">
        {madeUp.length === 0 && <li className="card p-4 text-muted">보충한 부원 없음</li>}
        {madeUp.map((u) => (
          <li key={u.id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <Name name={u.name} grade={u.grade} />
              <span className="pill pill-info">보충 완료</span>
            </div>
            {makeupRecords.filter((r) => r.userId === u.id).map((r) => r.detail && <Detail key={r.id}>{r.detail}</Detail>)}
          </li>
        ))}
      </ul>
    </>
  );
}

export default async function Admin({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="flex w-full flex-col items-start">
      <div className="mb-4 flex w-full items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">출석 관리</h1><form action={logoutAdmin}><button className="btn btn-ghost btn-sm" type="submit">로그아웃</button></form></div>
      <Suspense fallback={<AdminSkeleton />}>
        <Attendance searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
