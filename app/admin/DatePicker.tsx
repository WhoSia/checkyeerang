"use client";

import { useRouter } from "next/navigation";
import DateField from "../DateField";

export default function DatePicker({ value, today }: { value: string; today: string }) {
  const router = useRouter();
  return (
    <div className="w-56">
      <DateField float label="날짜 선택" value={value} today={today} onChange={(date) => router.push(`/admin?date=${date}`)} />
    </div>
  );
}
