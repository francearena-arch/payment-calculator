# Release 5.5.9

Remove routine export progress and mail success messages below export buttons. Keep actionable validation and failure messages with retry, so failed exports are not silently lost. Both exports retain shared PDF/JSON email delivery and in-session duplicate protection. Simplify mail body to customer/date intro, blank line and comparison ID; subject and both attachments stay unchanged.

Validation: 27 automated tests and production build. Mail test asserts exact body and unchanged attachments.
