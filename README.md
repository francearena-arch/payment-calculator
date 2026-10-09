# Proposition & Competition Comparator
## 4.1.0-rc.1 — reporting release candidate
Built from the supplied v3.5.0 pilot. This is NOT a production sign-off: actual Supabase/Vercel configuration, invitations, SMTP, RLS and user access must be tested on the configured project before real use.

## Update existing installation
Read `START_HIER.md` first. Run `supabase/02_reporting_upgrade.sql` before deploying. Do not rerun the initial setup on an existing project. Reporting methodology: `REPORT_LOGIC.md`.

## Included
- Existing DE/FR/EN/IT calculator and merchant print-to-PDF, neutral application branding.
- Admin TOTP MFA enrollment and verification; privileged server operations require aal2.
- Email/password login; invitation/recovery password setup; no registration UI.
- Required sales channel per comparison: Remote Sales, Field Sales, Key Account. Purpose: acquisition/retention.
- Listed competitors + Other with competitor-name field. No customer fields or quote attachments.
- One competitor against 1–3 manually named Nexi propositions. Existing internal comparisons remain local.
- Explicit real-quote submission, checked mix and offer date required. Demo-loaded comparisons must restart before submitting. This is an attestation plus admin review, not proof of authenticity.
- Submitted competitor and Nexi pricing, mix assumptions and turnover band stored. Exact merchant turnover and transaction count are not stored. Names must describe propositions only.
- Admin: invitations, suspension, permanent user deletion; admin accounts protected from app deletion/suspension.
- Admin Reporting: pending review, approved library, filters, grouped monthly observations, indicative reference costs and PDF via browser print.
- Own retention outcome form: actual offered proposition, open/retained/lost. No merchant identifiers.
- Nexi logo only inside reporting; competitor assets where available; fallback provider label.

## Deliberately not configured yet
- Scheduled monthly email and attachment delivery (recipient, schedule and SMTP/transactional provider outstanding).
- Centrally managed proposition templates (names/prices not supplied).
- Operational monitoring and independent backup/restore test.
- Native generated downloadable PDF file: current reports use browser Print → Save as PDF.

## Installation — step by step
1. Supabase `payment-calculator` → SQL Editor → New query. Paste `supabase/01_setup.sql` and run ONCE. Confirm no error. The script creates only `pcc_*` tables; it does not modify Bodyplan. Authenticated and anonymous clients have no direct table permissions; server APIs authorize every request.
2. Keep public signup and anonymous sign-in disabled; email provider and email confirmation enabled.
3. Upload the contents of this release to the GitHub repository root. Do not upload node_modules, dist, .env or secrets. Keep package-lock.json.
4. Import repository into Vercel. Framework preset Other; build `npm run build`, output `dist`, install `npm ci`. APIs deploy from root `api/`.
5. Vercel environment variables: SUPABASE_URL (project URL), SUPABASE_SECRET_KEY (Supabase server secret OR legacy service_role key, ONLY here), APP_URL (exact HTTPS production origin, no trailing slash). Redeploy after changes. See `.env.example`; it contains no secret.
6. Supabase Authentication → URL Configuration: Site URL = APP_URL. Add APP_URL + `/` and APP_URL + `/?flow=recovery` to allowed redirects. Custom SMTP is required for dependable invitations/recovery beyond Supabase's default restricted test email service. Configure strong password requirements (at least 12 characters).
7. After deployment, Authentication → Users → Add user → Send invitation: invite france.arena@googlemail.com and francesco.arena@nexigroup.com. Normal accounts start inactive and are activated explicitly by the app administrator invitation endpoint (or Restore access). Dashboard-created normal users must be activated separately. This prevents accidental open signup from granting application access. The SQL trigger assigns admin role only to these initial email identities, not from user-editable metadata. Invitation opens the password setup in the app. Never create roles through frontend metadata.
8. Log in as admin. Invite a test user from Access. Test all checklist items below BEFORE pilot.
9. Choose an appropriate Vercel plan for business use. Supabase Free can pause low-activity projects; it is not a production availability guarantee.

## Acceptance checklist (live configuration required)
- Uninvited signup rejected by Supabase, including direct SDK request.
- Both admins can sign in; invited normal user sees no Reporting/Access.
- Normal user calling report/users/invite/review endpoints receives 403.
- Anonymous publishable-key table reads/writes denied; authenticated direct reads/writes denied.
- Suspended already-logged-in user cannot read/write through API, even with an unexpired token.
- Invite, password setup, forgotten-password email and re-login work on real destination URL.
- Real submission saved pending; double click/retry cannot create a second record with same request ID.
- Demo blocked; missing date/channel/mix confirmation blocked; Other requires competitor name.
- Reviewer inspects all rates and assumptions before approval. Rejected entries not in benchmarks.
- Retention outcome stored for correct owner only. User deletion retains quotes with owner_id null.
- DE/FR/EN/IT switch, mobile keyboard/forms and both PDF layouts checked on target devices.

## Financial scope
The original indicative calculator cost formula is preserved. Percentage fees apply to turnover shares; per-payment amounts use separate transaction counts if entered, otherwise turnover shares. Card IC++ uses entered interchange/scheme percentage estimates; TWINT separate. Scheme fixed fees, refunds/chargebacks, card region/product mix, taxes and card-specific minimum charges are not comprehensively modeled. Monthly minimum excludes TWINT under the original formula: verify quote terms.

Reporting reference profile: CHF 500,000/year, 10,000 payments/year, 30% Debit MC, 30% Visa Debit, 25% Credit, 15% TWINT, 0% Other. Setup costs included fully in first year. Card IC++ assumptions: debit interchange .20% + scheme .12%; credit .40% + .15%; other 1.50% + .70%. These are illustrative, not sourced live rates. Comparison results are not underwriting/pricing authority.

Library snapshots preserve the entered assumptions for review. Benchmark reference assumptions are held constant across dates to avoid fictitious fee trends. Groups for monthly competitor observation: month/provider/channel/turnover band/model. No trend claim below five quotes, and none are representative market statistics. Nexi overall reference summary covers options, not independent quotes. Observed retention is based on approved closed cases and is not causal evidence.

Server report read capped at 5,000 rows with visible warning. Before this cap is approached, implement paginated/server-aggregated reporting. No automatic global collection of local comparisons.

## Development
Node 22+; `npm ci`, `npm run build`, `npm test`. Unit tests cover indicative formulas, strict payload allowlisting and authorization denials. Browser integration tests (mocked auth/server) are in tests/browser-check.mjs; run separately after installing Playwright Chromium. Real services still need the acceptance checklist.
