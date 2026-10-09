# Update auf 4.1.0-rc.1

## Bestehendes Projekt – diese Reihenfolge einhalten
1. Im Supabase SQL Editor die Datei `supabase/02_reporting_upgrade.sql` öffnen, den gesamten Inhalt einfügen und Run ausführen. Die Migration ergänzt nur das Branchenfeld und einen Index. Bestehende Nutzer und Offerten bleiben erhalten. Alte Offerten werden als „nicht erfasst“ ausgewertet.
2. Archiv entpacken und die enthaltenen Dateien direkt in das Hauptverzeichnis des bestehenden GitHub-Repositorys übernehmen. `package.json` bleibt im Hauptverzeichnis. Kein ZIP in das Repository hochladen; dessen Inhalt verwenden.
3. Vercel baut automatisch. Auf Ready warten, dann den Browser neu laden.
4. Als normaler Nutzer einen Vergleich durchführen. Branche ist für das Rechnen optional, für die Einreichung erforderlich. Bei nicht bekannter Branche „Nicht bekannt“ wählen. Pflichtfelder werden bei fehlenden Eingaben rot markiert.
5. Als Administrator unter Reporting eine eingereichte echte Offerte prüfen und freigeben. Filter und PDF prüfen.
6. Unter Reporting „Demo-Report ansehen“ wählen. Beispielauswertung und PDF prüfen, danach „Zu echten Daten wechseln“.

**Für dieses Update nicht `01_setup.sql` erneut ausführen.** Diese Datei ist nur für eine neue Installation vorgesehen. Vercel-Variablen und Login-Konfiguration bleiben unverändert. Keine Secret Keys ins Repository kopieren.

## Neu
- Branchenfilter, nachvollziehbare Preisdetails und Offertenbibliothek.
- Management Summary, Preisentwicklung, Referenzkosten und Retention-Auswertung.
- Separater Demo-Modus für alle Wettbewerber; keine Speicherung der Demodaten. Jede PDF-Seite ist als fiktiv gekennzeichnet.
- Die Referenzprofile und die Grenzen der Auswertung sind in `REPORT_LOGIC.md` beschrieben.

## Nach dem Deployment
Die lokalen Prüfungen ersetzen nicht den Live-Test auf deinem Supabase/Vercel-Projekt. Bitte eine echte Test-Einreichung, Freigabe, Nutzerzugriff und PDF prüfen. Monatlicher automatischer Mailversand ist noch nicht implementiert.
