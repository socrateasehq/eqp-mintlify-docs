# ATS Fact Pack

Sources: Equip codebase (react/src + app/api_v3), llms-snapshot.txt (2026-07-22), crisp helpdesk HTML. Facts marked UNVERIFIED could not be confirmed in code.

## job-post

- Job creation wizard has 3 steps (exact UI labels): "1 JOB POST — Details candidates see", "2 APPLICATION FORM — Fields candidates must fill out", "3 CANDIDATE PIPELINE — Different stages and automations".
- AI JD import: upload a PDF (PDF only, max 10 MB) or paste text; AI parses and pre-fills all job fields. UI: "Upload Job Description PDF", "Drag & drop a PDF file here, or click to browse (max 10MB)", button "Choose PDF File". Progress text: "Uploading file..." / "Processing your PDF..." and "This usually takes 30 - 45 seconds". If no response within 60 seconds after upload, falls back to manual entry ("Unable to Parse PDF ... Please enter the details manually.").
- A sample job description (Data Analyst role) is available as a starting point.
- Job details enums (value → UI label):
  - Employment type: FULLTIME "Full-time", PARTTIME "Part-time", CONTRACT "Contract", INTERNSHIP "Internship", OTHER "Other".
  - Seniority level: Intern, Entry-level, Junior, Mid-level, Senior, Lead, Manager, Director.
  - Work arrangement: On-site, Remote, Hybrid.
  - Salary frequency: Yearly, Monthly, Weekly, Hourly, Fixed, Other.
  - Minimum education qualification: Bachelor's, Master's, High School, Diploma, PhD (a "None" value exists but is filtered out of the dropdown).
- Fields: job title/role, min/max years of experience, employment type, seniority level, work arrangement, locations (cities), location restrictions, timezone restriction (zone + hours), hybrid policy description, mandatory + preferred skills, salary range (min/max, currency, frequency), minimum education qualification, employment start date, application deadline, key callout. Rich-text sections: Job Summary, Responsibilities, Perks, Additional Requirements.
- Validation limits (VALIDATION_LIMITS): job summary 50–2,000 chars; max experience 50 years; max min–max experience gap 20 years; max salary must be ≤ 3× min salary; up to 10 mandatory skills and 15 total skills; hybrid policy 10–300 chars; location restriction min 3 chars; timezone restriction 1–12 hours; application deadline up to 6 months out; key callout max 200 chars / 30 words.
- Job post statuses (value → label): ACTIVE → "Published" (visible, accepting applications), HIDDEN → "Hidden" (not visible to candidates; the public URL returns 404), ARCHIVED → "Archived" (no longer accepting applications, may still be visible for reference). Status is changed from a dropdown on the Job Openings dashboard.
- Job Openings dashboard: each opening shows "#<number> <job title>", creator avatar (tooltip "Created by {name}"), and row links "Invite", "Preview", "Settings". Table filters: Employment Type, Work Arrangement, Status, Min Salary, Max Salary. Dashboard also shows views (num_job_post_views) and application counts per post.
- Editing after creation: Settings page has the same three tabs (Job Post / Application Form / Candidate Pipeline).

## application-form

- Standard fields, exact labels and defaults (enabled = shown on form; each enabled field can be toggled mandatory):
  - Always on + mandatory + locked: "First Name", "Last Name", "Email".
  - Default ON and mandatory: "Phone Number", "Work Experience", "Educational Background", "Industries", "Skills", "CV/Resume", "Notice Period".
  - Default OFF: "Current City", "LinkedIn Profile", "Year of Birth", "Projects/Certifications", "Salary Expectation Range", "Portfolio URLs", "Languages Known", "Willing to Relocate".
  - Sections in the builder: basic / professional / additional.
