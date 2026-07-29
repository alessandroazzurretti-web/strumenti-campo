# Strumenti in campo

App per la sperimentazione agronomica in campo. Funziona come un'app: si installa sulla schermata Home e funziona anche **senza connessione**.

## Strumenti

- **Schemi a Blocchi** — randomizzazione disegni sperimentali (RCB, CRD, quadrato latino), mappa di campo, spostamento parcelle, export immagine e CSV. Ogni randomizzazione ha un **seme**: annotandolo nel protocollo, lo stesso schema si rigenera identico.
- **Calcolo Dosi e Miscele** — dosi per tesi in tutte le unità (compreso LWA), acqua e quantità da preparare, riepilogo a tabella colorata.
- **Taratura Irroratrice** — erogato ugelli su 3 run, media D, portata, controllo conformità ±5%.
- **Scala BBCH** — fasi fenologiche di 32 colture, 1538 stadi (monografia BBCH, 2ª ed. 2001), colture preferite, navigazione per fase.

## Come installare l'app

Apri il sito nel browser del telefono, poi:

### Android (Chrome)
1. Tocca il menu **⋮** in alto a destra.
2. Scegli **"Installa app"** (oppure "Aggiungi a schermata Home").
3. Conferma: l'icona compare tra le app.

In alternativa, tocca il pulsante **📲 Installa l'app** in fondo alla schermata iniziale.

### iPhone / iPad (Safari)
1. Tocca l'icona **Condividi** (il quadrato con la freccia verso l'alto), in basso.
2. Scorri e scegli **"Aggiungi alla schermata Home"**.
3. Tocca **Aggiungi** in alto a destra.

> Su iPhone l'installazione funziona **solo da Safari**, non da Chrome o altri browser.

## Aggiornamenti

L'interruttore **Aggiornamenti automatici** (icona ⚙ nella schermata iniziale) vale ora per tutta l'app, non solo per la home:

- **acceso** (predefinito): la nuova versione si applica da sola appena disponibile;
- **spento**: compare in basso il banner **"Nuova versione disponibile → Aggiorna"** e si aggiorna quando lo tocchi tu.

Il lavoro in corso non si perde in nessuno dei due casi: schema di campo, misure di taratura e dosi vengono salvati sul telefono e ricaricati da soli.

Se qualcosa non si aggiorna: chiudi e riapri l'app, oppure svuota la cache del browser per il sito.

## Note per chi mantiene il progetto

**Versione.** Sta scritta in un posto solo: la costante `CACHE` in `sw.js`. Le pagine la chiedono al service worker e la mostrano nel footer e nelle Impostazioni. Per rilasciare: alza `CACHE` (es. `strumenti-1.9.6`) e ripubblica.

**File.**

| file | contenuto |
|---|---|
| `index.html` | home, elenco strumenti, pannello Impostazioni |
| `schemi-blocchi.html`, `calcolo-dosi.html`, `taratura.html`, `bbch.html` | i quattro strumenti, ognuno autonomo |
| `pwa.js` | installazione, aggiornamenti, versione, Impostazioni — condiviso da tutte le pagine |
| `sw.js` | service worker: precache e strategia offline |
| `scarica-font.sh` | porta i font dentro l'app (vedi sotto) |
| `.github/workflows/font.yml` | lo stesso lavoro, avviabile dalla scheda Actions |
| `DATI-BBCH.md` | provenienza e citazione dei dati fenologici |

**Font.** Le pagine caricano Fraunces e IBM Plex da Google Fonts; il service worker li mette in cache al primo uso, ma quel primo uso deve avvenire online. Per rendere l'app autonoma fin dal primo avvio ci sono due strade.

*Dal telefono, senza terminale:* scheda **Actions** del repository → **Porta i font dentro l'app** → **Run workflow**. GitHub scarica i font, aggiorna le pagine e `sw.js`, alza la versione e salva tutto con un commit. Un minuto circa.

*Da computer, con la rete disponibile:*

```bash
bash scarica-font.sh
```

Scarica i `.woff2` in `font/`, riscrive i `<link>` nelle pagine e aggiunge i file alla precache di `sw.js`.

## Pubblicazione su GitHub Pages

Tutti i percorsi sono relativi (`./`), quindi l'app funziona sia su dominio proprio sia in un sottopercorso `utente.github.io/repo/`, senza modifiche. Il service worker sta nella cartella radice del sito: il suo ambito copre tutta l'app.

Prima di pubblicare:

1. **Alza `CACHE` in `sw.js`** a ogni rilascio, altrimenti i telefoni già installati non vedono le modifiche.
2. **Sistema la licenza dei dati BBCH**: vedi `DATI-BBCH.md`.
3. **Lancia `scarica-font.sh`** se vuoi i font dentro l'app (vedi sotto).

Nota su GitHub Pages: `sw.js` viene servito con una cache di alcuni minuti, quindi un aggiornamento può farsi vedere sui telefoni con un po' di ritardo. È normale; il pulsante *Controlla aggiornamenti* nelle Impostazioni forza la verifica.

**Dati BBCH.** 32 scale, 1538 stadi, estratti dalla monografia BBCH. Provenienza, citazione e stato della licenza sono in `DATI-BBCH.md`: la licenza è il punto aperto prima di rendere pubblico il repository.
