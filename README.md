# NomadCal

**Calendrier pro pour commercial terrain**  
PWA mobile-first connectée à iCloud via CalDAV. Agenda hebdomadaire, tâches glissantes, journal de terrain (NomadBook) et sync offline-first — sans aucune dépendance UI.

---

## Stack technique

| Couche | Choix |
|---|---|
| UI | React 18.3.1 — JSX inline, CSS-in-JS vanilla, aucune librairie de composants |
| Build | Vite 5.4.1 + `@vitejs/plugin-react` |
| Backend | 2 Vercel Serverless Functions (`api/`) |
| Calendrier | CalDAV iCloud (caldav.icloud.com) via proxy CORS |
| Persistance locale | localStorage (events, tâches, settings) + IndexedDB (photos) |
| PWA | Service Worker manuel (`public/sw.js`) |
| Police | Phenomena (TTF bundled) |

---

## Architecture

```
NomadCal/
├── api/
│   ├── caldav.js          proxy CORS Vercel → iCloud (export default handler)
│   └── feedback.js        log structuré des feedbacks utilisateur
│
├── src/
│   ├── main.jsx           point d'entrée React + enregistrement Service Worker
│   ├── App.jsx            (~1 010 lignes) orchestration centrale : auth, grille,
│   │                      sync CalDAV, boîte d'envoi offline, gestion tâches
│   │
│   ├── components/
│   │   ├── EventForm.jsx      formulaire création/édition événement
│   │   ├── EventPopover.jsx   popover contextuel (copier/modifier/supprimer)
│   │   ├── Header.jsx         barre navigation, statut sync, date picker
│   │   ├── LoginScreen.jsx    écran d'authentification (email + App Password iCloud)
│   │   ├── Settings.jsx       paramètres, calendrier par défaut, export/import JSON
│   │   ├── Modal.jsx          composant modal générique + Btn
│   │   ├── NomadBook.jsx      journal de terrain : notes, périodes, dictée vocale
│   │   ├── TaskDrawer.jsx     tiroir latéral des tâches glissantes
│   │   ├── FeedbackButton.jsx bouton feedback flottant
│   │   └── icons/             18 composants SVG (strokeWidth 1.5, bleu #2B5A9E + or #F5C97A)
│   │
│   ├── services/
│   │   ├── syncService.js     runSync() : flushQueue → syncCalDAV (12 lignes)
│   │   └── eventActions.js    helpers purs : copyEvent, updateEvent, deleteEventAction,
│   │                          setConfirmed, setTentative — seul deleteEventAction
│   │                          est utilisé (dans EventPopover)
│   │
│   └── utils/
│       ├── caldav.js          ⚠️ CLIENT navigateur — caldavRequest(), parseCalendars(),
│       │                      parseEvents(), parseICS(), expandRecurring()
│       │                      ≠ api/caldav.js qui est le proxy serveur
│       ├── caldavCalendar.js  CRUD CalDAV dédié au calendrier NomadCal OC :
│       │                      checkCalendarExists, createCalendar, CRUD périodes,
│       │                      syncNoteCount, autoLabel
│       ├── constants.js       tokens design (C), grille (SLOT_H=56, GRID_H=1344),
│       │                      PRIORITY, RECURRENCE_OPTIONS, SYNTHESE_DEADLINES
│       ├── helpers.js         date/time, load/save localStorage, makeAuthHeader,
│       │                      slideTasksToToday, rruleToFr
│       └── photoStore.js      compressImage (canvas, max 1600px, q=70%),
│                              savePhoto/getPhotoURL/deletePhoto (IndexedDB),
│                              requestPersistentStorage
│
├── public/
│   ├── sw.js              Service Worker v4-20260603
│   └── Phenomena-*.ttf    police embarquée
│
├── index.html
├── vite.config.js
└── vercel.json
```

### ⚠️ Les deux fichiers `caldav.js`

