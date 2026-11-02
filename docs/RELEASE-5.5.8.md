# Release 5.5.8

Remove optional pricing acknowledgement from UI and PDF. Both export buttons send the same PDF and JSON attachments before downloading their selected format. A shared in-session ledger coalesces concurrent sends and suppresses repeat sends for unchanged comparisons after provider acceptance. Failed requests remain retryable; edited comparisons may be sent again. Server idempotency remains in place for identical request retries.
