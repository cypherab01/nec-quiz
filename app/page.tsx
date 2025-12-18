import Link from "next/link";
import { headers } from "next/headers";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default function Home() {
  // Server component: render links based on session + role.
  // (No client-side auth required here.)
  const hdrsPromise = headers();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">NEC Quiz</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Practice Nepal Engineering Council registration exam questions.
        </p>

        <HomeActions hdrsPromise={hdrsPromise} />
      </div>
    </div>
  );
}

async function HomeActions({ hdrsPromise }: { hdrsPromise: Promise<Headers> }) {
  const hdrs = await hdrsPromise;
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  const userId = session?.user?.id ?? null;
  const profile = userId
    ? await prisma.userProfile.findUnique({
        where: { userId },
        select: { role: true },
      })
    : null;

  const role = profile?.role ?? null;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {userId ? (
        <>
          <Button asChild>
            <Link href="/play">Play</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/leaderboard">Leaderboard</Link>
          </Button>
          {role === "admin" ? (
            <Button variant="outline" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
        </>
      ) : (
        <>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signup">Create account</Link>
          </Button>
        </>
      )}
    </div>
  );
}