- Custom fields: max 10 (MAX_CUSTOM_FIELDS = 10). Types offered in UI: "Boolean", "Integer", "Date". Label min 3 chars. Each has optional placeholder and mandatory toggle. Usable as dashboard filters.
- Screening questions: max 5 (MAX_SCREENING_QUESTIONS = 5). Answer types in UI: "Text", "Boolean", "Integer", "Date". Objective (non-text) answers are filterable in the dashboard.
- A live preview of the candidate-facing form is shown in the builder.

## pipeline-stages

- 11 stage types (value → label — short description shown on the "add stage" card):
  - APPLIED → "Applied" — "Candidates apply for the position" (system stage, always first).
  - PHONE_SCREENING → "Phone Screening" — "Call candidates. Rank and review them".
  - ASSESSMENT → "Assessment" — "Quiz, coding, communication, etc".
  - ONE_WAY_AI_INTERVIEW → "One-Way AI Interview" (short label "One-Way AI") — "Fixed questions. Evaluate subjective responses via text, audio, video".
  - CONVERSATIONAL_AI_INTERVIEW → "Conversational AI Interview" (short label "Conversational AI") — "AI bot auto-generates questions. Engages in back-and-forth".
  - VIDEO_INTERVIEW → "Video Interview" — "Use your videoconferencing tool. Rank and review candidates".
  - CUSTOM → "Custom" — "Custom stage with optional ranking".
  - OFFERED → "Offered" (system, non-configurable; supports offer email + offer letter).
  - Terminal stages: HIRED "Hired", REJECTED "Rejected", WITHDRAWN "Withdrawn" (plus OFFERED is system but not terminal).
- Per-stage capability matrix (from constants):
  - Scorecard dropdown: Phone Screening, Video Interview, Custom.
  - Invitation email template: Assessment, One-Way AI Interview, Conversational AI Interview, Video Interview, Custom.
  - Rejection email template: all non-terminal stages except Offered (Applied through Custom).
  - Assignee: all stages except the three terminal ones.
- Each stage has a candidate-facing stage name (max 20 chars) and an internal name (max 200 chars) shown to the team in dashboards. Pipeline builder is drag-to-reorder; terminal stages are not deletable.
- Deleting a stage that holds candidates archives it instead: toast "Stage has candidates and was archived instead of deleted". Archived stages can be restored ("Stage has been restored successfully"). Stage availability statuses: ACTIVE, ARCHIVED.
- AI interview stages auto-generate their artifact (interview) when created.

## candidate-pipeline (applications dashboard)

- Views: Table and Kanban (toggle in the filter bar). Kanban has collapsible cards/columns (llms).
- Filter presets (exact labels): "All", "Relevant" (excludes stages of type Hired/Rejected/Withdrawn; default in table view), "Mine" (assigned to me), "Unassigned", "Starred", "Recent" (applied in the last 7 days). "All" is the default in Kanban view.
- Sortable fields (UI labels): "Fit Score", "Max Salary", "Min Salary", "Notice Period", "Experience", "Applied Date".
- Bulk actions on selection: change stage (ChangeStageDropdown), "Move to Job" (move to another job post), delete, star/unstar.
- Candidate status, independent of pipeline stage (value → label): APPLIED "Applied", MAYBE "Maybe", SHORTLISTED "Shortlisted", REJECTED "Rejected", WITHDRAWN "Withdrawn".
- "Action pending on" marker per candidate: Team, Candidate, or Both.
- Application sources (value → label): CANDIDATE_DIRECT "Direct Application", BULK_UPLOAD "Bulk CV Upload", EQUIP_SOURCING "Equip Sourcing Platform", AGENCY "Recruitment Agency", ATS_IMPORT "ATS Import".
- Export: CSV/Excel with core columns always present and optional columns gated by which standard fields are enabled; includes one dynamic column per custom field / screening question. (llms: 32 columns incl. contact details, stage, fit score + reason, salary, resume URL, notes, starred.)
- Star toggle tooltip: "Add star" / "Remove star".

## changing-stages

