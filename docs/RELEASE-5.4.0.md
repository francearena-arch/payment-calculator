# 5.4.0: optional contractual card markups

## Scope and behaviour

The optional card-characteristics section is collapsed and empty at startup. Existing examples and baseline costs remain unchanged when unused. Inputs are shares of **total annual payment turnover including TWINT**, not percentages of each card category. For example, 10% at CHF 500,000 is CHF 50,000 affected turnover. This explicit common denominator avoids inventing a regional allocation within the payment mix.

Only eligible Visa/Mastercard transactions are to be entered. TWINT, V PAY, other schemes and special tariff cases are excluded from these standard populations. Regional shares are distinct; foreign Commercial Cards are a subset of the regional populations, not a third disjoint payment population. Their independently confirmed additional fee is additive. Domestic debit token turnover is separate from foreign turnover and bounded by the debit mix.

## Nexi reference tariff

Source: https://www.nexi.swiss/content/dam/nexich/documents/download-center/pricelist/CH_DE_KMU_Preisliste_May2026.pdf (effective 1 May 2026, pp. 1 and 3).

| Eligible population | Additional percentage |
| --- | ---: |
| Standard intraregional Visa/Mastercard transactions | 1.03% |
| Interregional Visa/Mastercard transactions | 1.55% |
| Foreign Commercial Cards | 1.45% |
| Domestic debit token transactions | 0.16% |

The 0.10% Digital Enablement / Token Facilitation fee is **not** inferred from a general wallet percentage. No FX, special Visa Israel/Turkey/Swiss cases, B2B, authorisation, minimum transaction amount, fixed token fee, 3DS fee or other unrepresented conditions are inferred. These require the applicable quote and potentially additional transaction data. Region definitions: https://www.nexi.swiss/content/dam/nexich/documents/download-center/2023-110-072_CH_DE_Regionendefinitionen_Kartenorganisationen.pdf

The standard reference profile is offered only for Nexi Split Blend because the cited footnote specifies additions to Disagio. IC++ is not assigned this tariff automatically: use confirmed quoted additional rates or explicitly confirm that the charges are already included. This prevents silently duplicating ASF, Scheme Fee or blended charges.

## Contract confirmation

If any characteristic is positive, each offer requires a treatment selection: already included/no extra charge; confirmed quoted additional rates; or Nexi's reference tariff when eligible. The competitor never inherits Nexi's tariff. Custom rates are required for each positive characteristic and may explicitly be zero. Changing competitor identity clears that competitor's confirmation and custom rates. Switching Nexi to IC++ clears the standard profile confirmation.

Formula per characteristic: annual turnover x affected share / 100 x confirmed surcharge / 100. The amount is added once as a separate `cardMarkups` component, outside the existing annualised minimum calculation. The contract must support that additional treatment. Existing optional general surcharges remain separate: the same fee must not be entered twice.

## Output and validation

All shares must be finite decimal percentages from 0 to 100 (comma or point accepted). Regional totals must fit the eligible card mix; Commercial Cards must fit foreign regional turnover; domestic debit tokens must fit both the debit mix and remaining domestic turnover. Unknown and explicit zero remain distinguishable in JSON. Missing/invalid confirmation suppresses results and prevents PDF/JSON export. Non-finite total costs are blocked. Readiness is stored independently from temporary export-button state.

PDF, JSON, recommendation, offer totals, detailed breakdown and volume scenarios consume the same calculation. JSON includes source/version, denominator, effective rates and per-fee affected volume/amount. The PDF prints those assumptions and calculations, and reserves space for complete cost tables.

## Verification

- `npm test`: 10 tests passed, including 1,000 independent checks of the production annual cost function and 500 independent markup calculations, plus empty/zero/invalid populations, policies, IC++ restrictions, scaling and existing email-handler tests.
- Build passed. Cloud-browser checks verified the CHF 1,280 markup example, CHF 7,867.50 Split Blend total, CHF 6,077.50 IC++ total using confirmed custom rates, and blocked results after a competitor switch.
- Actual JSON download matched UI totals and contained all four rates and tariff provenance. PDFs generated in all four languages from that export; German PDF text and rendered layout inspected, including full cost tables.
- Narrow-screen CSS geometry inspected without horizontal overflow. This is not actual iOS Safari certification. Earlier automated Playwright browser suite was not rerun in this environment; the new arithmetic checks run without browser automation.

This release adds defined markup functionality. It does not resolve all pre-existing findings in AUDIT-2026-10-31.md or certify contractual completeness of every offer.
