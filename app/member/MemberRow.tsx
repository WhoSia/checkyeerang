"use client";

import { useState, useTransition } from "react";
import { deleteMember, updateMember } from "./actions";
import Modal from "../Modal";
import ChoiceGroup from "../ChoiceGroup";

type Member = {
  id: number;
  name: string;
  grade: number;
  day: number;
  shift: number;
  workCount: number;
  addCount: number;
  runCount: number;
};

const DAYS = ["월", "화", "수", "목", "금"];

export default function MemberRow({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(member.name);
  const [grade, setGrade] = useState(String(member.grade));
  const [day, setDay] = useState(String(member.day));
  const [shift, setShift] = useState(String(member.shift));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function openEdit() {
    setName(member.name);
    setGrade(String(member.grade));
    setDay(String(member.day));
    setShift(String(member.shift));
    setMessage("");
    setOpen(true);
  }

  function save() {
    startTransition(async () => {
      const result = await updateMember(member.id, {
        name,
        grade: Number(grade),
        day: Number(day),
        shift: Number(shift),
      });
      if (result.ok) setOpen(false);
      else setMessage(result.message);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteMember(member.id);
      setConfirmDelete(false);
    });
  }

  const stats = [
    { label: "출석", value: member.workCount, color: "text-ok" },
    { label: "보충", value: member.addCount, color: "text-brand" },
    { label: "결석", value: member.runCount, color: "text-bad" },
  ];

  return (
    <li className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-bold">
          {member.name} <span className="text-sm font-normal text-muted">{member.grade}학년</span>
        </p>
        <p className="text-sm text-muted">
          {DAYS[member.day - 1]}요일 · {member.shift === 1 ? "점심" : "저녁"}
        </p>
      </div>
      <dl className="flex gap-5 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className={`text-xl font-extrabold tabular-nums ${s.color}`}>{s.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex gap-2">
        <button type="button" onClick={openEdit} disabled={pending} className="btn btn-ghost btn-sm">
          수정
        </button>
        <button type="button" onClick={() => setConfirmDelete(true)} disabled={pending} className="btn btn-danger btn-sm">
          삭제
        </button>
      </div>

      {open && (
        <Modal label="부원 수정" onClose={() => setOpen(false)}>
          <h2 className="mb-4 text-2xl font-extrabold">부원 수정</h2>
          <div className="flex flex-col gap-4">
            <label className="label">
              이름
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} />
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
              options={[
                { value: "1", label: "점심" },
                { value: "2", label: "저녁" },
              ]}
            />
          </div>
          {message && <p className="mt-3 font-semibold text-bad">{message}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              취소
            </button>
            <button type="button" onClick={save} disabled={pending} className="btn btn-primary">
              {pending ? "저장 중..." : "저장"}
            </button>
          </div>
        </Modal>
      )}
      {confirmDelete && (
        <Modal alert narrow label="부원 삭제 확인" onClose={() => !pending && setConfirmDelete(false)}>
          <h2 className="mb-2 text-xl font-extrabold">{member.name} 부원을 삭제할까요?</h2>
          <p className="text-sm text-muted">출석·보충·결석 기록도 함께 삭제되며 되돌릴 수 없습니다.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={pending} className="btn btn-ghost">
              취소
            </button>
            <button type="button" onClick={remove} disabled={pending} className="btn btn-danger-solid">
              {pending ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </Modal>
      )}
    </li>
  );
}