- Moving a candidate opens a contextual dialog depending on the target stage: simple move, rejection dialog, or an invitation dialog (Assessment, AI Interview, or Video-Interview/Custom-stage invite) with email preview.
- Rejection dialog: title "Reject candidate(s)", rejection-reason dropdown placeholder "Select a reason", checkbox "Send rejection email to candidates" (off by default; emails are never auto-sent).
- Rejection reasons (10, exact labels): "Not enough experience", "Skills mismatch", "Overqualified", "Salary expectations too high", "Location/relocation concerns", "Culture fit", "Position filled", "Incomplete application", "No response from candidate", "Other".
- Email send options: optional Reply-To (pick a team member; default is the current user — without it the email is sent from no-reply@equip.co per llms), and Schedule Send with units minutes (1–10,080), hours (1–168), days (1–7) — i.e. max 7 days ahead.
- Credit cost notice on invitation dialogs: "We'll deduct N credit(s) now." + "Reclaimable if not attempted." Assessment pricing schemes: flat (1 credit per candidate), per_test (1 credit covers the first 2 tests; assessments with >2 tests cost 0.5 credits per test, so "We'll deduct 0.5 credits per candidate when they start the third test."), one_per_test (1 credit per test: "We'll deduct 1 credit per candidate for each additional test they start."). Insufficient balance blocks with "Insufficient credits (need X, have Y)".
- Per-candidate credit costs (BASE_CREDITS_PER_PURPOSE): assessment 1, one-way AI interview 1, conversational AI interview 2 (Quick; Comprehensive is 3 per llms), job-fit re-ranking 0.5, bulk CV import 0.01.
- Candidates with unverified emails trigger a warning in invite dialogs and receive no stage-change emails until verified.
- Candidate Journey logs 31 event types, e.g. "submitted application", "changed stage", "updated status", "starred this candidate", "updated notes", "changed assignee", "submitted scorecard", "sent/scheduled assessment invite", "sent/scheduled AI interview invite", "sent/scheduled rejection email", "sent/scheduled video interview invite", "sent/scheduled custom stage invite", "moved to different job post", "updated candidate details", "re-uploaded resume", plus offer email and offer letter events (sent, viewed, signed, counter-signed, completed, voided, declined).

## candidate-profile

- Detail panel tabs (exact labels): "Candidate Details" and "Candidate Journey".
- Details tab section headings include: "Preferences", "Experience", "Education", "Attachments" (plus scores, skills, languages, custom fields, screening answers per llms).
- Attachments: max 3 per candidate, 10 MB each, attachment name max 50 chars; uploader tracked as Recruiter or Candidate.
- Resume replacement: PDF, DOC, DOCX only; max 10 MB. Errors: "Only PDF, DOC, and DOCX files are allowed." / "Resume must be at most 10 MB."
- Editable contact fields (Edit Candidate modal): first name, last name, email, phone, LinkedIn profile, current city, resume.
- Unverified email: amber icon in the email cell; popover "Email not verified"; recruiters can copy a verification link to share with the candidate.
- Moving to another job post: dialog title "Move Application(s)"; note "Applications will be moved to the first stage of the new pipeline." Fit score is kept (llms).

## sharing-job-posts

- On the Job Openings dashboard, clicking "Invite" copies the application link: `{origin}/job-posts/{job-post-label}/`. Toast: "Application link copied! Share this link with your candidates. They can apply through it and will appear in your applications."
- "Preview" opens the candidate-facing job post at `/job-posts/{label}/?preview=true` in a new tab.
- Candidates visiting the link see the job post, upload a resume (parsed by Equip), review the pre-filled form, and click Submit.
- Share the link anywhere: email, WhatsApp, your careers page or Equip's, or job boards (crisp article).

## job-boards

