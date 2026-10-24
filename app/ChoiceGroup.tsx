"use client";

// 드롭다운 대신 쓰는 버튼형 선택 (학년·요일·당번)
export default function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; disabled?: boolean }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="label" role="group" aria-label={label}>
      {label}
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className="choice"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
