# NomadCal

*Vérifié fichier par fichier contre `main` au commit `7d7763a` — 2026-07-05.*

**Calendrier pro pour commercial terrain** — PWA mobile-first (iPhone-first) connectée à iCloud via CalDAV. Agenda hebdomadaire, tâches glissantes, journal de terrain (NomadBook), sync offline-first. Aucune librairie de composants UI.

---

## Stack technique

| Couche | Choix |
|---|---|
| UI | React 18.3.1 — JSX, styles inline (CSS-in-JS vanilla), zéro lib de composants |
| Build | Vite 5.4.1 + `@vitejs/plugin-react` |
| Backend | 2 Vercel Serverless Functions (`api/`) |
| Calendrier | CalDAV iCloud (`caldav.icloud.com`) via proxy serveur |
| Persistance locale | localStorage (events, tâches, notes, settings) + IndexedDB (photos) |
| PWA | Service Worker manuel (`public/sw.js`) |
| Police | Phenomena (TTF embarqué) |
| Hébergement | Vercel — prod : `cal-flow-jade.vercel.app` |

> **Neon (backend planifié, ~fin août)** : mentionné dans la doc projet, **pas encore présent dans le code**. Objectif : remplacer localStorage et régler l'isolation des contextes WKWebView. Roadmap, pas encore une dépendance.

---

## Arborescence réelle (`main`)

```
NomadCal/
├── api/                            # Fonctions serverless Vercel (Node)
│   ├── caldav.js                   # ⚠️ PROXY SERVEUR → iCloud : CORS + tunneling X-HTTP-Method-Override
│   └── feedback.js                 # Log structuré des feedbacks (POST → console.log Vercel)
│
├── src/
│   ├── main.jsx                    # Entrée React + enregistrement Service Worker (update on visibility)
│   ├── App.jsx                     # Orchestration : auth, grille, merge, syncCalDAV/syncCalendar, boîte d'envoi, tâches
│   │
│   ├── components/
│   │   ├── Header.jsx              # Barre nav, statut sync (online/offline), date picker, vues
│   │   ├── LoginScreen.jsx         # Connexion iCloud (email + mot de passe d'application)
│   │   ├── EventForm.jsx           # Formulaire création/édition d'événement (WheelSelect)
│   │   ├── EventPopover.jsx        # Popover d'un event existant (copier / modifier / supprimer)
│   │   ├── EventPopoverPaste.jsx   # Popover de collage d'un event copié (WheelSelect, heure)
│   │   ├── Modal.jsx               # Modal générique + bouton `Btn` réutilisable
│   │   ├── WheelSelect.jsx         # Sélecteur type molette (date/heure), tactile
│   │   ├── NomadTask.jsx           # Tiroir des tâches glissantes (swipe-to-delete, tri urgence)
│   │   ├── NomadBook.jsx           # Journal de terrain : notes (chapitres), périodes, photos, dictée
│   │   ├── Settings.jsx            # Réglages, calendrier défaut, sauvegarde/restauration, toggle debug
│   │   ├── DebugPanel.jsx          # Écran « Debug ICS » (lecture cache, diagnostic récurrence) — off par défaut
│   │   ├── FeedbackButton.jsx      # Bouton feedback flottant (beta users)
│   │   ├── Toast/
│   │   │   ├── Toast.jsx           # Composant toast (type / title / body / durée)
│   │   │   └── ToastContext.jsx    # ToastProvider + pont global `window.__showToast`
│   │   └── icons/                  # 25 icônes SVG maison + index.js (barrel)
│   │
│   ├── services/
│   │   ├── syncService.js          # runSync() : flushQueue → syncCalDAV (orchestrateur, ~12 lignes)
│   │   └── eventActions.js         # deleteEventAction(ev) — helper minimal utilisé par EventPopover
│   │
│   ├── sync/                       # ⭐ Cœur offline-first / écritures
│   │   ├── index.js                # Barrel : ré-exporte queue + pushEvent/deleteEvent + mergeEvents
│   │   ├── pushEvent.js            # 🔒 pushEvent() + deleteEvent() (2 des 4 fonctions sacrées)
│   │   ├── pendingQueue.js         # Boîte d'envoi (loadQueue/enqueueWrite) + tombstones
│   │   └── mergeStrategy.js        # mergeEvents(icloud, local, tombstones) — merge sans perte
│   │
│   └── utils/
│       ├── caldav.js               # ⚠️ CLIENT navigateur : caldavRequest, parseEvents, parseICS,
│       │                           #    expandRecurring, mergeRecurrenceExceptions
│       ├── caldavCalendar.js       # CRUD du calendrier « NomadCal OC » (périodes NomadBook, MKCALENDAR)
│       ├── constants.js            # Palette C, PRIORITY, grille (SLOT_H=56, GRID_H=1344), RECURRENCE_OPTIONS
│       ├── helpers.js              # Dates/heures, load/save localStorage, makeAuthHeader, uKey, slideTasks
│       └── photoStore.js           # « Vestiaire » photos : compression canvas + IndexedDB
│
├── public/
│   ├── sw.js                       # Service Worker (CACHE_VERSION nomadcal-v4… ; assets cache, API jamais interceptée)
│   ├── Phenomena-Bold.ttf
│   └── Phenomena-Regular.ttf
│
├── index.html
├── vite.config.js                  # Plugins react + swVersion (injecte timestamp dans sw.js) ; proxy /api→:3000
├── vercel.json                     # Headers cache + rewrite SPA (`/((?!api/).*)` → index.html)
└── package.json
```

