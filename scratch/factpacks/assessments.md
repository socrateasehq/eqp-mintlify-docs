# Fact Pack: Assessments

Sources: [code] = /Users/jayanth/PycharmProjects/equip codebase; [llms] = scratch/llms-snapshot.txt; [crisp] = scratch/crisp/ helpdesk HTML. Facts tagged with the strongest source verified.

## assessment-hierarchy

- Hierarchy: Assessment > Test > Question. An assessment maps to a role; candidates attempt tests one-by-one; each test is taken in one sitting. [crisp]
- A test contains one or more questions: single question (programming challenge), multiple shown one-by-one (Equip-content quiz), or multiple shown all at once. [crisp]
- A Custom Test is a test you create with your own questions; add it to any assessment via test type > Add > "My Content". [crisp]
- An assessment can contain any number of tests. [crisp]
- Test type enum values [code, react/src/Types/Assessment.ts AvailableTestType]: quiz, css, sql, programming, video_interview, question_bank, question_bank_quiz, excel, psychometric, typing_test, cefr.
- Default test-type order in builder [code]: Quiz(1), Programming(2), CEFR(3), Psychometric(4), Video Response(5), Typing Test(6), SQL(7), Excel(8), CSS(9).

## create-assessment

- Builder page heading: "Create Assessment" (new) / "Assessment Settings" (existing); subtitle "Choose Skills, Test Types and Questions. View/Edit Proctoring and Other Settings". [code]
- Three tabs, in order: "Tests", "Test Order", "Settings". [code]
- Role-based setup: pick a Role (search box, placeholders like "Try Python Developer") plus Years of Experience; Equip suggests tests/skills at appropriate difficulty. Validation: "Please provide the Role Name", "Please select Years of Experience". [code]
- Tests tab validations [code]: at least 1 test ("Please add at least 1 test to proceed"); each Equip-content quiz needs at least 1 skill; question counts required for all skills; Equip quiz total must stay under 25; Excel test needs at least 1 question; programming test needs at least 1 language ("Please select at least 1 language to proceed").
- Test Order tab: drag to reorder tests, set per-test weightage; validation "Please ensure that the sum of all weightages equals 100". Randomize icon for coding tests and proctoring settings also live here. [code, crisp]
- Settings tab validations [code]: assessment Title required; at least 1 login provider ("Please enable atleast 1 login provider"); date+time required when "Cannot Start Before"/"Cannot Start After" enabled.
- Warning toast if any weighted test has weightage 0: "The weightage for some test(s) is 0. If you don't change it, these tests won't contribute to the overall score." with a "Set weightage" action. [code]
- Estimated total assessment duration is computed automatically and shown in the Test Order tab. [llms, crisp]
- Existing assessments show "View Candidates" and "Preview" buttons at top of settings. [code]

## equip-vs-custom-content

- Every test type offers "Equip Content" (pre-built library) and "My Content" (recruiter-authored custom tests). [llms]
- Differences (Equip Content vs Custom Content) [crisp]:
  - Proctoring settings: cannot change vs can change.
  - Select questions: No for quizzes / Yes for other test types vs Yes for all.
  - Set points & remove negative points for MCQs: No vs Yes.
  - Show all quiz questions at once: No (Equip quizzes always one-by-one) vs Yes.
  - See questions candidate attempted: No for quizzes / Yes for other types vs Yes for all.
  - Set time per question/test: No vs Yes.
  - Set time for whole assessment: No for both.
- An assessment may mix Equip Content and Custom Tests freely. [crisp]

## testing-multiple-skills

- Two ways to test multiple skills with Equip-content quizzes: (a) add multiple skills to one quiz — questions from different question banks are jumbled into a single quiz (recommended); (b) add each skill as a separate quiz. [crisp]
- UI: "Add Skill" button (bottom left of quiz card) adds a skill to the existing quiz; "Add Quiz" button (bottom right) creates another quiz, then choose "Equip's Content" or "My Content" / "Create New". [crisp]
- Max 6 skills per quiz (MAX_SKILLS_PER_QUIZ = 6). [code, crisp]
- Two custom quizzes cannot be merged into one; they must be added as separate tests. [crisp]

## question-difficulty-levels

