# BRIEFING CRM IMMOBILIARE — STATO AGGIORNATO

## STACK CRM
Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma 5.22.0, Neon PostgreSQL
Cartella: C:\Users\immob\OneDrive\Desktop\crm-immobiliare
GitHub: immobiltrade-ops/crm-immobiliare
URL locale: http://localhost:3001
URL produzione: https://crm-immobiliare-theta.vercel.app
Vercel: attivo e funzionante (build verde)

## STACK APP SEGNALAZIONI
Next.js 14 (no TypeScript), Tailwind, Supabase (Postgres)
Cartella: C:\Users\immob\OneDrive\Desktop\segnalazioni
URL produzione: https://segnalazioni-delta.vercel.app
Database: Supabase — https://knbbigtbxjdxilyjvdhu.supabase.co
Tabelle principali:
- segnalazioni: immobili con proprietario, indirizzo, stato_lead, prezzo ecc.
- appuntamenti: calendario con data_ora, agente, segnalazione_id, stato
- profili: utenti con ruolo (admin/agente)
Campo chiave: stato_lead — valori: nuovo, da_contattare, contattato, in_trattativa, acquisito, perso

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
11. Dopo .next corrotta: Remove-Item -Recurse -Force .next poi npm run dev

## COSA FUNZIONA NEL CRM (NON TOCCARE)
- /login: pagina di login con email e password, gestita da NextAuth v4
- /setup: pagina primo accesso — funziona solo se nessun admin ha ancora una password
- /contatti: lista con filtri, dettaglio con immobili e opportunità collegate
- /immobili: lista card, dettaglio con Proprietari via PropertyOwner e Opportunità
- /immobili/nuovo: form completo con Permuta + internalCode
- /immobili/[id]: modifica con select proprietario, mostra proprietari e opportunità, campo internalCode
- /opportunita: lista con stati in italiano, form con select Contatto e Immobile
- /agenda: calendario settimanale, dettaglio appuntamento modificabile
- /impostazioni: 4 tab: Profilo Agenzia, Utenti con password e ruoli, Notifiche, Export CSV
- Dashboard: contatori corretti, pipeline vendite, attività recenti
- Sidebar: nome e ruolo dalla sessione NextAuth, pulsante logout
- Middleware: protegge tutte le route tranne /login, /setup, /api/auth, /api/setup

## AUTENTICAZIONE CRM
- Libreria: NextAuth v4 con CredentialsProvider
- File config: lib/authOptions.ts
- Route: app/api/auth/[...nextauth]/route.ts
- Password: hashate con bcrypt (12 rounds)
- Sessione: JWT
- Middleware: middleware.ts
- Providers: components/Providers.tsx

## MODELLI DATABASE CRM (Neon/Prisma)
- Contact: id, tipo, nome, cognome, ragioneSociale, email, telefono, cellulare, indirizzo, citta, cap, provincia, codiceFiscale, partitaIva, ruoli[], interessi[], budgetMin, budgetMax, note, consensoPrivacy, consensoMarketing
- Property: id, titolo, tipo, stato, prezzo, superficie, locali, bagni, piano, indirizzo, citta, cap, provincia, descrizione, caratteristiche[], acceptsExchange, exchangeNotes, internalCode, note
- PropertyOwner: tabella ponte Property-Contact con campo quota
- Opportunity: id, titolo, tipo, stato, valore, contactId, propertyId, note
- Appointment: id, titolo, tipo, data, durata, contactId, propertyId, note
- AgencySettings: nomeAgenzia, indirizzo, citta, cap, provincia, telefono, email, piva, sito, notificaVisita, notificaOpportunita, notificaScadenza
- User: id, email, name, password (bcrypt), ruolo (AMMINISTRATORE / AGENTE / SEGRETERIA)

## CAMPO INTERNALCODE
- Formato: prime 3 lettere città (maiuscolo) + prezzo in migliaia (es. GAL320, CAM90)
- Generato automaticamente in POST e PUT di /api/properties/route.ts e /api/properties/[id]/route.ts
- Modificabile manualmente dal form — se lasciato vuoto viene rigenerato

## STATI OPPORTUNITA CRM (sempre in italiano)
LEAD: Interesse
NEGOTIATION: In trattativa
PROPOSAL: Proposta
CLOSED_WON: Conclusa - Venduta
CLOSED_LOST: Conclusa - Persa

## RELAZIONI IMPORTANTI CRM
- Un immobile può avere più proprietari via PropertyOwner, non ownerId diretto
- Contact.ownedProperties NON properties: include con property true
- Property.owners NON owner: include con contact true
- Appointment: campi in italiano (titolo, tipo, data, durata)

## INTEGRAZIONI DA SVILUPPARE (una alla volta)

### Integrazione 1 — Segnalazione → Opportunità CRM (PROSSIMA)
Quando stato_lead diventa "acquisito" nella tabella segnalazioni di Supabase:
- Creare automaticamente un Contatto nel CRM con i dati del proprietario
- Creare automaticamente una Opportunità nel CRM collegata al contatto
Meccanismo: Supabase Database Webhook su UPDATE tabella segnalazioni → API endpoint CRM su Vercel
DA FARE PRIMA: verificare struttura colonne tabella segnalazioni su Supabase

### Integrazione 2 — Proprietari → Contatti CRM
Tutti i proprietari delle segnalazioni visibili come contatti nel CRM
Sincronizzazione: valutare webhook in tempo reale o pulsante manuale

### Integrazione 3 — Appuntamenti → Agenda CRM
Appuntamenti dell'app segnalazioni visibili nel CRM, collegati a contatto/opportunità

## FLUSSO DI LAVORO TARGET
1. Funzionario inserisce segnalazione nell'app Segnalazioni
2. Agente lavora il contatto fino a "Acquisito"
3. In automatico appare nel CRM come nuova opportunità
4. Appuntamenti visibili in entrambi i sistemi

## NOTE TECNICHE
- I due database sono separati (Supabase vs Neon/Prisma) — comunicazione via API
- Singleton PrismaClient obbligatorio nel CRM
- Neon URL con connection_limit=1&pool_timeout=0
- Usare sempre (variable ?? []).map() per evitare crash

## PROSSIMI PASSI CRM
- Permessi per ruolo: Segreteria e Agente con accesso limitato
- Dashboard: collegamento diretto alle sezioni dai contatori