# Fact Pack: Billing & Account

Sources: [code] = /Users/jayanth/PycharmProjects/equip codebase, [crisp] = existing helpdesk HTML, [llms] = scratch/llms-snapshot.txt.
Credits are stored internally scaled x1000 (`NUM_CREDITS_SCALING_FACTOR = 1000`); all user-facing numbers below are in whole credits. [code]

## how-credits-work

- Each team has one shared credit balance. All members see the same balance. [crisp]
- New teams get 10 free trial credits on signup (`NUM_TRIAL_CREDITS = 10`). [code][crisp] (llms phrases this as "$10 worth".)
- 1 credit = $1 (USD) or ₹90 (INR); `DOLLAR_TO_INR_CONVERSION_RATE = 90`. Currency determined by team's country (`country_code`, 'IN' vs everything else billed in USD). [code]
  - UNVERIFIED (llms only, not in code): ₹95 per credit from August 1, 2026.
- Credits never expire. No subscriptions, no per-seat fees; the ATS is free. [llms][crisp]
- Credit costs per action ([code] app/helpers/credit_deduction.py + generated ai_interview_constants):
  - Assessment: 1 credit per candidate per test (`ASSESSMENT: 1`, pricing scheme `one_per_test`).
  - One-way AI interview: 1 credit per candidate.
  - Conversational AI interview: `QUICK` ("Quick Interview") = 2 credits; `COMPREHENSIVE` ("Comprehensive Interview") = 3 credits.
  - Job Fit Score re-ranking: 0.5 credits per candidate.
  - Bulk CV import: 0.01 credits per CV.
