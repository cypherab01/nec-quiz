import { Section } from "@/components/shared/section";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SubjectUnitCreateTabs from "./_components/subject-unit-create-tabs";

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.roles !== "admin") {
    redirect("/login");
  }

  return (
    <Section size="xs">
      <article className="tailwind-typography">
        <h4>Admin Dashboard</h4>
        <p>Create or delete subjects and units</p>
        <SubjectUnitCreateTabs />
      </article>
    </Section>
  );
};

export default AdminPage;