---

## ⚠️ Les deux `caldav.js` — à ne jamais confondre

| Fichier | Rôle | Export |
|---|---|---|
| `api/caldav.js` | **Proxy serveur** Vercel. Reçoit les requêtes du navigateur, les relaie à `caldav.icloud.com`, gère CORS + le **tunneling** des méthodes WebDAV (`X-HTTP-Method-Override` → PROPFIND/REPORT/MKCALENDAR, que Vercel rejette sinon en 405). | `export default handler(req, res)` |
| `src/utils/caldav.js` | **Client navigateur.** Émet les requêtes (`caldavRequest`), parse le XML CalDAV/iCal (`parseCalendars`, `parseEvents`, `parseICS`), développe les récurrences (`expandRecurring`) et fusionne les exceptions `RECURRENCE-ID` (`mergeRecurrenceExceptions`). | fonctions nommées |

**Règle :** `src/utils/caldav.js` appelle **toujours** `/api/caldav?path=…`, **jamais** iCloud en direct (cross-origin impossible depuis le navigateur).

---

## Les 4 « fonctions sacrées » (signatures intouchables)

| Fonction | Emplacement réel |
|---|---|
| `pushEvent(ev, auth, invalidateCache=true, queueable=true)` | `src/sync/pushEvent.js` |
| `deleteEvent(ev, auth, queueable=true)` | `src/sync/pushEvent.js` |
| `syncCalendar(calHref)` | `src/App.jsx` |
| `syncCalDAV()` | `src/App.jsx` |

---

## Sync & offline-first

- **Boîte d'envoi** (`${email}_cf_pending`) : toute écriture hors-ligne est mise en file (`pendingQueue.js`), rejouée au retour réseau.
- **`runSync()`** (`syncService.js`) : `flushQueue(auth)` → `syncCalDAV()`.
- **Déclencheurs** : démarrage app (300 ms), retour réseau (`window.online`), appui manuel.
- **Tombstones** : ids supprimés localement, pour empêcher un event effacé de « ressusciter » tant qu'iCloud n'a pas confirmé (`pendingQueue.js` + `mergeStrategy.js`).
- **Récurrence** : `expandRecurring` développe les séries (BYDAY / BYMONTHDAY / UNTIL / COUNT / EXDATE, DST-safe) ; `mergeRecurrenceExceptions` applique les occurrences modifiées (`RECURRENCE-ID`) au rendu.
- **Garde-fous anti-effacement** : une synchro qui revient sans aucun calendrier/event conserve le cache.

---

## Données (localStorage / IndexedDB)

| Donnée | Stockage | Clé |
|---|---|---|
| Auth (email + mot de passe d'app) | localStorage global | `cf_auth` |
| Événements (cache) | localStorage préfixé | `${prefix}cf_events` |
| Tâches | localStorage préfixé | `${prefix}cf_tasks` |
| Calendriers | localStorage préfixé | `${prefix}cf_calendars` |
| Paramètres | localStorage préfixé | `${prefix}cf_settings` |
| File offline | localStorage | `${email}_cf_pending` |
| Tombstones | localStorage | `${email}_cf_tombstones` |
| Notes NomadBook | localStorage global | `nb_notes` |
| Périodes (cache) | localStorage global | `nb_periods_cache` |
| Synthèses | localStorage global | `nb_syntheses` |
| Photos | IndexedDB | base `nomadcal-photos` |

**Préfixe user** : `${nomAvant@}${JJMMAAAA}_` (helpers.js `userPrefix`/`uKey`), avec migration silencieuse des anciennes clés au 1er login. `cf_auth` n'est **jamais** préfixée. La sauvegarde manuelle (Settings) couvre 6 clés (notes/tâches/réglages), **pas** `cf_events` (redondants avec iCloud).

---

## Design — palette ORCHARD (extrait de `constants.js`)

```
bg #fdf8f0 · surface #ffffff · accent #2B5A9E (bleu acier) · ink #0F1D2B
gold #F5C97A · green #2d7a4f · red #c0392b · muted #5a6e7f  (+ card, subtle, *Light…)
```

- Police **Phenomena** (TTF embarqué) sur titres et labels.
- **25 icônes SVG maison** (`components/icons/`, exportées via `index.js`) : viewBox 24×24, couleur passée en prop (défaut selon l'usage : muted/green/accent), `strokeWidth` **2.2–2.4** sur les récentes. Pas d'emoji de navigation.

---

## Déploiement

```bash
npm run dev     # Vite + proxy /api → localhost:3000
npm run build   # → dist/
```

Vercel : fonctions dans `api/`, SPA statique dans `dist/`. **Aucune variable d'environnement requise** — le proxy relaie le header `Authorization` de l'utilisateur (mot de passe d'application iCloud, généré sur appleid.apple.com). Stockage `cf_auth` **non chiffré** (localStorage).
