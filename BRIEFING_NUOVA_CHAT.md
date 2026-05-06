# BRIEFING CRM IMMOBILIARE — STATO AGGIORNATO

## STACK
Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma 5.22.0, Neon PostgreSQL
Cartella: C:\Users\immob\OneDrive\Desktop\crm-immobiliare
GitHub: immobiltrade-ops/crm-immobiliare
URL locale: http://localhost:3000
Vercel: attivo e funzionante (build verde)

## REGOLE DI LAVORO
1. Un problema alla volta, aspetta conferma prima di passare al successivo
2. Usa sempre comandi pronti da incollare in Claude Code CLI
3. Dopo ogni modifica indica quale file hai cambiato
4. Ricorda sempre di ricaricare il browser dopo ogni modifica
5. Non modificare mai file che funzionano già
6. Per Neon PostgreSQL: Error kind Closed e normale, non e bloccante
7. Per deploy Vercel: se non parte automaticamente usare git commit --allow-empty + git push

## COSA FUNZIONA (NON TOCCARE)
- /contatti: lista con filtri, dettaglio con immobili e opportunita collegate via ownedProperties
- /immobili: lista card, dettaglio con sezione Proprietari via PropertyOwner e Opportunita collegate
- /immobili/nuovo: form completo con sezione Permuta viola acceptsExchange + exchangeNotes
- /immobili/[id]: modifica con select proprietario, mostra proprietari e opportunita
- /opportunita: lista con stati in italiano, form con select Contatto e Immobile
- /agenda: calendario settimanale, dettaglio appuntamento modificabile
- /impostazioni: 4 tab: Profilo Agenzia salva su DB, Profilo Utente, Notifiche toggle, Dati e Privacy export CSV
- Vercel build: prisma generate && next build funzionante
- Tutte le API route hanno export const dynamic = 'force-dynamic'

## MODELLI DATABASE
- Contact: dati anagrafici, ruoli[], ownedProperties PropertyOwner[], opportunities, appointments
- Property: dati immobile, acceptsExchange, exchangeNotes, owners PropertyOwner[], opportunities, appointments
- PropertyOwner: tabella ponte Property-Contact con campo quota
- Opportunity: titolo, tipo, stato, valore, contactId, propertyId
- Appointment: titolo, tipo, data, durata, contactId, propertyId
- AgencySettings: nomeAgenzia, indirizzo, citta, cap, provincia, telefono, email, piva, sito, notificaVisita, notificaOpportunita, notificaScadenza
- User: id, email, name, password

## STATI OPPORTUNITA (sempre in italiano)
LEAD: Interesse
NEGOTIATION: In trattativa
PROPOSAL: Proposta
CLOSED_WON: Conclusa - Venduta
CLOSED_LOST: Conclusa - Persa

## RELAZIONI IMPORTANTI
- Un immobile puo avere piu proprietari via PropertyOwner, non ownerId diretto
- Quando si salva un immobile con ownerId nel body, l'API crea un record PropertyOwner
- Contact.ownedProperties NON properties: include con property true
- Property.owners NON owner: include con contact true

## MIGLIORAMENTI FUTURI
- Profilo Utente nelle Impostazioni e ancora statico non legge da DB
- Nome utente in sidebar e hardcoded come Mario Rossi Amministratore
- Manca sistema di autenticazione reale
- Manca codice interno automatico per gli immobili internalCode
- Dashboard: verificare che tutti i contatori siano aggiornati
