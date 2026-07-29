#!/usr/bin/env bash
# Strumenti in campo · porta i font dentro l'app.
#
# Perché: le pagine caricano Fraunces, IBM Plex Sans e IBM Plex Mono da
# fonts.googleapis.com. Il service worker li mette in cache al primo uso, ma
# il primo uso deve avvenire online: chi installa l'app e la apre per la prima
# volta in campo senza rete vede i font di sistema, e le immagini esportate
# escono con un altro carattere. Con i font dentro l'app il problema sparisce.
#
# Uso: lancialo dalla cartella del progetto, con rete disponibile.
#   bash scarica-font.sh
#
# Cosa fa:
#   1. scarica il CSS di Google Fonts e i .woff2 in ./font/
#   2. riscrive font/font.css con percorsi locali
#   3. sostituisce il <link> a Google Fonts nelle 5 pagine
#   4. aggiunge i file a ASSETS in sw.js
# È idempotente: rilanciarlo non fa danni.

set -euo pipefail

CSS_URL="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

mkdir -p font
echo "· scarico il CSS…"
curl -sS -A "$UA" "$CSS_URL" -o font/font.css

echo "· scarico i .woff2…"
python3 - <<'PY'
import re, os, subprocess
css = open('font/font.css', encoding='utf-8').read()
urls = sorted(set(re.findall(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', css)))
if not urls:
    raise SystemExit('Nessun woff2 trovato nel CSS: controlla la connessione.')
for u in urls:
    nome = u.rsplit('/', 1)[-1]
    dest = os.path.join('font', nome)
    if not os.path.exists(dest):
        subprocess.run(['curl', '-sS', u, '-o', dest], check=True)
    css = css.replace(u, nome)
open('font/font.css', 'w', encoding='utf-8').write(css)
print(f'  {len(urls)} file scaricati in font/')
PY

echo "· aggiorno le pagine…"
python3 - <<'PY'
import re, glob
pagine = ['index.html', 'taratura.html', 'calcolo-dosi.html', 'schemi-blocchi.html', 'bbch.html']
locale = '<link rel="stylesheet" href="font/font.css">'
for p in pagine:
    s = open(p, encoding='utf-8').read()
    if locale in s:
        continue
    s = re.sub(r'<link rel="preconnect" href="https://fonts\.googleapis\.com">\n', '', s)
    s = re.sub(r'<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\n', '', s)
    s = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">', locale, s)
    open(p, 'w', encoding='utf-8').write(s)
    print(f'  {p}')

# i font entrano nella precache: disponibili al primo avvio, anche offline
import os
files = sorted(f for f in os.listdir('font') if f.endswith(('.woff2', '.css')))
sw = open('sw.js', encoding='utf-8').read()
blocco = '\n'.join(f"  './font/{f}'," for f in files)
if './font/font.css' not in sw:
    sw = sw.replace("  './pwa.js',", "  './pwa.js',\n" + blocco)
    open('sw.js', 'w', encoding='utf-8').write(sw)
    print('  sw.js: font aggiunti alla precache')
PY

echo
echo "Fatto. Ricordati di alzare il numero di versione in sw.js (CACHE) prima di pubblicare."
