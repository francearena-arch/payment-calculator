# Release 5.5.18

Language quality release for English, French and Italian. Keeps the established design and calculation model.

- Clarifies merchant terminology, recommendation headings, terminal-count guidance and minimum-fee supplements.
- Aligns editable interchange/scheme reference-value wording across mix help, IC++ explanations and PDF notes. Retains merchant/quote verification and all surcharge applicability conditions.
- Corrects one-off setup labels to reflect the full setup amount included in year one (also corrects the German breakdown label).
- Improves tokenised debit and Worldline card-present terminology without changing tariff data, validation rules or calculations.
- Localises industry display values in dropdowns and PDFs while preserving canonical stored JSON values. Official internal sales-channel names and Frontbook remain unchanged.
- Localises previously hardcoded PDF pricing-model, example-data and difference labels, uses localised scheme-fee labels and consistent TRX units.
- Keeps the internal-recipient email in German, including its approved minimal body. No email destination, sender or sending behaviour changes.

Validation: 30 automated tests passed, including catalogue completeness, locale placeholder parity, stable industry IDs, financial regression and mail/send-once tests. Production build passed. Representative English, French and Italian PDFs (Split Blend and IC++, card features, minima and setup) generated, text-checked and visually reviewed. Italian reference wording shortened to avoid an orphaned final line/page. No claim of independent native-language certification.
