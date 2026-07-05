# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. On NE le relit PAS à chaque session — on vient le consulter quand on est coincé. Il grossit ; c'est normal. Pour l'avancement en cours → fichier « État du projet ». Pour la méthode → Instructions. Pour l'archi → README.*

---

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
*Vérifiée commit par commit sur `main`. Corrige une erreur du Journal (ancienne mention « tunneling via #32 »).*
- **Un seul merge a tout amené en prod : #31 (`4c2d5cc`).** Il porte ENSEMBLE, dans le même merge : tunneling (`e1e7763`), PR-a (`70e595e`), PR-b (`349ade1`) ET α (`9b0a126`).
- **#32 (`b73e5c0`) n'a JAMAIS touché la prod.** C'était un merge `main → branche` (resync de la branche de travail), côté branche, pas côté `main`. Son titre « Merge pull request #32 from …/main » le trahit : c'est `main` qu'on tire DANS la branche.
- **⚠️ CONSÉQUENCE CRITIQUE :** reverter `4c2d5cc` (#31) **détruirait aussi** synchro + PR-a + PR-b (couche 2 lecture). **INTERDIT.** Pour retirer α, la cible est **`9b0a126` SEUL** — et comme α et le tunneling vivent dans la MÊME fonction `caldavRequest`, un `git revert` propre est impossible (conflit) → **retrait MANUEL des lignes du timeout**, en gardant le tunneling.

## ⏱️ α (TIMEOUT 20 s, `9b0a126`) — LIVE, SPÉCULATIF, À NEUTRALISER AVANT L'ÉCRITURE
*Anatomie clouée par le cousin (05-07-26). α n'est PAS « en pause » : il est en prod depuis #31.*
- **Quoi :** `AbortController` + `setTimeout(…, 20000)` dans `caldavRequest` (`caldav.js`), le **point de passage UNIQUE de toutes les requêtes CalDAV client**. Sur `AbortError` → renvoie `{status:408}`. Client seul (le proxy Vercel `api/caldav.js` n'a AUCUN timeout).
- **Ce qu'il borne :** TOUTES les requêtes sans distinction — PROPFIND/REPORT (lecture) **ET PUT / DELETE / MKCALENDAR** (écriture).
- **Spéculatif (PROUVÉ) :** ne corrige AUCUN problème constaté. Le « 0 event » était le **405** (→ tunneling), pas un hang. Le hang WKWebView (socket figée sur bascule WiFi↔cellulaire) est théorique, **jamais observé** ici. Filet préventif, pas correctif.
- **Inoffensif en LECTURE** (avortement → 408 → re-sync au tour suivant).
- **⚠️ DANGEREUX en ÉCRITURE :** un PUT réussi côté iCloud mais lent à répondre (>20 s, réseau terrain iPhone dégradé) est avorté → cru échoué → ré-enqueue → **ré-émis** → **doublon / écrasement iCloud**. Aggrave la « fabrique à doublons » visée par la couche 2 écriture.
- **À TRANCHER avant le 1er PUT (pas avant) :** **A** = retirer α (retrait manuel des lignes, garder le tunneling) · **B** = raffiner α (timeout sur lecture SEULE, jamais PUT/DELETE/MKCALENDAR). **Reco cousin : B** (chirurgical, garde le filet anti-hang sans le risque doublon). Décision capitaine, PR isolée.

---

## ✅ RESTRUCTURATION DE LA DOC — SCELLÉE (05-07-26)
- **Passage à 4 fichiers moteurs :** Instructions (socle permanent) · README (archi, lent) · État (établi vivant, court) · Journal/Acquis (ce classeur, neuf). Le déjà-fait scellé a quitté l'État pour le Journal → État léger, reprise de session en 10 s.
- **Double jeu Projet + GitHub :** chaque moteur vit en deux copies — connaissance du Projet (pour Claude/Olivier) + repo GitHub dossier `Contexte/` à la racine (pour le cousin, isolé de `src/`). Les deux copies naissent du MÊME téléchargement au même instant → ne peuvent pas diverger (ce n'est PAS le piège WKWebView : ici c'est Olivier qui tient les deux stylos, rien ne s'écrit tout seul). *(NB casse : dossier réel = `Contexte` majuscule ; Instructions écrivent `/contexte/` — à harmoniser.)*
- **Méthode de MAJ :** ancrée sur l'ÉVÉNEMENT (un merge scellé), jamais sur le calendrier. Règle d'or = MAJ **seulement les fichiers réellement touchés**, pas les 4 par réflexe (une variable à la fois, appliquée à la doc). Horodatage `JJ-MM-AA` dans le nom = repérage de la dernière version + sauvegarde locale versionnée gratuite.
- **Geste apprenti en 3 temps :** Claude livre le(s) fichier(s) touché(s) horodaté(s) → Olivier télécharge (= sauvegarde locale) → upload Projet + copier-coller GitHub. Le cousin n'est PAS mobilisé pour ranger les tiroirs (travail d'apprenti, montée en compétence Git).
- **Rôle de la mémoire du Projet :** on la laisse vivre (préférences durables), mais elle n'est JAMAIS source de vérité. En cas de conflit, les 4 moteurs gagnent, toujours.
- **Différé (autre chantier) :** essaimer les items transposables des Instructions vers les autres contextes projet (dont remonter « une question à la fois » dans userPreferences — le seul item de préférence pas encore global).

---

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
*En prod via le merge #31 (`4c2d5cc`) — voir « Lignée main » en tête.*

### PR-a (commit `70e595e`) — lecture multi-VEVENT
- **But :** apprendre à NC à LIRE les occurrences modifiées (exceptions `RECURRENCE-ID`), jamais parsées avant.
- **Cause racine (PROUVÉE) :** `parseICS` (`caldav.js:57`) ne capturait que le 1er VEVENT ; iCloud livre master + exceptions dans la MÊME ressource.
- **Fix :** `parseEvents` découpe le `calendar-data` en TOUS ses blocs VEVENT (regex `/g`), un `parseICS` par bloc ; 6e param `veventBlock`. `expandRecurring` + 4 sacrées intouchés.
- **Validation (05/07) :** « Test C3 » 100 % Apple natif, série hebdo 10h + occurrence 25/07 déplacée à 13h. Brut relu au Web Inspector = master + 1 exception `RECURRENCE-ID` propre.

### PR-b (commit `349ade1`) — fusion master + exceptions
- **But :** nettoyer le doublon → retirer l'occurrence développée par le master dont l'instant == `RECURRENCE-ID`, la remplacer par l'exception.
- **Fix :** `mergeRecurrenceExceptions` + 2 helpers dans `caldav.js` ; 1 ligne dans `App.jsx` au point d'affichage **`allEvs`**.
  - **Règle 1 — instant absolu :** `RECURRENCE-ID` → `getTime()` en heure locale comme les occurrences → DST-safe, zéro chaîne UTC tronquée.
  - **Règle 2 — aucun `EXDATE` supposé :** retrait déduit du seul `RECURRENCE-ID` (le master n'a AUCUN `EXDATE`, prouvé au brut).
  - **Règle 3 — stableId :** exceptions ré-identifiées `${UID}_exc_${recurrenceId}` → clé React saine, N exceptions OK.
  - **Localisation : à l'affichage (`allEvs`), PAS dans la sync** → 4 sacrées + `expandRecurring` intouchés, lecture pure.
  - **Non-régression :** 0 exception → `return events` (référence identique).
- **Validation (05/07, preview + prod après merge) :** cas C3 (exception heure différente) = 25/07 un seul event à 13h ✅ · cas ALL-DAY (le plus risqué, piège minuit/off-by-one) = report correct, pas de doublon ✅.

### ⚠️ Détails scellés à ne pas re-découvrir
- **La fusion est au RENDU, pas dans la donnée.** Le brut `calendar-data` montrera TOUJOURS 2 VEVENT (master + exception). On juge PR-b **à l'écran**, jamais dans le brut.
- **VALARM `ACTION:NONE` datée 1976** sur les exceptions = **Apple lui-même** l'ajoute (PAS WeekCal). Inoffensif.

---

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling « method override », commit `e1e7763`.** En prod **via le merge #31 (`4c2d5cc`)** — PAS #32 (voir « Lignée main » en tête). Prod + preview OK. Preview = banc de test opérationnel. 3 bugs prouvés au Web Inspector :
  1. **Prod 401** = ancienne clé révoquée coincée dans `cf_auth` → **"Se déconnecter"** (un "reconnecter" ne suffit PAS).
  2. **Preview 405** = Vercel bloque WebDAV (PROPFIND/REPORT) AVANT la fonction → **tunneling POST + `X-HTTP-Method-Override`**.
  3. **Preview 401** = coquilles de saisie de la clé → **coller** depuis la note chiffrée.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- UNTIL / EXDATE / DST. **DST-proofing :** instant absolu (`getTime()`) pour UNTIL ; helpers de date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (produit des dates UTC → off-by-one).

---

## 📚 LEÇONS SYNCHRO (capital méthodo)
- Le **Web Inspector au câble prime sur les logs Vercel**.
- **Décoder `Authorization: Basic`** = vérifier QUELLE clé part réellement.
- Un « reconnecter » ne vide pas `cf_auth` ; seul **"Se déconnecter"** le fait.
- **Toujours COLLER les clés d'app, jamais retaper.**
- **Isolation WKWebView** : bac PWA ≠ bac Safari ≠ bac preview. Toujours savoir dans quel bac on regarde.

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT à examiner**, et **vérifier le titre du Web Inspector** avant d'inspecter. Piège vécu : inspecté longtemps la PROD (sans fix) + une vieille preview → diagnostic faussé. Le titre de la fenêtre d'Inspecteur = la boussole.
- **WeekCal ≠ Apple natif pour la STRUCTURE iCloud.** WeekCal (`com.wasabi-apps.WeekCal`) peut créer des exceptions non demandées (04/07 : 1 modif → 2 exceptions). ➡️ **Créer les cas de test dans Apple natif** ; consulter dans WeekCal pour la vue semaine (lire ne pollue pas).
- **La doc a attrapé sa 1re dérive (05-07-26) :** l'État figé disait « α en pause » alors que #31 l'avait mis en prod. Le croisement doc ↔ `main` par le cousin l'a clouée. Preuve que le système établi/classeur + « prouvé pas supposé » fonctionne.

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- Commits : `4c2d5cc` (#31, LE merge qui a tout amené en prod) · `b73e5c0` (#32, resync `main`→branche, JAMAIS en prod) · `9b0a126` (α, live via #31 — spéculatif, à neutraliser avant écriture) · `e1e7763` (tunneling, en prod via #31) · `70e595e` (PR-a lecture) · `349ade1` (PR-b fusion).
- Cas de test : **« Test C3 »** (Apple natif, hebdo 10h, 25/07→13h) + **cas all-day** (Apple natif, 1 occurrence modifiée).
- `nomadcal_tests_recurrences.html` (QCM 17) ; `ZZ-TEST-REC3.ics`.
