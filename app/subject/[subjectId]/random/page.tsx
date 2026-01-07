import { Section } from "@/components/shared/section";
import { fetchData } from "@/helpers/api/fetch-data";
import { ApiResponse } from "@/helpers/api/response";
import { PublicQuestion } from "@/types/public-questions";

const fetchQuestions = async (subjectId: string) => {
  try {
    const questions = await fetchData<ApiResponse<PublicQuestion[]>>(
      "/questions/random",
      {
        method: "POST",
        body: {
          subjectId,
        },
      }
    );
    return questions;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const SubjectRandomQuiz = async ({
  params,
}: {
  params: { subjectId: string };
}) => {
  const { subjectId } = await params;

  const questions = await fetchQuestions(subjectId);

  if (!questions) {
    return (
      <article className="tailwind-typography">
        <p>Not enough questions to start quiz</p>
      </article>
    );
  }

  console.log("questions", questions);

  return <Section size="xs">SubjectRandomQuiz : {subjectId}</Section>;
};

export default SubjectRandomQuiz;
