"use client";

import { useState } from "react";
import Modal from "../Modal";
import DateField from "../DateField";

export default function ExportCsv({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const invalid = !from || !to || to < from;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFrom(today);
          setTo(today);
          setOpen(true);
        }}
        className="btn btn-ghost"
      >
        CSV 내보내기
      </button>

      {open && (
        <Modal label="CSV 내보내기" onClose={() => setOpen(false)}>
          <h2 className="mb-1 text-2xl font-extrabold">CSV 내보내기</h2>
          <p className="mb-4 text-sm text-muted">선택한 기간의 정규 출석과 보충 출석을 내려받습니다.</p>
          <div className="flex flex-col gap-3">
            <div className="label">
              시작일
              <DateField label="시작일" value={from} today={today} max={to || undefined} onChange={setFrom} />
            </div>
            <div className="label">
              종료일
              <DateField label="종료일" value={to} today={today} min={from || undefined} onChange={setTo} />
            </div>
          </div>
          {invalid && <p className="mt-2 font-semibold text-bad">종료일은 시작일 이후여야 합니다.</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              취소
            </button>
            {invalid ? (
              <span className="btn btn-primary" aria-disabled="true" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                내려받기
              </span>
            ) : (
              <a href={`/admin/export?from=${from}&to=${to}`} download onClick={() => setOpen(false)} className="btn btn-primary">
                내려받기
              </a>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
