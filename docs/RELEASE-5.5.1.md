# Release 5.5.1

PDF emails now include the corresponding JSON export (schema 1.2.0) from the same immutable browser snapshot. Both files share comparison ID and creation time. The subject is `Angebotsvergleich – Kundenname – TT.MM.JJJJ`, using the Europe/Zurich snapshot date. The message explains both attachments in German.

The server validates JSON size, schema, comparison ID, currency, customer and timestamp. It retains exact uploaded bytes for both attachments. Idempotency includes both files so an unchanged retry cannot send a different snapshot under the same provider key. Sender and destination remain server-controlled. This is structured user-supplied data, not server-certified arithmetic.

Validation: 25 Node tests pass, including both exact attachments, Zurich date rollover, malformed/mismatched JSON, header control characters, transient retry and JSON-only idempotency changes. Production build passes.

The owner confirmed receiving/opening the previous release PDF at the configured Googlemail testing inbox on 31 October 2026. Sender change and PDF+JSON live acceptance are checked during deployment. Resend test-domain recipient restrictions remain in force.
