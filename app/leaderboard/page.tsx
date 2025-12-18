import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LeaderboardPage() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rows = await prisma.quizAttempt.groupBy({
    by: ["userId"],
    _count: { _all: true },
    _sum: { correctCount: true, totalCount: true },
    _max: { submittedAt: true },
    orderBy: [{ _sum: { correctCount: "desc" } }, { _max: { submittedAt: "desc" } }],
    take: 50,
  });

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            Top students by total correct answers (last 50).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild>
            <Link href="/play">Play</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Correct</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No attempts yet. Play a quiz to appear here.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => {
                const totalQuestions = r._sum.totalCount ?? 0;
                const totalCorrect = r._sum.correctCount ?? 0;
                const accuracy =
                  totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
                return (
                  <TableRow key={r.userId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">
                      {userById.get(r.userId)?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">{r._count._all}</TableCell>
                    <TableCell className="text-right">{totalCorrect}</TableCell>
                    <TableCell className="text-right">{totalQuestions}</TableCell>
                    <TableCell className="text-right">
                      {accuracy.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


