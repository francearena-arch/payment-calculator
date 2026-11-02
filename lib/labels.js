const labels = {"mailAccepted":["PDF erstellt. E-Mail zum Versand angenommen; Zustellung noch nicht bestätigt.", "PDF créé. Envoi accepté ; livraison non encore confirmée.", "PDF created. Email accepted for sending; delivery not yet confirmed.", "PDF creato. Invio accettato; consegna non ancora confermata."],"mailDelivered":["PDF erstellt. E-Mail an den Empfangsserver zugestellt.", "PDF créé. E-mail remis au serveur destinataire.", "PDF created. Email delivered to the recipient mail server.", "PDF creato. E-mail consegnata al server destinatario."],"mailFailed":["PDF erstellt. Die E-Mail konnte nicht zugestellt werden.", "PDF créé. L’e-mail n’a pas pu être livré.", "PDF created. Email could not be delivered.", "PDF creato. Impossibile consegnare l’e-mail."],"mailConfiguration":["PDF erstellt. E-Mail-Versand ist noch nicht korrekt konfiguriert.", "PDF créé. L’envoi d’e-mails n’est pas encore correctement configuré.", "PDF created. Email delivery is not configured correctly yet.", "PDF creato. Invio e-mail non ancora configurato correttamente."],"retryMail":["PDF-Versand wiederholen", "Réessayer l’envoi du PDF", "Retry PDF email", "Riprova invio PDF"],
 customer:["Kundenname", "Nom du commerçant", "Merchant name", "Nome dell’esercente"],
 account:["Salesforce Account-ID", "ID de compte Salesforce", "Salesforce Account ID", "ID account Salesforce"],
 opportunity:["Salesforce Opportunity-ID", "ID d’opportunité Salesforce", "Salesforce Opportunity ID", "ID opportunità Salesforce"],
 optional:['Optional','Facultatif','Optional','Facoltativo'],
 context:["Angaben zum Merchant", "Informations sur le commerçant", "Merchant details", "Dati dell’esercente"],
 channel:['Sales Channel','Canal de vente','Sales channel','Canale di vendita'],
 purpose:['Einsatzzweck','Objectif','Purpose','Finalità'],
 acquisition:['Frontbook','Frontbook','Frontbook','Frontbook'],
 retention:['Retention','Rétention','Retention','Retention'],
 industry:['Branche','Secteur','Industry','Settore'],
 competitor:["Competitor auswählen", "Sélectionner le concurrent", "Select competitor", "Seleziona il concorrente"],
 other:['Anderer Anbieter','Autre fournisseur','Other provider','Altro fornitore'],
 select:['Bitte auswählen','Veuillez sélectionner','Please select','Seleziona'],
 quoteDate:["Datum der Wettbewerbsofferte", "Date de l’offre concurrente", "Competitor quote date", "Data dell’offerta concorrente"],
 export:["JSON-Datei herunterladen", "Télécharger le fichier JSON", "Download JSON file", "Scarica il file JSON"],
 reset:["Neuen Vergleich starten", "Commencer une nouvelle comparaison", "Start new comparison", "Avvia un nuovo confronto"],
 resetConfirm:['Alle Eingaben verwerfen und neu beginnen?','Effacer toutes les données et recommencer ?','Discard all inputs and start again?','Eliminare tutti i dati e ricominciare?'],
 required:["Bitte Kundenname, Sales Channel, Einsatzzweck und Wettbewerber angeben und die Berechnung vervollständigen.", "Renseignez le nom du commerçant, le canal de vente, l’objectif et le concurrent, puis complétez le calcul.", "Enter the merchant name, sales channel, purpose and competitor, then complete the calculation.", "Inserisci il nome dell’esercente, il canale di vendita, la finalità e il concorrente, quindi completa il calcolo."],
 invalidDate:['Bitte ein gültiges Offertdatum angeben, das nicht in der Zukunft liegt.','La date de l’offre doit être valide et ne pas être future.','Enter a valid quote date that is not in the future.','Inserisci una data valida non futura.'],
 exported:['JSON-Datei erstellt.','Fichier JSON créé.','JSON file created.','File JSON creato.'],
 pdfReady:['PDF erstellt.','PDF créé.','PDF created.','PDF creato.'],
 pdfFailure:['PDF konnte nicht erstellt werden. Bitte erneut versuchen.','Impossible de créer le PDF. Réessayez.','Could not create PDF. Please try again.','Impossibile creare il PDF. Riprova.'],
 mailFailure:['PDF erstellt. Der automatische E-Mail-Versand ist fehlgeschlagen. PDF erneut erstellen, um den Versand zu wiederholen.','PDF créé. L’envoi automatique a échoué. Recréez le PDF pour réessayer.','PDF created. Automatic email delivery failed. Create the PDF again to retry.','PDF creato. Invio automatico non riuscito. Ricrea il PDF per riprovare.'],
 busy:['PDF wird erstellt …','Création du PDF …','Creating PDF …','Creazione PDF …'],
 footer:['Indikative Vergleichsrechnung · Keine Speicherung im Calculator','Comparaison indicative · Aucune sauvegarde dans le calculateur','Indicative comparison · No storage in the calculator','Confronto indicativo · Nessun salvataggio nel calcolatore'],
 title:["Nexi vs. Wettbewerb", "Nexi vs concurrence", "Nexi vs. competitor", "Nexi vs concorrente"],
 inputs:["Eingaben & Annahmen", "Données saisies et hypothèses", "Inputs & assumptions", "Dati inseriti e ipotesi"],
 results:["Kostenvergleich pro Jahr", "Comparaison des coûts annuels", "Annual cost comparison", "Confronto dei costi annui"],
 offer:['Angebot','Offre','Offer','Offerta'],
 id:["Vergleichs-ID", "ID de comparaison", "Comparison ID", "ID del confronto"],
 created:['Erstellt','Créé le','Created','Creato'],
 notes:["Hinweise & Grenzen", "Remarques et limites", "Notes & limitations", "Note e limiti"],
 true:['Ja','Oui','Yes','Sì'],false:['Nein','Non','No','No'],
 model:["Preismodell", "Modèle tarifaire", "Pricing model", "Modello tariffario"],
 difference:["Differenz (CHF)", "Différence (CHF)", "Difference (CHF)", "Differenza (CHF)"],
 exampleData:["Beispieldaten", "Données d’exemple", "Example data", "Dati di esempio"],
 providerExample:["Zahlungsanbieter", "Prestataire de paiement", "Payment provider", "Fornitore di servizi di pagamento"],
};
export const label=(key,lang='de')=>labels[key]?.[['de','fr','en','it'].indexOf(lang)]||key;
export const competitors=['Worldline','Wallee','Planet/Datatrans','Adyen','Stripe','Payrexx','SumUp','SwiPay','Privapay','Other'];
export const channels=['Remote Sales','Field Sales','Key Account','Retention'];
export const industries=['Gastro','Hospitality','Beauty & Cosmetics','Health Services','Specialty Retail','Other'];


// Translate display labels only. Stored industry IDs stay stable for JSON/reporting.
const industryLabels={
 'Gastro':['Gastronomie','Restauration','Food service','Ristorazione'],
 'Hospitality':['Hotellerie','Hôtellerie','Hospitality','Settore alberghiero'],
 'Beauty & Cosmetics':['Beauty & Kosmetik','Beauté et cosmétique','Beauty & cosmetics','Bellezza e cosmetica'],
 'Health Services':['Gesundheitsdienstleistungen','Services de santé','Health services','Servizi sanitari'],
 'Specialty Retail':['Fachhandel','Commerce spécialisé','Specialty retail','Commercio specializzato'],
 'Other':['Andere Branche','Autre secteur','Other','Altro settore']
};
export const industryLabel=(value,lang='de')=>industryLabels[value]?.[['de','fr','en','it'].indexOf(lang)]||value;