- Equip does NOT automatically publish to any job board. There is no built-in job-board or LinkedIn integration (confirmed: crisp article "What Job Boards does Equip publish to? — tl;dr: None").
- Workflow: paste the job post application link on LinkedIn, Indeed, Monster, Naukri, etc. yourself.
- LinkedIn: use LinkedIn's "External Apply" option — when creating the LinkedIn job, in "Manage applicants" settings enter the Equip application link; the Apply button then redirects candidates to your Equip job post.

## careers-page

- Settings at Account → "Careers Page" (`/careers-page/`). Enable toggle generates a slug server-side.
- Fields: "Slug" (required, max 30 chars, placeholder "your-company"), "Custom CSS" (placeholder shows examples like `#careers-hero { background-color: ... }`; write plain CSS, no `<style>` tags), "Embed Code" (copyable HTML anchor; comment requires the link stay search-engine crawlable and count as a backlink).
- Public URL: `https://equip.co/companies/{slug}/hiring/`. Copy-URL and open-in-new-tab buttons provided.
- Public page: lists Published job posts only, as cards showing work arrangement, employment type, locations, and mandatory skills. Search box "Search jobs...". Filters: Work Arrangement, Location (city), Employment Type, and skills. Empty state: "No jobs found matching your criteria."
- Customizable with company logo (org settings) and custom CSS; embeddable on your own site.

## job-fit-score

- Every applicant gets a fit score displayed 0–100 with one decimal (stored as job_fit_score_times_ten, clamped to 0.5–99.5) plus a one-line AI explanation. Shown in the applications table and on Kanban cards.
- Scoring is relative: the LLM places each new candidate against benchmark candidates from the same job's applicant pool; the numeric score is interpolated deterministically between the two chosen benchmark scores. Phases by number scored: COLD_START (1–3 candidates, individual evaluation), BOOTSTRAP (4–6, all prior candidates as benchmarks, capped at 35), then TRANSITION and STEADY with periodic calibration refreshes.
- Ranking criteria: choose up to 3 (MAX_RANKING_CRITERIA = 3) from six, drag to prioritize. Exact labels + hover text:
  - "Skills" — How relevant the Skills are to the Job Description
  - "Experience" — Higher weightage to more Years of Experience
  - "Education" — Degrees and Institutions
  - "Previous Companies" — Pedigree of Employment History
  - "Seniority" — More Managerial positions get higher weightage
  - "Industry" — Relevance of candidate's industry experience to the role
- Criteria availability depends on the application form: Skills requires the Skills field, Experience and Previous Companies require Work Experience, Education requires Educational Background, Industry requires Industries; Seniority is always available.
- "Additional criteria (optional)": free text, max 200 chars.
- No criteria selected → default AI judgment. Criteria changes apply to future applications; a re-rank action re-scores existing active candidates at 0.5 credits per candidate.
- Candidates without a score show a "Calculate" button for on-demand scoring.

## cv-parsing

- Candidate self-apply: resume upload (PDF, up to 10 MB) on the application form pre-fills the form; parsing typically takes 30–45 seconds, manual fill as fallback (llms).
- Extracted fields (llms + base schema): name, email, phone, current city, LinkedIn URL, portfolio URLs, languages known, education (degree, institution, field, years, grade), work experience (role, company, dates, description, employment type), skills (with years and expertise level), industry experience. Base candidate schema also defines alternate email/phone, nationality, date of birth, current role, salary expectation, notice period, willingness to relocate, availability date, work authorization.
- Skill expertise levels: Intermediate, Advanced, Expert.
- Parsed values are normalized against Equip's canonical databases of skills, roles, cities, companies, and educational institutions; institution matching is country-aware (llms).

## bulk-cv-import

