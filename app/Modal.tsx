"use client";

import { useEffect, type ReactNode } from "react";

// 공통 모달: 바깥 클릭·Esc로 닫고, 모바일에서는 아래에서 올라오는 시트가 된다.
export default function Modal({
  onClose,
  children,
  alert = false,
  narrow = false,
  label,
}: {
  onClose: () => void;
  children: ReactNode;
  alert?: boolean;
  narrow?: boolean;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-label={label}
        className={`modal ${narrow ? "modal-narrow" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
