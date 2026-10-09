# Update auf 4.2.0-rc.1

## Reihenfolge für dein bestehendes Projekt
1. ZIP entpacken.
2. Falls die Branchen-Erweiterung aus 4.1 noch NICHT installiert ist: `supabase/02_reporting_upgrade.sql` im Supabase SQL Editor ausführen. Ist 4.1 bereits eingerichtet, brauchst du für 4.2 keinen weiteren SQL-Lauf. Die Migration ist wiederholbar, wenn du unsicher bist. `01_setup.sql` nicht erneut ausführen.
3. Inhalt des ZIPs direkt ins Hauptverzeichnis des bestehenden GitHub-Repositorys übernehmen; nicht das ZIP selbst hochladen. `package.json` bleibt im Hauptverzeichnis.
4. Auf Vercel Ready warten und den Browser neu laden. Bestehende Login-Konfiguration und Vercel-Variablen bleiben bestehen. Keine Secret Keys in GitHub hinterlegen.
5. Als Administrator Reporting öffnen und Demo-Report ansehen. Summary, Branchenübersicht und Detailanalyse prüfen.
6. Für das Ranking eine konkrete Nexi-Vergleichsofferte auswählen. Name, Datum, Ursprung und vollständige Konditionen werden angezeigt. Ohne Auswahl gibt es ein Wettbewerbsranking ohne Nexi-Abstand. Filter-/Vergleichsgruppenwechsel setzt die Referenz zurück.
7. Zahlungsart für die Trendanalyse auswählen. Das PDF zeigt die gewählte Zahlungsart als einzelne Anbieterdiagramme; die Preismatrix zeigt alle relevanten Zahlungsarten.
8. Sprache oben im Tool wählen: Deutsch, Französisch, Englisch oder Italienisch. Danach PDF erstellen. Die Report-Sprache entspricht der Tool-Sprache. Anbieter- und manuelle Propositionstitel bleiben unverändert.
9. Zurück zu echten Daten wechseln. Einreichung, Freigabe und PDF im Live-Projekt testen. Auch mit einem normalen Nutzer prüfen, dass Reporting nicht zugänglich ist.

## Neu
Management Summary mit datenbasierten Beobachtungen und Prüfaufträgen; gesonderte Branchenübersicht; fixe auswählbare Nexi-Offerte im Kostenranking; Einzel-Diagramme je Anbieter mit gemeinsamer Skala; Preismatrix inklusive CHF-Fixbeträgen. Fiktion ist auf jeder Demo-PDF-Seite markiert, es werden keine Demodaten gespeichert.

Die PDF umfasst Summary, Verticals, Kostenranking, Trendanalyse, Preismatrix, Detailbelege und höchstens sechs Offerten aus der aktuellen Bibliotheksseite. Abhängig vom Datenumfang können mehr Seiten entstehen. Kleine Stichproben und fehlende Informationen werden ausgewiesen; keine pauschalen Markt- oder Kausalitätsaussagen.

## Prüfung und Grenzen
23 automatisierte Tests sowie lokale Browserprüfungen mit simuliertem Backend. PDFs in vier Sprachen und mobile/desktop Darstellung geprüft. Live-Konfiguration und Deployment bleiben bei dir zu testen. Monatlicher automatischer PDF-Mailversand ist weiterhin nicht implementiert. `REPORT_LOGIC.md` erläutert die Rechenlogik.
