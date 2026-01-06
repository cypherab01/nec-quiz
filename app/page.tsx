import { Section } from "@/components/shared/section";
import { fetchOrNotFound } from "@/helpers/api/fetch-or-not-found";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Subject } from "@/app/generated/prisma/client";

import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const subjects = await fetchOrNotFound<Subject[]>("/subjects");

  return (
    <Section size="sm">
      <div className="tailwind-typography">
        <h1 className="text-center">
          Practice <span className="text-primary">today</span> so you don't have
          to worry <span className="text-primary">tomorrow</span>
        </h1>
        <p className="text-center">Select a subject and start practicing</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {subjects.map((subject) => (
          <Link href={`/subject/${subject.id}`} key={subject.id}>
            <Card className="hover:scale-105 transition-all duration-300">
              <CardContent>
                <CardDescription>{subject.name}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
