# Release 5.5.2

Finish the automatic PDF+JSON mail attempt before opening/downloading the PDF. Previously blob PDF opening preceded the mail request and could navigate away from the calculator before the request started/completed. Local PDF download remains available after a failed mail attempt. The existing button is unchanged.

Investigation: Deploy Preview #1 function logs through 02:15 Europe/Zurich contained the two known successful synthetic sends, with no additional user invocation. This is consistent with client-side interruption, but does not prove the exact cause on the user device.

Validation: existing mail/calculation test suite and production build; live browser test on deployed preview. iOS Safari must be confirmed by the user because the available browser is Chromium.
