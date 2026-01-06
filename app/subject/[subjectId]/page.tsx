import { Section } from "@/components/shared/section";

const SubjectDetailsPage = async ({
  params,
}: {
  params: { subjectId: string };
}) => {
  const { subjectId } = await params;

  return <Section size="xs">SubjectDetailsPage {subjectId}</Section>;
};

export default SubjectDetailsPage;