| Fichier | Rôle | Export principal |
|---|---|---|
| `api/caldav.js` | **Proxy serveur** Vercel — reçoit les requêtes du navigateur, les retransmet à `caldav.icloud.com` avec les bons headers CORS | `export default async function handler(req, res)` |
| `src/utils/caldav.js` | **Client navigateur** — parse le XML CalDAV/iCalendar, étend les récurrences | `caldavRequest`, `parseCalendars`, `parseEvents`, `expandRecurring` |

Ne pas les confondre : `src/utils/caldav.js` appelle toujours `/api/caldav?path=…`, jamais iCloud directement.

---

## Fonctionnalités

### Agenda ✅

- Vue semaine 7 jours, grille horaire 0h–24h (SLOT_H = 56 px/heure, GRID_H = 1 344 px)
- Scroll initial positionné à **midi** (`GRID_DEFAULT_SCROLL = 12 × 60` dans `constants.js`)
- Événements positionnés par `layoutEvents()` avec gestion des chevauchements (colonnes)
- Bannière « Jour entier » au-dessus de la grille ✅
- Indicateur heure actuelle (trait rouge) ✅
- Navigation semaine par swipe horizontal (seuil 50 px, tolérance verticale 80 px) ✅
- Numéro de semaine ISO (commence lundi) ✅
- **Tap long (450 ms) sur zone vide → ouverture EventForm** avec pré-remplissage créneau ✅
- Tap long sur un événement → popover (copier / modifier / supprimer) ✅
- Tap court sur zone vide → 🔧 **bug** (voir section Limitations)
- Copier-coller un événement (presse-papier local + tap long pour coller) ✅
- Rappel 48 h avant un événement « à confirmer » via `window.confirm` ✅

### Événements CalDAV ✅

- Création, modification, suppression avec sync iCloud
- Champs : prénom/nom (compose le SUMMARY), rue/CP/ville, email, téléphone, notes, calendrier, statut, récurrence
- Statuts : Confirmé / À confirmer (tentative)
- Récurrence : Quotidienne, hebdomadaire, bi-hebdomadaire, mensuelle (date fixe ou Nᵉ jour), annuelle, Lun–Ven — expansion `BYDAY`, `BYMONTHDAY`, `UNTIL`, `COUNT`, `EXDATE` ✅
- Mode édition récurrence (cet événement / suivants / tous) : 🔧 **UI présente mais non prise en compte** (App.jsx ignore `editMode` lors du save)
- Alerte, invitation e-mail, lien visio, pièce jointe, partage : ⏳ marqués « à venir » dans l'UI

### Tâches glissantes ✅

- Stockées uniquement en localStorage (`cf_tasks`), pas dans CalDAV
- Champs : titre, notes, priorité (high/normal/low), date d'apparition, échéance, récurrence
- **Glissement automatique à aujourd'hui** à minuit si non faites (`slideTasksToToday`) ✅
- Récurrence propre (recrée la tâche) vs glissement (décalage pur)
- Validation → crée un event `done-${id}` dans la grille (heure de validation) ✅
- Vibration haptique sur validation ✅
- Tiroir latéral (TaskDrawer) avec swipe-to-delete ✅

### NomadBook — Journal de terrain ✅

- Périodes de rapport sauvegardées dans le calendrier NomadCal OC sur iCloud (VEVENT all-day avec catégorie `RAPPORT`) ✅
- Alarmes CalDAV intégrées dans l'ICS : 7 jours avant + veille ✅
- Notes texte classées en 13 chapitres (Client, Marché, Concurrence, Nouveautés, Logistique, Propositions, Performances, Alertes, Réassorts, Opérations en cours, Saisonnalité, Demandes de dédicace, Outils) ✅
- **Photos sur les notes** : ajout depuis galerie ou appareil photo, compression canvas (max 1 600 px, qualité 70 %), stockage IndexedDB ✅
- Édition d'une note existante avec gestion des photos (conservation / suppression sélective) ✅
- Dictée vocale (Web Speech API, langue fr-FR) ✅
- Swipe-to-delete sur notes et périodes ✅
- Copier les notes de la période courante (texte brut structuré par chapitres) ✅
- Brainstorming IA (AIChat) : ⏳ **non opérationnel** (voir Limitations)
- Export PDF : ⏳ marqué « à venir »
- Archives des synthèses : ⏳ marqué « à venir »
- NomadFeed : ⏳ `alert("NomadFeed — bientôt disponible !")` — non implémenté

