# Public competitor tariff review

Public official sources checked during the 5.4.0 work. Findings are research, not automatically enabled competitor presets. A provider name is insufficient to select a tariff. Unknown is never equivalent to zero.

| Provider/profile | Public evidence | Implementation constraint |
| --- | --- | --- |
| Worldline Swiss presence business | Published schedule effective February 2024: intra 0.98%, inter 1.30%, foreign commercial 1.30%; qualifying card lists differ | Confirm this document applies to the actual contract and date; do not label it a universally current 2026 tariff. No universal wallet surcharge established. |
| Worldline QR Payments | Non-domestic surcharge 1.5%, international commercial surcharge 1.5% | Product-specific; different from general presence business. |
| Stripe Swiss online standard | Domestic 2.9% + CHF .30; foreign 3.25% + CHF .30; FX 2% only if conversion occurs | Foreign/domestic difference is .35 percentage points, not an additional 3.25%. Applies only if quoted baseline is the domestic standard tariff. |
| Stripe Terminal | Page separately lists EEA/non-EEA rates | Not the online foreign-card rule or Nexi regional populations; needs its own profile and country mapping. |
| Payrexx | Public Swiss page lists business/inter online 3.40% + CHF .18 and presence credit-card 3.10% + CHF .15. Wallet fees follow underlying card. | These are category tariffs, not a separate flat markup to add. Avoid counting a commercial-and-foreign transaction twice. Its documented regional definitions differ from Nexi's. |
| SumUp | Swiss page differentiates pay-as-you-go, subscription, premium/company/non-EU card categories | Category replacement tariffs, not universal additive foreign/commercial markups. Help and pricing pages show differing subscription figures; verify exact plan/current quote. |
| Adyen | Processing fee plus payment-method fee; card pricing uses Interchange++ | Card origin/type effects may already be in passed-through IC/Scheme Fees; no universal Nexi-style surcharge profile established. |
| Wallee | Public pricing notes processor-, risk-, industry- and volume-dependent processing fees | No verified universal four-surcharge schedule found. Use actual acquiring contract, separately from gateway fees. |
| Planet/Datatrans | Public pricing explicitly excludes separately priced Planet acquiring | Gateway pricing cannot establish acquiring markups; actual acquiring quote required. |
| SwiPay / Privapay | Official public pages describe fee structure/solutions without a numeric applicable four-surcharge schedule found | Leave unknown; require confirmed quote. |

## Sources

- Worldline schedule: https://worldline.com/content/dam/worldline/local/de-ch/documents/110061101-DS-Schedule-of-Fees-for-Presence-Business-02-2024-CHE-DE-opt.pdf
- Worldline download centre: https://support.worldline.com/de-ch/home/merchants/download-center
- Worldline QR: https://worldline.com/de-ch/campaigns/ms/worldline-qr-payments
- Stripe CH: https://stripe.com/de-ch/pricing
- Payrexx CH: https://www.payrexx.com/pricing
- Payrexx regional definitions: https://docs.payrexx.com/merchant/bezahldienste/payrexx-pay/kartenregionen-und-gebuehren
- SumUp CH: https://www.sumup.com/de-ch/preise/?lang=en
- SumUp help: https://help.sumup.com/de-CH/articles/4oI3qHHji2I2S9dyvRfec3-preise-gebuehren
- Adyen: https://www.adyen.com/pricing
- Wallee: https://app-wallee.com/pricing/ch
- Datatrans: https://datatrans.weareplanet.com/de/pricing
- SwiPay: https://swipay.ch/fees/
- Privapay: https://privapay.ch/

## Next implementation

Use versioned profiles keyed by provider, product/plan, Swiss merchant country, channel, pricing model and effective date. Distinguish additive percentages from replacement category rates, fixed fees, IC/Scheme pass-through, inclusion and unknown. Confirm the actual contract before applying a public preset. Use one small profile selector within the optional section; retain the manual quote path. More automatic profiles require country/region mapping and, for replacement tariffs, joint card-type/region populations to avoid duplicate replacement or unsupported allocation. The existing four shared aggregates alone cannot guarantee correct results for every provider.
