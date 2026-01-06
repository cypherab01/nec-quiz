import { Section } from "@/components/shared/section";
import SubjectUnitCreateTabs from "./_components/subject-unit-create-tabs";

const AdminPage = () => {
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
