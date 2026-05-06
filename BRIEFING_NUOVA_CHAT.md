# BRIEFING CRM IMMOBILIARE — STATO AGGIORNATO

## STACK
Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma 5.22.0, Neon PostgreSQL
Cartella: C:\Users\immob\OneDrive\Desktop\crm-immobiliare
GitHub: immobiltrade-ops/crm-immobiliare
URL locale: http://localhost:3000
Vercel: attivo e funzionante (build verde)

## REGOLE DI LAVORO
1. Un problema alla volta, aspetta conferma prima di passare al successivo
2. Fornisci sempre file completi da incollare in VS Code (Ctrl+A, Canc, incolla, Ctrl+S)
3. Dopo ogni modifica indica quale file hai cambiato
4. Prima di ricaricare il browser lanciare SEMPRE "npm run dev" nel terminale
5. Non modificare mai file che funzionano già
6. Per Neon PostgreSQL: Error kind Closed è normale, non è bloccante
7. Per deploy Vercel: se non parte automaticamente usare git commit --allow-empty + git push
8. Su Windows PowerShell: usare "code nomefile" per aprire file con parentesi quadre nel percorso
9. Su Windows PowerShell: il comando grep non esiste, usare Select-String
10. Per modificare file: sempre aprire con "code percorso/file", mai usare heredoc << EOF

## COSA FUNZIONA (NON TOCCARE)
- /contatti: lista con filtri, dettaglio con immobili e opportunità collegate via ownedProperties
- /immobili: lista card, dettaglio con sezione Proprietari via PropertyOwner e Opportunità collegate
- /immobili/nuovo: form completo con Permuta + internalCode
- /immobili/[id]: modifica con select proprietario, mostra proprietari e opportunità, campo internalCode
- /opportunita: lista con stati in italiano, form con select Contatto e Immobile
- /agenda: calendario settimanale, dettaglio appuntamento modificabile
- /impostazioni: 4 tab funzionanti:
  - Profilo Agenzia: salva su DB via /api/impostazioni
  - Utenti: lista con ruoli, aggiunta/modifica/eliminazione via /api/utente
  - Notifiche: toggle salvano su DB
  - Dati e Privacy: export CSV contatti e immobili
- Dashboard: contatori corretti, pipeline vendite, attività recenti con contatto e immobile
- Sidebar: nome e ruolo dinamici dal primo utente AMMINISTRATORE nel DB
- Vercel build: prisma generate && next build funzionante
- Tutte le API route hanno export const dynamic = 'force-dynamic'

## MODELLI DATABASE
- Contact: dati anagrafici, ruoli[], ownedProperties PropertyOwner[], opportunities, appointments
- Property: dati immobile, acceptsExchange, exchangeNotes, internalCode, owners PropertyOwner[], opportunities, appointments
- PropertyOwner: tabella ponte Property-Contact con campo quota
- Opportunity: titolo, tipo, stato, valore, contactId, propertyId
- Appointment: titolo, tipo, data, durata, contactId, propertyId
- AgencySettings: nomeAgenzia, indirizzo, citta, cap, provincia, telefono, email, piva, sito, notificaVisita, notificaOpportunita, notificaScadenza
- User: id, email, name, password, ruolo (AMMINISTRATORE / AGENTE / SEGRETERIA)

## CAMPO INTERNALCODE
- Formato: prime 3 lettere città (maiuscolo) + prezzo in migliaia (es. GAL320, CAM90)
- Generato automaticamente in POST e PUT di /api/properties/route.ts e /api/properties/[id]/route.ts
- Modificabile manualmente dal form — se lasciato vuoto viene rigenerato
- Visibile nel dettaglio immobile come etichetta grigia font-mono

## API UTENTI (/api/utente)
- GET: restituisce lista completa utenti
- POST: crea nuovo utente (email obbligatoria, ruolo default AGENTE)
- PUT: aggiorna utente esistente (richiede id nel body)
- DELETE: elimina utente per id (protetto: non elimina l'unico utente rimasto)

## STATI OPPORTUNITA (sempre in italiano)
LEAD: Interesse
NEGOTIATION: In trattativa
PROPOSAL: Proposta
CLOSED_WON: Conclusa - Venduta
CLOSED_LOST: Conclusa - Persa

## RELAZIONI IMPORTANTI
- Un immobile può avere più proprietari via PropertyOwner, non ownerId diretto
- Quando si salva un immobile con ownerId nel body, l'API crea un record PropertyOwner
- Contact.ownedProperties NON properties: include con property true
- Property.owners NON owner: include con contact true
- Appointment: campi in italiano (titolo, tipo, data, durata) — NON title/type/scheduledDate

## PROSSIMI PASSI
- Autenticazione reale con NextAuth.js (login/logout, sessioni, protezione route)
- Dashboard: collegamento diretto alle sezioni dai contatori