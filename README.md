# CRM Immobiliare Pro

Sistema gestionale completo per agenzie immobiliari italiane.

## 🚀 Caratteristiche Principali

### Gestione Contatti
- Anagrafiche complete di persone e aziende
- Profilazione esigenze (acquisto, vendita, locazione, investimento)
- Storico completo delle interazioni
- Tag e segmentazione personalizzati
- Gestione privacy e consensi GDPR

### Portafoglio Immobili
- Schede immobili dettagliate con dati tecnici e catastali
- Gestione documentazione (APE, visure, planimetrie)
- Stati e visibilità configurabili
- Gestione mandati ed esclusività
- Gallery fotografiche

### Pipeline Commerciale
- Visualizzazione Kanban delle opportunità
- Fasi configurabili: lead, qualificato, visita, proposta, trattativa, chiusura
- Tracking valore atteso e probabilità
- Collegamenti tra immobili, clienti e agenti

### Agenda e Attività
- Calendario settimanale con attività
- Gestione visite, appuntamenti, chiamate, task
- Storico completo delle attività
- Esiti e feedback strutturati

### Dashboard e Analytics
- KPI operativi in tempo reale
- Statistiche pipeline di vendita
- Monitoraggio conversioni
- Attività recenti

## 🛠️ Tecnologie

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Management**: date-fns

## 📦 Installazione Locale

```bash
# Clona il repository
git clone https://github.com/tuousername/crm-immobiliare.git
cd crm-immobiliare

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 🌐 Deploy su Vercel

### Deploy Automatico

1. Fai push del codice su GitHub
2. Vai su [vercel.com](https://vercel.com)
3. Importa il repository
4. Vercel configurerà automaticamente il deploy

### Deploy con Vercel CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy in produzione
vercel --prod
```

## 📱 Struttura del Progetto

```
crm-immobiliare/
├── app/
│   ├── api/              # API Routes
│   │   ├── contacts/
│   │   ├── properties/
│   │   ├── opportunities/
│   │   ├── activities/
│   │   └── dashboard/
│   ├── contatti/         # Pagina Contatti
│   ├── immobili/         # Pagina Immobili
│   ├── opportunita/      # Pagina Opportunità
│   ├── agenda/           # Pagina Agenda
│   ├── impostazioni/     # Pagina Impostazioni
│   ├── layout.tsx        # Layout principale
│   ├── page.tsx          # Dashboard
│   └── globals.css       # Stili globali
├── components/
│   ├── Sidebar.tsx       # Navigazione laterale
│   └── Header.tsx        # Header con ricerca
├── lib/
│   └── db.ts            # Database simulato
├── types/
│   └── index.ts         # TypeScript types
└── public/              # Assets statici
```

## 🎯 Roadmap

### Fase 1 - MVP (Completato) ✅
- Dashboard con statistiche
- Gestione contatti
- Gestione immobili
- Pipeline opportunità
- Agenda attività

### Fase 2 - Automazioni (Prossimamente)
- [ ] Matching automatico immobile-cliente
- [ ] Notifiche e promemoria
- [ ] Template email e documenti
- [ ] Workflow automatizzati

### Fase 3 - Integrazioni (Prossimamente)
- [ ] Pubblicazione portali immobiliari
- [ ] Integrazione WhatsApp Business
- [ ] Firma elettronica
- [ ] Google Calendar sync

### Fase 4 - Avanzate (Prossimamente)
- [ ] App mobile nativa
- [ ] Database reale (PostgreSQL)
- [ ] Sistema autenticazione
- [ ] Multi-tenant per reti

## 🔒 Sicurezza e Privacy

- Gestione consensi GDPR integrata
- Tracciamento accessi e modifiche
- Mascheramento indirizzi per privacy
- Backup e disaster recovery

## 📄 Licenza

Questo progetto è stato creato per scopi dimostrativi.

## 🤝 Contributi

I contributi sono benvenuti! Per modifiche importanti, apri prima una issue per discutere i cambiamenti proposti.

## 📧 Supporto

Per domande o supporto, contatta: info@crm-immobiliare.it

---

**Nota**: Questo è un prototipo MVP. Per utilizzo in produzione, implementare:
- Database persistente (PostgreSQL/MySQL)
- Sistema di autenticazione sicuro
- Gestione file e upload immagini
- Backup automatici
- SSL/HTTPS
- Rate limiting API
- Logging e monitoring
