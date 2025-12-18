"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuizSession = {
  sessionId: string;
  startedAt: string;
  expiresAt?: string;
  questions: Array<{
    externalId: string;
    prompt: string;
    choices: string[];
    difficulty: "easy" | "medium" | "hard" | null;
    unit: { code: string };
  }>;
};

type QuizQuestion = QuizSession["questions"][number];

function getOptionStyle({
  isSubmitted,
  isCorrect,
  isChosen,
}: {
  isSubmitted: boolean;
  isCorrect: boolean;
  isChosen: boolean;
}) {
  if (isSubmitted && isCorrect)
    return "border border-emerald-500/30 bg-emerald-500/10";
  if (isSubmitted && isChosen && !isCorrect)
    return "border border-destructive/30 bg-destructive/10";
  if (!isSubmitted && isChosen)
    return "border border-primary/30 bg-primary/5 hover:bg-primary/10";
  return "border border-border hover:bg-accent/40";
}

function QuestionCard({
  q,
  index,
  selectedIndex,
  isSubmitted,
  correctIndex,
  explanation,
  onSelect,
}: {
  q: QuizQuestion;
  index: number;
  selectedIndex: number | undefined;
  isSubmitted: boolean;
  correctIndex?: number;
  explanation?: string | null;
  onSelect: (choiceIndex: number) => void;
}) {
  const cardId = `q_${q.externalId}`;

  return (
    <Card id={cardId} className={selectedIndex == null ? "border-dashed" : ""}>
      <CardHeader>
        <CardTitle className="text-base">
          Q{index + 1}. {q.prompt}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {q.unit.code}
          {q.difficulty ? ` • ${q.difficulty}` : ""}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="radiogroup" aria-label={`Question ${index + 1}`}>
          {q.choices.map((choice, idx) => {
            const resolvedCorrectIndex =
              typeof correctIndex === "number" ? correctIndex : null;
            const isCorrect = resolvedCorrectIndex === idx;
            const isChosen = selectedIndex === idx;
            const style = getOptionStyle({ isSubmitted, isCorrect, isChosen });

            return (
              <button
                key={`${q.externalId}_${idx}`}
                type="button"
                aria-pressed={isChosen}
                className={`flex w-full items-start gap-3 rounded-md p-3 text-left ${
                  isSubmitted ? "cursor-default" : "cursor-pointer"
                } ${style}`}
                onClick={() => {
                  if (isSubmitted) return;
                  onSelect(idx);
                }}
              >
                <span
                  aria-hidden="true"
                  className={`mt-1 inline-flex size-4 items-center justify-center rounded-full border ${
                    isChosen ? "border-primary" : "border-input"
                  }`}
                >
                  {isChosen ? (
                    <span className="size-2 rounded-full bg-primary" />
                  ) : null}
                </span>
                <div className="leading-6">{choice}</div>
              </button>
            );
          })}
        </div>

        {isSubmitted && explanation ? (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <div className="font-medium">Explanation</div>
            <div className="text-muted-foreground">{explanation}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function QuizClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverResults, setServerResults] = useState<null | {
    score: { correct: number; total: number };
    byExternalId: Record<
      string,
      {
        correctIndex: number;
        selectedIndex: number;
        isCorrect: boolean;
        explanation: string | null;
      }
    >;
  }>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      setSubmitError(null);
      setServerResults(null);
      setSubmittedAt(null);
      setAnswers({});
      setIsSubmitting(false);

      try {
        const res = await fetch(
          `/api/quiz/session/${encodeURIComponent(sessionId)}`
        );
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        if (!json) {
          setLoadError(`Empty response (HTTP ${res.status}).`);
          setSession(null);
          return;
        }
        if (!json.ok) {
          setLoadError(
            `${json.error?.code ?? "ERROR"}: ${
              json.error?.message ?? "Failed to load quiz."
            }`
          );
          setSession(null);
          return;
        }
        const data = json.data as any;
        setSession(data as QuizSession);

        // If the session already has an attempt, lock it in "submitted" mode.
        if (data?.attempt) {
          const byExternalId: Record<string, any> = {};
          const nextAnswers: Record<string, number> = {};
          for (const r of data.attempt.results as Array<any>) {
            byExternalId[r.externalId] = r;
            nextAnswers[r.externalId] = r.selectedIndex;
          }
          setServerResults({ score: data.attempt.score, byExternalId });
          setAnswers(nextAnswers);
          setSubmittedAt(String(data.attempt.submittedAt));
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load quiz.");
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [sessionId]);

  const isSubmitted = submittedAt !== null;
  const total = session?.questions.length ?? 0;
  const answeredCount = Object.keys(answers).length;

  const score = serverResults?.score ?? null;

  const unanswered = useMemo(() => {
    if (!session) return [];
    const items: Array<{ idx: number; externalId: string }> = [];
    session.questions.forEach((q, idx) => {
      if (answers[q.externalId] == null)
        items.push({ idx, externalId: q.externalId });
    });
    return items;
  }, [answers, session]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Loading quiz…</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Quiz not found
        </h1>
        <p className="text-sm text-muted-foreground">
          {loadError ??
            "This quiz session could not be loaded. It may have expired. Start a new quiz."}
        </p>
        <Button asChild>
          <Link href="/play">Go to start page</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quiz</h1>
          <p className="text-sm text-muted-foreground">
            Answered {answeredCount}/{total} • Session {sessionId}
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/play">New quiz</Link>
        </Button>
      </div>

      {score ? (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          Score: {score.correct} / {score.total}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}

      <div className="space-y-4">
        {session.questions.map((q, idx) => (
          <QuestionCard
            key={q.externalId}
            q={q}
            index={idx}
            selectedIndex={answers[q.externalId]}
            isSubmitted={isSubmitted || isSubmitting}
            correctIndex={
              serverResults?.byExternalId?.[q.externalId]?.correctIndex
            }
            explanation={
              serverResults?.byExternalId?.[q.externalId]?.explanation ?? null
            }
            onSelect={(choiceIndex) => {
              if (isSubmitted || isSubmitting) return;
              setSubmitError(null);
              setAnswers((prev) => ({ ...prev, [q.externalId]: choiceIndex }));
            }}
          />
        ))}
      </div>

      <div className="sticky bottom-0 rounded-xl border bg-background/80 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {isSubmitted ? (
                <>Quiz submitted.</>
              ) : (
                <>
                  Answered{" "}
                  <span className="font-medium text-foreground">
                    {answeredCount}
                  </span>
                  {" / "}
                  <span className="font-medium text-foreground">{total}</span>
                  {unanswered.length > 0 ? (
                    <>
                      {" • Unanswered "}
                      <span className="font-medium text-foreground">
                        {unanswered.length}
                      </span>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {!isSubmitted && unanswered.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {unanswered.slice(0, 20).map((u) => (
                  <button
                    key={u.externalId}
                    type="button"
                    className="rounded border px-2 py-0.5 hover:bg-accent"
                    onClick={() => {
                      const el = document.getElementById(`q_${u.externalId}`);
                      el?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                  >
                    Q{u.idx + 1}
                  </button>
                ))}
                {unanswered.length > 20 ? (
                  <span className="px-1">+{unanswered.length - 20} more</span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex gap-2">
            {isSubmitted ? (
              <Button asChild variant="outline">
                <Link href="/play">Start new quiz</Link>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  if (isSubmitting) return;
                  if (unanswered.length > 0) {
                    setSubmitError(
                      `You still have ${unanswered.length} unanswered question(s). Jump to them below and answer before submitting.`
                    );
                    const el = document.getElementById(
                      `q_${unanswered[0].externalId}`
                    );
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                  }
                  (async () => {
                    setIsSubmitting(true);
                    setSubmitError(null);
                    try {
                      const payload = {
                        sessionId,
                        answers: session.questions.map((q) => ({
                          externalId: q.externalId,
                          selectedIndex: answers[q.externalId] as 0 | 1 | 2 | 3,
                        })),
                      };

                      const res = await fetch("/api/quiz/submit", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify(payload),
                      });
                      const text = await res.text();
                      const json = text ? JSON.parse(text) : null;
                      if (!json) {
                        setSubmitError(`Empty response (HTTP ${res.status}).`);
                        return;
                      }
                      if (!json.ok) {
                        setSubmitError(
                          `${json.error?.code ?? "ERROR"}: ${
                            json.error?.message ?? "Failed to submit quiz."
                          }`
                        );
                        return;
                      }

                      const resultsArr = json.data.results as Array<{
                        externalId: string;
                        selectedIndex: number;
                        correctIndex: number;
                        isCorrect: boolean;
                        explanation: string | null;
                      }>;
                      const byExternalId: Record<string, any> = {};
                      for (const r of resultsArr)
                        byExternalId[r.externalId] = r;
                      setServerResults({
                        score: json.data.score,
                        byExternalId,
                      });
                      setSubmittedAt(String(json.data.submittedAt));
                    } catch (e) {
                      setSubmitError(
                        e instanceof Error
                          ? e.message
                          : "Failed to submit quiz."
                      );
                    } finally {
                      setIsSubmitting(false);
                    }
                  })();
                }}
                disabled={total === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit quiz"}
              </Button>
            )}
          </div>
        </div>

        {isSubmitted ? null : (
          <div className="mt-2 text-xs text-muted-foreground">
            Tip: you can answer questions in any order. Submit unlocks
            explanations.
          </div>
        )}
      </div>
    </div>
  );
}
