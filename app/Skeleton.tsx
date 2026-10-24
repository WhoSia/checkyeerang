// 데이터를 불러오는 동안 보여 주는 스켈레톤(깜빡이는 자리표시) 모음

function Block({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

export function DateSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="flex flex-col items-center gap-2">
      <Block className="h-5 w-24" />
      <Block className="h-9 w-64" />
    </div>
  );
}

export function DutySkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="mt-6 flex w-full flex-col gap-3">
      <Block className="h-6 w-32" />
      <Block className="h-36 w-full" />
    </div>
  );
}

export function MakeupSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="mt-8 flex w-full flex-col gap-3 p-5">
      <Block className="h-7 w-32" />
      <Block className="h-11 w-full" />
      <Block className="h-20 w-full" />
      <Block className="h-11 w-full" />
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="flex w-full flex-col gap-4">
      <div className="flex gap-2">
        <Block className="h-11 w-44" />
        <Block className="h-11 w-32" />
      </div>
      <Block className="h-8 w-56" />
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Block className="h-6 w-16" />
          <Block className="h-16 w-full" />
        </div>
      ))}
      <Block className="mt-4 h-8 w-20" />
      {[0, 1, 2].map((i) => (
        <Block key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function MemberListSkeleton() {
  return (
    <ul role="status" aria-label="불러오는 중" className="flex w-full flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i}>
          <Block className="h-[84px] w-full" />
        </li>
      ))}
    </ul>
  );
}
