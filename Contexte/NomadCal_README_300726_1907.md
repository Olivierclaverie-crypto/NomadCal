# README MOTEUR — NOMADCAL
*SOURCE UNIQUE du technique permanent : vision, ossature d'archi, sacrées, doctrine terrain. Le détail EXHAUSTIF (fichier par fichier) vit dans le **README racine du repo**, certifié contre `main` @ `7d7763a`. Pour l'avancement → ÉTAT ; pour le plan des lots → ROADMAP ; pour la méthode de collab → INSTRUCTIONS ; pour le récit des chantiers scellés → JOURNAL (GitHub).*

---

## VISION
NomadCal est une PWA de **calendrier + tâches + notes**, pensée **iPhone-first et terrain-first**, pour le travail de représentant commercial d'Olivier — librairies, chaînes culturelles (Cultura, Fnac, Furet du Nord), espaces culturels d'hypermarchés, nord de la France et région parisienne.

Principe directeur : **« ton agenda t'appartient — le filou libre ».** La complexité reste **invisible** pour l'utilisateur. Vue semaine native (absente du Calendrier iPhone d'Apple), tâches glissables, notes intégrées, et à terme calcul de frais par géolocalisation.

Olivier travaille **100 % sur iPhone, sur le terrain**, et privilégie la compréhension à la vitesse.

## LES 3 MODULES
- **Calendrier** — le cœur : grille semaine, récurrence, sync CalDAV/iCloud.
- **NomadTask** — tâches glissantes (report automatique au jour courant).
- **NomadBook** — journal de terrain : notes (texte + **photos** + dictée vocale), rangées par **périodes**, dont on tire un **rapport de fin de période** (specs et lot → ROADMAP, lot R4).

## 🎨 CHARTE VISUELLE
➡️ **Tout le visuel obéit à la CHARTE ORCHARD** (`Orchard_CHARTE_GRAPHIQUE_*`, document transverse : Projet + `Contexte/`) — 9 couleurs (olives, corail, crèmes, encres), typo Phenomena deux voix, icônes stroke par taille. **L'ancien duo bleu `#2B5A9E` + or `#F5C97A` des icônes est OBSOLÈTE** ; le mode opératoire de migration (au fil de l'eau, sans big-bang) est stipulé DANS la charte. Polices : `public/fonts/` (Light 300 · Regular 400 · Bold 700).