- Quiz and coding (Programming/SQL/CSS) difficulty levels: Medium, Hard, Expert. [crisp]
- Mapping (Equip quiz content) [crisp]: 0-2 yrs exp = Medium (1-2 point questions); 3-4 yrs = Hard (3-4 pts); 5+ yrs = Expert (5-6 pts). UI shows "(0-2 yrs exp)", "(3-4 yrs exp)", "(5+ yrs exp)" beside difficulty. [code]
- Equip picks questions of the matching point value at random per candidate. [crisp]
- CEFR (English Communication) skill difficulty is fixed at Medium in the builder. [code]
- Excel difficulty levels run Medium to Expert. [llms]

## question-limits

- Max questions per test [crisp; quiz/excel values confirmed in code CONSTANTS]:
  - Quiz (Equip Content): 25 (MAX_QUESTIONS_PER_QUIZ = 25)
  - Quiz (Custom Content): 100
  - Programming, SQL, CSS: 1 question per test
  - Excel: 6 (MAX_QUESTIONS_PER_EXCEL = 6)
  - Typing Test: 3
  - Video Response: 4 (maxScreensForVideoResponse = 4 in code)
  - Psychometric, English Communication (CEFR): N/A — standardized, questions not selectable
- Need more quiz questions? Add a second quiz to the same assessment. [crisp]
- Per-skill-per-difficulty caps for Equip quizzes: 4 questions before unlocking, 10 after (MAX_QUESTIONS_ALLOWED = 10). Unlock by purchasing at least 25 credits in a single transaction. Cap applies only to Equip quiz content, not other test types or custom content. [code, crisp]
- Max 10 Equip tests per test type in the builder (MAX_EQP_TESTS_PER_TEST_TYPE = 10). [code]

## same-or-random-questions

- Equip-content quizzes randomize three ways: different questions per candidate (drawn from a large pool), randomized question order, and shuffled option order. [crisp]
- Recruiters cannot see or select individual Equip quiz questions (during creation or in results); not provided even on request. [crisp]
- For custom quizzes wanting randomization: create a Custom Question Bank and enable the corresponding settings. [crisp]
- Non-quiz test types [crisp]: Programming — can select questions, randomization possible; SQL — same; CEFR — cannot select, randomized; Excel — questions not randomized but numbers within questions are; Psychometric — no selection, no randomization.

## quiz-display-modes

- Screen-by-screen (one-by-one, "like Typeform"): one question at a time; per-question timer only; progress bar; skip button (skipped questions cannot be revisited); candidate can't see other questions. Equip-content quizzes are always screen-by-screen; cannot be changed. [crisp]
- All-at-once ("like Google Forms"): all questions visible; overall test timer only (no per-question timer); bookmark questions for review; filter questions by status; no sections concept. [crisp]
- Custom quizzes can switch between the two modes at any time; the change takes effect on save. [crisp]

## assessment-duration / time-limits

- No assessment-level time limit exists; candidates may take breaks between tests, so end time cannot be controlled. [crisp]
- Time limits are set at the test or question level, per test type [crisp]:
  - One-by-one quiz: question level. All-at-once quiz: test level. Programming/SQL/CSS: test level. Psychometric: no time limit. English Communication: question level. Video Response: question level. Excel: question level.
- Equip-content time limits are fixed and cannot be changed; only Custom Tests let you set timers. [crisp]
- Estimated Assessment Duration shown in Test Order tab; every Equip question has an associated timer; estimate may be off if a custom test lacks per-question timers. [crisp]
- Start window: "Cannot Start Before" / "Cannot Start After" date-time settings (either or both); times are in the recruiter's local time zone. [crisp, code]

## assessment-settings

