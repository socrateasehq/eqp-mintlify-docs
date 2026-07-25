# Fact Pack: Candidate Experience
Sources: Equip codebase (`/Users/jayanth/PycharmProjects/equip`), llms-snapshot.txt, Crisp helpdesk HTML. Facts marked UNVERIFIED could not be confirmed in code.

## share-url-vs-email (Sharing assessment: URL vs Emails)
- Two ways to invite: (1) Email invitations with a unique one-time URL per candidate; (2) a shared/common public URL (looks like `equip.co/assessments/abcdefg`).
- Email invitation: candidate clicks unique link -> a one-time verification code is sent to the invited email ID -> candidate authenticates -> assessment starts.
- Common URL: candidate opens URL -> enters their email ID -> OTP sent to that email -> authenticates -> assessment starts.
- After the assessment begins, both methods behave identically.
- Comparison (Crisp, updated 15/09/2025):
  - Track invitation status: Email = Yes; Common URL = No.
  - Credit deduction: Email = when candidate is invited (reclaimable if unattempted); Common URL = when candidate starts the first test.
  - Control who attempts: Email = Yes; Common URL = No (anyone with the link).
  - Control how many attempt: Email = Yes; Common URL = No.
- Backend metadata keys: `is_one_time_url_enabled`, `is_public_url_enabled` on the assessment; `is_unique_url` flag on the stage artifact.