## OSSATURE D'ARCHI (détail complet → README racine)
```
api/
  caldav.js         ⚠️ PROXY SERVEUR → iCloud (CORS + tunneling X-HTTP-Method-Override)
  feedback.js       log des feedbacks
src/
  App.jsx           orchestration — contient syncCalendar() + syncCalDAV() (2 sacrées)
  sync/             ⭐ CŒUR OFFLINE-FIRST / ÉCRITURE — ZONE SACRÉE
    pushEvent.js       🔒 pushEvent() + deleteEvent() (2 sacrées) + pushOccurrenceException() (voisine, #35)
    pendingQueue.js    boîte d'envoi + tombstones
    mergeStrategy.js   mergeEvents() sans perte + roundTrippedMasters (#38)
    index.js           barrel
  components/       Header, LoginScreen, EventForm, EventPopover, EventPopoverPaste,
                    Modal, WheelSelect, NomadBook, NomadTask, Settings, DebugPanel,
                    FeedbackButton · Toast/ · icons/ (25 SVG maison + index)
  utils/
    caldav.js         ⚠️ CLIENT navigateur (≠ api/caldav.js) — caldavRequest, parseEvents,
                      expandRecurring, mergeRecurrenceExceptions
    caldavCalendar.js CRUD calendrier « NomadCal OC » (périodes, MKCALENDAR, syncNoteCount)
    constants.js      palette C, grille (SLOT_H=56, GRID_H=1344), SYNTHESE_DEADLINES
    helpers.js        dates, load/save localStorage, makeAuthHeader
    photoStore.js     vestiaire photos (compression canvas max 1600px q70% + IndexedDB)
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
- **Doctrine sur les sacrées :** la meilleure modif est souvent **à côté**, pas dedans (fonction voisine, ex. `pushOccurrenceException`). Une variable à la fois STRICT dans cette zone.

## ARCHITECTURE — POINTS DE VIGILANCE
- **Isolation des contextes WKWebView** : chaque URL / raccourci PWA = un bac localStorage séparé. Cause racine des pertes de données. Résolu structurellement par **Neon** uniquement. Corollaire : **preview ≠ prod** (bacs séparés).
- **Cache PWA iOS** : sert l'ancien code après un deploy. Toujours force-refresh Safari avant de soupçonner le code.
- **Récurrence** : `expandRecurring` déplie les séries en occurrences ; la fusion des exceptions (`mergeRecurrenceExceptions`) est **au rendu**, pas dans la donnée (le brut montre toujours master + exception).
- **DST-proofing** : instant absolu (`getTime()`) pour UNTIL ; helpers de date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (produit des dates UTC → off-by-one). Format UNTIL cible = fin de journée locale convertie UTC + `Z` (ex. `UNTIL=20260930T215959Z`). `INTERVAL=1` jamais écrit (conformité Apple).
- **Périodes NomadBook — identité et filtre (acquis C #39 / C-bis #40)** : la clé de liaison note↔période = **`period.href` COMPLET** (`/1012673262/calendars/nomadcal-oc/rapport-<fin>.ics`), JAMAIS l'UID ni la forme courte. `updatePeriodEvent` **préserve l'UID** (paramètre, plus dérivé du basename). Les **8 sites** de filtre sont alignés sur `href`. Recréer une période = nouvel UID mais MÊME href slug (dérivé de la date de fin) → le filtre reste stable.
- **Les périodes ne passent PAS par `mergeStrategy.js`** — tuyauterie propre : `caldavCalendar.js` + `nb_periods_cache` (⚠️ non couvert par le backup 6 clés).
- **ETag/If-Match** : omis en V1 mono-device (dette tracée) → **OBLIGATOIRE avant version desk** (write-write race multi-device).

## 🧭 DOCTRINE TERRAIN (les réflexes quotidiens — récit complet → JOURNAL)
1. **Le brut PROPFIND est le SEUL juge.** Export client (ICS iCal/macOS) = copie du cache, peut mentir.
2. **Rendu ≠ stockage.** Un défaut d'affichage n'implique pas une donnée corrompue (et inversement).
3. **Preview ≠ prod** = bacs localStorage séparés (WKWebView). Tester données/migrations sur le BON bac, après force-refresh.
4. **Cache iCal par-appareil**, désynchronisé indépendamment. Ne JAMAIS supprimer un fantôme suspect depuis iCal sans preuve au brut qu'aucune ressource réelle ne vit derrière.
5. **iCloud 503 / « verrouillé » = observation suspendue.** Event créé pendant = né corrompu, à jeter. Vérifier qu'iCloud répond avant de recréer des cas de test.
6. **Web Inspector : vérifier titre/URL AVANT d'inspecter** (la boussole). Un fix qui « ne marche pas » → suspecter la CIBLE (mauvaise preview, mauvais bac, mauvaise session) avant le code.
7. **Clés localStorage PRÉFIXÉES par l'utilisateur** (préfixe variable) → `Object.keys(localStorage)` d'abord, jamais supposer `cf_events` nu.
8. **Web Inspector — pièges** : la recherche ment sur les gros XML (lire à l'œil) ; requêtes CalDAV tunnelées en **POST** vers `/api/caldav` ; repère d'un event = sa ligne `SUMMARY:` ; jumeaux distingués par `UID:` ; sur un PUT test on surveille le champ ciblé, pas l'etag.
9. **Cas de test : Apple natif, dans `ZZ-TEST-REC`.** Jamais WeekCal, jamais l'agenda pro.
10. **Prouver au brut avant de graver une cause ou une cible** — le timonier inclus. Le doute s'inscrit dans le brief, ne se grave pas. L'objection du capitaine est un garde-fou.
11. **« Tous les sites » n'est jamais sûr sans grep hors de la zone évidente** (leçon C-bis : le 8ᵉ site oublié).
12. **Le CODE passe en prod au merge ; pas les DONNÉES.** Corriger des données = geste séparé (export/corriger/restaurer), réversible, prouvé à l'écran.
13. **Migration par restauration > migration par code** (zéro code jetable, Neon réécrira).
14. **Ne jamais deviner la forme d'une clé** : la relever sur un élément qui S'AFFICHE (terrain-first).
15. **Reverter `4c2d5cc` (#31) = INTERDIT** (a tout amené en prod ; #32 jamais en prod).

## STACK (résumé — détail dans README racine)
React 18 + Vite · 2 Vercel Serverless Functions (`api/`) · CalDAV iCloud via proxy · localStorage (events/tâches/notes/settings) + IndexedDB (photos) · Service Worker manuel. **Prod : `cal-flow-jade.vercel.app`.** Repo : `Olivierclaverie-crypto/NomadCal`. Calendriers iCloud : `ZZ-TEST-REC` (tests) · `nomadcal-oc` (périodes NomadBook).
> **Neon** (backend planifié, ~fin août) : roadmap, **pas encore dans le code**. Réglera l'isolation WKWebView. Ligne produit : à Neon, les périodes deviennent des objets **backend NC** ; iCloud = simple fenêtre.

## ROADMAP
➡️ **Toute la planification (lots batchés, brainstorms, ordre) vit dans le moteur ROADMAP.** Ici seulement le cap : **V1** = calendrier pro solide + fonction rapport NomadBook · **V2** = frais + géolocalisation · **V3** = IA (complexité invisible) · **NomadSuite** (hub & spokes) → VISION (GitHub).
