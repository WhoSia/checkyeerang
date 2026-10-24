"use client";

import { useState, useTransition } from "react";
import { addMember } from "./actions";
import Modal from "../Modal";
import ChoiceGroup from "../ChoiceGroup";

const DAYS = ["월", "화", "수", "목", "금"];
const SHIFTS = [
  ["1", "점심"],
  ["2", "저녁"],
];

export default function AddMember() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [day, setDay] = useState("1");
  const [shift, setShift] = useState("1");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function openModal() {
    setName("");
    setGrade("1");
    setDay("1");
    setShift("1");
    setMessage("");
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      const result = await addMember({ name, grade: Number(grade), day: Number(day), shift: Number(shift) });
      if (result.ok) setOpen(false);
      else setMessage(result.message);
    });
  }

  return (
    <>
      <button type="button" onClick={openModal} className="btn btn-primary">
        + 부원 추가
      </button>

      {open && (
        <Modal label="부원 추가" onClose={() => setOpen(false)}>
          <h2 className="mb-4 text-2xl font-extrabold">부원 추가</h2>
          <div className="flex flex-col gap-4">
            <label className="label">
              이름
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <ChoiceGroup
              label="학년"
              value={grade}
              onChange={setGrade}
              options={["1", "2", "3"].map((g) => ({ value: g, label: `${g}학년` }))}
            />
            <ChoiceGroup
              label="요일"
              value={day}
              onChange={setDay}
              options={DAYS.map((d, i) => ({ value: String(i + 1), label: d }))}
            />
            <ChoiceGroup
              label="시간"
              value={shift}
              onChange={setShift}
              options={SHIFTS.map(([value, label]) => ({ value, label }))}
            />
          </div>
          {message && <p className="mt-3 font-semibold text-bad">{message}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              취소
            </button>
            <button type="button" onClick={save} disabled={pending} className="btn btn-primary">
              {pending ? "저장 중..." : "추가"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