- Upload UI: "Select PDF files to upload" — "PDF only · Max 100 files · Max 10MB each". Errors: "Only PDF files are supported", "File exceeds 10MB limit", "Maximum 100 files allowed". Backend enforces 1–100 CVs per batch ("Maximum 100 CVs per batch").
- Cost: 0.01 credits per CV (BULK_CV_IMPORT), checked against team balance before starting.
- Batch statuses: Pending, Processing, Completed, Failed. Detail page shows total/processed/success/failed/skipped counts with per-file lists (categories: success, failed, skipped, processing) and per-file failure reasons. Status auto-polls every 10 seconds while processing.
- Each successfully parsed CV creates a job application automatically. Failure reasons include missing email, missing name, duplicate application, parsing failure (llms).
- Bulk-imported candidates are marked unverified ("Email not verified") and receive no stage-change emails until verified; source is recorded as "Bulk CV Upload".

## candidates-and-cvs

- (See candidate-pipeline for dashboard views/filters/bulk actions and candidate-profile for the detail panel.)
- Candidates can be deleted (CandidateDeleteDialog); stage/status/starred state and notes live on the application.
- Per-candidate recruiter notes; assignee per application; starred flag.

## scorecards

- Scorecard templates: Account → Templates → Scorecards (`/templates/scorecards/`). Name max 100 chars ("Name must be 100 characters or less"), placeholder "e.g., Technical Interview Scorecard".
- Applicable stage types: Phone Screening, Video Interview, Custom.
- Default criteria for new templates (name — description): "Communication — Clarity and articulation", "Technical Skills — Domain expertise and knowledge", "Problem Solving — Analytical and critical thinking", "Cultural Fit — Alignment with team values". Criteria can be added, removed (min 1 must remain), and reordered.
- Filling a scorecard: star-rating input per criterion; submitted as a Candidate Journey event ("submitted scorecard") with an overall score (stored as scorecardScoreTimesHundred). Viewing an existing scorecard and re-submitting always creates a NEW event.
- Star scale is 1–5: UNVERIFIED (StarRatingInput not inspected).
- Scorecard averages feed the Insights "Avg scorecard by recruiter" chart.

## email-templates

- Template purposes (exact labels): "Rejection Email", "Assessment/AI Interview Invitation", "Video Interview Invitation", "Custom Stage Invitation", "Offer Email". Managed under Templates → stage-transition emails; default templates provided (llms).
- Shared variables (all templates; value → label): candidate_name "Candidate Full Name", candidate_first_name "Candidate First Name", job_title "Job Title", company_name "Company Name", sender_name "Sender Name", job_post_url "Job Post URL". Variables are click-to-copy with example values.
- Invitation-template extra variables: stage_type "Assessment or AI Interview", test_link "Assessment or AI Interview Link", cannot_start_before_time_in_your_timezone "Earliest Start Time (Your Timezone)", cannot_start_before_time_in_utc "Earliest Start Time (UTC)", cannot_start_after_time_in_your_timezone "Latest Start Time (Your Timezone)", cannot_start_after_time_in_utc "Latest Start Time (UTC)", link_expiry_in_days "Link Expiry (Days)".
- Video-interview / custom-stage invitations add: stage_type "Stage Type".
- Offer email adds: signing_link "Offer Letter Signing Link".
- Emails are recruiter-triggered at stage changes, never auto-sent; sending supports reply-to and scheduling up to 7 days ahead (see changing-stages).

## ats-insights

