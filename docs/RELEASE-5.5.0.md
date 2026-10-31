# 5.5.0: controlled Sales pilot

This release addresses the six rollout findings from the 5.4.0 audit. It is a bounded indicative quote comparison, not an invoice reconstruction or an approval of unverified tariffs.

| Finding | Change | Remaining business condition |
| --- | --- | --- |
| Silent decimal/negative input transformation | Strict parser accepts CHF cents using point or comma and valid Swiss grouping. Formatting occurs on blur only. Signs, invalid characters, ambiguous separators, exponent notation and out-of-range values are rejected rather than silently removed. | Sales must use the quote's correct annual volume and counts. |
| Transaction minimum not modelled | Record contractual minimum per payment and require a confirmed annual minimum-fee top-up when positive. That top-up is charged exactly once. | Obtain annual top-up from a verified quote, statement or transaction-level calculation; average ticket is insufficient. No transaction-level floor/cap engine is claimed. |
| Simplified global IC/Scheme assumptions | Optional per-offer percentage and fixed CHF transaction components, independently calculated and included in outputs. A global confirmation is required for manually changed cost inputs. | Validate issuer/channel/card mix; convert EUR components using an agreed rate before entry. Current example assumptions are not universal tariffs. |
| Impossible transaction mix | Positive turnover categories require positive whole counts; zero-turnover categories require zero counts; category totals must equal annual count. | The default proportional count estimate still assumes equal average ticket across payment categories unless actual counts are entered. |
| Annualised monthly minimum approximation | Removed the `max(annual cards, 12 x monthly minimum)` shortcut. Use only a confirmed annual minimum top-up. Relevant input changes clear the confirmation/top-up. Scenario extrapolation is disabled for minimum-fee cases. | Seasonal monthly billing must be checked outside the aggregate annual model. |
| Competitor tariff gaps | Opt-in Worldline CH presence-business reference profile effective 02/2024 with source recorded. Applies only to the selected provider and Split Blend, subject to contract confirmation. Unknown token rate stays null and blocks the profile for a positive token share. Other providers retain confirmed quote entry. | Verify applicability/date. Provider names alone do not select a tariff. No automatic Payrexx/SumUp/Stripe replacement-rate or region mapping is inferred. |

## Confirmation and presentation

Advanced controls remain collapsed. One concise checkbox confirms both offers' prices, minimum fees and additional charges. Input/model/provider changes invalidate confirmation. Unchanged explicitly loaded examples still show immediate results and remain marked as examples in exports; they are not marked contract-confirmed. A confirmation checkbox is an operator acknowledgement, not formal Pricing approval.

JSON schema 1.2.0 adds effective per-offer fee assumptions and confirmation state. PDF, JSON and on-screen totals use the same production calculation; the PDF lists effective fixed and percentage IC/Scheme components. PDF translation is frozen to the exported snapshot's language.

## Mail

`/api/send-pdf` sends the actual downloaded PDF to the server-configured recipient. The original bytes and stable provider idempotency key are reused for retry. One transient provider retry is allowed. Configuration, sender verification and restricted testing-recipient errors remain failures, never successful delivery messages.

`/api/mail-status` verifies a signed, 10-minute receipt before retrieving provider delivery state. It returns only status; no recipient/content data or API keys. Sending and receiving-server delivery are distinct. Retrieval permission failures remain unconfirmed. The browser can retry a failed submission without regenerating a different attachment. No durable queue or delivery guarantee after the browser closes is claimed.

Netlify requires Functions-scoped `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_TO` in the relevant deploy context and a redeploy. A resend.dev sender can be restricted to the provider account's testing address. An authorised verified sender domain is needed for general company destinations. The existing agreed test recipient remains the intended first destination; no new recipient is hard-coded.

## Verification completed

- 23 Node tests passed, including 1,500 independent arithmetic cases, decimal/negative/ambiguous parsing, inconsistent transaction mix, minimum gating, independent offer-specific IC/Scheme fees and fixed CHF amounts, Worldline profile applicability, mail retry idempotency, signed receipts and accepted-versus-delivered statuses.
- Browser checks on the local preview: unchanged example CHF 6,587.50; `500000.50` preserved and produces CHF 6,587.51 after explicit confirmation; negative amount rejected; 0%-turnover/1,000-transaction mismatch blocked; monthly minimum requires a confirmed uplift; confirmed CHF220 uplift yields CHF6,807.50; a changed annual volume clears it.
- Separate quoted IC/Scheme percentages and fixed CHF amounts yield the independently expected CHF4,212.50 total. Worldline 10% intraregional reference surcharge adds CHF490, producing CHF7,715 on its example offer. Actual downloaded JSON matches these values and records source, effective fees and confirmation.
- PDFs generated in DE/FR/EN/IT from the downloaded JSON. German PDF extracted values and rendered full-page layout reviewed. Cost tables and sources remain legible, without the previous orphaned example note.
- GitHub Actions now runs npm ci, tests and build for pushes and pull requests. Existing standalone Playwright tests were adapted to the confirmation requirement; they were not executed through an alternative browser driver in this environment. Cloud-browser checks above are the observed UI evidence.

## Pilot gates still required

Pricing must approve the actual quote assumptions and applicability of reference profiles. Sales should reconcile a small set of real, anonymised reference comparisons before customer-facing use. The live Netlify mail configuration and actual delivery cannot be certified by the mocked mail tests; confirm separately using a synthetic PDF and provider delivery evidence. Actual iOS Safari, full accessibility compliance and external security testing remain outside this verification.

The public fixed-recipient mail endpoint is protected by origin checks and configured platform rate limits, not user authentication. Verify rate-limit enforcement and business recipient access before expanding the pilot. Server/recipient mail retention is outside the calculator's no-database design.
