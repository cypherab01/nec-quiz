---
description: Domain rules for NEC quiz app (subjects/units/topics, question structure, leaderboard metrics).
globs:
  - "**/*"
---

## Domain model (vocabulary)

- **Subject**: a top-level syllabus set (e.g. `ACtE` Computer Engineering, later `AEEE`, `ACiE`).
  - Examples: `ACtE05` (Computer Network and Network Security System)
- **Unit**: a major chapter/unit under a subject.
  - Example: `AExE01` (Concept of Basic Electrical and Electronics Engineering)
- **Topic**: a sub-unit area (often already has a code in the syllabus).
  - Example: `AExE0204` (Microprocessor)
- **Question**: initially **MCQ** with one correct answer.

## Identifier rules

- Preserve NEC codes as **first-class identifiers** where provided:
  - `subjectCode`: e.g. `ACtE`
  - `unitCode`: e.g. `AExE01`
  - `topicCode`: e.g. `AExE0204`
- Store a human-friendly name alongside codes (e.g. `unitName`, `topicName`).

## Quiz session expectations

- Students must **log in** to play.
- Student chooses:
  - **Subject**
  - **Question count**: strictly one of `25 | 50 | 75 | 100`
  - **Mode**:
    - `random`: random questions across selected scope
    - `unitWise`: questions filtered by a specific unit/topic

## Leaderboard metrics (future-facing)

Design with these metrics in mind (don’t hardcode assumptions into UI only):

- **Correctness**: total correct, accuracy %
- **Volume**: total answered, quizzes completed
- **Time**: total time spent, average time per question
- **Streaks**: best streak, current streak (optional)

## Content generation constraints (for bulk import)

- Each question should be:
  - **unambiguous**
  - **single correct option**
  - **aligned with the specified unit/topic**
- Avoid “All of the above” / “None of the above” unless necessary.
- Prefer including a short explanation when possible (helps learning).