## email-invitations
- Entry point: **Invite** button/link under the assessment on the dashboard. Page has two tabs: **Send Invitations** and **Track Invitations**.
- Recipients: type/paste comma-separated email addresses or **Upload CSV** (button label; `.csv` accepted; "Download sample CSV" link to a template). Commas or newlines both parsed.
- Hard limit: max **100 recipients per send** (frontend `MAX_EMAIL_RECIPIENTS = 100`; backend rejects >100 with "Cannot send to more than 100 recipients at once").
- Send-tab fields (exact labels): **Sender** (dropdown of team members' emails), **Link Expiry (days)** (number input, min 1, max 365; helper text "Links will expire after these many days"; empty = never expires), **Email Subject** (placeholder "Invitation to {job title}"; default subject "Invitation to Assessment" / "Invitation to AI Interview"), **Email Template** (rich-text body; saved per assessment).
- The email body must contain the assessment link. Removing it blocks sending: dialog "No Link Found" — "You've removed the assessment link from the email. Restore the link by clicking the Reset button...".
- Confirmation dialog: "Invite Candidates" — "Are you sure you want to email these N candidates? We'll deduct N credits now." plus "Each candidate submission will cost you X credits".
- Credits: 1 credit per candidate deducted immediately at invite time (assessments and AI interviews both list 1 credit per invite in `NUM_CREDITS_PER_STAGE`; conversational AI interviews cost 2 (Quick) or 3 (Comprehensive) credits per submission).
- Insufficient credits blocks sending ("Insufficient Credits" dialog shows needed vs current balance).
- Frontend warns on common typo domains (gamil.com, gmial.com, hotmial.com, etc.) and invalid TLDs (.comm).
- Duplicate invitations: Equip warns if you invite the same candidate to an assessment again; proceeding deducts another credit (reclaimable after 24h since only one link gets used).
- Max open invitations: credit balance + 25 (account can go to −25 credits; below 0 results are hidden, below −25 candidates cannot start attempts).

## email-status
- Track under **Track Invitations** tab; table column label **Status** (Crisp calls it "Delivery Status").
- Full status enum (internal -> display): Schedule->Scheduled, Fail->Failed, Send->Sent, Delivery->Delivered, Bounce->Bounced, Complaint->Complaint, Reject->Rejected, Open->Opened, Click->Clicked, Unsubscribe->Unsubscribed, Spamreport->Spam Report, Generate->Generated.
- Statuses surfaced to recruiters in UI copy: Sent, Delivered, Opened, Clicked, Bounced.
- Meanings: Sent = initial status when email sent; Bounced = not delivered (invalid address, full inbox, etc.); Delivered = reached inbox; Opened = candidate opened the email; Clicked = candidate clicked a link in the email.
- Caveats: some email clients (esp. mobile apps) block open tracking, so an Opened email may stay at Delivered. Default template has exactly one link (the assessment link), so Clicked = clicked the assessment link; if you add extra links Equip cannot tell which was clicked.
- Delivered/Opened/Clicked statuses are authoritative — if Delivered but candidate can't find it, they should check Spam/other folders.

## custom-sender-email
- The "from" address is always **hello@equip.co** (sender constant `"Equip <hello@equip.co>"`). It cannot be changed.
- **Reply-to** = the inviting recruiter's email; **sender name** = the recruiter's first + last name. Both are changed via the recruiter's Profile page.
- If a different team member's email should be reply-to, that member must send the invitation — or use the **Sender** dropdown on the Send Invitations tab, which lists all team members' emails (stored as `email_sender_id` on the assessment).

## invitation-links
- Every email invitation contains a unique assessment URL usable once; all recipients get the same email body, only the link differs.
- On visiting the URL, a verification code is sent to the email ID tied to the link. Only someone with inbox access can proceed — forwarding the link to another person doesn't work (the code still goes to the original invitee).
- Same candidate on a different device: allowed; the attempt resumes with remaining time intact (e.g., 10 minutes left continues at 10 minutes).
- Expiry: set via **Link Expiry (days)** (1–365). By default links never expire.
- Revoking: from the Track Invitations tab you can revoke an invitation after sending. Reclaiming credits also invalidates the candidate's link and deletes their test data (points etc.).

## invitations-vs-preview
- tl;dr (Crisp): "Invitations are for candidates and cost credits. Preview is for team members and is free."
- **Invite** (yourself/teammate): real questions, proctoring enabled, costs credits.
- **Preview**: free, unlimited times, for you or your team. Two modes:
  - **As a Recruiter**: jump between tests freely; proctoring (camera tracking, screen sharing) disabled.
  - **As a Candidate**: exact candidate flow — grant camera/screen access, finish each test before the next; a "Preview Mode / Previewing as a Candidate" banner is shown.
- Questions seen in Preview: custom content = same as candidate; Equip content non-quiz = same as candidate; Equip content quiz = **sample questions** only (representative question bank matched by difficulty; actual quiz questions are never shown to recruiters). If the sample bank has fewer questions than configured, the preview shows fewer, but candidates see the full count.

## candidate-reattempts
- A candidate (identified by email ID) can attempt an assessment **only once**. Two different email IDs = two different candidates.
- An unfinished assessment is ALWAYS resumed for that email ID — even if you send a fresh invitation with a new link, clicking it resumes the old attempt.
- To allow a true re-attempt: delete the existing attempt (Results page -> red Delete icon at far right of the candidate row), then re-invite. Alternatively clone the assessment and invite them to the clone.
- Credits on re-attempts: every invitation deducts a credit. If candidate hadn't started: reclaim previous credit. If they'd started or finished: you pay again for the re-attempt (a deleted+reattempted candidate costs 2 credits total, not 1).
- If a candidate reports not receiving the invite: check status — Bounced -> fix email and re-invite; Delivered/Opened/Clicked -> ask them to check all folders; if still lost, re-invite and reclaim the old credit.

## redirect-after-completion
- Default end state: "Assessment Completed" screen with green check; sub-text "You may contact your recruiter for the results." Candidate closes the tab.
- Optional: assessment setting **On Assessment Completion, redirect candidate** (Yes/No radio) + a Redirect URL field (validated as http(s) URL). Stored as `is_redirect_url_enabled` and `redirect_url` in assessment meta_data.
- When enabled, the completed screen shows "You will be automatically redirected in **5** seconds. Please wait." with a live countdown, then redirects.

## taking-an-assessment (candidate flow)
- Flow: invitation/shared link -> email verification (code or magic link, or Google) -> registration collects only recruiter-enabled fields still missing -> instructions page -> optional demo tests -> tests in order -> Assessment Completed screen.
- Additional details recruiters can collect: phone number, LinkedIn URL, student ID, college name, graduation year, department, work experience (llms).
- Instructions page: greets candidate by name, shows assessment structure ("test n of N"), per-test instructions, recruiter's custom rich-text instructions, and per-test-type guidance auto-generated (quiz navigation rules, coding language choices, Excel formula requirements, typing timer behavior).
- Start window: **Cannot Start Before** / **Cannot Start After** date-times (exact UI labels). Candidate-facing messages: "You can only start the assessment after {time}", "...before {time}", "...between {t1} and {t2}".
- Quiz modes and exact candidate-facing instruction copy (from backend):
  - Navigable quiz: "You can skip questions and return to them later." / "You can navigate across questions."
  - One-by-one (screen-by-screen): "This quiz has questions that appear one-by-one." "Each question may have its own timer, and even negative points!" "If you skip a question, you cannot return to it later." On reload, "your latest question is blocked, and you must start from the next question."
  - All-at-once: "This quiz has questions that are shown all at once."; if timed with auto-submit: "The quiz will auto-submit after the time ends."
- Timers: persistent time-remaining display; durations recruiter-set on custom tests, fixed on Equip library tests. There is no assessment-level time limit — only per-test or per-question limits.
- Coding: browser editor with language selection; SQL environment; Excel = simulated spreadsheet; CSS = live output vs target design.
- Audio/video answers: visible retake counts, min/max duration enforced; upload progress shown on submission with diagnostics on slow connections.
- Credits deducted as the candidate starts each test (default `one_per_test` pricing: 1 credit per test; the first credit is taken at invite time for email invites).

## taking-an-ai-interview (candidate flow)
- Two families: One-way (pre-set questions; answer by video, audio, or text; all questions visible at once, answered in any order, single session) and Conversational (live voice AI with adaptive follow-ups).
- Pre-start: three-step wizard — (1) review the format, (2) test devices with a 5-second recording playback (conversational adds a read-aloud mic calibration), (3) start. Camera and mic verified before start.
- Conversational UI: live video-call layout with "Equip AI Interviewer", self-view, real-time transcript; optional Workspace panel for code (syntax-highlighted editor; Python, JavaScript, TypeScript, Java, Go, C++, C#, Ruby, Rust, SQL, or candidate's choice) or plain text answers.
- Network resilience: automatic reconnection with status banners; a grace window so brief disconnects don't end the interview.
- Resumption/restart: setting **Allow resuming unfinished attempt** (toggle; helper text: "Lets candidates restart if they leave before submitting. Restarts are unlimited until they submit, and only the submitted attempt is graded."). Conversational interviews cannot be resumed once submitted.
- Optional availability window restricts when candidates can start.
- Interview languages (recruiter-chosen): English (US, India, UK), Hindi, Kannada, Telugu, Tamil, Marathi, Bengali, Spanish (Spain, US), French, German, Portuguese (Brazil), Italian.
- Recording is server-side; transcripts retained; same proctoring options as assessments apply.

## candidate-login-methods
- Candidate sign-in page: "Sign in to continue" with two options (exact labels): **Sign In with Google** and **Sign In with Email**.
- Email flow: verification email contains a login (magic) link AND a 6-digit code. Page copy: "Click the link in the email to verify your account" / "Enter the 6-digit Equip Login Code that was sent to your email" -> **Verify & Continue**.
- Both the link and the code expire in **30 minutes** (email copy: "This link is valid for the next 30 minutes... The code expires in 30 minutes"). Code is 6 characters (DB column `login_code String(6)`).
- No account/password setup required beyond email verification.
- Unique-link invitees: the code is always sent to the invited email ID regardless of who opens the link.

## device-compatibility
- Mobile-friendly test types: Quiz (MCQs, essay), Psychometric, English Communication (CEFR), Video Response. Desktop-only: Programming, SQL, CSS, Excel, Typing.
- Desktop-only tests carry a "Desktop Only" badge; the **Enforce Desktop** proctoring option blocks phones/tablets on any test.
- Browser guidance: Google Chrome recommended. Switched Tab Screenshot works on Chrome, Edge, Safari, and Firefox desktop browsers (Crisp, 09/02/2026); multiple-monitor detection requires Chromium-based browsers; video interviews on iOS require Safari.
- Troubleshooting ladder for candidates: check webcam/mic -> incognito mode -> different browser (Chrome first; Firefox last resort) -> different device.

## language-support
- Platform UI (buttons, instructions, website, recruiter dashboard): English only. Browser auto-translate (e.g., Chrome) covers most candidates.
- Equip's own questions (MCQs, coding, etc.): English only.
- Custom questions / AI test content: any language. Candidate responses to AI tests or essay questions: any language. Candidate invitation emails: any language.
- Assessments support a candidate-facing language selector for multilingual assessments (llms).
- AI interview spoken languages: see taking-an-ai-interview above.

## demo-tests
- Before the actual tests, candidates are shown a **Demo Tests** page: "Before attempting the actual tests on Equip, we highly recommend attempting demo tests to become familiar with the interface. This also helps you configure proctoring for the different tests. Demo tests take a minute to complete."
- Page shows "Your Demo Tests Status" with per-test-type rows and Attempted checkmarks; note "You may skip demo tests if you have already attempted them"; button **Skip to Assessment** at the bottom; banner "Not Actual Assessment - Just Demo Tests".
- Nudge copy: "Candidates who attempt demo tests tend to score higher on their assessments".
- Demo tests are skippable and free; candidates are auto-redirected to demo tests before test 1 unless already attempted/skipped.
- Finishing only a demo test is a common cause of "candidate says they submitted but no result" (see candidate-says-submitted).

## resume-your-attempt
- "Resuming" = the assessment is opened again by: page refresh, opening the link in another tab, or another browser/device. All are treated identically.
- Candidate action: click the same assessment link again (any device). Equip auto-resumes where possible; finished assessments show the completion screen instead.
- Two resumption types by where the timer lives:
  - **Type 1** (per-question timer): Video Response, One-by-one Quiz. The in-progress question is forfeited (must skip to the next); resumable any number of times with no time check.
  - **Type 2** (per-test timer): All-at-once Quiz, Programming, CSS, SQL. Wall-clock time keeps running: a 45-min test started at 11:00 ends at 11:45 regardless of disconnects; resuming after the end time is impossible.
- Unique-link invitees resuming on a new device keep their remaining time (link + email are bound).
- If resumption is impossible, the recruiter must delete the attempt and re-invite (costs another credit).
- Invalid/used links, expired deadlines, and deleted attempts each show specific explanatory error pages.
- Proctoring is resilient to connectivity loss: evidence is captured offline and synced when connection returns.

## ai-proctoring (overview)
- Proctoring is automated, AI-driven (powered by AutoProctor). When a test starts, Equip gets access to camera feed, microphone feed, and device screen (as configured).
- Candidates see exactly which proctoring measures are active before starting and consent to the proctoring report being shared with the recruiter.
- Recruiter report tabs per candidate: **Test Summary**, **Proctoring** (photos, tab switches, audio flags), **Session Recording**.
- Report shows a Trust Score plus a list of violations with timestamps and evidence (screenshots, audio recordings, photos).
- Always-on measures on every attempt: device fingerprinting, IP recording with geolocation lookup, multi-session detection (resume from another tab/browser/device/IP is flagged), offline evidence capture.
- Anti-AI-tool strategy: disable copy/paste + full-screen + tab-switch detection catch on-device AI use; Auxiliary Device (phone as second camera watching hands/keyboard/screen) catches stealth tools like Cluely/InterviewCoder or AI on a second phone.

## proctoring-settings (the 11 per-test toggles)
- Where: Assessment Settings -> **Test Order** tab -> **Edit Settings** on a test -> toggle -> **Save Settings** -> **Update**. Panel has **Enable All** / **Disable All** links.
- Exact labels + descriptions (from `ALL_PROCTOR_SETTINGS_EXPLANATION_DICT`), in UI order:
  1. **Detect Audio** (`audio`) — "Record noise and audio cues in the background"
  2. **Detect Face** (`numHumans`) — "Capture a photo if the camera detects no faces or multiple faces"
  3. **Detect Switched Tab** (`tabSwitch`) — "When user switches to a different tab/application, we detect this"
  4. **Switched Tab Screenshot** (`captureSwitchedTab`) — "...capture screenshot (Works only on supported browsers)"
  5. **Take Random Photos** (`photosAtRandom`) — "Capture a few photos of the candidate throughout the test"
  6. **Prevent Multiple Monitors** (`preventMultipleMonitors`) — "Candidates connected to more than one monitor are blocked from taking the test until they disconnect extra displays (Works only on supported browsers)"
  7. **Capture Photo Before Start Test** (`testTakerPhoto`) — "Take a photo of the candidate's face before every test starts. For the first test, it is enabled by default"
  8. **Enforce Full Screen** (`forceFullScreen`) — "Candidates cannot take the test without entering full-screen mode... Recommended to avoid tab switching and cheating"
  9. **Enforce Desktop** (`forceDesktop`) — "Useful if you are conducting coding challenges... which requires the user to have a large screen"
  10. **Record User Session** (`recordSession`) — "Records the candidate's screens and actions (mouse clicks, keyboard typing), as they attempt the test"
  11. **Auxiliary Device** (`auxiliaryDevice`) — "Candidate will have to pair their phone to their computer to take the test"
- (A 12th tracking option exists in code, `disableCopyPaste` — surfaced to candidates as "Copy/Paste Disabled" — but it is configured via test anti-cheating settings, not this panel.)
- Dependency rule: enabling Switched Tab Screenshot auto-enables Detect Switched Tab; disabling Detect Switched Tab auto-disables the screenshot option.
- Defaults per test type (all ON except the following, per `get_default_proctor_settings`; auxiliaryDevice is always OFF by default):
  - Quiz (all quiz variants): forceDesktop OFF.
  - Video Response: audio, numHumans, photosAtRandom, recordSession, testTakerPhoto, forceFullScreen, forceDesktop OFF. (For custom video-response tests the recruiter UI also disables editing those camera options: "You cannot enable some of the options, because you get to see the candidate in a video response anyway.")
  - Psychometric: numHumans, testTakerPhoto, forceDesktop, audio, tabSwitch, captureSwitchedTab, photosAtRandom, forceFullScreen, preventMultipleMonitors OFF (tabSwitch is locked off in UI).
  - Excel: recordSession OFF.
  - AI One-way interview: audio, forceDesktop OFF.
  - AI Conversational interview: audio, numHumans, photosAtRandom, forceDesktop OFF.
  - CEFR-tagged tests: audio OFF (spoken answers would trigger it).
- Equip-content tests: proctoring defaults CANNOT be modified. Custom tests: fully configurable. (Crisp "Disabling Camera and Mic Tracking".)

## anti-cheating-settings (separate from proctoring)
- Four settings: **Randomize the question order** (all-at-once quizzes randomize order; question-bank quizzes are inherently random; also available for Programming and SQL tests), **Shuffle choices within a question** (MCQ/MCA options shuffled per candidate), **Disable Copy & Paste**, **Auto-submit on Tab-switch** (test auto-submits after more than n tab switches; n configurable — exact field/limits UNVERIFIED).
- Equip-content defaults (locked, not changeable): Quiz = Randomize Yes / Shuffle Yes / Copy-Paste disabled Yes / Auto-submit No. Programming = Randomize Yes / Copy-Paste Yes / Auto-submit No. CSS = Copy-Paste Yes only. SQL = Randomize Yes / Copy-Paste Yes. Video Response = all No. (N/A where a test has one question or no choices.)
- Custom-content tests: all four configurable per test.
- Related quiz settings enum in code: `randomiseQuestions`, `randomizeOptions`, `disableCopyPaste`, `autoSubmit`, `showScreenByScreen`, `quizDisplayMode`, `gradeReleaseMethod`, `parseLatex`, `timerSettings`.
- Negative marking: always on for Equip library quiz MCQs (question points ÷ number of options); optional for custom content.
- Question protection: recruiters never see actual Equip quiz questions (only sample questions) — protects the question bank.

## disable-camera-mic
- If using Equip's content: camera/mic tracking CANNOT be disabled. Content type determines modifiability: Equip's = No, Custom = Yes.
- For custom tests: turn off **Detect Audio**, **Detect Face**, **Take Random Photos**, **Capture Photo Before Start Test** (camera/mic-related toggles) via Test Order -> Edit Settings.
- Psychometric and video-response test types already default most camera/mic tracking off (see defaults above).

## session-recording
- Setting: **Record User Session** — records screen and interactions (mouse clicks, keyboard typing) for playback. Off by default only for Excel tests and video-response/conversational-AI test types.
- Viewing: candidate's score -> report -> **Proctoring** tab -> Play. Controls include faster playback speed and skipping inactive sections.
- Use with Trust Score: low score -> watch the recording to verify.
- llms states session recordings mask question content; Crisp states recruiters can see the questions in the recording. CONFLICT — verify before publishing.

## ai-usage-detection (ChatGPT etc.)
- Layered approach: copy-paste disabled -> screenshots of question hard to move; opening ChatGPT in another tab breaks full screen + triggers tab-switch capture; Cluely/InterviewCoder-style overlay tools and AI-on-a-second-phone are caught only by **Auxiliary Device** proctoring (recommended).
- Auxiliary Device flow (candidate): open test link on computer (phone-only users told to switch to computer) -> QR code shown -> scan with phone to pair -> record a scan of surroundings (video uploaded for recruiter review) -> position phone so camera shows the keyboard -> screenshot of phone feed captured every few seconds -> normal laptop proctoring continues in parallel.
- Recruiter sees: regular proctoring report + surroundings video + keyboard screenshots.
- Enable: Test Order tab -> **Aux Device** option -> Update.
- No extra cost ("completely free, just disabled by default"). Candidates cannot skip pairing — questions won't load without it. On supported phone browsers Equip keeps the phone awake; if it locks, the candidate is warned on the computer.

## trust-score
- Every completed attempt gets a Trust Score, 0–100%, shown at the top of the candidate report; summarizes reliability/authenticity of the session (how likely the candidate did NOT cheat).
- Stored as a fraction (0–1) on the test attempt; displayed as `round(score × 100)`; per-test trust scores appear in results exports.
- Suggested workflow (Crisp): if score below ~80%, review the full proctoring report (violations + evidence).
- Exact computation formula: not in Equip codebase (computed by AutoProctor) — UNVERIFIED beyond the above.

## id-verification
- **ID Card Verification**: candidate photographs a government/institution ID at test start; Equip matches face and name against the test-taker. Paid add-on (llms).
- **Impersonation Detection**: AI flags if a different person appears on camera mid-session (i.e., two people attempt the same test). Paid add-on (llms).
- Public self-serve demo exists (demo route `/id-card-multi-session-impersonation/`); no login needed for proctoring demos.
- How a recruiter enables these in the dashboard: not found in recruiter UI code — UNVERIFIED (likely via Equip support; do not state a mechanism).

## candidate-issues (troubleshooting)
- Two stages of failure:
  1. **Cannot start the test** (never saw a question): almost always device/internet-side. Steps: verify proctoring works (public proctoring test link), check webcam/mic, try incognito, try another browser (Chrome recommended; then Safari/Edge; Firefox last), try another device. The demo test automatically checks the specific test type works.
  2. **Issue during the test** (questions loaded): proctoring started, so the Session Recording shows exactly what the candidate saw — use it to verify claims (e.g., couldn't see a question, couldn't select an option).
- Reporting to Equip: pre-start issues — candidate installs the **Jam** Chrome extension (Chrome/Edge only), records the tab while reproducing, emails the jam.dev URL to hello@equip.co (cc the recruiter) with the page URL. Mid-test issues — recruiter emails hello@equip.co the Session Recording URL + the time range of the issue (e.g., "1:05 to 1:20").
- A candidate who hasn't seen questions yet can click the same link any number of times (until expiry).

## candidate-says-submitted (but no result visible)
- tl;dr: they likely finished only the **demo test**, or didn't finish **all tests** in the assessment.
- Ask the candidate to click the assessment link again and record what they see: "Assessment Completed" screen = they truly finished (then send Equip their email ID + assessment number + the video); "Continue with the Assessment" = they hadn't finished and can now complete it.
- Unfinished attempts: the Results page shows a callout for Unfinished attempts; change filters to include them.
- The finish screen explicitly says the candidate may close the tab — a screenshot of it is proof of completion.
- Re-inviting is safe: finished candidates just see the completed screen; unfinished ones resume via their original link. The new invite's credit is reclaimable since the new link goes unused. Check deductions on the Credit Usage page.
- Escalation: share candidate email ID + assessment number with Equip via chat or hello@equip.co.

## Misc verified numbers (cross-topic)
- 1 credit = $1 / ₹90 (₹95 from Aug 1, 2026). Assessment: 1 credit per candidate per test (default scheme; first credit at email-invite time). One-way AI interview 1 credit; Conversational Quick 2 / Comprehensive 3.
- Reclaim conditions: invitation sent >24 hours ago AND candidate has not started the first test. Reclaiming revokes the link and deletes the candidate's test data.
- Balance floor −25; results hidden below 0; attempts blocked below −25; open invitations capped at balance + 25.
- Login link/code expiry 30 minutes; code length 6 digits.
- Email invite recipient cap 100 per send; link expiry 1–365 days (default: never).
- Redirect-after-completion delay: 5 seconds.
- Demo test length: about one minute.
