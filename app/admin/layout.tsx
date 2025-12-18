import { headers } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const session = await auth.api.getSession({
    headers: Object.fromEntries(hdrs.entries()),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  if (profile?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}
