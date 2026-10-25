import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import MemberRow from "./MemberRow";
import { MemberListSkeleton } from "../Skeleton";
import AddMember from "./AddMember";
import { requireAdmin } from "@/lib/admin-auth";

async function MemberList() {
  await connection();
  const members = await prisma.user.findMany({
    orderBy: [{ day: "asc" }, { shift: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      grade: true,
      day: true,
      shift: true,
      workCount: true,
      addCount: true,
      runCount: true,
    },
  });

  if (members.length === 0) {
    return (
      <div className="card w-full p-8 text-center">
        <p className="font-bold">등록된 부원이 없어요</p>
        <p className="text-sm text-muted">오른쪽 위 “부원 추가”로 시작해 보세요.</p>
      </div>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-2">
      {members.map((m) => (
        <MemberRow key={m.id} member={m} />
      ))}
    </ul>
  );
}

export default async function Member() {
  await requireAdmin();
  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-4 flex w-full items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">부원 관리</h1>
        <AddMember />
      </div>
      <Suspense fallback={<MemberListSkeleton />}>
        <MemberList />
      </Suspense>
    </div>
  );
}
