"use client";

import { useState, useTransition } from "react";
import { submitAttendance } from "./actions";
import Modal from "./Modal";

export default function AttendButton({ userId, name, attended }: { userId: number; name: string; attended: boolean }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const completed = attended || done;

  function close() {
    setOpen(false);
    setDetail("");
    setMessage("");
    setDone(false);
    setConfirming(false);
  }

  function submit() {
    startTransition(async () => {
      const result = await submitAttendance(userId, detail);
      setMessage(result.message);
      setDone(result.ok);
      setConfirming(false);
    });
  }

  return (
    <>
      {completed ? (
        <div className="pill pill-ok w-full justify-center py-3 text-lg" role="status">
          <svg className="check-pop h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          출석 완료
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-primary btn-lg">
          출석하기
        </button>
      )}

      {open && !attended && (
        <>
          <Modal label={`${name} 출석`} onClose={() => !confirming && close()}>
            <h2 className="mb-4 text-2xl font-extrabold">{name} 출석</h2>
            <label className="label" htmlFor={`detail-${userId}`}>
              특이사항
            </label>
            <textarea
              id={`detail-${userId}`}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              disabled={done}
              maxLength={1000}
              rows={5}
              className="field mt-1 resize-none"
            />
            <p className="mt-1 text-right text-xs text-muted">{detail.length} / 1000</p>
            {message && (
              <p role="status" className={`mt-2 font-semibold ${done ? "text-ok" : "text-bad"}`}>
                {message}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={close} className="btn btn-ghost">
                {done ? "닫기" : "취소"}
              </button>
              {!done && (
                <button type="button" onClick={() => setConfirming(true)} disabled={pending} className="btn btn-primary">
                  출석 기록
                </button>
              )}
            </div>
          </Modal>

          {confirming && (
            <Modal alert narrow label="출석 확인" onClose={() => !pending && setConfirming(false)}>
              <h3 className="mb-2 text-xl font-extrabold">{name} 님, 출석할까요?</h3>
              <p className="rounded-lg bg-idle-soft p-3 text-sm text-muted">
                특이사항: {detail.trim() ? detail.trim() : "없음"}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirming(false)} disabled={pending} className="btn btn-ghost">
                  취소
                </button>
                <button type="button" onClick={submit} disabled={pending} className="btn btn-primary">
                  {pending ? "저장 중..." : "확인"}
                </button>
              </div>
            </Modal>
          )}
        </>
      )}
    </>
  );
}
