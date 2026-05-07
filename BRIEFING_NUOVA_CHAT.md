# BRIEFING CRM IMMOBILIARE — STATO AGGIORNATO

## STACK
Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma 5.22.0, Neon PostgreSQL
Cartella: C:\Users\immob\OneDrive\Desktop\crm-immobiliare
GitHub: immobiltrade-ops/crm-immobiliare
URL locale: http://localhost:3000
URL produzione: https://crm-immobiliare-theta.vercel.app
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
11. Dopo modifiche alla cartella .next corrotta: Remove-Item -Recurse -Force .next poi npm run dev

## COSA FUNZIONA (NON TOCCARE)
- /login: pagina di login con email e password, gestita da NextAuth v4
- /setup: pagina primo accesso — funziona solo se nessun admin ha ancora una password
- /contatti: lista con filtri, dettaglio con immobili e opportunità collegate
- /immobili: lista card, dettaglio con Proprietari via PropertyOwner e Opportunità
- /immobili/nuovo: form completo con Permuta + internalCode
- /immobili/[id]: modifica con select proprietario, mostra proprietari e opportunità, campo internalCode
- /opportunita: lista con stati in italiano, form con select Contatto e Immobile
- /agenda: calendario settimanale, dettaglio appuntamento modificabile
- /impostazioni: 4 tab funzionanti:
  - Profilo Agenzia: salva su DB via /api/impostazioni
  - Utenti: lista con ruoli e password, aggiunta/modifica/eliminazione via /api/utente
  - Notifiche: toggle salvano su DB
  - Dati e Privacy: export CSV contatti e immobili
- Dashboard: contatori corretti, pipeline vendite, attività recenti
- Sidebar: nome e ruolo dinamici dalla sessione NextAuth, pulsante logout
- Middleware: protegge tutte le route tranne /login, /setup, /api/auth, /api/setup
- Vercel build: verde, variabili NEXTAUTH_URL e NEXTAUTH_SECRET configurate

## AUTENTICAZIONE
- Libreria: NextAuth v4 con CredentialsProvider
- File config: lib/authOptions.ts
- Route: app/api/auth/[...nextauth]/route.ts
- Password: hashate con bcrypt (12 rounds)
- Sessione: JWT
- Middleware: middleware.ts — blocca accesso senza sessione valida
- Providers: components/Providers.tsx — SessionProvider nel layout
- Login page: app/login/page.tsx
- Setup page: app/setup/page.tsx + app/api/setup/route.ts

## MODELLI DATABASE
- Contact: dati anagrafici, ruoli[], ownedProperties PropertyOwner[], opportunities, appointments
- Property: dati immobile, acceptsExchange, exchangeNotes, internalCode, owners PropertyOwner[], opportunities, appointments
- PropertyOwner: tabella ponte Property-Contact con campo quota
- Opportunity: titolo, tipo, stato, valore, contactId, propertyId
- Appointment: titolo, tipo, data, durata, contactId, propertyId
- AgencySettings: nomeAgenzia, indirizzo, citta, cap, provincia, telefono, email, piva, sito, notificaVisita, notificaOpportunita, notificaScadenza
- User: id, email, name, password (bcrypt), ruolo (AMMINISTRATORE / AGENTE / SEGRETERIA)

## CAMPO INTERNALCODE
- Formato: prime 3 lettere città (maiuscolo) + prezzo in migliaia (es. GAL320, CAM90)
- Generato automaticamente in POST e PUT di /api/properties/route.ts e /api/properties/[id]/route.ts
- Modificabile manualmente dal form — se lasciato vuoto viene rigenerato

## API UTENTI (/api/utente)
- GET: restituisce lista completa utenti (senza password)
- POST: crea nuovo utente (email obbligatoria, password hashata se fornita)
- PUT: aggiorna utente (password aggiornata solo se fornita)
- DELETE: elimina utente per id (protetto: non elimina l'unico utente rimasto)

## STATI OPPORTUNITA (sempre in italiano)
LEAD: Interesse
NEGOTIATION: In trattativa
PROPOSAL: Proposta
CLOSED_WON: Conclusa - Venduta
CLOSED_LOST: Conclusa - Persa

## RELAZIONI IMPORTANTI
- Un immobile può avere più proprietari via PropertyOwner, non ownerId diretto
- Contact.ownedProperties NON properties: include con property true
- Property.owners NON owner: include con contact true
- Appointment: campi in italiano (titolo, tipo, data, durata)

## PROSSIMI PASSI
- Permessi per ruolo: Segreteria e Agente con accesso limitato rispetto ad Amministratore
- Dashboard: collegamento diretto alle sezioni dai contatori
- Possibilità per ogni utente di cambiare la propria password dal profilo