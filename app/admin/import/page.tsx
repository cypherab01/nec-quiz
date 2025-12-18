"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const PLACEHOLDER_JSON = `{
  "version": "v1",
  "subjectCode": "ACtE",
  "subjectName": "Computer Engineering",
  "unitCode": "AExE01",
  "unitName": "Concept of Basic Electrical and Electronics Engineering",
  "questions": [
    {
      "externalId": "AExE01-0001",
      "prompt": "Ohm’s law relates which quantities?",
      "choices": [
        "Voltage, current, and resistance",
        "Power and energy only",
        "Charge and flux",
        "Capacitance and inductance"
      ],
      "correctIndex": 0,
      "explanation": "Ohm’s law is V = I·R.",
      "difficulty": "easy",
      "tags": ["ohms-law"],
      "references": ["NEC syllabus AExE01"]
    }
  ]
}`;

type ImportResult =
  | {
      ok: true;
      data: {
        subjectId: string;
        unitId: string;
        questionsUpserted: number;
      };
    }
  | { ok: false; error: { code: string; message: string } };

export default function AdminImportPage() {
  const [jsonText, setJsonText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const quickStats = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const questionsCount = Array.isArray(parsed?.questions)
        ? parsed.questions.length
        : null;
      return {
        version: parsed?.version ?? null,
        subjectCode: parsed?.subjectCode ?? null,
        unitCode: parsed?.unitCode ?? null,
        questionsCount,
      };
    } catch {
      return null;
    }
  }, [jsonText]);

  const resultNode = useMemo(() => {
    if (!result) return null;
    if (result.ok) {
      return (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          Imported {result.data.questionsUpserted} questions.
        </div>
      );
    }
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {result.error.code}: {result.error.message}
      </div>
    );
  }, [result]);

  async function onImport() {
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: jsonText,
      });
      const data = (await res.json()) as ImportResult;
      setResult(data);
    } catch (e) {
      setResult({
        ok: false,
        error: {
          code: "NETWORK_ERROR",
          message: e instanceof Error ? e.message : "Failed to import.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bulk import</h1>
        <p className="text-sm text-muted-foreground">
          Paste JSON that matches the v1 contract in <code>AGENTS.md</code>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paste JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={PLACEHOLDER_JSON}
            className="min-h-[320px] font-mono text-xs"
          />

          <div className="flex items-center gap-3">
            <Button
              onClick={onImport}
              disabled={isSubmitting || !jsonText.trim()}
            >
              {isSubmitting ? "Importing..." : "Import"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setJsonText("");
                setResult(null);
              }}
              disabled={isSubmitting}
            >
              Clear
            </Button>
          </div>

          {quickStats ? (
            <div className="text-xs text-muted-foreground">
              Parsed: version={String(quickStats.version)} subjectCode=
              {String(quickStats.subjectCode)} unitCode=
              {String(quickStats.unitCode)} questions=
              {String(quickStats.questionsCount)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Not valid JSON yet (that’s OK).
            </div>
          )}

          {resultNode}
        </CardContent>
      </Card>
    </div>
  );
}