### Sync & Offline ✅

- **Boîte d'envoi** (`${email}_cf_pending`) : toute écriture hors-ligne est mise en file, rejouée au retour réseau
- `runSync()` (syncService.js) : `flushQueue(auth)` → `syncCalDAV()`
- Déclencheurs sync : démarrage app (300 ms), retour réseau (`window.online`), appui manuel
- Garde-fous anti-effacement : si sync retourne 0 events/calendriers → cache conservé
- `syncCalendar(calHref)` : sync légère d'un seul calendrier (dernière heure), utilisée après création
- Service Worker : HTML network-first / assets cache-first / API jamais interceptée

### UX mobile ✅

- `height: 100dvh` (respecte les safe areas iOS)
- `env(safe-area-inset-top)` dans EventForm header
- `requestPersistentStorage()` pour protéger IndexedDB des purges iOS
- Toast générique (DOM injection) pour les confirmations légères
- `localStorage.setItem("last_feedback_prompt", ...)` anti-spam 1× /jour

---

## Données

| Donnée | Stockage | Clé |
|---|---|---|
| Auth (email + App Password) | localStorage global | `cf_auth` |
| Événements CalDAV (cache) | localStorage préfixé | `${prefix}_cf_events` |
| Tâches | localStorage préfixé | `${prefix}_cf_tasks` |
| Calendriers | localStorage préfixé | `${prefix}_cf_calendars` |
| Paramètres | localStorage préfixé | `${prefix}_cf_settings` |
| File offline | localStorage | `${email}_cf_pending` |
| Notes NomadBook | localStorage global | `nb_notes` |
| Périodes (cache) | localStorage global | `nb_periods_cache` |
| Synthèses | localStorage global | `nb_syntheses` |
| Photos | IndexedDB | base `nomadcal-photos` |

**Préfixe user** : `${partieAvant@email}${JJMMAAAA}\_` — migration silencieuse des anciennes clés non préfixées au premier login.

**Périodes NomadBook** : stockées comme VEVENT all-day dans le calendrier iCloud NomadCal OC (tag `CATEGORIES:NOMADCAL,RAPPORT`). Les **notes** restent uniquement en localStorage — elles ne sont pas répliquées sur iCloud.

---

## Design — Palette ORCHARD

```js
bg:      "#fdf8f0"  // crème chaud
surface: "#ffffff"
accent:  "#2B5A9E"  // bleu acier
ink:     "#0F1D2B"  // encre profonde
gold:    "#F5C97A"  // or nomade
green:   "#2d7a4f"
red:     "#c0392b"
muted:   "#5a6e7f"
```

- Police **Phenomena** (TTF embarqué) sur tous les titres et labels
- 18 icônes SVG custom (dossier `icons/`) : strokeWidth 1.5, traits bleu + or, aucun emoji de navigation
- Arrondi 10–16 px selon le contexte, bordures 1–1.5 px

---

## Roadmap

