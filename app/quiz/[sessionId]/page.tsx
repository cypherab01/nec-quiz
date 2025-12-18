import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { QuizClient } from "./quiz-client";

export default async function QuizPage({
  params,
}: Readonly<{ params: Promise<{ sessionId: string }> }>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { sessionId } = await params;

  return <QuizClient sessionId={sessionId} />;
}
