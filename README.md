# Nexi Payment Calculator 5.3.2

Stateless browser calculator for one Nexi offer against one competitor offer. Each side independently supports Split Blend or IC++. DE/FR/EN/IT UI and PDF output are supported.

## Behaviour

- No login, Supabase client, database, analytics, case history or reporting.
- Customer name, optional Salesforce Account/Opportunity references, channel, purpose, industry, competitor and quote date are captured in memory only.
- Customer name, channel, purpose, competitor and valid calculation are required for export. Industry, Salesforce IDs and quote date are optional.
- PDF creation downloads a real PDF and automatically posts exactly those PDF bytes to the mail function. No separate send action or pre-send notice. A delivery error is shown without preventing download.
- JSON export includes schema/calculator version, comparison UUID, timestamp, customer/context fields, volume, transactions, separate transaction mix, assumptions, raw offer values and full annual result breakdowns. Unchanged exports share the timestamp/ID. Map this schema to the existing Salesforce importer; actual Salesforce acceptance has not been tested here.
- Reset clears the page. No localStorage, sessionStorage or IndexedDB is used. Back-forward cache restoration triggers reset.
- Unknown inactive rates remain null in JSON, not zero. PDF denotes these with a dash. IC and mix examples are shown as placeholders only until explicitly entered or loaded.

## Netlify deployment

Connect this repository to Netlify. `netlify.toml` sets build command `npm run build`, publish directory `dist` and function directory `netlify/functions`. Node 22+.

Create these runtime environment variables in the Netlify UI (not in Git):

- `RESEND_API_KEY`: sending-enabled Resend key (secret).
- `MAIL_FROM`: `onboarding@resend.dev` for initial testing.
- `MAIL_TO`: the exact verified Resend account email for testing with the resend.dev sender.

Current test setup agreed with owner: MAIL_TO=france.arena@googlemail.com. Later destination: francesco.arena@nexigroup.com, then a shared mailbox. A resend.dev test sender only sends to the account address. Verify an authorised sender domain before sending to arbitrary recipients. No mail destination is hard-coded; change MAIL_TO then redeploy. No Supabase variables are needed.

Resend endpoint: `/api/send-pdf`. It allows POST multipart uploads only from configured Netlify deployment origins (`URL`, `DEPLOY_PRIME_URL`, `DEPLOY_URL`), limits size, validates PDF signature/hash, and fixes sender/recipient server-side. Netlify rate limiting permits five requests per minute per IP/domain; ensure this rule is active on your plan after deployment. Same-origin checks are browser protection, not authentication. Public URL access is intentional. Apply additional platform controls if needed for business rollout.

Resend idempotency keys derive from comparison ID and PDF hash. Retrying unchanged data uses the same key within the provider's idempotency window. Accepted means handed to Resend, not confirmed inbox delivery. Provider errors are not logged with customer data. Host and mail-provider operational logs/retention are outside the calculator's no-database design.

## Local verification

```
npm ci
npm test
npm run build
python3 -m http.server 8765 --directory dist
# In another terminal:
npx playwright install chromium
npm run test:browser
```

The browser tests mock mail delivery and do not send email. They verify exports, four languages, pricing fixtures, reset, mobile and mail-failure handling. Inspect generated `test-output` PDFs manually or with Poppler. Live Netlify mail delivery and Salesforce import require separate end-to-end checks.

PDF uses embedded standard Helvetica with Western European encoding. Unsupported characters outside that encoding are replaced with `?`; original strings are preserved in JSON. Cost logic is retained from the pilot, including annual card minimums, terminal quantities and annualised one-off costs. This is an indicative comparison, not a binding quotation.

## Removed

Supabase Auth/API/schema scripts, invitation/user management, reporting library, internal-only comparison modes, persisted retention workflow, Vercel config and duplicate legacy root frontend files. This code change does not delete an existing Supabase project or historical data at the provider.

## 5.1 interface update

Payment Calculator title; simplified context; Frontbook and Retention labels; Credit, ASF and Scheme Fee terminology; Competitor auswählen / Competitor Angebot in German; no numbered offer labels. The mix confirmation badge, checkbox and confirmation claims are removed. Calculations use exactly one year and include one-off setup costs in full. JSON retains oneOffCostYears=1 and no longer exports mixConfirmed, so it cannot imply a user confirmation. Example loading seeds ASF 0.45% and monthly terminal rent CHF 25 on both sides, including when switching pricing models.

## 5.2 empty form and placeholders

The headline is Vergleichsrechner and the annual transaction field unit is TRX. All manual text/number inputs start empty with localised gray example placeholders; the quote date stays empty and dropdowns remain unselected. No placeholder value participates in calculations or exports. Optional empty cost fields and terminal quantity export as zero; positive terminal rent requires an explicit positive integer terminal quantity. Offer names and active rates are required. IC and Scheme Fee inputs are required only for active card types when at least one IC++ offer is selected. Loading the example fills payment volumes, mix, IC/Scheme Fee assumptions, offer names, rates and optional costs explicitly. Reset restores the empty form. The three section number badges are removed.

## 5.2.1 icon release

Replaces the P/C mark with the approved solid white calculator, purple details and gradient tile. Tile: 46 px; inner symbol canvas: 41 px. Uses the same local vector asset as the browser favicon. No external icon request or added runtime dependency.

## 5.2.2 calculation defaults
Initial and reset forms use editable payment mix (30/30/25/15/0), Interchange and Scheme Fee assumptions. All other manual fields remain empty. These assumptions are used directly in calculations and exports.

## 5.2.3 complete example and competitor palette
Example loading fills missing customer context, Salesforce example references, channel, purpose, industry, competitor and quote date so a fresh form immediately shows a recommendation. Existing context values are preserved. Competitor card uses pale pink and coral accents with white inputs.

## 5.2.4 offer palettes
Nexi card uses lavender with purple accents and a white-on-purple tag. Competitor tag is white on #C00000; competitor card text and controls use #C00000. Inputs remain white.

## 5.2.5 field captions
Competitor field captions are black. Red accents, input values, units and the white-on-red provider tag are retained.

## 5.2.6 annual price difference
Highlights the absolute annual price difference from the Nexi perspective. White circular status shows a green tick for lower Nexi cost, red cross for higher cost, and neutral equals for equal cost (below CHF 0.005 difference). Includes all four UI languages and responsive layout.

## 5.2.7 centered status symbols
Replaces font glyphs with larger centered check and cross shapes matching the approved preview. Existing circle sizes, colors and conditional logic remain unchanged.

## 5.2.8 seamless check
Uses a single continuous SVG stroke with round joins for the green check, eliminating the CSS border seam. Circle, color and icon dimensions are retained.

## 5.2.9 result labels and cleanup
Removes the service/terminal advice block and bottom footer. Result provider labels follow the selected competitor or manually entered Other provider, escaped as text.

## 5.3.0 payment mix and responsive fields
Equal responsive payment mix tiles include local brand logos from activemerchant/payment_icons (license in public/payment-logos). Salesforce references use Optional placeholders; ticket amount label shortened. Removes merchant-check sentence from mix preview. Constrains date and context inputs to their grid cells, including WebKit date presentation.

## 5.3.1 input logos and actions
Moves Example loading to the page headline. Adds local logo tiles immediately before editable payment mix shares. JSON and New comparison are equal filled buttons in two responsive columns.

## 5.3.2 export wording and audit
Renames the export button to JSON-Datei herunterladen (localized). See docs/AUDIT-2026-10-31.md for the model audit, tariff gaps and reproduced validation defects. No pricing assumptions changed. Numerical reproduction: node tests/audit-calculation.mjs with a local dist server.
