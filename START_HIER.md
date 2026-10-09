# Schritt 1 — Datenbank vorbereiten

1. Öffne Supabase und prüfe oben den Projektnamen: **payment-calculator**.
2. Öffne links **SQL Editor** und wähle **New query**.
3. Öffne im entpackten Release die Datei **supabase/01_setup.sql** mit einem Texteditor.
4. Kopiere den gesamten Inhalt in den SQL Editor.
5. Klicke **Run**. Erwartet: erfolgreiche Ausführung ohne Fehlermeldung.
6. Im Table Editor findest du danach `pcc_profiles`, `pcc_cases` und `pcc_audit`.

Das Skript nur einmal ausführen. Bei einer Fehlermeldung nicht mehrfach ausführen; den Fehlertext zur Prüfung weitergeben. Bodyplan nicht öffnen oder verändern.

**Danach zunächst stoppen.** Der nächste Einrichtungsschritt ist das Hochladen des Releases nach GitHub und die Verbindung mit Vercel. Erst nach dem Deployment konfigurieren wir die Auth-URLs und versenden die Admin-Einladungen.

## Was dieses Paket ist
Version 4.0.0-rc.1 ist die erste integrierte Testversion. Rechner, Login, Einreichung, Zugangsverwaltung und Reporting sind implementiert. Manuelle PDF-Berichte über Drucken → Als PDF speichern sind vorhanden. Monatlicher automatischer E-Mail-Versand und Proposition-Vorlagen folgen nach der zugehörigen Konfiguration.

Die Bibliothek speichert nur bewusst eingereichte Offerten. Der Nutzer bestätigt echte Konditionen, ein Administrator prüft sie. Dieser Ablauf reduziert Testdaten; er kann keine echte Offerte technisch beweisen. Nach Beispieldaten muss ein neuer Vergleich gestartet werden.

## Prüfergebnis
- Build erfolgreich.
- 13 automatisierte Prüfungen für Formeln, Eingabevalidierung und Zugriffsschutz bestanden.
- Desktop-/Mobile-Browserprüfungen mit simuliertem Login und API bestanden, vier Sprachen geprüft.
- PDF-Drucklayout gerendert und visuell kontrolliert.
- Laufende Supabase-/Vercel-Integration, echte Einladungen und E-Mail-Zustellung noch nicht geprüft. Dafür folgt nach Einrichtung ein gemeinsamer Test.

## Daten und Grenzen
Keine Felder für Kundenname, Merchant-ID, Kontaktdaten oder Offert-Anhänge. In Freitextfeldern nur Proposition-/Wettbewerbernamen angeben. Nutzer-E-Mail-Adressen werden für die Zugangskontrolle gespeichert.

Interchange/Scheme Fees bleiben indikative Annahmen. Die tatsächlichen Offertbedingungen, Mindestgebühren und Zusatzkosten sind zu prüfen. Der Referenzvergleich ist keine verbindliche Offerte. Fehlende Preise werden nicht als kostenlose Zahlungsarten behandelt.

Nexi und acht Wettbewerber haben lokal hinterlegte Logos aus offiziellen Quellen. SumUp wird vorerst als Name dargestellt. Die Anwendung selbst hat neutrales Branding. Regelmässige PDF-E-Mails sind in diesem Release noch nicht aktiviert.

## Wichtige Betriebsentscheidungen vor dem Pilot
Server-Schlüssel ausschliesslich in Vercel speichern. Öffentliche Registrierung aus lassen. Eigene SMTP-Konfiguration für zuverlässige Einladungen einrichten. Admin-MFA ist implementiert; Einrichtung testen. Wiederherstellung/Backup und Zugriffsregeln mit dem tatsächlichen Projekt prüfen, bevor das Tool dauerhaft genutzt wird. Supabase Free kann bei geringer Aktivität pausiert werden.

Die vollständige technische Einrichtung und die Live-Testliste findest du in README.md.
