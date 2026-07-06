# README MOTEUR — NOMADCAL
*Vision produit, ossature d'archi et points de vigilance. Le détail technique EXHAUSTIF (fichier par fichier) vit dans le **README racine du repo**, certifié contre `main` @ `7d7763a`. Ici = le squelette + le « pourquoi ». Pour l'avancement → ÉTAT ; pour la méthode de collab → INSTRUCTIONS.*

---

## VISION
NomadCal est une PWA de **calendrier + tâches + notes**, pensée **iPhone-first et terrain-first**, pour le travail de représentant commercial d'Olivier — librairies, chaînes culturelles (Cultura, Fnac, Furet du Nord), espaces culturels d'hypermarchés, nord de la France et région parisienne.

Principe directeur : **« ton agenda t'appartient — le filou libre ».** La complexité reste **invisible** pour l'utilisateur. Vue semaine native (absente du Calendrier iPhone d'Apple), tâches glissables, notes intégrées, et à terme calcul de frais par géolocalisation.

Olivier travaille **100 % sur iPhone, sur le terrain**, et privilégie la compréhension à la vitesse.

## LES 3 MODULES
- **Calendrier** — le cœur : grille semaine, récurrence, sync CalDAV/iCloud.
- **NomadTask** — tâches glissantes (report automatique au jour courant).
- **NomadBook** — journal de terrain : notes (texte + **photos** + dictée vocale), rangées par **périodes**, dont on tire un **rapport de fin de période**. Voir ci-dessous.

## NOMADBOOK — FONCTION RAPPORT
NomadBook capitalise les observations de tournée (client, marché, concurrence, alertes, outils) et produit, en fin de période, une **synthèse mise en forme, envoyée au chef puis archivée**.

**Ce qui existe déjà (code réel) :** `photoStore.js` stocke les photos en **IndexedDB** (compression canvas, max 1600px, q70%) → les photos sont de vrais binaires, pas des blobs volatils (le `blob:` n'est que l'URL d'affichage). `caldavCalendar.js` gère le CRUD des **périodes** + `syncNoteCount`. `constants.js` porte `SYNTHESE_DEADLINES`.

**Specs prouvées à la main (07/2026) — à implémenter (roadmap V1) :**
1. Les notes portent des **photos**, pas que du texte → le rapport doit les tirer via `getPhotoURL` (IndexedDB).
2. Le rapport doit être un **format conteneur** (PDF) : texte + image dans un seul document.
3. **Archivage 12 mois, accès par lien par user** → le PDF léger est le bon véhicule.
4. **Convention de nommage** auto-classante (tri chronologique) + **taille photo** à régler dans la mise en page.
5. **Purge des notes après envoi CONFIRMÉ** (pas avant), avec l'archive comme filet anti-perte. ⚠️ Pas encore automatisé — aujourd'hui purge manuelle.
6. **Icône « état vide »** → remplacer l'emoji générique par une SVG maison du dossier `icons/` (charte : strokeWidth 1.5, bleu `#2B5A9E` + or `#F5C97A`). *Cosmétique — FERMÉ jusqu'à finition V1.*

## OSSATURE D'ARCHI (détail complet → README racine)
```
api/
  caldav.js         ⚠️ PROXY SERVEUR → iCloud (CORS + tunneling X-HTTP-Method-Override)
  feedback.js       log des feedbacks
src/
  App.jsx           orchestration — contient syncCalendar() + syncCalDAV() (2 sacrées)
  sync/             ⭐ CŒUR OFFLINE-FIRST / ÉCRITURE
    pushEvent.js       🔒 pushEvent() + deleteEvent() (2 sacrées)
    pendingQueue.js    boîte d'envoi + tombstones
    mergeStrategy.js   mergeEvents() sans perte
    index.js           barrel
  components/       Header, LoginScreen, EventForm, EventPopover, EventPopoverPaste,
                    Modal, WheelSelect, NomadBook, NomadTask, Settings, DebugPanel,
                    FeedbackButton · Toast/ · icons/ (25 SVG maison + index)
  utils/
    caldav.js         ⚠️ CLIENT navigateur (≠ api/caldav.js) — caldavRequest, parseEvents,
                      expandRecurring, mergeRecurrenceExceptions
    caldavCalendar.js CRUD calendrier « NomadCal OC » (périodes, MKCALENDAR)
    constants.js      palette C, grille (SLOT_H=56, GRID_H=1344), SYNTHESE_DEADLINES
    helpers.js        dates, load/save localStorage, makeAuthHeader
    photoStore.js     vestiaire photos (compression + IndexedDB)
public/  sw.js · police embarquée
```
➡️ **Arborescence exhaustive + rôle de chaque fichier : README racine du repo (certifié `main` @ `7d7763a`).**

## ⚠️ LES DEUX `caldav.js` — NE JAMAIS CONFONDRE
- `api/caldav.js` = **proxy serveur** Vercel → iCloud (CORS + tunneling des méthodes WebDAV).
- `src/utils/caldav.js` = **client navigateur** (parse, expand, merge).
- **Règle :** le client appelle TOUJOURS `/api/caldav?path=…`, jamais iCloud en direct.

## 4 FONCTIONS SACRÉES — signatures intouchables + EMPLACEMENT RÉEL
- `pushEvent(ev,auth,invalidateCache=true,queueable=true)` → **`src/sync/pushEvent.js`**
- `deleteEvent(ev,auth,queueable=true)` → **`src/sync/pushEvent.js`**
- `syncCalendar(calHref)` → **`src/App.jsx`**
- `syncCalDAV()` → **`src/App.jsx`**
*(Elles NE sont PAS dans `caldav.js` — erreur d'une ancienne doc, corrigée après certification 05/07.)*

## ARCHITECTURE — POINTS DE VIGILANCE
- **Isolation des contextes WKWebView** : chaque URL / raccourci PWA = un bac localStorage séparé. Cause racine des pertes de données. Résolu structurellement par **Neon** uniquement.
- **Cache PWA iOS** : sert l'ancien code après un deploy. Toujours force-refresh Safari avant de soupçonner le code.
- **Récurrence** : `expandRecurring` déplie les séries en occurrences ; la fusion des exceptions (`mergeRecurrenceExceptions`) est **au rendu**, pas dans la donnée (le brut montre toujours master + exception).
- **DST-proofing** : instant absolu (`getTime()`) pour UNTIL ; helpers de date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (produit des dates UTC → off-by-one).

## STACK (résumé — détail dans README racine)
React 18 + Vite · 2 Vercel Serverless Functions (`api/`) · CalDAV iCloud via proxy · localStorage (events/tâches/notes/settings) + IndexedDB (photos) · Service Worker manuel. **Prod : `cal-flow-jade.vercel.app`.** Repo : `Olivierclaverie-crypto/NomadCal`.
> **Neon** (backend planifié, ~fin août) : roadmap, **pas encore dans le code**. Réglera l'isolation WKWebView.

## ROADMAP
- **V1** — calendrier pro solide : récurrence couche 2 (lecture ✅, écriture à venir), drag & drop, vues jour/mois/année, **fonction rapport NomadBook**, complétion Settings, cosmétique.
- **V2** — frais + géolocalisation comme base de calcul.
- **V3** — IA (assistance, complexité invisible). Direction A (consommer l'IA) vs B (s'exposer en MCP) non tranchée.
