# Equip Help Center — Article Style Guide

## 10 Principles for Every Article

1. **TL;DR only when it earns its place** — Add a `<Tip>` at the top only when the article is detailed and the title poses a question worth answering upfront. Skip it for straightforward how-to or settings pages.

2. **One visual element per section** — Every H2 section should contain at least one non-text element: table, callout, steps, or code block. Screenshots come in a later media pass; where one clearly belongs, leave an HTML comment `<!-- screenshot: what it should show -->`.

3. **Bold the key terms** — Within body text, bold the critical concept or feature name on first mention.

4. **Short paragraphs (3 sentences max)** — Each paragraph expresses one idea. Global audience; simple, clear English.

5. **Use callouts for intent, not decoration** — `<Tip>` = summary/shortcut, `<Note>` = supplementary context, `<Warning>` = things that can go wrong.

6. **Tables for comparisons, not prose** — Whenever comparing 2+ options, features, or plans, use a table.

7. **Steps for procedures, prose for concepts** — Use `<Steps>` for sequences of actions. Use prose for explaining why something works. Don't mix.

8. **H2 for major sections, H3 for sub-topics** — H2s are scannable section labels. Never skip from H2 to H4. Keep the planned H2 sections from the stub unless the content genuinely demands a change.

9. **Related Resources are an appendix** — End articles with `## Related Resources` containing 2-4 links to other help-center articles, each as `- [Title](/slug) - one-line reason`.

10. **Front-load the action** — The first H2 is the primary thing the user came to do. Conceptual background comes after.

## Writing Conventions

- **No em-dashes or double hyphens.** Never use `—` or `--` in prose. Use commas, periods, colons, semicolons, or conjunctions instead. A single `-` is fine in Related Resources list items.
- Internal links are root-relative: `/slug` (files are flat at repo root).
- English only. USD and INR both exist; state currency-specific facts carefully.
- Do not invent facts. Every claim must come from the codebase, equip.co/llms.txt, or the original Crisp article. If a detail is unknown, write around it rather than guessing numbers or limits.
- Frontmatter: keep the existing `title` and `description`; remove the migration `<Note>` stub when writing real content.

## Style Exemplars

The AutoProctor help center at `/Users/jayanth/projects/autoproctor-mintlify-docs/` is the style and structure reference (never a content source). Good exemplars to study before writing: `proctoring-settings.mdx` (settings reference), `payments-and-credits.mdx` (pricing explainer), `take-proctored-exam.mdx` (candidate how-to), `what-is-trust-score.mdx` (concept article). Match their density of callouts, tables, and steps.

## Product Context

- Equip is a self-serve hiring platform with three pillars: a free AI-native **ATS**, **Assessments** (skill tests with AI proctoring), and **AI Interviews** (one-way and conversational). Resume Screening (CV parsing, Job Fit Score) is part of the ATS.
- Pay-per-use **credits** (1 credit = $1 / ₹90); the ATS is free; assessments cost 1 credit per candidate per test; no subscriptions or seat fees.
- Audiences: recruiters (primary), candidates (Candidate Experience category), admins (Account & Billing).
- Proctoring is powered by AutoProctor. Candidates see active proctoring measures and consent before starting.

## Hierarchy

Categories > Subcategories > Articles > Sections. The hierarchy lives in `docs.json` navigation only; article files are flat at repo root. `scratch/hierarchy.md` is the planning source of truth.