### V1 — Base terrain (✅ livré)
- ✅ Agenda semaine CalDAV iCloud
- ✅ Tâches glissantes
- ✅ NomadBook (notes + photos + périodes + dictée)
- ✅ Offline-first (boîte d'envoi)
- ✅ PWA iOS installable

### V1.5 — Corrections & finitions (🔧 en cours)
- 🔧 Corriger bug `ev` undefined sur tap court cellule vide
- 🔧 Corriger mapping status TENTATIVE → `"pending"` vs `"tentative"` (perte après sync)
- 🔧 Implémenter réellement les modes édition récurrence (cet événement / suivants / tous)
- 🔧 Corriger comportement feedback `window.location.href = mail` (navigue hors PWA)
- Purger le dead code : `EventPopover_OLD`, `EventDetail`, 4 exports inutilisés d'`eventActions.js`

### V2 — Premium
- ⏳ Module Frais (forfaits km/repas/nuitée) — UI partielle dans Settings
- ⏳ Alertes sur événements (VALARM)
- ⏳ Invitation e-mail
- ⏳ Lien visio
- ⏳ Pièce jointe

### V3 — Intelligence
- ⏳ Brainstorming IA (AIChat via proxy sécurisé avec clé Anthropic côté serveur)
- ⏳ Export PDF rapport terrain
- ⏳ Archives et historique des synthèses
- ⏳ NomadFeed
- ⏳ Recherche IA de nouveau créneau après annulation

---

## Limitations connues (version interne)

### 🔧 Bug — Tap court sur cellule vide (App.jsx ~l. 719 et l. 740)

Les handlers `onTouchEnd` et `onClick` du fond de grille utilisent la variable `ev` qui appartient au scope `layoutEvents(dayEvs).map(ev => {...})` défini plus bas dans le même rendu JSX. En dehors de ce map, `ev` est **undefined**.

Résultat : un tap court sur une zone vide ouvre le popover avec `ev=undefined` → `EventPopoverNew` retourne `null` immédiatement (`if (!ev || !position) return null`). En pratique, **tap court sur zone vide = rien ne se passe**.

### 🔧 Perte du statut « à confirmer » après sync iCloud

`src/utils/caldav.js` : `TENTATIVE` est mappé vers `"pending"` (ligne 116).  
`App.jsx::pushEvent()` : vérifie `ev.status === "tentative"` pour émettre `STATUS:TENTATIVE`.  
Un événement récupéré d'iCloud avec `status="pending"` sera réécrit `STATUS:CONFIRMED`.  
De plus, les checks d'affichage (`isPending = ev.status === "tentative"` dans EventPopover.jsx l. 22 et EventDetail) ne détectent pas les events venant d'iCloud.  
**Correction** : unifier sur une seule valeur, par exemple `"tentative"` partout.

### 🔧 Mode édition récurrence non fonctionnel

EventForm.jsx expose « Cet événement / Suivants / Tous » et envoie `editMode` dans le payload. App.jsx ignore `editMode` dans le handler `onSave` et met toujours à jour l'occurrence unique.

### ⏳ Brainstorming IA inaccessible et non fonctionnel

`NomadBook.jsx` contient un composant `AIChat` qui appelle `https://api.anthropic.com/v1/messages` **sans header `x-api-key`** → 401 en production. De plus, aucun bouton UI ne déclenche `chatOpen=true` (le div « Brainstorming » affiche « à venir » et n'a pas de `onClick`).

### ⚠️ Feedback auto-email navigue hors PWA

L'`useEffect` (~l. 415, App.jsx) ouvre le lien `mailto:` via `window.location.href`, ce qui quitte l'app PWA sur iOS.

### ⚠️ Scroll initial à midi, pas à 8 h

`GRID_DEFAULT_SCROLL = 12 * 60 = 720` dans `constants.js` → l'app s'ouvre positionnée sur **12 h**, pas 8 h.

### Dead code dans App.jsx

`EventPopover_OLD` (l. 229–252) et `EventDetail` (l. 254–281) sont définis mais jamais utilisés. `eventActions.js` exporte 5 helpers dont seul `deleteEventAction` est réellement appelé (dans `EventPopover.jsx`).

---

## Déploiement

```bash
# Développement
npm run dev       # Vite dev server + proxy /api → localhost:3000

# Production
npm run build     # → dist/
```

Hébergé sur **Vercel** : fonctions serverless dans `api/`, SPA statique dans `dist/`.  
Aucune variable d'environnement requise pour la version free (le proxy CalDAV transfère le header `Authorization` de l'utilisateur).

---

## Authentification

L'app utilise un **App Password iCloud** (pas le mot de passe Apple ID principal).  
Génération : [appleid.apple.com](https://appleid.apple.com) → Sécurité → Mots de passe spécifiques aux apps.  
Stockage : `localStorage["cf_auth"]` = `{ email, appPassword }` — **non chiffré**.

---

*README interne — version publique disponible sur demande (sans la section Limitations).*
