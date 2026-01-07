import { Unit } from "@/app/generated/prisma/client";
import { Section } from "@/components/shared/section";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchData } from "@/helpers/api/fetch-data";
import { ApiResponse } from "@/helpers/api/response";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SubjectDetailsPage = async ({
  params,
}: {
  params: { subjectId: string };
}) => {
  const { subjectId } = await params;

  // const units = await fetchData<ApiResponse<Unit[]>>("/units", {
  //   method: "POST",
  //   body: {
  //     subjectId,
  //   },
  // });

  return (
    <Section size="xs" className="flex flex-col gap-md">
      <article className="tailwind-typography">
        <h4>Start Quiz</h4>
      </article>

      <RadioGroup defaultValue="random">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="random" id="random" />
          <Label htmlFor="random">Random Questions</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="units" id="units" />
          <Label htmlFor="units">Select Unit(s)</Label>
        </div>
      </RadioGroup>
      <Button asChild className="w-fit">
        <Link href={`/subject/${subjectId}/random`}>Start Quiz</Link>
      </Button>
    </Section>
  );
};

export default SubjectDetailsPage;
