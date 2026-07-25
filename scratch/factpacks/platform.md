# Fact Pack: Platform (for article: what-is-equip)

Sources: [code] = /Users/jayanth/PycharmProjects/equip codebase, [snap] = scratch/llms-snapshot.txt (2026-07-22), [crisp] = legacy helpdesk articles.

## What Equip Is

- Equip (https://equip.co) is a self-serve hiring platform: recruiters shortlist candidates; candidates demonstrate skills. [snap]
- Positioning for docs: three pillars — **ATS** (includes Resume Screening), **Assessments**, **AI Interviews**. [hierarchy.md]
  - The llms-snapshot describes the same product as four modules (ATS, Assessments, AI Interviews, AI Resume Screening); in the help-center hierarchy, Resume Screening lives inside the ATS pillar. [snap, hierarchy.md]
- Modules can be used individually or together. [snap]
- Pricing model: pay-per-use with credits. No subscriptions, no per-recruiter seat fees, credits never expire. [snap]

## The Three Pillars (one-line facts each)

### ATS & Candidate Pipeline
- AI-native applicant tracking system, free with no time limit ("free forever"). [snap]
- Job openings with a candidate-facing job post, application form, and configurable pipeline (11 stage types: Applied, Phone Screening, Assessment, One-Way AI Interview, Conversational AI Interview, Video Interview, Custom, Offered, Hired, Rejected, Withdrawn). [snap]
- Includes Resume Screening: AI CV parsing, bulk CV import (up to 100 CVs, PDF, 10 MB each), and a 0–100 AI Job Fit Score per applicant. [snap]
- Auto-generated public careers page; hiring analytics (ATS Insights). [snap]

### Assessments
- Multi-test skill assessments taken online with AI proctoring (powered by AutoProctor). [snap]
- 9 test types: Quizzes, Programming, Communication (CEFR), Psychometric, Video Response, Typing Test, SQL, Excel, CSS. [snap]
- Every test type offers **Equip Content** (pre-built library) and **My Content** (recruiter-authored custom tests). [snap]
- Free unlimited previews before inviting anyone. [snap]
- Each completed attempt gets a 0–100% Trust Score. [snap]

### AI Interviews
- Two families: **One-way** (pre-set questions; video/audio/text answers; AI-graded) and **Conversational** (real-time voice AI that adapts its questions and asks follow-ups). [snap]
- Conversational formats: **Quick** (~15 min, 3–5 topics, 5–10 questions) and **Comprehensive** (~30 min, 5–10 topics, 10–25 questions). [snap]
- AI-generated report per candidate: recommendation, strengths, areas for improvement, per-topic scores, full transcript, session recording. [snap]

## Free vs Credit-Based

Free (no credits ever):
- The entire ATS: job posts, application forms, pipeline, candidate management, emails, scorecards, analytics, careers page. [snap]
- Unlimited recruiter/team-member accounts. [snap]
- Creating assessments and AI interviews (unlimited). [crisp: demo-or-trial-account]
- Previewing assessments/tests (unlimited; library quizzes preview with sample questions). [snap, crisp]

Credit-based (1 credit = $1 USD or ₹90 INR; ₹95 from August 1, 2026; currency set by the team's country): [snap; code: DOLLAR_TO_INR_CONVERSION_RATE = 90]
- Assessment: 1 credit per candidate per test (3-test assessment = 3 credits/candidate), deducted as the candidate starts each test. [snap]
- One-way AI interview: 1 credit per candidate submission. [snap]
- Conversational AI interview: 2 credits (Quick) or 3 credits (Comprehensive). [snap]
- Bulk CV import: 0.01 credits per CV. [snap]
- Application re-ranking: 0.5 credits. [snap]
- Paid proctoring add-ons: ID Card Verification, Impersonation Detection. [snap; per-unit cost UNVERIFIED]

Free trial credits:
- New teams get 10 free credits on signup ($10 worth) — "assess 10 candidates for free". [code: NUM_TRIAL_CREDITS = 10; snap; crisp]
- No separate demo/trial account exists; the real account is the trial (archive test assessments when done). [crisp: demo-or-trial-account]
- Interactive demos without an account: sample recruiter dashboard at equip.co/demo/recruiter/home/ and test-types demo at equip.co/demo/test-types/. [snap]

Purchases (context, detail belongs to billing pack):
- Minimum purchase $10/₹900; up to 5,000 credits per transaction; 18% GST in India. [snap]
- Volume discounts: 5% at 500+, 10% at 1,000+, 15% at 2,000+ credits. [snap]
- First-purchase discount: 50% off within 7 days of signup, 25% within 21 days (capped at ₹5,000 / $60). [snap]
- Balance can go up to 25 credits negative (below 0: results hidden; below −25: candidates cannot start attempts). [snap; code: MAX_NEGATIVE_BALANCE_ALLOWED = -25]
- Low-balance email alerts fire at 20 and 5 credits remaining. [code: TOPUP_TRIGGER_VALS = [20, 5]]
- Credits never expire. [snap]

## Signup & Login Rules

- Self-serve signup at equip.co/account/recruiter-onboarding/. [snap]
- Work email required for recruiters: public/personal email domains (Gmail etc.) are rejected with the error "Please enter your business email". [code: is_business_email(), PUBLIC_EMAIL_DOMAINS list]
- UI labels: "Sign in as a recruiter with your work email." / button "Sign In with Work Email". [code: recruiter-login.html]
- One team per email domain: if a team with your domain already exists, signup is blocked with "A team with domain {domain} already exists. We have sent you an email with the team admin's email address. You may ask them to invite you to join the team." [code: check_team_with_domain_exists()]
- Joining an existing team: via invite email or a team join code. Join links have the form equip.co/j/<join_code>; the code is a 5-character alphanumeric string. [code: Team.join_code, generate_random_string_code(5); route /j/<join_code>/]
- Member invitations are restricted to the team's email domain. [snap]
- Login is passwordless: a 6-digit login code emailed to the recruiter (email subject: "{code} is your Equip Login Code"); the code expires after 30 minutes. [code: generate_login_otp(), UserOTP expires_at default +30 min]
- Candidates sign in via magic link or 6-digit email code (30-minute expiry); Google sign-in available for candidates. No candidate account setup beyond email verification. [snap]
- Team roles: exactly one **Team Admin** (invites/removes members, can transfer admin) and **Members** (full recruiter access). Unlimited members at no cost. [snap]
- Account creation takes ~42 seconds on average (marketing claim). [crisp: demo-or-trial-account]

## Support Channels

- Primary: live chat (Crisp widget on equip.co and help.equip.co) — responses "in minutes"; chat has automatic translation and agents across timezones; agents can see which page you are on. [crisp: phone-support]
- Email: hello@equip.co for both recruiters and candidates; 24-hour turnaround. [crisp: phone-support]
- Phone support: not offered by default. Eligible if (a) you paid Equip more than $5,000 in the last 365 days (automatic; share your number on chat), or (b) you buy the Phone Support Add-on, which raises every credit's price by 50% (e.g. $1 → $1.50) — enable by emailing hello@equip.co. [crisp: phone-support]
- Demo walkthrough with the team: equip.co/schedule-demo/. [snap]
- Help center: help.equip.co. [crisp]

## Browser & Device Requirements

- Google Chrome is recommended to candidates. [snap]
- Switched-tab screenshots and multiple-monitor detection require Chromium-based browsers. [snap]
- Video interviews on iOS require Safari. [snap]
- Mobile-friendly test types: quizzes, psychometric, CEFR communication, video response. Desktop-only: programming, SQL, CSS, Excel, typing (flagged with a "Desktop Only" badge). [snap]
- Recruiters can force desktop via the "Enforce Desktop" proctoring option. [snap]
- Camera/microphone are verified in a pre-test equipment check; proctoring evidence survives connectivity loss (captured offline, synced later). [snap]

## Misc Platform Facts

- Candidate results are recruiter-gated: candidates do not see scores, certificates, or badges. [snap]
- Assessments are archived, never deleted; archived assessments retain all results and can be un-archived. [snap]
- Referral program: rewards for referring other companies. [snap; code: REFERRAL_REV_SHARE_PERCENTAGE = 10, REFERRAL_REWARD_AMOUNT = 200 — public-facing reward terms UNVERIFIED]
- Organization settings include brand name (shown to candidates), legal entity name (on invoices), timezone, and logo. [snap]
