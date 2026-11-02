# Release 5.5.4

Implement the approved payment-mix assumption layout: shared 52px input/logo-tile height, narrower percentage share field with a 164px logo tile, centered single-row logos (including JCB/Diners/Amex/UnionPay), and vertically centered TWINT no-interchange note. Below 760px the share group spans the row with interchange and scheme inputs beneath it. Below 380px the logo tile shrinks to 136px with 28px logos; input height stays unchanged.

Presentation only. No calculation, tariff or delivery changes. Production build checked; deployed browser geometry and visual inspection verify alignment and no overflow.