- Sidebar shows pricing badges: "Free!" on Job Openings/Resume Screening; "$1/test" or "₹90/test" on Assessments; "$1/candidate" or "₹90/candidate" on AI Interviews. [code react Sidebar.tsx]
- Buying credits (page title/h1: "Purchase Credits", route /topup-credits/):
  - Input labeled with placeholder "Enter number of credits" (field `num-credits`). UI clamps input to 1–5,000; validation error: "Cannot purchase more than 5000 credits at once". [code TopupCredits.tsx]
  - Backend validation: minimum 10 credits ("Minimum number of credits needed is 10"), maximum 10,000 ("Maximum number of credits needed is 10000"). Effective self-serve max is 5,000 (UI). [code recruiter/ajax.py]
  - Page shows cost without discount, cost with discount, and net cost; applicable discount auto-applied. [code]
  - India (INR): optional GSTIN field (placeholder "Ex. 29WMJHP9310B4Z5"). Validation: exactly 15 characters ("GSTIN must be exactly 15 characters long."), format regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` ("Invalid GSTIN format. Ensure it follows the correct structure."). [code]
  - India: 18% GST added on the discounted cost (net = discounted x 1.18). [code]
  - India payment flow: Stripe invoice is created, payment collected via Razorpay payment link — UPI, NEFT, credit/debit cards. [code][crisp]
  - Other countries: Stripe Checkout, card payments (Visa, Mastercard, American Express; bank transfers available for some countries). [code][crisp]
  - Balance updates automatically after purchase; invoice emailed to the team admin. [crisp]
- Volume discounts (auto-applied): 5% at >= 500 credits, 10% at >= 1,000, 15% at >= 2,000. [code get_volume_discount_percentage, mirrored in TopupCredits.tsx]
- Only one discount applies per purchase: the one with the larger monetary value (first-purchase discount wins ties). [code]
- Negative balance rules (`MAX_NEGATIVE_BALANCE_ALLOWED = -25`) [code][crisp]:
  - Balance < 0: team cannot see any candidate results.
  - Balance < -25: candidates can no longer attempt assessments.
  - Max candidates invitable at any point = current credits + 25.
- Low-balance email alerts to the team admin when the balance crosses down through 20 and through 5 (`TOPUP_TRIGGER_VALS = [20, 5]`). Email warns of the 0 and -25 thresholds. [code]
- Credit Usage ledger (sidebar: Account > "Credit Usage", route /credit-usage/) [code CreditUsage.tsx]:
  - Table columns: "Date", "Transaction Type", "Credits", "Balance". Empty state: "No credit transactions to view".
  - Transaction types include "Credit Purchase" and "Credit Reclaim"; deductions read e.g. "<email> was invited to #<job number> <job title> Assessment" or "<email> started #<job number> <job title> Assessment"; bulk: "<email> and N other candidates were invited to ...". [code credit_deduction.py]
  - CSV export (filename "Credit Usage") columns: "Date & Time", "Transaction Type", "Change in Credits" (signed, e.g. +10), "New Balance".
- Referral program: each team has a referral code; first referral gift ₹200 (`REFERRAL_REWARD_AMOUNT = 200`) plus 10% of the referred team's purchases for one year (`REFERRAL_REV_SHARE_PERCENTAGE = 10`). Team page has a "Referrals" section with "Code:" and a "Referred Teams" table (columns: Team Name, Email Domain, Joined, Status; empty state "No referrals yet — share your code to get started"). [code]

## credit-deduction-policy

- Policy: 1 credit per test in the assessment, per candidate. To count tests: assessment Settings link > Test Order tab. [crisp]
- Timing [crisp, consistent with ledger reasons in code]:
  - 1st credit deducted when the candidate is invited (immediately on send — even if the email bounces or is never opened).
  - When the candidate starts Test #2, the 2nd credit is deducted; Test #3 → 3rd credit; and so on. "Start" = the questions load for the candidate.
  - If the candidate never starts Test #1, the invitation credit can be reclaimed. Net effect: you pay 1 credit per test the candidate actually starts.
- Worked example [crisp]: 2-test assessment, 10 candidates invited; 2 never start, 3 finish only Test 1, 5 finish both → 15 credits charged (10 invites + 5 Test-2 starts), 2 reclaimable.
- Inviting the same candidate twice: Equip warns first; proceeding deducts 2 credits total; the unused invitation's credit can be reclaimed 24 hours after it was sent. [crisp]
- One question per test for Programming and SQL tests; Quiz max 25 questions (Equip content) / 100 (custom content) — why tests can't be merged to game per-test pricing. [crisp]
- Rationale for deduct-on-invite (abuse incident with 50,000 spam invitations) is documented in the crisp article and can be referenced. [crisp]

## reclaim-credits

- Page: sidebar Account > "Reclaim Credits" (route /reclaim-credits/). H1 "Reclaim Credits"; subtitle: "Invitations sent more than 24 hours ago where the candidate hasn't started the test or ..." [code ReclaimCredits.tsx]
- Eligibility (both required) [code communication.py `can_reclaim_credit`]:
  - `credit_reclaim_status` is `can_reclaim` (i.e., candidate has not started the first test; statuses are enum `can_reclaim` / `cannot_reclaim`).
  - Invitation was sent more than 24 hours ago.
- Table columns: "Select" (checkbox), "Email ID", "Reason" (purpose), "Job Opening", "Sent", "Reclaim Credit" (per-row button). Bulk reclaim button; selecting none shows "Please select at least one invitation to reclaim." [code]
- Confirm dialog — title "Confirm Reclaim", body: "By reclaiming the credit, you are making this candidate's invitation link invalid. They won't be able to attempt the test or interview. Are you sure you want to proceed?" Buttons: "Yes, reclaim" / "Cancel". [code]
- Effects of reclaiming [code + crisp]: the candidate's invitation link is revoked (becomes invalid); all test data associated with the candidate (e.g., points) is deleted; the candidate must be re-invited. Balance increases by reclaimed amount; ledger records a "Credit Reclaim".
- API: POST /api/v3/email-status/actions/reclaim/ with email-status IDs; response reports credits reclaimed and failures ("N credits could not be reclaimed"). [code]
- Applies to assessment and AI-interview invitations (page copy mentions "test or interview"). [code]

## first-purchase-discount

- 50% off the first purchase if made within 7 days of team creation; otherwise 25% off if made within 21 days of creation (i.e., a 2-week second window after the first expires). [code TopupCredits.tsx `canAvailFirstPurchaseDiscount`][crisp]
- Discount cap: ₹5,000 (India) / $60 (elsewhere). [code functions.py + TopupCredits.tsx][crisp]
- Only for teams that have never purchased (`isCustomer` false). One use only; the two offers cannot be combined. [code][crisp]
- Auto-applied at checkout via coupon codes named FIRSTPURCHASE50 / FIRSTPURCHASE25 (crisp); implemented as Stripe percent coupons, switching to fixed-amount coupons above the cap (IN: > 111 credits for 50%, > 222 for 25%; US: > 120 / > 240). [code]
- Compared against volume discount; the larger monetary discount is applied (first-purchase wins ties). UI flags when a volume discount overrides the first-purchase discount. [code]
- Eligibility indicator: countdown timer in the dashboard navbar; no timer = not eligible. [crisp]
- Reminder emails: "Your first purchase discount of 50% ends in 3 days!" and "Your discount of 25% on the first purchase ends in 5 days." [code email_literals.py]
- Minimum purchase ($10 / 10 credits) still applies. [crisp][code]
- Anti-abuse: discount is for genuinely new companies; duplicate accounts/domains/related entities have discounted credits retroactively revoked; Equip team's decision is final. [crisp]

## tds-for-purchases

- India only. TDS applies when payments exceed ₹1,00,000 total in a tax year or ₹30,000 in a single transaction. [crisp]
- TDS cannot be deducted on the website's payment gateway. For such transactions, email hello@equip.co with the number of credits; Equip shares an invoice with bank transfer details; credits added once payment is received. [crisp]
- Alternative (pay-then-refund) flow [crisp]: e.g., ₹10,000 purchase, TDS 10% = ₹1,000 → pay ₹10,000 in full on Equip → remit ₹1,000 as TDS on the government portal → share Form 16A via hello@equip.co → Equip refunds ₹1,000 or issues equivalent credits.

## invoices

- After successful payment, the invoice is automatically generated and emailed to the person who created the account (team admin). [crisp]
- All team members can self-serve: Dashboard > Purchase Credits > "Go to Billing" button > 'Invoice History' > click the date > view/download the Invoice and Receipt. [crisp]
- "Go to Billing" opens the Stripe billing portal (billing-portal session created against the team's Stripe customer). [code api_v3 users/service.py]
- Invoice is billed to the team's Legal Entity Name (Team page > Organization > "Legal Entity Name" — helper text "Appears on your invoice"); update it before paying. [code Team.tsx][crisp]
- Indian customers paying in INR: GST number appears on the invoice if entered before purchasing. [crisp]

## change-billing-information

- Business details (company name, address, tax info) are collected by the payment gateway on first purchase. [crisp]
- To update for future invoices: Buy Credits button > "Go to Billing" > "Update Information" > edit the form. [crisp]
- Already-issued (finalized) invoices cannot be edited in-product; email hello@equip.co to have the invoice manually re-issued using the updated Billing Portal details. [crisp]

## demo-or-trial-account

- No separate demo account. Create a real account with a work email; assess up to 10 candidates free with the 10 signup credits, then buy credits. [crisp][code]
- Free without credits: create unlimited assessments, invite unlimited teammates, preview unlimited tests with sample content. [crisp]
- To "convert" a trial: just archive experimental assessments — same account continues. One account per team. [crisp]
- Without an account: Sample Recruiter Dashboard at https://equip.co/demo/recruiter/home/ (sample data: assessments, settings, results, proctoring) and an interactive demo / Test Types demo at https://equip.co/demo/test-types/. [crisp][llms]
- Crisp claims signup takes ~42 seconds on average (marketing copy).
- Personal-domain emails (gmail.com, outlook.com, etc.) cannot create recruiter accounts. [crisp how-equip-protects][llms]

## manage-team-members

- Roles: exactly one Team Admin per team; everyone else is a Member. All members see the same data and have the same privileges; admin-only actions are removing members and transferring admin. [crisp][code]
- Adding members (Team page, sidebar Account > "Team"): Members section > "Invite members" button > enter email IDs (placeholder "Enter email addresses", comma-separated, section "Emails to invite") > invitees get an email with a join link; or copy the invite link ("Copy Link") and share manually. [crisp][code _InviteMembers.tsx]
- Unlimited members at no cost. [crisp][llms]
- Member invitations are restricted to the team's email domain; one team per email domain (a second signup from the same domain is told the team exists and who the admin is). [llms][code TEAM_ALREADY_EXISTS_EMAIL]
- Pending invites: "Pending Invites" section on the Team page; "Remove invite" action with confirm dialog "Remove Pending Invite?" (Remove / Cancel). [code Team.tsx]
- Changing admin: only the current admin; three-dots menu next to the member > "Make Admin". Success toast: "Admin Changed!" / "Recruiter <name> is now the new Team Admin". Backend errors: "Only the current team admin can change the admin". [code][crisp]
- Removing members: only the admin; three-dots menu > "Remove" (dialog "Remove Team Member"; toast "Team member removed successfully"). The admin cannot be removed ("Admin of the team cannot be removed from the team") — transfer admin first. [code][crisp]
- Admin badge "Team Admin" is shown next to the admin in the member list. [code]
- Optional reporting structure: members can have a manager ("Manager: <name>" shown in the list); used by analytics. [code Team.tsx][llms]
- Login is passwordless: 6-digit email code, expires in 30 minutes. [code email_literals + functions.py]

## organization-settings

- Location: Team page, "Organization" section (shows "You've been with us since <date>"). Fields [code Team.tsx]:
  - "Brand Name" — required, max 80 chars; helper "Shown to candidates on instructions, emails". Error: "Brand name is required".
  - "Legal Entity Name" — required, max 100 chars; helper "Appears on your invoice". Error: "Legal name is required".
  - "Size" — required select; options: "1 - 10", "11 - 50", "51 - 200", "201 - 1000", "1000+".
  - "Timezone" — required select, "(for email invitations)"; options are IANA timezones with UTC offsets. Default Asia/Kolkata. [code team model]
  - "Default Dashboard" — helper "The dashboard you are taken to after signing in"; options: "Job Openings", "Assessments", "AI Interviews".
  - "Organization Logo" — helper "Will be shown to candidates who apply"; max file size 500 KB; accepted: JPEG, PNG, WebP, SVG.
- Fields save automatically (on blur / on change); no explicit Save button. [code]
- Profile page (Account > "Profile"): first name, last name, phone number, profile photo; email is fixed — "(Not editable)". [code Profile.tsx][llms]
- Sidebar Account section entries: Profile, Team, Careers Page, Templates, Credit Usage, Reclaim Credits, Logout; described as "Team, credits, and integrations". [code Sidebar.tsx]

## api-integrations

- REST APIs let you invite candidates and pull results without using the Equip UI; candidates still attempt on Equip. No direct access to question content. [crisp]
- Pricing: one-time setup fee of $500 (converted to 500 credits) plus a minimum monthly purchase of 500 credits. Credits are normal, never-expiring Equip credits usable for regular usage. [crisp]
- Getting started: create a team > trial with free credits > purchase $500 worth of credits (note: with a 25% first-purchase discount you'd need 667 credits to reach $500 paid) > email/chat to get the API Key > keep purchasing >= 500 credits/month. [crisp]
- A public Postman collection of the APIs exists; an API key is required to call them. [crisp]
- Each team has an `api_key` (15-character string) stored on the Team record; issued by the Equip team on request (no self-serve UI found). [code team model]

## lever-integration

- Purpose: moving a Lever candidate into an "Equip Assessment" stage auto-emails them the mapped Equip assessment; results are written back to the Lever opportunity as a note. [crisp]
- Requirements: Lever access role Super Admin to set up; available to Equip customers on the Premium Plan. [crisp]
- Enable: Equip recruiter dashboard > "Integrations" link in sidebar > Lever card > "Configure" > review permissions > "Accept". [crisp]
- Configure: in Lever, Settings > Integrations & API > Webhooks > enable the CANDIDATE STAGE CHANGE webhook; create a pipeline stage named "Equip Assessment". [crisp]
- Map: on the Equip mapping page, select a Lever job posting + an Equip assessment > "Map" button; a tag with the Equip assessment's ID is created on the job posting. [crisp]
- Use: in Lever, open the candidate ("Candidates" tab), assign a job if needed ("Choose Job"), move them to the Equip Assessment stage → invitation email sent automatically. [crisp]
- If the Lever candidate has no email ID, Equip emails the recruiter ("Email ID missing on Lever"). [code team.py]
- Results: Equip adds a note with a score summary + link to the detailed Equip report, and sets a Lever Score [crisp; thresholds confirmed in code assessment_transactions.py]:
  - 0–34% → 1 (Strong No Hire); 35–49% → 2 (No Hire); 50–74% → 3 (Hire); 75–100% → 4 (Strong Hire).
- Disable: Lever > Integrations & API Settings > Authorized Apps tab > locate Equip > "Revoke Access". [crisp]

## webhooks

- Team-level `webhook_url` (max 500 chars) on the Team record. If set, Equip POSTs JSON events; if unset, nothing is sent. [code team model + ext/webhooks.py]
- Events [code]:
  - `assessment.completed` — fired once when all tests in a candidate's assessment attempt are graded (grade finalized).
  - `ai_interview.completed` — fired once when an AI interview attempt is fully graded.
- Envelope: `{"event": <type>, "timestamp": <UTC ISO-8601>, "data": {...}}`. Delivery: fire-and-forget background POST, 10-second timeout, no retries, deduplicated per attempt. [code]
- `assessment.completed` data fields: job_opening_label, job_title, candidate_email, candidate_name, assessment_label, assessment_report_url, overall_score_percentage, started_at, finished_at, hiring_status, tests[] (each: test_title, test_report_url, points_scored, points_available, percentage_scored). [code]
- `ai_interview.completed` data fields: job_opening_label, job_title, candidate_email, candidate_name, ai_interview_label, ai_interview_report_url, overall_score_percentage, started_at, finished_at. [code]
- UNVERIFIED: no self-serve UI found for setting webhook_url (likely configured via Equip support/API).
- Related no-code option — Write Results to Google Sheets [crisp]: assessment Settings > Miscellaneous > "Write results to Google Sheets"; create a Google Spreadsheet, grant Editor permission to hello@equip.co, paste the URL, click Create/Update. Equip auto-creates one sheet per test plus an overall sheet. Assessment sheet columns: Email, Name, Overall Score, Start Date, Start Time, End Date, End Time. Test sheet columns: Email, Name, Points Scored, Percentage Scored, Trust Score, Start Date, Start Time, End Date, End Time. Only candidates attempting after setup appear; do not rename Equip-created sheets or columns.

## faqs (billing-related, sourced)

- "What if the email bounces?" — credit is still deducted at send; reclaim after 24 hours. [crisp]
- "Invited the same candidate twice?" — 2 credits deducted; warned beforehand; reclaim the unused one after 24 hours. [crisp]
- "Max candidates I can invite?" — current credits + 25 (negative-balance floor of -25). [crisp][code]
- "Can a candidate continue after I reclaim?" — no; link is invalidated and their test data deleted; re-invite required. [crisp]
- "Can I combine a Quiz and a Programming Question into one test?" — no (per-test pricing). [crisp]
- "Is there a minimum purchase?" — 10 credits ($10 / ₹900). [code][crisp]

## contact-support

- Channels: live chat (in-product) and email hello@equip.co, for both recruiters and candidates. Chat responses in minutes; email turnaround 24 hours. Chat supports automatic translation and agents across timezones. [crisp phone-support]
- No phone support by default. Automatically entitled to phone support if you've paid more than $5,000 in the last 365 days (share your number on chat). [crisp]
- Phone Support Add-on: no upfront cost, but every credit costs 50% more for a year (e.g., $1 → $1.50). Enable by emailing hello@equip.co with subject "Phone Support Add-on" from the registered email. [crisp]
- Weekly webinars/office hours: 30-minute product demo + 30 minutes of Q&A; signup link on the helpdesk article. [crisp]

## custom-slas

- Equip is fully self-serve; all customers are covered by the standard Terms of Service, Privacy Policy, and public Pricing. Credit-based, pay-as-you-go; no subscription. [crisp]
- For annual contract value (ACV) under $25,000: Equip does NOT sign custom MSAs/SLAs/DPAs, modify legal terms (governing law, indemnity, confidentiality), or complete bespoke security questionnaires. [crisp]
- ACV >= $25,000: custom paperwork (limited redlines, vendor forms, tailored SLAs) considered subject to review — share requirements and timeline with the team. [crisp]

## security-privacy

- Account access: work-email-only recruiter signup; passwordless 6-digit login codes expiring in 30 minutes. [code][crisp]
- Question protection [crisp how-equip-protects-its-questions]:
  - Real questions require a recruiter account or a specific candidate invitation; sample content only is public; search engines cannot index questions.
  - Quiz questions are hidden even from recruiters (during creation and in candidate reports) and are picked/shown randomly per candidate.
  - Coding questions are recruiter-visible (large pool mitigates leakage); questions are tracked and retired ("refreshed") when overexposed.
  - Suspicious recruiter accounts are blocked.
- Candidate privacy: candidates see active proctoring measures before starting and consent to the proctoring report being shared with the recruiter; session recordings mask question content. [llms]
- Candidate data deletion: a product-level candidate-deletion action removes a candidate's attempts, applications, email records, and PII for candidate-role accounts (recruiter/admin accounts on the same email untouched); deletions propagate to the attempt-content subsystem. [code api_v3 users/_candidate_deletion_action.py]
- UNVERIFIED (do not claim without checking): specific compliance certifications (SOC 2, ISO 27001, GDPR DPA terms), data-retention windows, hosting locations.
