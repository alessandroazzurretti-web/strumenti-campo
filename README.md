# Strumenti in campo

App per la sperimentazione agronomica in campo. Si installa sulla schermata Home e funziona anche **senza connessione**.

## Strumenti

- **Schemi a Blocchi** — randomizzazione dei disegni sperimentali (RCB, CRD, quadrato latino), mappa di campo, esclusione celle per campi irregolari, spostamento parcelle a mano, export dell'immagine. Ogni randomizzazione ha un **seme**: riscrivendolo si rigenera lo schema identico, ed è quello che rende la randomizzazione documentabile nel protocollo di prova.
- **Calcolo Dosi e Miscele** — dosi per tesi in tutte le unità (compreso LWA), acqua e quantità da preparare, riepilogo a tabella colorata da salvare come immagine.
- **Taratura Irroratrice** — erogato degli ugelli su 3 run, media D, portata, controllo di conformità ±5%.
- **Scala BBCH** — fasi fenologiche di 32 colture, 1538 stadi, con le note della monografia e le sigle dei gruppi di piante. Colture preferite e navigazione per fase principale.

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

## Schemi a Blocchi: cosa c'è sotto "Avanzate"

Nel form, fuori dal pannello, restano dimensioni del campo, tesi, repliche, disegno, numerazione delle parcelle e forma del campo. Sotto **Avanzate**, chiusa di default:

| opzione | cosa fa |
|---|---|
| Inizia con T1 nella prima parcella | fissa la parcella 1 a tesi 1 · replica I. Comoda per i cartellini, ma quella posizione non è randomizzata |
| Serpentina verticale ↑ / orizzontale → | decide come corre la numerazione **e** come si tagliano i blocchi |
| Evita adiacenze della stessa tesi | vieta due parcelle uguali a contatto di lato (gli angoli sono ammessi) |
| Evita doppi in riga | una sola parcella per tesi in ogni riga |
| Evita doppi in colonna | una sola parcella per tesi in ogni colonna |
| Seme di randomizzazione | vuoto = nuovo seme casuale; riscrivendo un seme si riottiene quello schema |

I default cambiano con il disegno: tutti i vincoli attivi per l'RCB, solo le adiacenze per il CRD. Nel quadrato latino i due vincoli sui doppi sono la definizione del disegno e restano bloccati.

Quando un vincolo è richiesto ma impossibile per geometria — per esempio più repliche che righe, dove qualche ripetizione deve per forza ricadere sulla stessa linea — lo schema viene generato riducendo i doppi al minimo e la cosa è dichiarata sotto le metriche.

## Aggiornamenti

L'interruttore **Aggiornamenti automatici** (icona ⚙ nella schermata iniziale) vale per tutta l'app:

- **acceso** (predefinito): la nuova versione si applica da sola appena disponibile;
- **spento**: compare in basso il banner **"Nuova versione disponibile → Aggiorna"** e si aggiorna quando lo tocchi tu.

Il lavoro in corso non si perde in nessuno dei due casi: schema di campo, misure di taratura e dosi vengono salvati sul telefono e ricaricati da soli.

Se qualcosa non si aggiorna: chiudi e riapri l'app, oppure svuota la cache del browser per il sito.

## Note per chi mantiene il progetto

**Versione.** Sta scritta in un posto solo: la costante `CACHE` in `sw.js`. Le pagine la chiedono al service worker e la mostrano nel footer e nelle Impostazioni. Per rilasciare: alza `CACHE` e ripubblica. Senza alzarla, i telefoni che hanno già l'app installata restano sulla versione vecchia.

**File.**

| file | contenuto |
|---|---|
| `index.html` | home, elenco strumenti, pannello Impostazioni |
| `schemi-blocchi.html`, `calcolo-dosi.html`, `taratura.html`, `bbch.html` | i quattro strumenti, ognuno autonomo |
| `pwa.js` | installazione, aggiornamenti, versione, Impostazioni — condiviso da tutte le pagine |
| `sw.js` | service worker: precache e strategia offline |
| `manifest.webmanifest`, `icon-*.png` | dati e icone per l'installazione |
| `DATI-BBCH.md` | provenienza, citazione e verifica dei dati fenologici |
| `NOTE-VERSIONE-*.md` | cosa è cambiato e perché, versione per versione |
| `scarica-font.sh`, `.github/workflows/font.yml` | facoltativi: portano i font dentro l'app |
| `.nomedia` | impedisce alla Galleria di Android di indicizzare le icone |

**Disegni non esposti.** `schemi-blocchi.html` contiene split-plot e fattoriale a due fattori, funzionanti ma non offerti nella tendina. Per attivarli: rimettere le due `<option>` nel select `#design` (le righe esatte sono in un commento lì accanto) e svuotare la costante `DISEGNI_NASCOSTI`.

**Font.** Le pagine caricano Fraunces e IBM Plex da Google Fonts. Il service worker li mette in cache al primo uso, e siccome per installare l'app serve comunque la rete, dal secondo avvio sono disponibili anche offline. Portarli dentro il repository è quindi **facoltativo**; se un giorno servisse — cache svuotata e primo riavvio senza rete — ci sono due strade: la scheda **Actions** del repository → *Porta i font dentro l'app* → **Run workflow**, oppure `bash scarica-font.sh` da un computer con la rete. Entrambe scaricano i `.woff2` in `font/`, riscrivono i `<link>` nelle pagine e aggiungono i file alla precache.

## Pubblicazione su GitHub Pages

Tutti i percorsi sono relativi (`./`), quindi l'app funziona sia su dominio proprio sia in un sottopercorso `utente.github.io/repo/`, senza modifiche. Il service worker sta nella cartella radice del sito: il suo ambito copre tutta l'app.

Prima di pubblicare, l'unica cosa da ricordare è **alzare `CACHE` in `sw.js`**.

Nota su GitHub Pages: `sw.js` viene servito con una cache di alcuni minuti, quindi un aggiornamento può farsi vedere sui telefoni con un po' di ritardo. È normale; il pulsante *Controlla aggiornamenti* nelle Impostazioni forza la verifica.

**Dati BBCH.** 32 scale, 1538 stadi, ricostruiti dal testo della monografia BBCH (2ª ed., 2001) e verificati a campione sull'edizione del Julius Kühn-Institut. Provenienza, citazione e anomalie note della fonte sono in `DATI-BBCH.md`.
