# Fact pack: AI Interviews

Sources: Equip codebase (react/src/Templates/Recruiter/AIInterviews/, Templates/ConversationalInterview/, Templates/Recruiter/AiInterviewReportTemplates/, Templates/Recruiter/Common/, constants/generated/, app/models/test_stage_artifacts.py) + scratch/llms-snapshot.txt "AI Interviews" section. Facts not verifiable are marked UNVERIFIED.

## one-way-vs-conversational

- Two interview families attached to a job opening: **One-way** (pre-set questions, recorded answers, AI-graded) and **Conversational** (real-time voice AI that adapts its questions).
- Enum `type` on the AI interview artifact: `ONE_WAY` | `CONVERSATIONAL`. Conversational subtype `conversational_type`: `QUICK` | `COMPREHENSIVE`.
- Credits (AI_INTERVIEW_TYPES generated constant): One-way Interview = 1 credit, Quick Interview = 2 credits, Comprehensive Interview = 3 credits. Credits deducted per candidate submission; reclaimable if candidate never starts (invite dialog: "If a candidate doesn't start the test, you can reclaim the credits.").
- One-way: fixed set of questions; candidates respond with video, audio, or text; built from reusable templates; all questions visible at once, answered in any order, in a single session (llms). Suited to high-volume screening (30+ candidates).
- Conversational: live spoken interview; AI asks follow-ups based on answers; adaptive questions.
- Recruiter "How it Works" page ("One-way and Conversational Overview") comparison table: Duration — One-way 40 mins, Conversational 40 mins, Assessment 60 mins; Purpose — "Deep evaluation" (one-way), "Natural conversation" (conversational), "Skills testing" (assessment); AI Graded Questions — 20 / 20 / 0; Video Responses — Yes / No / No; Adaptive Questions — No / Yes / No. Page also shows badges "$1 per candidate" (₹90 in India) and "40-50 minutes", and "When to Use": ">30 Candidates", "L2 Interview, Comprehensive"; "What You Get": "20 AI-graded questions", "Audio, video or text response".
- Dashboard (AI Interviews → Dashboard): lists interviews with type tags "Conv" (green) and "1-Way" (yellow), columns Started/Finished counts, credits per candidate, links Invite / Preview / Settings. "Add AI Interview" button offers two choices: "Conversational Interview" and "One-Way Interview".
- Quick vs Comprehensive selector cards (shown on create and settings pages): "Quick Interview" — "2 credits" badge, description "3-5 topics; 5-10 questions required"; "Comprehensive Interview" — "3 credits" badge, description "5-10 topics; 10-25 questions required". Quick ~15 minutes, Comprehensive ~30 minutes (llms).
- Switching Comprehensive → Quick is blocked if question count exceeds Quick's limit; tooltip: "You have N questions. Quick interviews support max 10 questions. Remove some questions to switch."
- Conversational interviews cannot be resumed once submitted (llms; also candidate-experience section).

## interview-languages

- Conversational interview language is a recruiter setting ("Interview Language" dropdown on the conversational settings page). Stored as a BCP-47 code in `interview_language`; the voice agent picks STT/TTS and interview language from it; empty/unknown values fall back to `en-US` (backend get_conversational_interview_livekit_session).
- Supported languages (exact dropdown labels/values from cascadeLanguageOptions):
  - English (US) `en-US`, English (India) `en-IN`, English (UK) `en-GB`
  - Hindi `hi-IN`, Kannada `kn-IN`, Telugu `te-IN`, Tamil `ta-IN`, Marathi `mr-IN`, Bengali `bn-IN`
  - Spanish (Spain) `es-ES`, Spanish (US) `es-US`, French `fr-FR`, German `de-DE`, Portuguese (Brazil) `pt-BR`, Italian `it-IT`
  (15 options total.)
- One-way questions have a per-question "response languages" setting (multi-select with "Search languages" placeholder; script samples shown for some languages); default response language is English (`en`). Exact list of one-way response languages: UNVERIFIED (drawn from an internal languages registry).

## interview-workspace

