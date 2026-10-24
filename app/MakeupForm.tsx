"use client";

import { useEffect, useState, useTransition } from "react";
import { submitMakeup } from "./actions";
import Modal from "./Modal";

export default function MakeupForm({ members }: { members: { id: number; name: string; grade: number; onDuty: boolean }[] }) {
  const [userId, setUserId] = useState("");
  const [picking, setPicking] = useState(false);
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  // 성공 메시지는 3초 뒤에 사라지게 한다 (오류 메시지는 그대로 둔다)
  useEffect(() => {
    if (!ok || !message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [ok, message]);

  const selected = members.find((m) => String(m.id) === userId);

  function submit() {
    startTransition(async () => {
      const result = await submitMakeup(Number(userId), detail);
      setMessage(result.message);
      setOk(result.ok);
      if (result.ok) setDetail("");
    });
  }

  return (
    <section className="mt-10 flex w-full flex-col gap-4 border-t border-line pt-8" aria-labelledby="makeup-title">
      <h2 id="makeup-title" className="text-lg font-bold">
        보충 출석
      </h2>
      <div className="label">
        부원
        <button
          type="button"
          onClick={() => setPicking(true)}
          aria-haspopup="dialog"
          className="field flex items-center justify-between gap-3 text-left font-semibold"
        >
          <span className={selected ? "" : "text-muted"}>{selected ? selected.name : "부원 선택"}</span>
          <svg className="h-4 w-4 text-muted" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {picking && (
        <Modal label="부원 선택" onClose={() => setPicking(false)}>
          <h2 className="mb-4 text-2xl font-extrabold">부원 선택</h2>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((grade) => {
              const group = members.filter((m) => m.grade === grade);
              return (
                <div key={grade} role="group" aria-label={`${grade}학년`}>
                  <p className="mb-2 text-sm font-bold text-muted">{grade}학년</p>
                  {group.length === 0 ? (
                    <p className="text-sm text-muted">부원 없음</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {group.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          disabled={m.onDuty}
                          aria-pressed={userId === String(m.id)}
                          onClick={() => {
                            setUserId(String(m.id));
                            setPicking(false);
                          }}
                          className="choice flex-none px-4"
                        >
                          {m.name}
                          {m.onDuty && <span className="ml-1 text-xs font-normal">(현재 당번)</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => setPicking(false)} className="btn btn-ghost">
              닫기
            </button>
          </div>
        </Modal>
      )}
      <label className="label">
        특이사항
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={1000}
          rows={3}
          className="field resize-none"
        />
      </label>
      {message && (
        <p role="status" className={`font-semibold ${ok ? "text-ok" : "text-bad"}`}>
          {message}
        </p>
      )}
      <button type="button" onClick={submit} disabled={pending || !userId} className="btn btn-primary">
        {pending ? "저장 중..." : "보충 기록"}
      </button>
    </section>
  );
}
