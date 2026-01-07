import type { Subject } from "@/app/generated/prisma/client";
import { Section } from "@/components/shared/section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { fetchData } from "@/helpers/api/fetch-data";
import { ApiResponse } from "@/helpers/api/response";
import Link from "next/link";
import { redirect } from "next/navigation";

const fetchSubjects = async () => {
  try {
    const subjects = await fetchData<ApiResponse<Subject[]>>("/subjects");
    return subjects;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const subjects = await fetchSubjects();

  if (!subjects) {
    return <p className="tailwind-typography">Error fetching subjects</p>;
  }

  return (
    <Section size="sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {subjects.data.map((subject) => (
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