- The Workspace is an optional panel in conversational interviews where candidates write answers in code or plain text. Recruiter toggle on the settings page: "Enable Workspace" — helper text: "Adds a Workspace panel where candidates can write answers in code or plain text. Once enabled, you can choose per item whether the answer should be spoken, written, or either."
- `code_editor_enabled` defaults to false (DB default). Workspace + Scenario items + custom report templates are gated by the same per-team feature flag (`aiReportTemplates`), i.e. gradual rollout — not available to all teams.
- With Workspace enabled, each interview item gets an "Answer format" selector. Options (CONV_ANSWER_MODES): Spoken (`SPOKEN`, default), Written (`WRITTEN`), Either (`EITHER`). Tooltip copy: "Spoken — the candidate answers out loud. Written — the AI asks them to write the answer in the Workspace. Either — the candidate chooses."
- Workspace modes (candidate side): `code` or `text`. Code editor language options (exact labels): Python, JavaScript, TypeScript, Java, Go, C++, C#, Ruby, Rust, SQL, and "Any (candidate chooses)". Plain-text tab placeholder: "Type your answer or notes here".
- Workspace content limit: 5,000 characters (CAI_CONSTRAINTS.workspaceContent; error: "Workspace content must be 5,000 characters or fewer.").
- A required programming language, if any, is specified by the recruiter in the item/instructions text and enforced by the AI (no per-item language dropdown for the recruiter).
- In the report, code written in the Workspace is captured with timestamped snapshots plus the final code (with language); snapshots are seekable against the recording.

## create-one-way-interview

