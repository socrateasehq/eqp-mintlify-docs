---
name: condense-article
description: Make a helpdesk article shorter by cutting text, tables and screenshots that do not help the reader find the feature and try it. Use when asked to condense, shorten, trim, tighten or "make concise" an article, or when an article feels exhaustive. Reports every cut with the rule that triggered it.
---

# Condense a helpdesk article

Equip is self-serve. These articles get sent to users who email "how do I do X" or "Y is broken", and users also find them by search. The job of an article is to **convince the reader that a way exists and get them to go try it**. It is not a manual for every step. Once the reader is on the right screen, the screen explains itself.

Long articles defeat this. If the page looks like work, the reader closes it and emails support again.

## The governing test

Apply this to every sentence, table, callout and image:

> Does this help the reader believe the feature exists, or find the screen where it lives? If not, cut it.

What passes: the step titles, the links, one screenshot per screen the reader must recognise, warnings about things that break, and the fact that a setting exists.

What fails: explaining how to use a screen the reader can see, describing what a page contains, narrating what happens after a click, listing every branch of a form, and summarising other articles.

There is no fixed length target. Some articles lose half their words, some lose a tenth, and a short article that already passes the test is left alone. Never manufacture cuts to look useful.

## Never cut

- **Links.** Every internal link to another article and every external link to a product page stays. If a sentence is cut, move its link into a sentence that survives.
- **One screenshot per distinct screen.** The reader must be able to match the article to what they see.
- **`<Warning>` callouts** about data loss, lost responses, lost credits or anything that cannot be undone.
- **Step titles.** A reader who only skims the titles should still get the whole path.
- **The one sentence that says a feature exists** and where to find it.

## The cull catalogue

Each rule has a short name, used in the report. Examples are taken from the AutoProctor help center, where this skill was first written; the same patterns apply to Equip articles.

### R1. Orientation chatter

Sentences that tell the reader where they are, what a page shows, or how to get back. Cut entirely.

- Cut: "You can come back to this page at any time by clicking **Home** in the sidebar."
- Cut: "You land on the **Tests** page, which lists all tests you created or collaborate on."
- Cut: "The settings page shows the test title at the top, the test link below it, and a list of sections."
- Cut: "The same address appears in the account menu at the bottom of the sidebar."

### R2. Instructions for self-evident UI

If the screen tells the reader what to do, the article does not repeat it. Name the destination and stop.

| Before | After |
|---|---|
| Go to the [AutoProctor sign-in page](url) and sign in with your **Google** account, **Microsoft** account, or **email address**. | Sign in at [AutoProctor](url). |
| Click a provider to open it, fill in what it asks for, and click the button at the bottom of the card. | Pick a provider and paste your quiz link. |
| Open the **Profile** page. The **Email** field shows the address you are logged in with. | Check the email on your [**Profile**](url) page. |
| Click **Save settings** at the bottom of the page after you change anything. | Click **Save settings**. |

### R3. Enumerating every branch

A table that lists what each option asks for, or a paragraph that covers what happens on each path, is a spec sheet. Collapse to the common pattern plus the one exception that matters.

Before, from Your First Proctored Test:

> | Provider | What it asks for | Button |
> |---|---|---|
> | Socratease Quizzes | Nothing yet. You build the quiz on the next screen | Continue |
> | Google Forms | Google Form URL and Test Title | Create Test |
> | Microsoft Forms | Microsoft Form URL and Test Title | Create Test |
> | Other Quizzing Platforms | Quiz URL and Test Title | Create Test |
>
> For a form or another platform, AutoProctor creates the test and opens its settings page. For Socratease, Continue opens Socratease Quizzes, where you add your questions and then click Save & Proceed to reach the same settings page.

After:

> Pick a provider, paste your quiz link and give the test a title. For [Socratease](/create-socratease-quiz), you build the quiz on the next screen instead.

### R4. Duplicate tables for the same objects

Two tables describing the same set of things from different angles. Keep at most one, and only if the choice between the things is non-obvious. In Your First Proctored Test, the "When to use" provider table repeats the one-line hint printed on each provider card, which is also visible in the screenshot. Cut the table, keep the screenshot.

### R5. Previewing other articles

A step, table or bullet list that summarises what a linked article already covers. Replace the summary with one sentence and the link.

Before:

> | Section | What you set there |
> |---|---|
> | General | Test title, Max attempts per candidate, and whether the test is open |
> | Timer | A duration, a start window, and what happens when time runs out |
> | Proctoring | Camera, microphone, tab-switching detection, and more |
> | Access & login, Before the test, After the test | Login methods, restrictions, instructions ... |

After:

> Open [**Timer**](/timer-settings) and [**Proctoring**](/proctoring-settings) to adjust them, then click **Save settings**. The defaults work for a first test.

Same rule for the "View results" bullet list that explains Trust score, View report and evidence. One sentence plus the link to [Where Can I See My Quiz Results?](/where-to-find-quiz-results).

### R6. Sections that belong to another article

A section that documents a page or concept rather than the task in the title. "The Tests Page" in Your First Proctored Test is two tables and a screenshot describing a page, inside an article about creating a test. The "Timer Settings Reference" table in Timer Settings restates every field already walked through in the steps above it.

Do not delete these silently. What happens next depends on whether the content has another home:

- **Another article already covers it:** remove it from the draft, and make sure a link to that article survives.
- **No other article covers it:** leave it in place.

