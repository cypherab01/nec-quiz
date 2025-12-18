import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { PlayClient } from "./play-client";

export default async function PlayPage() {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <PlayClient />;
}
