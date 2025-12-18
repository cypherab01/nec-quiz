"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UnitMultiCombobox } from "@/components/units/unit-multi-combobox";
import Link from "next/link";

type SubjectRow = { code: string; name: string; _count: { units: number } };
type UnitRow = { code: string; name: string; _count: { questions: number } };

type StartQuizResponse =
  | {
      ok: true;
      data: {
        sessionId: string;
        startedAt: string;
        expiresAt: string;
      };
    }
  | { ok: false; error: { code: string; message: string } };

const COUNTS = [25, 50, 75, 100] as const;

export function PlayClient() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);

  const [subjectCode, setSubjectCode] = useState<string>("");
  const [mode, setMode] = useState<"random" | "unitWise">("random");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(25);
  const [unitCodes, setUnitCodes] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const res = await fetch("/api/subjects");
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        if (!json) {
          setError(`Empty response from /api/subjects (HTTP ${res.status})`);
          return;
        }
        if (!json.ok) {
          setError(
            `${json.error?.code ?? "ERROR"}: ${json.error?.message ?? "Failed"}`
          );
          return;
        }
        const data = json.data as SubjectRow[];
        setSubjects(data);
        if (data.length > 0) setSubjectCode(data[0].code);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load subjects.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!subjectCode) return;
    (async () => {
      try {
        setError(null);
        setUnits([]);
        setUnitCodes([]);

        const res = await fetch(
          `/api/subjects/${encodeURIComponent(subjectCode)}/units`
        );
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;
        if (!json) {
          setError(
            `Empty response from units (HTTP ${res.status}) for subject ${subjectCode}`
          );
          return;
        }
        if (!json.ok) {
          setError(
            `${json.error?.code ?? "ERROR"}: ${json.error?.message ?? "Failed"}`
          );
          return;
        }
        const data = json.data as UnitRow[];
        setUnits(data);
        if (data.length > 0) setUnitCodes([data[0].code]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load units.");
      }
    })();
  }, [subjectCode]);

  const canStart = useMemo(() => {
    if (!subjectCode) return false;
    if (mode === "unitWise" && unitCodes.length === 0) return false;
    return true;
  }, [mode, subjectCode, unitCodes.length]);

  async function startQuiz() {
    setError(null);
    setIsStarting(true);
    try {
      const body =
        mode === "random"
          ? { subjectCode, mode, count }
          : { subjectCode, mode, count, unitCodes };

      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as StartQuizResponse;
      if (!json.ok) {
        setError(`${json.error.code}: ${json.error.message}`);
        return;
      }

      globalThis.location.href = `/quiz/${encodeURIComponent(
        json.data.sessionId
      )}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start quiz.");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Start a quiz</h1>
        <p className="text-sm text-muted-foreground">
          Choose a subject and question count (25/50/75/100).
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

      <Card>
        <CardHeader>
          <CardTitle>Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subjectCode} onValueChange={setSubjectCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Questions</Label>
            <Select
              value={String(count)}
              onValueChange={(v) => setCount(Number(v) as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select count" />
              </SelectTrigger>
              <SelectContent>
                {COUNTS.map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="random" id="mode-random" />
                <Label htmlFor="mode-random">Random (across subject)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unitWise" id="mode-unitWise" />
                <Label htmlFor="mode-unitWise">Unit/topic wise</Label>
              </div>
            </RadioGroup>
          </div>

          {mode === "unitWise" ? (
            <div className="space-y-2">
              <Label>Unit(s)</Label>
              <UnitMultiCombobox
                options={units.map((u) => ({ code: u.code, name: u.name }))}
                value={unitCodes}
                onChange={setUnitCodes}
              />
              <div className="text-xs text-muted-foreground">
                Tip: select multiple units to practice across them.
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button onClick={startQuiz} disabled={!canStart || isStarting}>
            {isStarting ? "Starting..." : "Start quiz"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
