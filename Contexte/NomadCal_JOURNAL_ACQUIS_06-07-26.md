# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. On NE le relit PAS à chaque session — on vient le consulter quand on est coincé. Il grossit ; c'est normal. Pour l'avancement en cours → fichier « État du projet ». Pour la méthode → Instructions. Pour l'archi → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## 🗺️ RÉCONCILIATION DOC ↔ ARCHI RÉELLE — SCELLÉE (06-07-26)
*Le cousin a certifié le README racine du repo, fichier par fichier, contre `main` @ `7d7763a`. Deuxième dérive doc attrapée — cette fois sur l'archi.*
- **Le README racine est désormais la SOURCE D'ARCHI CERTIFIÉE** (arborescence exhaustive, prouvée sur `main`). Le README **moteur** porte l'**ossature** et **renvoie** au racine pour le détail — forme dite **A+** (moteur = vision + doctrine + squelette d'archi ; racine = détail exhaustif). Raison d'être de A+ : le moteur est dans le contexte à chaque session, donc il doit porter l'ossature ; recopier les 200 lignes du racine recréerait de la divergence.
- **⚠️ DÉCOUVERTE MAJEURE — le dossier `src/sync/`** (`pushEvent.js`, `pendingQueue.js`, `mergeStrategy.js`, `index.js`) = **cœur offline-first / ÉCRITURE**. Absent de TOUS les moteurs jusqu'ici. C'est le terrain de la couche 2 écriture qu'on s'apprêtait à ouvrir → on aurait briefé le cousin sur le mauvais fichier.
- **4 sacrées LOCALISÉES (prouvé, `git`-en-main) :**
  - `pushEvent` / `deleteEvent` → **`src/sync/pushEvent.js`** (`:5` et `:88`). Grep sur `src/utils/caldav.js` = **aucune occurrence**.
  - `syncCalendar` / `syncCalDAV` → **`src/App.jsx`** (`:329` et `:368`).
  - ➡️ L'ancienne doc les associait à `caldav.js` : **FAUX, corrigé**.
- **Corrections de comptage/inventaire :** `components/icons/` = **25** SVG (l'ancienne doc disait 18). Composants oubliés des anciens moteurs : **`WheelSelect`** et le sous-dossier **`Toast/`** (Toast.jsx + ToastContext → `window.__showToast`). L'ancien README citait **`TaskDrawer.jsx` qui n'existe pas** → le vrai est `NomadTask.jsx`.
- **3 moteurs touchés par cet événement :** README moteur (réécrit en A+, `06-07-26`) · Instructions (sacrées relocalisées + `src/sync/` + casse `Contexte/` majuscule harmonisée + vocabulaire deux jauges gravé, `06-07-26`) · ce Journal.
- **Boîte privée « fonction rapport NomadBook » vidée dans le README moteur** (specs prouvées à la main les 05-06/07 : photos IndexedDB via `getPhotoURL`, format conteneur PDF, archivage 12 mois/lien, nommage auto-classant, purge après envoi confirmé — pas encore automatisée, icône état-vide charte `icons/`).

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
*Vérifiée commit par commit sur `main`. Corrige une erreur du Journal (ancienne mention « tunneling via #32 »).*
- **Un seul merge a tout amené en prod : #31 (`4c2d5cc`).** Il porte ENSEMBLE : tunneling (`e1e7763`), PR-a (`70e595e`), PR-b (`349ade1`) ET α (`9b0a126`).
- **#32 (`b73e5c0`) n'a JAMAIS touché la prod.** Merge `main → branche` (resync de la branche de travail), côté branche.
- **⚠️ CONSÉQUENCE CRITIQUE :** reverter `4c2d5cc` (#31) **détruirait aussi** synchro + PR-a + PR-b. **INTERDIT.** Pour retirer α, cible = **`9b0a126` SEUL** — mais α et tunneling vivent dans la MÊME fonction `caldavRequest` → `git revert` propre impossible → **retrait MANUEL des lignes du timeout**, en gardant le tunneling.

## ⏱️ α (TIMEOUT 20 s, `9b0a126`) — LIVE, SPÉCULATIF, À NEUTRALISER AVANT L'ÉCRITURE
*Anatomie clouée par le cousin (05-07-26). α n'est PAS « en pause » : il est en prod depuis #31.*
- **Quoi :** `AbortController` + `setTimeout(…, 20000)` dans `caldavRequest` (`src/utils/caldav.js`), point de passage UNIQUE de toutes les requêtes CalDAV client. Sur `AbortError` → `{status:408}`. Client seul (le proxy `api/caldav.js` n'a AUCUN timeout).
- **Ce qu'il borne :** TOUTES les requêtes — PROPFIND/REPORT (lecture) **ET PUT / DELETE / MKCALENDAR** (écriture).
- **Spéculatif (PROUVÉ) :** ne corrige AUCUN problème constaté. Le « 0 event » était le **405** (→ tunneling), pas un hang. Le hang WKWebView est théorique, jamais observé ici.
- **Inoffensif en LECTURE** (avortement → 408 → re-sync).
- **⚠️ DANGEREUX en ÉCRITURE :** un PUT réussi côté iCloud mais lent (>20 s) est avorté → cru échoué → ré-émis → **doublon / écrasement iCloud**. Aggrave la fabrique à doublons visée par la couche 2 écriture.
- **À TRANCHER avant le 1er PUT :** **A** = retirer α (retrait manuel, garder le tunneling) · **B** = raffiner α (timeout sur lecture SEULE, jamais PUT/DELETE/MKCALENDAR). **Reco cousin : B**. Décision capitaine, PR isolée.

---

## ✅ RESTRUCTURATION DE LA DOC — SCELLÉE (05-07-26)
- **4 fichiers moteurs :** Instructions (socle) · README (archi) · État (établi vivant, court) · Journal/Acquis (ce classeur). Le déjà-fait scellé a quitté l'État → reprise en 10 s.
- **Double jeu Projet + GitHub :** chaque moteur en deux copies — connaissance du Projet + repo dossier `Contexte/` à la racine (isolé de `src/`). Les deux naissent du MÊME téléchargement → ne divergent pas (Olivier tient les deux stylos, rien ne s'écrit tout seul).
- **MAJ à l'ÉVÉNEMENT** (un merge scellé), jamais au calendrier. Règle d'or = MAJ **seulement les fichiers réellement touchés**. Horodatage `JJ-MM-AA` dans le nom = repérage + sauvegarde locale versionnée.
- **Geste apprenti :** Claude livre horodaté → Olivier télécharge (= sauvegarde) → upload Projet + copier-coller GitHub. Le cousin ne range pas les tiroirs.
- **Mémoire du Projet :** on la laisse vivre (préférences durables), jamais source de vérité. Conflit → les 4 moteurs gagnent.
- **Différé :** essaimer les items transposables des Instructions vers les autres contextes projet.

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
*En prod via le merge #31 (`4c2d5cc`) — voir « Lignée main ».*
### PR-a (`70e595e`) — lecture multi-VEVENT
- **Cause racine (PROUVÉE) :** `parseICS` ne capturait que le 1er VEVENT ; iCloud livre master + exceptions dans la MÊME ressource.
- **Fix :** `parseEvents` découpe le `calendar-data` en TOUS ses blocs VEVENT (regex `/g`), un `parseICS` par bloc. `expandRecurring` + 4 sacrées intouchés.
### PR-b (`349ade1`) — fusion master + exceptions
- **Fix :** `mergeRecurrenceExceptions` + 2 helpers dans `src/utils/caldav.js` ; 1 ligne dans `App.jsx` au point d'affichage `allEvs`.
  - **Instant absolu :** `RECURRENCE-ID` → `getTime()` local (DST-safe). **Aucun `EXDATE` supposé** (retrait déduit du seul `RECURRENCE-ID`). **stableId** `${UID}_exc_${recurrenceId}`.
  - **Localisation : à l'affichage (`allEvs`), PAS dans la sync** → lecture pure, sacrées intouchées.
  - **Non-régression :** 0 exception → `return events`.
- **Validation :** C3 (heure différente) = 1 event à 13h ✅ · ALL-DAY (piège minuit/off-by-one) = report correct, pas de doublon ✅.
### ⚠️ À ne pas re-découvrir
- **La fusion est au RENDU, pas dans la donnée.** Le brut montre TOUJOURS 2 VEVENT. On juge PR-b à l'écran.
- **VALARM `ACTION:NONE` datée 1976** sur les exceptions = **Apple lui-même** (pas WeekCal). Inoffensif.

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling « method override », `e1e7763`.** En prod **via #31 (`4c2d5cc`)** — PAS #32. 3 bugs prouvés au Web Inspector :
  1. **Prod 401** = clé révoquée coincée dans `cf_auth` → **"Se déconnecter"** (reconnecter ne suffit PAS).
  2. **Preview 405** = Vercel bloque WebDAV avant la fonction → **tunneling POST + `X-HTTP-Method-Override`**.
  3. **Preview 401** = coquilles de saisie → **coller** la clé.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- UNTIL / EXDATE / DST. **DST-proofing :** instant absolu (`getTime()`) pour UNTIL ; helpers de date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (dates UTC → off-by-one).

---

## 📚 LEÇONS SYNCHRO (capital méthodo)
- Le **Web Inspector au câble prime sur les logs Vercel**.
- **Décoder `Authorization: Basic`** = vérifier QUELLE clé part.
- Un « reconnecter » ne vide pas `cf_auth` ; seul **"Se déconnecter"** le fait.
- **Toujours COLLER les clés d'app, jamais retaper.**
- **Isolation WKWebView** : bac PWA ≠ bac Safari ≠ bac preview. Toujours savoir dans quel bac on regarde.

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT + vérifier le titre du Web Inspector** avant d'inspecter (piège vécu : diagnostic faussé sur PROD + vieille preview).
- **WeekCal ≠ Apple natif pour la STRUCTURE iCloud.** WeekCal peut créer des exceptions non demandées → **créer les cas de test dans Apple natif**.
- **1re dérive doc (05-07) :** l'État figé disait « α en pause » alors que #31 l'avait mis en prod → cloué par le croisement doc ↔ `main`.
- **2e dérive doc (06-07) :** les 4 sacrées étaient mal/non localisées (crues dans `caldav.js`, en fait `src/sync/pushEvent.js` + `App.jsx`) ; le dossier `src/sync/` entier manquait. Cloué par certification du cousin contre `main` @ `7d7763a`. ➡️ **Le README racine du repo = ground truth archi** ; le moteur porte l'ossature (A+).

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- **Certification archi : `main` @ `7d7763a`** (README racine, vérifié fichier par fichier le 06-07-26).
- Commits : `4c2d5cc` (#31, LE merge en prod) · `b73e5c0` (#32, resync, JAMAIS en prod) · `9b0a126` (α, live via #31 — à neutraliser avant écriture) · `e1e7763` (tunneling, via #31) · `70e595e` (PR-a) · `349ade1` (PR-b).
- Cas de test : **« Test C3 »** (Apple natif, hebdo 10h, 25/07→13h) + **cas all-day**.
- `nomadcal_tests_recurrences.html` (QCM 17) ; `ZZ-TEST-REC3.ics`.