Either way, list it under **Needs your call** in the report, naming the article that covers it or saying none does.

### R7. Advice that is not a step

Distribution tips, lists of channels, "see best practices" notes, reassurance. Keep a one-line pointer at most.

Before:

> Share the link with candidates via:
> - **Email**, or use [Invite via Email](/invite-candidates-via-email) for direct invitations
> - **Your LMS** or classroom platform
> - **Any messaging tool**, but tell candidates to copy the link and open it in Chrome or Firefox, not the app's built-in browser
>
> `<Note>` See [Best Practices for Test Creators](/best-practices-for-exam-creators) for more on distributing test links. `</Note>`

After:

> Share the link however you reach your candidates, or use [Invite via Email](/invite-candidates-via-email). See [Best Practices](/best-practices-for-exam-creators) for tips.

### R8. Explaining the cause when the reader wants the fix

Troubleshooting articles over-explain why something happens. Keep the cause to one sentence, then the fix.

Before, from Purchased Packs Not Showing Up:

> AutoProctor is a subscription-based product. When your subscription is due for renewal, your card is charged automatically. If the charge fails after multiple attempts, your subscription is cancelled and **your credit balance resets to 0**.

After:

> If a renewal payment fails, the subscription is cancelled and **your credit balance resets to 0**.

### R9. Steps with no screen of their own

A step that is one sentence and does not land the reader on a new screen folds into its neighbour. Fewer steps reads as less work.

- "Test the link yourself" (click Preview) merges into "Share the test link".
- "Find the purchase confirmation email" and "Log in with the correct account" merge into one step: "Sign in with the email that received the receipt."
- "Save" as its own step merges into the step before it.

### R10. Screenshot pruning

One screenshot per distinct screen, never two crops of the same page. Your First Proctored Test shows the settings page twice (full view, then the link bar alone) and the Tests page twice (header, then a single row). Keep the one that shows the most, cut the other.

Tiebreaker for a page with a collapsed and an expanded state, such as a list of cards and one card opened: keep the collapsed view, because it shows every option and the reader meets it first. Two states of one control, such as a switch on and a switch off, count as two screens when each belongs to a different procedure.

A screenshot planning comment (`{/* screenshot: ... */}`) with no image yet stands in for that screenshot: count it as the image for its screen, keep one per distinct screen, and cut duplicates. Also cut screenshot planning comments once the image exists, and `{/* TODO ... */}` comments that have been there more than one release.

### R11. Captions and alt text that re-describe the image

Alt text names the screen in a few words. It is not a transcript of every label visible in the image. Drop the `caption` when the step title already says what the image is.

| Before | After |
|---|---|
| alt="Six tiles, Started 17, Submitted 14, Unsubmitted 3, Ungraded 2, Avg trust score and Avg duration, above the Submissions table. Its columns are Candidate, Started, Submitted, Duration, Trust score and Quiz score, and each submitted row has a View report button" | alt="Test results page with summary tiles and the Submissions table" |

### R12. Bold inflation

One bold per sentence, on the thing the reader clicks or the concept being introduced. A sentence with four bolded button names highlights nothing.

- Before: "Confirm that the **instructions page**, **camera check**, and **proctoring setup** all load correctly."
- After: "Check that it loads the way a candidate would see it."

### R13. Redundant TL;DR

A `<Tip>` at the top that restates the title. Per the style guide, a TL;DR earns its place only when the title asks a question and the answer is worth having before reading. "Create a proctored test, share the link with candidates, and view results, all in under 5 minutes" under the title "Your First Proctored Test" is cut.

### R14. Defaults, edge cases and timezone notes nobody asked about

Notes that pre-empt a question the reader has not asked yet. Keep only if getting it wrong costs the reader something. "If you set a date without a time, midnight is used as the default" stays, because it changes when a test opens. "AutoProctor handles all timezone conversions automatically" goes, because nothing breaks if the reader does not know it.

## Procedure

1. **Read the article** in full. Note the title and ask what the reader came to do.
2. **Inventory every element**: each paragraph, table, callout, image and step. For each, mark keep, cut, merge or move, and the rule (R1 to R14) that applies. Do this before rewriting, so the cuts are deliberate rather than drift.
3. **Rewrite.** Keep the heading structure unless a whole section is moved out. Follow the repo CLAUDE.md as usual: short paragraphs, bold key terms once, no em-dashes or double hyphens, one visual per H2.
4. **Check the never-cut list.** Every link from the original must appear in the new version. Every distinct screen keeps one screenshot.
5. **Write the report** in the final message, in the shape below.

## Report shape

The report is how the author vetoes a cut, so every cut is listed. Keep each line short.

```
## Condensed: <article title>

| | Before | After |
|---|---|---|
| Words | 1638 | 790 |
| Images | 8 | 5 |
| Tables | 6 | 1 |

### Cut
- R1  "You can come back to this page at any time by clicking Home in the sidebar."
- R3  Provider "What it asks for" table, replaced by one sentence
- R10 test-link.png, same screen as test-settings-page.png
- ...

### Merged
- R9  "Test the link yourself" folded into "Share the test link"

### Needs your call
- R6  "The Tests Page" section (2 tables, 1 image). Describes the Tests page, not test creation.
      No existing article covers it. Left in place; delete it or give it a home.
- R6  "Timer Settings Reference" table. Restates the steps above it. Removed from draft.
```

This help center is English only, so there are no translations to update.
