# Guida al Deploy su Vercel

## Prerequisiti

1. Account GitHub (gratuito)
2. Account Vercel (gratuito)

## Passo 1: Carica il codice su GitHub

### Opzione A: Tramite GitHub Web Interface

1. Vai su [github.com](https://github.com) e accedi
2. Clicca su "+" in alto a destra → "New repository"
3. Nome repository: `crm-immobiliare`
4. Scegli "Public" o "Private"
5. NON aggiungere README, .gitignore o licenza (già presenti)
6. Clicca "Create repository"
7. Segui le istruzioni per caricare il codice esistente

### Opzione B: Tramite terminale (se hai git installato)

```bash
cd crm-immobiliare

# Inizializza git
git init

# Aggiungi tutti i file
git add .

# Fai il primo commit
git commit -m "Initial commit - CRM Immobiliare MVP"

# Collega al repository GitHub (sostituisci con il tuo username)
git remote add origin https://github.com/TUO-USERNAME/crm-immobiliare.git

# Carica il codice
git branch -M main
git push -u origin main
```

## Passo 2: Deploy su Vercel

### Metodo Automatico (Consigliato)

1. Vai su [vercel.com](https://vercel.com)
2. Clicca "Sign Up" o "Log In"
3. Scegli "Continue with GitHub"
4. Clicca "Import Project"
5. Seleziona il repository `crm-immobiliare`
6. Vercel rileva automaticamente che è un progetto Next.js
7. Clicca "Deploy"
8. Attendi 2-3 minuti per il completamento

### Metodo CLI

```bash
# Installa Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Segui le istruzioni interattive
# Quando chiede "Link to existing project?" → No
# Quando chiede "What's your project's name?" → crm-immobiliare
# Le altre impostazioni possono rimanere di default

# Per deploy in produzione
vercel --prod
```

## Passo 3: Accedi all'applicazione

Dopo il deploy, Vercel ti fornirà un URL tipo:
- `https://crm-immobiliare.vercel.app`
- oppure `https://crm-immobiliare-xxx.vercel.app`

## Aggiornamenti Futuri

### Deploy automatico

Una volta collegato GitHub a Vercel:
- Ogni push su `main` → Deploy automatico in produzione
- Ogni push su altri branch → Deploy di preview

### Deploy manuale

```bash
# Modifica i file
# ...

# Commit e push
git add .
git commit -m "Descrizione modifiche"
git push

# Vercel deploierà automaticamente
```

## Configurazioni Avanzate (Opzionale)

### Dominio Personalizzato

1. Vai su Vercel Dashboard
2. Seleziona il progetto
3. Vai su "Settings" → "Domains"
4. Aggiungi il tuo dominio personalizzato
5. Segui le istruzioni per configurare i DNS

### Variabili d'Ambiente

1. Vai su Vercel Dashboard
2. Seleziona il progetto
3. Vai su "Settings" → "Environment Variables"
4. Aggiungi le variabili necessarie

### Limiti Piano Gratuito Vercel

- Bandwidth: 100 GB/mese
- Build time: 100 ore/mese
- Serverless function execution: 100 GB-hours
- Numero progetti: Illimitati

Più che sufficienti per un CRM aziendale!

## Troubleshooting

### Errore di build

```bash
# Verifica in locale
npm run build

# Se funziona in locale ma non su Vercel:
# 1. Controlla i log di build su Vercel
# 2. Verifica che tutte le dipendenze siano in package.json
# 3. Assicurati che non ci siano file mancanti
```

### Applicazione lenta

Il primo caricamento può essere più lento (cold start).
Considera:
- Ottimizzazione immagini
- Code splitting
- Caching

### Database in memoria

⚠️ **IMPORTANTE**: Questa versione usa un database in memoria.
I dati vengono persi ad ogni riavvio dell'applicazione.

Per persistenza dati, considera:
- Vercel Postgres (gratuito fino a 256MB)
- Supabase (gratuito fino a 500MB)
- PlanetScale (gratuito fino a 5GB)
- MongoDB Atlas (gratuito fino a 512MB)

## Risorse

- [Documentazione Next.js](https://nextjs.org/docs)
- [Documentazione Vercel](https://vercel.com/docs)
- [Guida Deployment Next.js](https://nextjs.org/docs/deployment)

## Supporto

Per problemi o domande:
- Apri una issue su GitHub
- Consulta la documentazione Vercel
- Contatta il supporto Vercel (piano Pro)