- Route: `/recruiter/job-openings/insights/`; page title "Insights".
- Empty state (no applications ever): "Post your first job to start seeing insights" with a link to a sample demo dashboard.
- Filter bar: date-range presets "Last 7 days", "Last 30 days", "Last 90 days" (default), "Last 12 months", "Custom range"; scope toggle "Solo" / "Squad" (Squad = you + direct and indirect reports; requires a reporting structure); filter by specific job openings. Scope summary reads e.g. "Squad of N · {from} → {to}" or "Just you · ...".
- Sections (exact): Key Metrics (KPI row), "Pipeline & Funnel", "Velocity", "Team", "Quality & Source".
- 20 charts (exact names): Active openings, Applications, In pipeline, Hires, Avg time to hire, Offer acceptance (KPIs); Application funnel, Pipeline snapshot, Stage drop-off, Pipeline-stage funnel; Time-to-hire trend, Avg time in stage, Time to offer, Offer turnaround; Team performance, Avg scorecard by recruiter; Applications by source, Job-fit score distribution, Rejections by reason, Offer outcomes.
- KPI definitions: "In pipeline" counts candidates currently in a non-terminal stage (right now, ignores date range); "Avg time to hire" = average days from application to hire (needs ≥1 hire: "Make your first hire to see this"); "Offer acceptance" = signed offers / resolved offers (needs ≥3 resolved offers: "Resolve a few offers to see your acceptance rate").
- Application funnel steps: Applied → Shortlisted → Offered → Hired, with click-to-drilldown. Offer outcomes shows Sent / Viewed / Signed / Declined counts.
- Charts can be grouped by: Source, Job opening, Recruiter, Stage type, Rejection reason; trend granularity Weekly/Monthly; chart sizes Small/Medium/Large; charts export to CSV (llms).

## talent-rediscovery

- Sidebar: ATS → "Talent Rediscovery" (`/job-openings/talent-rediscovery/`); searches every candidate who has ever applied to any of your team's job openings.
- Empty state heading "Rediscover Your Talent Pool"; shows "Your team has N past candidates"; buttons "Upload a Job Description" (JD paste modal that extracts criteria) "or set a skill filter above to begin".
- Experience aging: banner "Experience and per-skill years are estimated based on time since each candidate applied." Modal "How experience is estimated": total experience grows by time elapsed since application; per-skill years grow proportionally. Explicitly flagged as estimates.
- Relevance scoring activates when a skills filter is set. Scoring weights (must sum to 100; Recency is derived): defaults Skills 50% · Experience 30% · Recency 20%; Skills and Experience are editable.
- Row data includes: contact info, aged vs original experience, per-skill aged years and expertise level, latest role/company, latest application (job opening + stage), application source, whether they attempted an assessment or AI interview, relevance score with skills/experience/recency breakdown. Results exportable.
- Detail panel shows the candidate's full application history across openings (per-application stage, fit score, work and education history).

## candidate-search

- Sidebar: ATS → "Candidate Search" (`/candidate-search/`). Page heading "Candidate Search".
- Search box placeholder: "Search by name or email". Filters: "Activity type" — Job Application, Assessment, AI Interview, Assessment Invitation, AI Interview Invitation — and "Activity date". Nothing is queried until you click "Search".
- Each result row deep-links to the matching dashboard (job post applications, assessment results, or AI interview results) with the candidate's email pre-filled in that page's search filter.

## Cross-cutting

- Sidebar "ATS" section entries: "How It Works", "Job Openings", "Candidate Search", "Talent Rediscovery". (Insights is routed at /job-openings/insights/; its nav entry location UNVERIFIED.)
- The ATS is free forever; credits are only consumed by assessments/AI interviews, bulk CV import (0.01/CV), and fit-score re-ranking (0.5/candidate).
- Team collaboration: unlimited teammates, assignees on stages and applications, per-candidate notes, reporting structure powers Squad scope in Insights.
- Browser/device requirements for the recruiter ATS UI: none found in code (no ATS-specific restrictions). Candidate-side test-taking requirements (Chrome recommended, desktop-only test types) belong to Assessments, not the ATS.

## UNVERIFIED / gaps

- Scorecard star-rating scale (assumed 1–5, not confirmed in code).
- Exact 32-column export list and journey "32 event types" (code shows 31 journey event types; llms says 32).
- Kanban collapsible cards/columns specifics; careers-page logo upload flow details.
- Insights nav entry placement (route confirmed, sidebar/tab entry not found).
- Offer-letter e-signature flow details (early rollout; states from constants only: Sent, Viewed, Signed, Counter-Signed, Completed, Voided, Declined).