- Entry: AI Interviews dashboard → "Add AI Interview" → "One-Way Interview" (route /ai-interviews/create-one-way/). Page title "Create AI Interview", subtitle "Set up a new ai interview for your candidates".
- One-way interviews are built from templates. If the team has no one-way templates, creation redirects to the templates page (/ai-interviews/one-way-templates/) with toast "You must create an AI Interview template before creating an AI Interview." Templates page subheading: "Interviews with a fixed set of questions. Video, Audio, Text candidate responses".
- Create form fields: "Select Template" (dropdown of AI_ONE_WAY templates), "Job Opening" (radio: "Use existing job opening" with dropdown / "Create new job opening"), "Job Opening Title" (text, placeholder "e.g., Senior Software Engineer"). Buttons: Cancel / "Create Interview". On success, redirects to the interview's Settings page.
- Template editor (one-way): editable template Title (required, max 50 chars). Questions: max 20 per interview ("You cannot add more than 20 questions in an AI Interview."); min 1 (last question can't be deleted). "Add Question" button; questions reorderable (move up/down); Excel question import supported; template Settings and Preview buttons; templates can be cloned; templates in use can't be deleted.
- Per-question fields (one-way):
  - Question text (rich text). Default new-question text: "Tell us about yourself and your experience relevant to this position."
  - "Answer Format": Text | Audio | Video (default Text).
  - Points (default 10 points).
  - "Evaluation Prompt" — optional; placeholder "(Optional) Factors on which the AI must evaluate the answer. Leave empty to use default intelligence."; subtext "Leave blank to use AI's default thinking. Max 100 words".
  - Audio/Video: "Max Retakes (5)" — default 5, max 5 ("Cannot exceed 5 retakes"); "Min Seconds" / "Max Seconds (180)" — range 5–180 seconds; defaults 30 min / 180 max.
  - Text: Min/Max Words — 0–1000 allowed; defaults min 50 / max 250.
  - "Restrict media playback count" — limits how many times candidates replay question media; default 5.
  - Auto-start recording toggle with optional recording start delay (seconds).
  - Per-question response language(s), default English; tags.
- Stage settings page for a one-way interview (…/settings/): "Job Title" (max 100 chars), "Linked Template" (required: "A test must be linked to this stage"), "Additional Instructions" (max 1,000 chars, shown to candidates), "Timer Settings" ("Cannot Start Before" / "Cannot Start After" date+time pickers with "Clear date & time"), and "Proctoring Settings" (see interview-settings).

## create-conversational-interview

- Entry: dashboard → "Add AI Interview" → "Conversational Interview" (route /ai-interviews/create-conversational/). Page title "Create AI Interview", subtitle "Paste a job description. We'll draft interview topics from it."
- Step 1: pick interview type card — Quick Interview (2 credits) or Comprehensive Interview (3 credits).
- Form fields (exact labels):
  - "Job description" * — textarea, max 7,500 characters; placeholder "Paste or type the job description here. Keep it focused on the role and key skills".
  - "Job opening" * — radio "Use existing job opening" (dropdown) or "Create new job opening"; new title field "Job opening title" (placeholder "e.g., Senior Frontend Developer").
  - "Years of experience" * — Min and "Max (Optional)" number inputs; pre-populated and locked when an existing job opening is selected ("Pre-populated from selected job opening"); validation "Max years must be greater than or equal to Min years".
  - "Additional context" (optional) — textarea, max 1,000 characters; placeholder "Add any specific focus areas, skills to emphasize, or special requirements".
- CTA: "Generate interview topics". Equip's AI drafts topics (with evaluation criteria, follow-up counts, and difficulty) from the job description; the interview is created and you land on its Settings page (toast: "AI interview created successfully. Configure additional settings below.").
- AI-generated topics arrive with difficulty Medium/Hard/Expert (points 10/20/30 internally) and default evaluation criteria "Evaluate the candidate's understanding and communication." when none generated.

## interview-content-types

- Conversational settings page → section "3 · INTERVIEW CONFIGURATION" → "Topics & questions". Subtitle shows the active limits: Quick "3-5 topics; 5-10 questions required", Comprehensive "5-10 topics; 10-25 questions required".
- Three item types (QUESTION_TYPES enum values → UI labels):
  - `AI_CONVERSATIONAL_QUESTION` → **Question** — "One exact question, asked word-for-word as written." Add-menu description: "AI asks the exact question. No follow-ups". Follow-ups always 0.
  - `AI_CONVERSATIONAL_TOPIC` → **Topic** — "A theme the AI explores in its own words, with follow-ups." Add-menu: "AI generates questions and follow-ups".
  - `AI_CONVERSATIONAL_SCENARIO` → **Scenario** — "A situation shown to the candidate that they respond to." Add-menu: "Reference material shown to the candidate in a panel". Scenario option only appears for teams with the aiReportTemplates flag; existing scenario items still render if the flag is revoked.
- Per-item controls: type selector; "Difficulty" — Medium | Hard | Expert; "Follow-ups" — 0–5 (Topics and Scenarios only; disabled values show tooltip "Cannot add N more follow-ups. Only X questions remaining before reaching the limit."); move up/down; delete (confirm: "Are you sure you want to delete this item? This action cannot be undone."; at least one item required: "Cannot delete the last item. You must have at least one item in the interview.").
- Item text: required, max 500 characters ("Question text is required").
- Scenario fields: "Candidate view (Qn)" * — Markdown shown to the candidate ("Code blocks, image URLs, and tables are supported"; error "Candidate view is required for scenarios."); "AI context" — optional, not shown to candidate; "empty means the AI reads the candidate view as-is" (use it to describe images/diagrams the AI cannot parse). Scenario title is auto-derived from the first Markdown heading or first line (max 100 chars), falling back to "Scenario N". Scenarios appear to the candidate in a side panel, numbered Q1, Q2, … in order.
- Counting: each item counts as 1 topic; total questions = items + all follow-ups. Limits (getInterviewLimits): Quick max 5 topics / 10 total questions; Comprehensive max 10 topics / 25 total questions. Footer counter: "N topics, M questions added"; at-limit banners e.g. "You've reached the maximum of 10 total questions. Remove follow-ups or topics to add more."
- "Add item" button (dropdown of the item types) disables at the limit, with a "x/5 topics, y/10 questions" note.
- "Instructions for AI Interviewer" — free-text guidance to the AI, max 4,000 characters ("Instructions for AI interviewer must be 4,000 characters or fewer."); label subtext "Provide guidance to the AI on how to conduct the interview"; placeholder examples: "Start with easier questions, and then make them harder", "Score higher if they use simpler words".

## interview-settings

- Conversational settings page sections (numbered headers): 1 · Interview type, 2 · Job setup (read-only Opening + Experience range), 3 · Interview configuration, 4 · Settings, 5 · Proctoring. Header buttons: "View Candidates", "Preview" (opens candidate preview in a new tab).
- "Allow resuming unfinished attempt" toggle — "Lets candidates restart if they leave before submitting. Restarts are unlimited until they submit, and only the submitted attempt is graded." Default off (`allow_reattempt` DB default false).
- "Enable Workspace" toggle (flag-gated; see interview-workspace). Default off.
- "Availability window (optional)" — "Candidates can start the interview only inside this window." Fields: "Cannot Start Before" and "Cannot Start After", each a date + time picker with "Clear date & time" link; validation "End date/time must be after start date/time". Times entered in the recruiter's local time, stored as UTC.
- "Candidate instructions (notes shown to candidates)" — rich text, max 1,000 characters ("Candidate instructions must be 1,000 characters or fewer.").
- "Report Template" dropdown (flag-gated; see custom-report-templates) — "Select report template (optional)"; clear option "None — use the default report"; helper: "Leave blank to use the default report (summary, strengths, weaknesses, topic scores)." / "A custom report will be generated from this template after each interview."
- Proctoring Settings (same options as assessments; collapsible section, collapsed by default). Toggle labels and descriptions:
  - "Detect Audio" — Record noise and audio cues in the background
  - "Detect Face" — Capture a photo if the camera detects no faces or multiple faces
  - "Detect Switched Tab" — When user switches to a different tab/application, we detect this
  - "Switched Tab Screenshot" — capture screenshot on tab switch (supported browsers only); requires Detect Switched Tab ("'Detect Switched Tab' can't be disabled if 'Switched Tab Screenshot' is enabled")
  - "Take Random Photos" — a few photos of the candidate throughout the test
  - "Prevent Multiple Monitors" — blocks candidates with more than one monitor until extra displays disconnected (supported browsers only)
  - "Capture Photo Before Start Test" — photo before every test starts
  - "Enforce Full Screen" — cannot take the test without full-screen mode
  - "Record User Session" — records screens and actions (mouse clicks, keyboard typing)
  - "Auxiliary Device" — candidate pairs their phone to their computer
  - "Enforce Desktop" — requires a large screen (useful for coding challenges)
  - "Disable Copy Paste"
- Invitations: invite page per interview (Invite link on dashboard); credit notice per candidate ("Each candidate submission will cost you N credits (…)"); credits reclaimable if candidate doesn't start. Recording upload cap 2 GB (MAX_UPLOAD_SIZE_BYTES); recording-recovery grace after a dead browser/tab: 10 minutes (RECOVERY_GRACE_MINUTES).
- Candidate experience (llms): live video-call layout with "Equip AI Interviewer", self-view, real-time transcript; automatic reconnection with status banners; camera and microphone verified in a pre-interview equipment test (three-step pre-start wizard: review format, test devices with 5-second recording playback, start; conversational adds a read-aloud mic calibration). Interviews recorded server-side with transcripts retained. Exact browser support matrix: UNVERIFIED.

## interview-reports

- Conversational report (per candidate attempt) — tabs: "Test Summary", "Proctoring" (only if proctoring enabled), "Session Recording" (only if Record User Session was on).
- Test Summary contents (default report): "Recommendation" (overall recommendation text), "Strengths" and "Areas for Improvement" lists, "Summary", and "Topic Performance" — one score card per topic with percentage score (color-coded).
- Interview recording player with full transcript; transcript entries (interviewer/candidate, timestamped) are seekable — clicking a transcript line seeks the recording. Workspace answers appear as code/written content with timestamped code snapshots and final code.
- "Download" PDF export of the report (with progress screen).
- Maintenance actions on the report (behind URL query flags, e.g. ?retranscribe=1): "Re-evaluate" (queues re-evaluation; toast "The interview is being re-evaluated. Results will appear shortly.") and "Re-transcribe Interview".
- States: "Results are being evaluated..." while processing; "This interview has not been completed yet." before submission.
- One-way report uses the shared AI test report (per-question answers with AI grades); scoring uses per-question points (Medium 10 / Hard 20 / Expert 30 for conversational difficulty weighting). Breadcrumb path: AI Interviews → "#N Job Title Results" → "{Candidate}'s Report".
- Public/shareable results view exists (isPublicResults renders without breadcrumbs/tabs). Details: UNVERIFIED.

## custom-report-templates

- Team-defined "AI Interview Report Templates" replace the default conversational report with a template-driven holistic evaluation. Feature-flagged per team (aiReportTemplates; gradual rollout). When a template is attached to an interview, the holistic template-based evaluation runs instead of the default evaluator.
- Location: Templates → "AI Interview Reports" (/templates/ai-interview-reports/). List shows Name, Description, Status badge (Active/Archived; enum ACTIVE | ARCHIVED), Created date.
- Template form fields: "Template Name" * (max 100 chars; placeholder "e.g., Technical Interview Evaluation"), "Description" (max 255 chars; placeholder "Brief description of when to use this template").
- Four editor tabs: "LLM Prompt" * (instructions for the AI to evaluate candidate responses), "Response Schema" * (JSON schema for the structured output; validated JSON), "Jinja Template" * (custom HTML report layout, e.g. `<div>{{ overall_summary }}</div>`), "Preview" (live preview with sample preview data JSON, e.g. `{"communication_score": 85, ...}`).
- Attach on the interview's settings page via the "Report Template" dropdown (only ACTIVE templates listed). Attached report renders in place of the default summary; report shows the rendered holistic report with an evaluation status.