- Location: Settings tab of Create Assessment / Assessment Settings; editable anytime from the Recruiter Dashboard. [crisp]
- Assessment Title: shown to candidates; input placeholder "Title"; max 100 characters. [code (placeholder), llms (100-char limit)]
- Timer section: "Cannot Start Before" and "Cannot Start After" (date + time each). [code]
- Candidate Login: login providers selectable — Google and LinkedIn; at least one required. Recommendation: LinkedIn-only when sharing a public URL, to deter fake-account previews. [crisp, code]
- Gather Additional Details ("Select Yes to capture"): Phone Number, LinkedIn URL, Student ID, College Name, Graduation Year, Department, Work Experience (in years) — exact UI labels from code. Name, email and profile picture are captured automatically at login. Details collected before the first test. [code, crisp]
- Miscellaneous: "Write results to Google Sheets" (grant hello@equip.co Editor access), Custom Instructions (rich text; overrides Equip's default instructions), completion-notification emails, Redirect URL after completion. [crisp, code, llms]
- Proctoring settings are edited per-test from the Test Order tab, not the Settings tab. [crisp]
- Link modes: unique one-time links per candidate (default on) or shared public link (metaData.isOneTimeUrlEnabled default true, isPublicUrlEnabled default false). [code]

## test-types

- Create-assessment test types: Quiz, Programming Test, CSS Test, SQL Test, Video Response, Psychometric, English Communication (CEFR), Excel, Typing Test. [crisp, code]
- Quiz: MCQs, multiple-correct (MCA), essay-type, and more. Programming: auto-evaluated coding in browser editor. CSS: replicate a target design in CSS, compared at desktop/tablet/mobile breakpoints, manually graded. SQL: auto-evaluated SQL queries. Video Response: recorded video answers. Typing Test: speed and accuracy. Excel: formulas in a simulated spreadsheet, auto-evaluated. [llms, crisp]
- Mobile support [crisp "Test Types and Mobile Support"]: Works on mobile — Quiz, Psychometric, English Communication (CEFR), Video Response. Desktop only — Programming, SQL, CSS, Excel, Typing Test. Desktop-only tests show a "Desktop Only" badge to candidates. [llms]
- Weightage: Psychometric and Typing Test are weightless (weightage forced to 0, excluded from overall score) — WEIGHTLESS_TEST_TYPES in code. [code]
- Demo tests linked in help articles are unproctored; real assessments are proctored. [crisp]

## cant-find-role-or-skill

- Two options: (1) Equip creates the test for you — free if broadly useful; turnaround ~5 business days for most skills; (2) create your own Custom Test. Contact via live chat. [crisp]

## programming-languages

- Supported languages and versions [crisp, updated 03/02/2026]: C (gcc-5 5.1.1), C++ (gcc-5 5.1.1), C# (.net 6.0 10.0), Dart 2.14.4, Go 1.22.4, Java (jdk 8u51), JavaScript (NodeJS 17.0.1), Kotlin 2.0.0, NodeJS 7.4.0, PHP 8.3, Python 3.12, Python (AI/ML) 3.12, Ruby 3.1.0, Rust 1.56, Scala 3.1.0, Swift 5.5, SQL (sqlite 3.31.1), TypeScript 4.4.4.
- Code constants list matches: Python3, JavaScript, C, NodeJS, Go, C++, Java, PHP, SQLite, Rust, TypeScript, C#, Kotlin, Ruby, Swift, Dart, Scala, Python3 (AI/ML). [code, constants/sources/programming_languages.json]
- Additional languages can be enabled on request (chat after account creation). [crisp, llms]
- Beyond programming tests: SQL and CSS coding challenges also exist. [crisp]

## psychometric-tests / psychometric-scores

- Two standardized tests: DISC (24 questions, 12 minutes) — Dominance, Influence, Steadiness, Conscientiousness; OCEAN / Big Five (50 questions, 25 minutes) — Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism. [crisp, llms]
- No numerical score: subjective tests, cannot be graded, carry no points, weightage cannot be set, excluded from overall score. [crisp, code (weightless)]
- Results: personality graph; hover for trait descriptions and score interpretation. [crisp]
- Cannot add own questions (standardized); use a custom quiz instead. [crisp]
- No time limit on psychometric tests (in the time-limits table). [crisp]
- To send psychometric tests to already-shortlisted candidates: Export Results from the Shortlisted tab, create a new assessment with the psychometric test, invite via comma-separated emails or CSV. [crisp]

## communication-test / cefr-scores

- CEFR Adaptive Test measures English across 6 levels A1–C2 plus <A1. Adaptive: candidate self-assesses, starts at A1, B1 or C1; question sets contain Grammar, Vocabulary, Reading, Writing, Listening, Speaking (Listening & Speaking appear in alternate sets; others in all sets). [crisp]
- Adaptivity: do well → harder set (level up); struggle → easier set (level down); reasonable → same level. Test ends after staying on the same level for more than 2 sets; maximum 6 sets; typically 4-6 sets. [crisp]
- Overall score = weighted average of last two sets: 60% final set + 40% second-to-last set. [crisp]
- Overall grade boundaries [crisp]: >=85 C2; 76-84 C1; 59-75 B2; 43-58 B1; 30-42 A2; 21-29 A1; <21 = <A1 (Below Beginner).
- Individual skill scores (6 skills) use all sets weighted toward recent — e.g. for 5 sets: 5%, 15%, 25%, 25%, 30%. Overall vs skill scores can legitimately differ. [crisp]
- Level meanings: <A1 Below Beginner, A1 Beginner, A2 Elementary, B1 Intermediate, B2 Upper-Intermediate, C1 Advanced, C2 Near-Native. [crisp]
- CEFR time limits are per-question; recruiters cannot select CEFR questions. [crisp]

## custom-tests

- Create: click "Custom Tests" link (sidebar of Assessments Dashboard) > choose test type > create and save > add to a new or existing assessment via test type > Add > "My Content". [crisp]
- Custom test types listed [crisp]: Quiz, Coding Challenge, Question Bank, Question Bank Quiz, Video Response (plus AI-graded tests [llms]).
- Custom tests belong to the whole team: teammates can see, edit, and remove them. Same custom test reusable in multiple assessments. Cannot be shared directly with candidates — must be inside an assessment. [crisp]
- Custom Quiz results: view per-question responses and points; download all responses via Custom Test sidebar > Analytics icon > "Excel Download". Export contains ALL responses across every assessment using that quiz. [crisp]

## custom-quiz-question-types

- Custom quizzes support 15 question types [crisp]: 1 MCQ (one correct), 2 MCA (multiple correct), 3 Short Text (essay; min/max length), 4 Single-line Input (with validations: emails, numbers, dates), 5 Coding Editor (syntax highlighting/autocomplete; language selectable; code NOT executed), 6 Cloze (drag-and-drop fill-in-the-blanks with distractors), 7 Match (drag across two columns), 8 Categorize (classify items into buckets), 9 Comprehension (nested questions on a passage), 10 Document (PDF-based sub-questions), 11 Answer Any (answer any N of M), 12 Voice Input (record themselves speaking given text), 13 Autograded Text (exact-match expected answer), 14 Question Pool (one random question from a pool). (Crisp lists 14 numbered items while stating 15; llms additionally lists transcription and preference types.)
- Timer, points, and negative points settable per question while creating a custom test. [crisp]

## ai-graded-questions

- AI-graded question types [code, constants ai_graded_question_constants.json]: AI_ONE_WAY ("One-Way"), MCQ ("Multiple Choice"), MCA ("Multiple Answer") — plus conversational-only types (Question/Topic/Scenario).
- Answer formats: Text, Audio, Video. Response statuses: Seen, Skipped, Submitted, Processing, Enqueue Failed, Processing Failed, Graded. [code]
- Text answers: min/max word limits; optional per-question AI evaluation prompt. Defaults [code AI_TESTS_CONSTANTS]: min 50 words, max 250 words; hard max 1000 words; evaluation prompt max 100 words.
- Audio/video answers: min/max duration (default 30-180 s; platform bounds 5-180 s); up to 5 retakes (default 5); optional auto-start recording; optional replay-count restriction (default playback count 5). [code, llms]
- MCQ/MCA: 1-100 points per question, optional negative marking, option randomization. [llms]
- Default question points: 10. Default sample question: "Tell us about yourself and your experience relevant to this position." AI test title max 50 chars. [code]
- Evaluation modes: per-question only, or per-question + holistic report from a report template; test-level evaluation context supported. [llms]

## multilingual-tests

- Custom/AI tests support multiple languages per test with per-language question text; candidates pick their language before starting (candidate-facing language selector). [llms]
- Default AI-test response language: "en". [code, AITestForm]
- Platform UI, Equip's own questions: English only. Custom questions, candidate responses, candidate emails: any language. Browser auto-translate (e.g. Chrome) works for the rest. [crisp "Language Support on Equip"]

## question-bank-quiz

- Question Bank (QB): a large pool of your own questions; difficulty is expressed by points per question. QBs cannot be used in an assessment directly. [crisp]
- Question Bank Quiz (QBQ): draws N questions per points-level per QB, across one or more QBs (e.g. 3x1-pt Java + 2x2-pt Java + 3x1-pt Logical Reasoning = 8 questions shown). [crisp]
- Add QBQ to assessment: assessment Settings > Tests tab > Quiz on the left > "Add Quiz" > "My Content" > select the QBQ. [crisp]
- Builder validation for QB/QBQ: number of questions required for every skill; total must stay under 25 for Equip content quizzes (custom limit 100). [code, crisp]

## import-questions-from-excel

- Path: Assessments Dashboard > "Custom Tests" sidebar > "New" quiz > "Import" button (top right) / "Import from Excel" icon. Questions are appended to the quiz. [crisp]
- Use "Download Template" or the Google Sheets template (File > Download As > .xlsx). Do not remove columns; one sheet only; no empty rows. [crisp]
- Columns [crisp]: Question Type* (MCQ or MCA), Question*, Opt1-Opt5 (min 2 options), CorrectAnsInd* (e.g. 2 for MCQ; "2,3" comma-no-space for MCA), Markdown (1 to render Markdown), Points, Time (in seconds), Image (direct URL ending .jpg/.png; no Google Drive links), Tags (comma-separated).
- "Autocalculate Negative Points" option at import: negative points = points / number of options (e.g. 2 pts, 4 options → 0.5). MCAs are never auto-assigned negative points. [crisp]
- LaTeX equations: enable LaTeX in the quiz's Advanced Settings. [crisp] (llms: quiz templates support Markdown + LaTeX; AI-test imports support HTML-formatted text.)
- Non-MCQ/MCA questions and point re-assignments can be edited after import. [crisp]

## custom-programming-test

- Steps [crisp]: Custom Tests section > "Coding Challenge" tab > "Add New" > select "Programming Test" > add problem statement > choose enabled languages + boilerplates (driver/starter code) > write sample and real test cases.
- Add to assessment: assessment settings > Tests tab > "Programming" in left sidebar > hover "Add Programming" > "My Content". [crisp]

## randomize-coding-questions

- Purpose: associate multiple questions with one coding (Programming/SQL) test; each candidate gets one at random. [crisp]
- Steps: assessment "Settings" > "Test Order" tab > click the Randomize icon > select questions from the list of available coding questions. [crisp]
- Each randomization variant must keep at least one enabled language (builder blocks otherwise). [code]

## custom-quiz-time-limits

- Only custom tests allow time limits; Equip question timers are fixed. [crisp]
- One-by-one custom quiz: per-question time only. All-at-once custom quiz: whole-test time only. Mode can be switched at any time; saved changes apply immediately to candidates. [crisp]

## documents-in-custom-tests

- "Document" question type: upload a PDF in a parent question; add sub-questions (MCQ, MCA, Short Text, etc.) that reference it; useful for case studies. Similar to Comprehension but with a PDF instead of long text/images. [crisp]
- How-to: create Custom Test > question type "Document" > optional Description Text instructions > upload PDF > add sub-questions > set points per sub-question. Timer settable only on the parent question. All sub-questions appear at once below the document, answerable in any order. [crisp]

## video-response-questions

- Created as a Custom Test: Recruiter Dashboard > "Custom Tests" sidebar > "Video Response" > "Create" > set Title > "Add Questions" > type question, set points > "Save". [crisp]
- Settings per question [crisp]: Points (max points), Auto-Start Recording (starts recording after a set time), Answer Time (limits response duration), Allow Retake (set number of retakes), Cannot Skip (makes question mandatory — cannot proceed or submit without answering).
- Max 4 question screens per video response test. [code, crisp]
- Recording and upload happen inside Equip; graded manually (recruiter watches and awards points). [crisp]

## custom-coding-challenge-issues

- Equip recommends its own coding content: challenges are complex to set up (boilerplates, edge cases); Equip's questions are battle-tested by thousands of candidates; tiny I/O mistakes mark all submissions incorrect; unclear instructions block candidates. [crisp]
- Unlike Equip quizzes, Equip coding content lets you pick the exact question and see it in results. [crisp]
- Support policy: Equip will not triage broken custom coding questions — nearly always a setup error on the recruiter's side. [crisp]

## preview-assessment

- Preview link appears on the dashboard once an assessment is created. Two modes [crisp]:
  - "As a Recruiter": jump freely between tests; proctoring (camera, screen share) disabled.
  - "As a Candidate": exact candidate experience; camera/screen-share permissions; must finish each test before the next.
- Previews are free and unlimited for the whole team; invitations cost credits (inviting yourself deducts credits like any candidate). [crisp]
- Questions shown while previewing [crisp]: your content (any test type) — same as candidate; Equip content non-quiz — same as candidate; Equip content quiz — sample questions from a separate sample question bank, matched by skill and difficulty. If the sample bank has fewer questions than you configured, the preview shows fewer (candidates still see the full count).
- Preview URL pattern (existing assessment): /assessments/{id}/?preview=true&create_new_attempt=true. [code]

## live-progress

- Live progress view: real-time monitoring of overall assessment progress and individual test completion for large-scale drives; selectable time window. [crisp]
- The page also helps calculate credits deducted for the assessment. [crisp]

## archive-assessment

- Archive: three-dots menu next to an assessment > "Archive". Assessment disappears from dashboard; candidates opening the link see the assessment has been closed. [crisp]
- Un-archive: Usage Page > link to archived assessments > three-dots > make active. [crisp]
- Archived results remain accessible; assessments can never be deleted, only archived. [crisp, llms]

## test-scores-and-overall-score

- Results show per-test Individual Scores and an Overall Score. Overall Score = sum of (test percentage x weightage); weightages always sum to 100; equal weightage by default. Example: 70% weight test at 0.8 + 30% weight test at 0.5 → (0.8x70)+(0.5x30) = 71%. [crisp]
- Weightage set in Test Order tab of Assessment Settings; changing weightage recalculates overall scores of previous submissions. [crisp]
- Psychometric and Typing Test carry no weightage (excluded from overall). [code; crisp says psychometric]
- Candidate statuses in results: Uncategorized, Shortlisted, Hired, Rejected; score/cutoff filters; bulk updates. [llms, code]
- Candidate report tabs: Test Summary, Proctoring, Session Recording. [llms, crisp]

## grading-tests / manual-grading

- Auto-graded test types [crisp]: Quizzes, Programming, SQL, Communication (CEFR), Attention to Detail, Excel, Psychometric (unscored). Manually graded test types: Video Interview (Video Response), CSS Challenge.
- Quiz question types auto-graded: MCQ, MCA, Categorize, Transcription, Autograded Text, and more. Manually graded: Voice Input, Short-text answer, Single-line Input. [crisp]
- Ungraded flow: tests needing grading are labeled "ungraded"; overall score stays "ungraded" until every test is graded; "Show Ungraded" filter on the dashboard lists affected submissions. [crisp]
- Manual grading steps (video response): open assessment results > click the Video Interview test score > ungraded questions have a yellow outline labeled "Not Yet Graded" > play the video > pencil icon (top right) to award points. Question filters: Not Yet Graded, Correctly Answered, Wrongly Answered, Unattempted. [crisp]
- CSS grading: click CSS test score > compare Target Design (right) vs Code Preview (left) > mobile/tablet/desktop icons check responsiveness > "Submitted Code" shows the code > pencil icon to award points. [crisp]
- Scores editable anytime via the pencil icon, even after grading; test and overall scores recompute automatically. [crisp]
- AI grading: text/audio/video answers evaluated by Equip AI using optional per-question prompts and test-level evaluation context; manual overrides allowed on any response. [llms]

## negative-marking

- Only MCQs in Equip-content quizzes carry negative points; always on, cannot be disabled. Negative points are displayed on each question. [crisp]
- Custom content: negative points optional; formula when auto-calculated = points / number of options; not applied to MCAs. [crisp]
- llms confirms: Equip-library MCQ negative marking is automatic (points divided by option count); optional for custom content. [llms]

## good-assessment-score

- No universal "good" score; depends on company, role, and whether Equip filters candidates or supplements interviews. [crisp]
- Best use: relative shortlisting — sort by overall score, take the top N. [crisp]
- Rule of thumb for a single candidate: interpret percentage as percentile among practitioners with that skill at that experience level (e.g. 70% ≈ better than 70% of practicing digital marketers with 0-2 yrs). Mixed-difficulty assessments give a weighted-average percentile. [crisp]

## download-reports

- Two report types [crisp]:
  1. Export Results (all candidates): button top-right of assessment results; options "Export to Excel" and "Export to PDF" (same data). Fields: Name, Email, Start Date, Start Time (UTC), End Date, End Time (UTC), per-test Points Scored / Points Available / Trust Score Percentage / Plagiarism Score (always empty, legacy) / Test Taker Photo URL, any Gather Additional Details fields (College Name, LinkedIn URL, ...), Overall Percentage.
  2. Single-candidate PDF: open a candidate's test score > test dropdown on the left > "download PDF" button on the far right; exports the whole submission across all tests (test + trust score per test, answers/submissions, links to full report).
- Per-candidate report link is copyable; PDF export is asynchronous. [llms]

## write-results-to-google-sheets

- Setting: assessment Settings > Miscellaneous > "Write results to Google Sheets". [crisp]
- Setup: create a Google Spreadsheet > grant Editor permission to hello@equip.co > paste the spreadsheet URL in assessment settings > click Create/Update. [crisp]
- Behavior: Equip auto-creates one sheet per test plus an overall assessment sheet; results written in real time as candidates complete each test. [crisp]
- Assessment sheet columns: Email, Name, Overall Score, Start Date, Start Time, End Date, End Time. Test sheet columns: Email, Name, Points Scored, Percentage Scored, Trust Score, Start Date, Start Time, End Date, End Time. [crisp]
- Caveats: only candidates attempting AFTER setup are written; do not rename Equip-created sheets or columns; use distinct assessment/test titles. [crisp]
- If Editor permission is missing, Equip emails the creator asking to enable GSheet Editor permission. [code, app/main/tests.py + gsheets helper]

## missing-results

- Reasons a candidate is missing from results [crisp]: (1) unfinished attempt with "Show Unfinished" filter off; (2) attempt deleted by a teammate (unrecoverable); (3) Delinked Test Attempts — the assessment's test set changed after the attempt.
- Delinked attempts are hidden from the main results page because scores aren't comparable; a link on the results dashboard shows them. [crisp]
- Restoring an Equip-content quiz to its previous settings does NOT relink old quiz attempts; re-adding a removed custom test (e.g. Video Response) does relink. [crisp]

## cannot-see-quiz-questions

- Equip quiz questions are hidden during creation and in results to prevent leaks: anyone can self-onboard a team, so exposing the bank would compromise test integrity. [crisp]
- Instead, results give skill-wise and difficulty-wise breakdowns. For full question visibility, use a Custom Quiz. [crisp]

## credits (cross-cutting)

- Policy (current, [crisp updated 13/03/2026]): 1 credit per test in the assessment. 1 credit deducted at invitation; the 2nd credit when the candidate starts Test #2, 3rd at Test #3, etc. Effectively 1 credit per test started ("started" = questions loaded).
- Unstarted invitations are reclaimable for credit. [crisp, llms, code (reclaim_credit / CreditReclaimStatusEnum)]
- Code confirms pricing scheme "one_per_test": 1 credit per test; legacy schemes exist (per_test: 0.5 credits per test from test 3; flat: 0). [code, app/models/assessments/assessment_transactions.py]
- A Quiz and a Programming question cannot be merged into one test; Programming/SQL allow 1 question per test by design. [crisp]
- Trust Score: every completed attempt gets a 0-100% proctoring Trust Score shown atop the candidate report. [llms]

## browser/device requirements (candidate-facing)

- Google Chrome recommended; tab-switch screenshots and multiple-monitor detection require Chromium-based browsers; video on iOS requires Safari. [llms]
- Desktop-only test types: Programming, SQL, CSS, Excel, Typing Test ("Enforce Desktop" proctoring option blocks phones/tablets). [crisp, llms]
- Candidates can preview device compatibility via a skippable one-minute demo test before starting. [llms]
