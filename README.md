# Nexi Payment Vergleichsrechner · Pilot v3.5.0

Open `index.html` in a browser. The compact language control in the top right switches German, French, English and Italian. The current inputs and offer data remain when switching language. The printed PDF uses the selected language. Financial formulas and default assumptions are unchanged from v3.4.

## Calculation and assumptions
- Turnover and transaction count include TWINT. Starting payment mix: Debit Mastercard 30%, Visa Debit 30%, credit cards 25%, TWINT 15%, other cards 0%; this is an example, not merchant data.
- Split Blend uses a separate percentage and optional fixed transaction amount per payment method. IC++ adds editable interchange and scheme-fee estimates on cards; TWINT is priced separately.
- If transactions by payment method are not entered separately, transaction shares are assumed equal to turnover shares.
- The result and PDF identify whether the payment mix was marked as checked. Example rates load only after an explicit click.
- This is an indicative internal pilot. Scheme fee percentages omit transaction-specific fixed fees; offer terms, merchant mix and actual fees require review before sharing externally.

## Pilot check
- Language control is a small code pill on desktop and mobile. The desktop popover and mobile sheet use the current language for their heading and accessible labels. Escape and outside click close it. The PDF stays in the selected language.
- Pricing data and formulas remain those of v3.4.1; active zero-turnover methods with separately entered transactions still require a quoted rate and fixed fee. No live interchange or scheme fee feed is used. The optional per-method fixed charges and monthly minimum must be matched against each actual quote.
