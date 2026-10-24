"use client";

import { useEffect, useRef, useState } from "react";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function Calendar({
  value,
  today,
  min,
  max,
  onSelect,
}: {
  value: string;
  today: string;
  min?: string;
  max?: string;
  onSelect: (date: string) => void;
}) {
  const [vy, vm] = value.split("-").map(Number);
  const [view, setView] = useState({ y: vy, m: vm - 1 });

  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  // 항상 6주(42칸)로 채워서 달마다 달력 높이가 달라지지 않게 한다
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length < 42) cells.push(null);

  function move(delta: number) {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  }

  return (
    <div className="w-full select-none">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="이전 달" className="btn btn-ghost btn-sm w-9 px-0">
          ‹
        </button>
        <p className="font-extrabold">
          {view.y}년 {view.m + 1}월
        </p>
        <button type="button" onClick={() => move(1)} aria-label="다음 달" className="btn btn-ghost btn-sm w-9 px-0">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK.map((w, i) => (
          <span key={w} className={`py-1 text-xs font-bold ${i === 0 ? "text-bad" : i === 6 ? "text-brand" : "text-muted"}`}>
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} className="h-10" />; // 빈 주도 높이를 유지해야 한다
          const key = toKey(view.y, view.m, d);
          const selected = key === value;
          const disabled = (!!min && key < min) || (!!max && key > max);
          const weekend = (i % 7 === 0 || i % 7 === 6) && !selected;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(key)}
              aria-label={`${view.y}년 ${view.m + 1}월 ${d}일`}
              aria-pressed={selected}
              aria-current={key === today ? "date" : undefined}
              className={`h-10 rounded-lg text-sm font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                selected
                  ? "bg-brand text-[var(--on-brand)]"
                  : `hover:bg-brand-soft ${weekend ? (i % 7 === 0 ? "text-bad" : "text-brand") : ""} ${
                      key === today ? "ring-2 ring-inset ring-leaf" : ""
                    }`
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onSelect(today)}
        disabled={(!!min && today < min) || (!!max && today > max)}
        className="btn btn-ghost btn-sm mt-3 w-full"
      >
        오늘
      </button>
    </div>
  );
}

// 날짜 필드: 누르면 직접 만든 달력이 열린다. float면 아래로 떠서 열리고, 아니면 필드 아래에 펼쳐진다.
export default function DateField({
  value,
  today,
  onChange,
  min,
  max,
  float = false,
  label,
}: {
  value: string;
  today: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  float?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const [y, m, d] = value.split("-").map(Number);
  const weekday = value ? WEEK[new Date(y, m - 1, d).getDay()] : "";

  return (
    <div ref={ref} className={float ? "relative" : "w-full"}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        className="field flex items-center justify-between gap-3 text-left font-semibold"
      >
        <span className="tabular-nums">{value ? `${value} (${weekday})` : "날짜 선택"}</span>
        <svg className="h-5 w-5 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
          <path d="M3 8.5h14M7 2.5v3M13 2.5v3" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className={`card p-3 ${float ? "absolute left-0 top-full z-40 mt-2 w-72" : "mt-2"}`}>
          <Calendar
            value={value || today}
            today={today}
            min={min}
            max={max}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
