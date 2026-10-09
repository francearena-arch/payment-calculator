# Audit 4.2.0-rc.1

Lokale Logiktests: 23 Tests; Berechnungsfixtures des Pilot-Rechners, Zugriffsgrenzen, erlaubte Datenspeicherung, Demo-Abweisung, Preisgruppen, Referenzprofile, Branchenkennzahlen und Trend-Stichprobengrenzen.

Browserprüfung mit simuliertem Backend: normaler Nutzer und Administrator; Einreichung und Pflichtfeldmarkierung; kein Reporting-Zugang für normale Nutzer; Demo ohne Schreibzugriff; Referenzauswahl, Zahlungsartwechsel, Branchenseite; kein horizontaler Seitenüberlauf bei 320/375/390/768/1440 Pixel. Wechsel DE/FR/EN/IT erhält Report-Zustand. Vier PDF-Versionen erzeugt und visuell geprüft.

Diagramme: Einzelanbieter statt zehn überlagerter Linien; einheitliche Skala; Stichproben und Monate beschriftet. Ranking gegenüber expliziter gespeicherter Nexi-Offerte, Konditionen sichtbar. Branchentabellen nach Zweck getrennt; keine bereinigte Branchenrangliste. Summary interpretiert keine Haltequote als kausale Preiswirkung.

Die Live-Supabase-Konfiguration, Migration, produktive Einreichung und Deployment sind nicht aus dieser Entwicklungsumgebung verändert oder geprüft. Betreiber muss den kurzen Live-Test nach Upload durchführen. Release Candidate für den Piloten; kein allgemeiner Produktions-/Security-Freigabenachweis. Automatischer monatlicher Mailversand nicht enthalten.
