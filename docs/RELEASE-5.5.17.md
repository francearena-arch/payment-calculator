# Release 5.5.17

Show Other cards beside TWINT in both Split Blend quote panels. Reuse the existing rate:other calculation binding; remove its duplicate from the collapsed fixed-fee section and rename that section accordingly. IC++ continues to apply ASF plus the independently editable Other-card IC/Scheme assumptions.

English labels: How does the merchant accept payments? / Annual card turnover (incl. TWINT).

## Translation review
Reviewed public/i18n.js, lib/labels.js, public/markups.js and inline result text in public/calculator.js (DE/FR/EN/IT). Generally understandable, but not ready to claim a native-language editorial sign-off. Areas for a dedicated consistency pass:
- German recommendation is rendered as result in EN/FR/IT.
- Input-rate validation in FR/EN/IT omits terminal-count guidance present in German.
- Merchant context heading still coexists with Customer name / Kundenname.
- Industry choices and sales channels use English stored values in all languages; internal channel names may be intentional, industry Other/Gastro should be localized without changing stored IDs.
- Reference values are still described as estimates elsewhere (IC help/footnote); terminology should be aligned while retaining uncertainty.
- Setup is described as apportioned although the current calculation includes one-off setup in the first year; this wording needs correction separately from any pricing-model change.
- Commercial/foreign/token surcharge conditions are present across all four languages; editorial approval is still needed for contract terminology.

No tariff, formula, or stored option values changed in this release.
