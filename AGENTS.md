# AGENTS.md

This repo uses two “agents” (roles) so building the app and generating quiz content stay consistent.

## Agents

### CodeAgent (this repo)

Responsibilities:
- Implement product features in this repo (Next.js + Better Auth + Prisma + shadcn/ui).
- Prefer **Next.js API routes** (`app/api/**/route.ts`) so the same backend works for web + future mobile.
- Keep code simple, reusable, and readable.

Must ask before:
- Prisma schema/migrations (`prisma/schema.prisma`)
- Auth/session/roles/security-sensitive changes
- Non-trivial new dependencies

### ContentGenAgent (question generator)

Responsibilities:
- Generate quiz content (MCQs) from a specific NEC unit/topic.
- Output **only valid JSON** in the contract below (no markdown, no commentary).
- Keep questions aligned to the requested scope and difficulty.

## Bulk import JSON contract (v1)

The generator must produce a single JSON object:

```json
{
  "version": "v1",
  "subjectCode": "ACtE",
  "subjectName": "Computer Engineering",
  "unitCode": "AExE01",
  "unitName": "Concept of Basic Electrical and Electronics Engineering",
  "topicCode": "AExE0101",
  "topicName": "Basic concept",
  "questions": [
    {
      "externalId": "AExE01-AExE0101-0001",
      "prompt": "Ohm’s law relates which quantities?",
      "choices": ["Voltage, current, and resistance", "Power and energy only", "Charge and flux", "Capacitance and inductance"],
      "correctIndex": 0,
      "explanation": "Ohm’s law is V = I·R, relating voltage (V), current (I), and resistance (R).",
      "difficulty": "easy",
      "tags": ["ohms-law", "basics"],
      "references": ["NEC syllabus AExE01: Basic concept"]
    }
  ]
}
```

### Field rules

- `version`: must be `"v1"`.
- `subjectCode` / `unitCode` / `topicCode`: keep NEC codes where available (e.g. `ACtE05`, `AExE0204`).
- `questions[]`:
  - `externalId`: stable unique string (used for dedupe). Prefer: `<unitCode>-<topicCode>-<4-digit-seq>`.
  - `prompt`: plain text question (no LaTeX unless necessary).
  - `choices`: **exactly 4** options, plain text.
  - `correctIndex`: **0-based** index into `choices` (0..3).
  - `explanation`: optional but recommended (1–3 sentences).
  - `difficulty`: `"easy" | "medium" | "hard"`.
  - `tags`: optional string array.
  - `references`: optional string array (high-level, no URLs required).

### Quality constraints (MCQ)

- Exactly **one** correct answer.
- Avoid trick questions; focus on syllabus alignment.
- Avoid “All of the above” / “None of the above” unless necessary.
- Don’t repeat the correct answer wording in multiple options.

## Prompt templates (copy/paste)

### Template: Generate MCQs for a topic

Use this template with your preferred LLM:

```text
You are ContentGenAgent generating NEC exam practice MCQs.

Return ONLY valid JSON that matches this contract:
- version: "v1"
- subjectCode, subjectName, unitCode, unitName, topicCode, topicName
- questions[] with: externalId, prompt, choices[4], correctIndex (0-based), explanation (recommended), difficulty, tags, references

Scope:
- Subject: {SUBJECT_CODE} — {SUBJECT_NAME}
- Unit: {UNIT_CODE} — {UNIT_NAME}
- Topic: {TOPIC_CODE} — {TOPIC_NAME}

Requirements:
- Generate exactly {N} questions.
- Exactly one correct choice per question.
- choices must be concise and non-overlapping.
- Use difficulties: easy/medium/hard (mix them: ~40/40/20 unless instructed otherwise).
- Use externalId format: {UNIT_CODE}-{TOPIC_CODE}-0001 ... sequential.

Now generate the JSON.
```

### Template: Generate MCQs unit-wide (no topicCode available)

```text
You are ContentGenAgent generating NEC exam practice MCQs.

Return ONLY valid JSON (no markdown) in the v1 contract.

Scope:
- Subject: {SUBJECT_CODE} — {SUBJECT_NAME}
- Unit: {UNIT_CODE} — {UNIT_NAME}
- Topic: Use topicCode="UNIT_WIDE" and topicName="Unit-wide random"

Generate exactly {N} questions across the unit, balanced across subtopics.
Use externalId format: {UNIT_CODE}-UNIT_WIDE-0001 ... sequential.
```


