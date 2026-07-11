# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. On NE le relit PAS à chaque session — on vient le consulter quand on est coincé. Il grossit ; c'est normal. Pour l'avancement en cours → fichier « État du projet ». Pour la méthode → Instructions. Pour l'archi → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## 🩸 BUG A CONFIRMÉ TERRAIN iCLOUD + FANTÔME D'AFFICHAGE iCAL — CLOUÉ (11-07-26, soir)
*Capture au Web Inspector sur la PROD (lecture seule, aucune écriture). Reproduction réelle : création série hebdo dans NC → OK dans iCal → édition 2ᵉ occurrence dans NC → série disparaît de NC, iCal affiche « série + event modifié » = doublon apparent. Le brut tranche.*

- **Bug A = ÉCRASEMENT, prouvé sur la donnée réelle (pas seulement le code).** Le calendrier de test (`1925D1D3-5FA1-4FE3-8C5B-FCAC95DC3F23`) ne contient plus qu'**UNE** `<response>` : `calflow-1783755744987.ics`. Dedans : un seul VEVENT, `UID:calflow-1783755744987_20260718`, `SUMMARY:Test I 1`, `DTSTART;TZID=Europe/Paris:20260718T103000`, **sans RRULE**. `PRODID:-//NomadCal//FR`. Les seules RRULE présentes = **VTIMEZONE** (`FREQ=YEARLY`, décor Apple des fuseaux) — rien à voir avec la récurrence hebdo. → **La série récurrente n'existe plus sur iCloud.** L'édition d'occurrence a bien **remplacé le master** par un event unique daté. Confirme le mécanisme du code (`pushEvent` PUT sur href master, RRULE omise).

- **L'intuition « doublon à côté » est INFIRMÉE par le brut.** Vérifié : `FREQ=WEEKLY` **introuvable** dans le calendrier de test ; **une seule** ligne caldav porte `SUMMARY:Test I 1` ; l'inventaire complet du dossier (`x-final-url` finissant par `…FCAC95DC3F23/`) ne contient qu'**un** `<response>`. Pas de seconde ressource, pas de série survivante. Ce n'est pas un doublon réel — c'est un écrasement pur.

- **Le « doublon » d'iCal = FANTÔME D'AFFICHAGE APPLE.** Puisque le serveur ne contient qu'une ressource, les deux events qu'iCal montrait le même jour ne correspondent à **aucune** ressource réelle → cache local Apple non resynchronisé. **Résistance prouvée :** « Actualiser les calendriers » → sans effet ; **OFF/ON du calendrier iCloud** (Réglages → iCloud → Calendrier, ~2 min) → **sans effet non plus**. Le fantôme n'est tombé qu'en le **supprimant depuis iCal** (voir exception ci-dessous) → toute la série fantôme a disparu, l'event écrasé (bien réel) est resté.

- **Les 3 fenêtres, vérité au centre :** **iCloud = 1 ressource (event écrasé, sans récurrence) = LA VÉRITÉ.** **NC affichait 1 event = FIDÈLE** (contre l'impression de départ « aucun des deux n'a la vérité » : NC disait juste ; sa « perte de série » était normale, la série n'existait plus). **iCal affichait 2 = MENTAIT** (cache). ➡️ Leçon : ne jamais poser « aucune fenêtre n'a raison » avant d'avoir lu le brut — souvent l'une est fidèle.

- **EXCEPTION AU PROTOCOLE « ne jamais supprimer depuis iCal » — levée proprement (modèle méthode).** Règle habituelle : supprimer un doublon depuis iCal est INTERDIT (dans le cas bug B, le fantôme *est* le master → DELETE efface la série). **Ici l'exception a été autorisée** car le brut avait **prouvé** qu'aucune ressource réelle ne vivait derrière le fantôme récurrent (calendrier de test + event inutile + absent d'iCloud ET de NC). Le geste s'est révélé inoffensif, comme prédit. **Doctrine :** on ne lève pas un garde-fou pour aller vite — on le lève en **démontrant au brut** qu'il ne s'applique pas au cas. Sans cette preuve, l'interdit tient.

- **⚠️ Le fantôme n'est PAS effacé rétroactivement par le futur fix A.** Corriger l'écrasement empêche les **futures** séries de mourir, mais ne purge pas un cache iCal déjà installé. Nettoyage du fantôme = geste à part (suppression iCal justifiée par le brut, ou recréation propre du calendrier de test).

- **Matériau conservé :** l'event écrasé `Test I 1` (`calflow-1783755744987.ics`) est gardé comme **pièce à conviction**. ⚠️ C'est un cas **sale** (série déjà écrasée) → inapte comme point de départ pour tester le fix A. Le test du fix exigera une série **fraîche** (Apple natif, `ZZ-TEST-REC`).

- **Rappel méthode Web Inspector (revérifié le 11-07) :** la barre de recherche du panneau **ment sur les gros blocs XML** (`.ics` « introuvable » alors qu'il est à l'écran) → **compter/lire à l'œil**, ne jamais conclure sur un « introuvable ». Distinguer une réponse **fichier unique** (`…/xxx.ics`, un seul `<response>`) d'un **inventaire de dossier** (`x-final-url` finissant par `/`, 207 Multi-Status, gros `Content-Length`). Repère fiable d'un event : sa ligne `SUMMARY:` = le nom saisi. Un calendrier ≠ un autre : `1925D1D3-…` (test NomadCal) ≠ `M2CD-6-4-…` (EYROLLES/WeekCal).

## 🔬 INVESTIGATION LARGE « FABRIQUE À DOUBLONS » → 3 BUGS DISTINCTS — CLOUÉ (11-07-26)
*Chaîne Brief 2 (INVESTIGUER, prouve A) → Brief 4 (INVESTIGUER large, cartographie dates). 100 % code, lecture seule, aucune écriture. Baptême du type INVESTIGUER + chaîne fusionnable INVESTIGUER→CONSEILLER.*

- **Verdict racine : MULTIPLE, N = 3 bugs distincts. L'hypothèse « routine de recalcul de date fragile PARTAGÉE » est INFIRMÉE.** Il n'existe pas de routine unique — il y a même **deux `toISO` divergents** (`helpers.js:13` locale vs `caldav.js:211` UTC/`toISOString`), et le seul vrai recalcul fragile (`toISO` UTC dans `expandRecurring`, `caldav.js:347`) **ne cause aucun** des 3 symptômes (tous à heure normale / en lecture).

- **Bug A — édition d'occurrence écrase la série (côté écriture/identité).** `pushEvent` PUT sur href/UID du **master**, RRULE omise (`pushEvent.js:37` `ev.rrule && !ev.isRecurring`). L'occurrence porte `isRecurring:true` → RRULE perdue, UID suffixé `…_<date>` (`caldav.js:351`). PUT sur `ev.href` = href master hérité (`App.jsx:764`). **Écrase la ressource série**, pas « doublon à côté ». **✅ Confirmé terrain iCloud le 11-07 (voir entrée en tête).** Correctif visé = exception conforme RFC 5545 (UID master + `RECURRENCE-ID`, DTSTART nouvelle heure, sans RRULE, **pas d'`EXDATE`** — Apple n'en pose pas) = **ex-Brief 3, en réserve**.

- **Bug B — fantôme à la création (côté merge/identité) — LE PLUS DANGEREUX.** À la création (1 seul PUT, `App.jsx:758-775`) : `newId = calflow-<ts>`, href = ressource master, **avec RRULE** → série correcte. MAIS le master-local `_pending` (id `calflow-<ts>`, SANS `_<date>`) est ajouté au state. Au `syncCalDAV` suivant, iCloud renvoie le master → `expandRecurring` produit des occurrences `calflow-<ts>_<date>`. `mergeEvents` (`mergeStrategy.js:14-20`) **préserve** les locaux `_pending` dont l'id n'est pas dans `icloudIds` → `calflow-<ts>` (master pur) n'est jamais un id d'occurrence → **conservé** → coexiste avec l'occurrence n°1 → **doublon**. Le fantôme a `href = calHref + calflow-<ts>.ics` = **ressource master** → `deleteEvent` (`pushEvent.js:99`) DELETE dessus → **toute la série disparaît**. **Prouvé LOCALEMENT ; existence côté iCloud non prouvable sans réseau.** Danger PASSIF (frappe à la création, sans action).

- **Bug C — event à cheval sur minuit mal affiché (pur AFFICHAGE).** Original iCal `J 23:00 → J+1 01:00`, sélectionné sur J et J+1 (`App.jsx:578`). Le rendu (`App.jsx:643-644`) fait `y = timeToY(ev.startTime||"09:00")` et `h = durationToH(...)` **identiquement pour chaque jour, sans clip aux bornes du jour affiché** → sur J+1, `y = timeToY("23:00")` au lieu de 00:00. **Aucun UTC/date en cause** — bug de rendu. Fix = clip par jour (début `start→24:00`, fin `00:00→end`, intermédiaires `00:00→24:00`) ; ce clip **n'existe nulle part**.

- **Carte des recalculs de date (SAINS) :** saisie start/end `EventForm.jsx:32-33` (locale, `endDate` **existe déjà** en state, défaut = `startDate`) ; sérialisation DTSTART/DTEND `pushEvent.js:12-17` (locale + TZID) ; sélection multi-jour `App.jsx:578` (comparaison ISO locale, choisit les bons jours) ; helper affichage `helpers.js:13-17` (locale).

- **Option « début daté + fin datée » = PARTIELLE.** Corrige la SAISIE NC multi-jours (peu coûteux, `EventForm.jsx` seul, aucune sacrée). Laisse debout A, B, C. En particulier C (entre par la LECTURE d'un event iCal). Pour afficher un event à cheval créé dans NC → exige AUSSI le fix C. À traiter à part.

- **Leçon méthode :** une intuition « racine commune » séduisante peut être infirmée par le code — mais elle a de la valeur : elle a **déclenché** la cartographie qui a séparé proprement 3 bugs (donc 3 PR, jamais fusionnées). A et B sont d'une même **famille** (confusion identité master ↔ occurrence) par **deux mécanismes différents** (href hérité vs master-local préservé) ; C est indépendant.

## ✅ α NEUTRALISÉ (SCOPÉ LECTURE SEULE) — SCELLÉ EN PROD (10-07-26)
*Option B tranchée par le capitaine, exécutée par le cousin, testée sur preview, mergée en prod. Baptême réussi de la méthode de briefing (Brief 1 = EXÉCUTER/MODIFIER).*
- **Commit `ac0a025`** — un seul fichier : `src/utils/caldav.js` (`caldavRequest`, `+15/−9`).
- **Ce qui change :** `READ_METHODS = {PROPFIND, REPORT}` → timeout (AbortController + 20 s) UNIQUEMENT sur ces deux. PUT / DELETE / MKCALENDAR → `useTimeout=false` → aucun AbortController, aucun 408 → `fetch` nu (comportement d'avant α pour les écritures). **Un PUT lent mais abouti ne peut plus être avorté → risque de doublon iCloud ÉLIMINÉ.**
- **Tunneling `X-HTTP-Method-Override` : intact** (condition indépendante, `STD_METHODS`). MKCALENDAR reste tunnelé, sans timeout. 4 sacrées / `api/caldav.js` / `Contexte/` : non touchés.
- **Validé sur preview AVANT merge :** lecture OK (18 caldav vertes, events affichés) · écriture OK (event créé depuis NC dans `ZZ-TEST-REC` → arrivé dans iCloud, zéro timeout). Backups pris avant test (NC natif + `cf_events` préfixé).
- **NB :** le PUT n'apparaît pas comme « PUT » à l'inspecteur — il est **tunnelé en POST** (`X-HTTP-Method-Override`). Normal de ne pas trouver de ligne « PUT ».

## 🔧 LEÇONS WEB INSPECTOR (méthode — nous ont coûté du temps le 10-07)
- **Clés localStorage PRÉFIXÉES, préfixe VARIABLE :** dans un même bac, on a vu `olivierclaverie01072026_cf_events` / `_cf_tasks` / `_cf_calendars` / `_cf_settings` ET `olivierclaverie@me.com_cf_pending` / `_cf_tombstones` ET des clés nues (`cf_auth`, `nomadcal_calendar_href`). ➡️ **Ne JAMAIS supposer `cf_events` nu.** Toujours `Object.keys(localStorage)` d'abord pour lister les vrais noms.
- **Où taper une commande :** en **BAS** de l'onglet **Console**, sur la ligne de saisie marquée d'un `>`. Le haut = journal (lecture). La **loupe de l'onglet Sources cherche du TEXTE dans le code** — ce n'est PAS exécuter une commande. Ne pas confondre.
- **`copy(x)` renvoie `undefined`** dans la Console — c'est **normal** (la fonction ne retourne rien), mais elle a bien mis **la VALEUR de x** dans le presse-papier. Pour VOIR le contenu sans copier : taper `localStorage.getItem('…')` sans `copy()` autour.
- **La recherche du panneau Réseau ment sur les gros XML (revérifié 11-07) :** `.ics` renvoyé « introuvable » alors qu'il est affiché → **lire/compter à l'œil**, jamais conclure sur un « introuvable ». Distinguer réponse fichier unique (`…/xxx.ics`) vs inventaire de dossier (`x-final-url` finissant par `/`, 207).
- **Backup `cf_events` = dans le BON bac** (WKWebView isolé) : sauvegarder dans le bac où l'on va tester, sinon fausse sécurité.

## 🗺️ RÉCONCILIATION DOC ↔ ARCHI RÉELLE — SCELLÉE (06-07-26)
*Le cousin a certifié le README racine du repo, fichier par fichier, contre `main` @ `7d7763a`.*
- **Le README racine = SOURCE D'ARCHI CERTIFIÉE.** Le README **moteur** porte l'**ossature** et **renvoie** au racine (forme **A+** : moteur = vision + doctrine + squelette ; racine = détail exhaustif).
- **⚠️ Dossier `src/sync/`** (`pushEvent.js`, `pendingQueue.js`, `mergeStrategy.js`, `index.js`) = **cœur offline-first / ÉCRITURE**. Était absent de tous les moteurs.
- **4 sacrées LOCALISÉES (prouvé) :** `pushEvent`/`deleteEvent` → `src/sync/pushEvent.js` (`:5`/`:88`) ; `syncCalendar`/`syncCalDAV` → `src/App.jsx` (`:329`/`:368`). PAS dans `caldav.js`.
- Inventaire : `icons/` = **25** SVG. Oubliés : `WheelSelect`, `Toast/`. `TaskDrawer.jsx` n'existe pas → c'est `NomadTask.jsx`.
- Boîte privée « fonction rapport NomadBook » vidée dans le README moteur.

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
- **Un seul merge a tout amené en prod : #31 (`4c2d5cc`)** : tunneling (`e1e7763`) + PR-a (`70e595e`) + PR-b (`349ade1`) + α (`9b0a126`).
- **#32 (`b73e5c0`) n'a JAMAIS touché la prod** (merge `main → branche`, resync).
- **⚠️ Reverter `4c2d5cc` détruirait synchro + couche 2 lecture. INTERDIT.** (α a été neutralisé autrement — voir entrée 10-07, retrait manuel scopé, pas un revert.)

## ⏱️ α (TIMEOUT 20 s) — HISTORIQUE (résolu le 10-07)
*Conservé pour mémoire. α était live/spéculatif ; désormais scopé lecture seule (voir entrée en tête).*
- **Était :** `AbortController` + `setTimeout(20000)` dans `caldavRequest`, bornait TOUTES les requêtes (lecture ET écriture). Spéculatif (ne corrigeait aucun hang prouvé). Dangereux en écriture (PUT lent avorté → doublon).
- **Résolu par option B** (raffiner, pas retirer) : timeout gardé en lecture, retiré en écriture. Commit `ac0a025`.

---

## ✅ RESTRUCTURATION DE LA DOC — SCELLÉE (05-07-26)
- **4 fichiers moteurs :** Instructions · README · État · Journal/Acquis. Double jeu Projet + repo `Contexte/`. MAJ à l'ÉVÉNEMENT, seulement les fichiers touchés, horodatage `JJ-MM-AA`. Mémoire du Projet = jamais source de vérité (conflit → les 4 moteurs gagnent).

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
*En prod via #31 (`4c2d5cc`).*
- **PR-a (`70e595e`) :** `parseICS` ne lisait que le 1er VEVENT → `parseEvents` découpe TOUS les blocs (regex `/g`).
- **PR-b (`349ade1`) :** `mergeRecurrenceExceptions` au point d'affichage `allEvs`. `RECURRENCE-ID` → `getTime()` local (DST-safe). stableId `${UID}_exc_${recurrenceId}`. 0 exception → `return events`.
- **⚠️ La fusion est au RENDU, pas dans la donnée** (le brut montre toujours 2 VEVENT). VALARM `ACTION:NONE` 1976 = Apple, inoffensif.

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling `e1e7763`**, en prod via #31. 3 bugs Web Inspector : Prod 401 = clé révoquée dans `cf_auth` → **"Se déconnecter"** (reconnecter ne suffit pas) · Preview 405 = Vercel bloque WebDAV → tunneling POST + `X-HTTP-Method-Override` · Preview 401 = coquilles → **coller** la clé.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- **DST-proofing :** `getTime()` pour UNTIL ; helpers date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (UTC → off-by-one).

---

## 📚 LEÇONS SYNCHRO (capital méthodo)
- **Web Inspector au câble prime sur les logs Vercel.** Décoder `Authorization: Basic` = vérifier quelle clé part. « Reconnecter » ne vide pas `cf_auth` ; seul **"Se déconnecter"** le fait. **Toujours COLLER les clés, jamais retaper.** Isolation WKWebView : bac PWA ≠ Safari ≠ preview.

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT + vérifier le titre du Web Inspector** avant d'inspecter (piège vécu : diagnostic faussé sur PROD + vieille preview).
- **Une preview vide = clé périmée dans le `cf_auth` de CE bac** → Se déconnecter/reconnecter en collant. **Pas un bug du code testé.** (Répétition du piège « prod 401 » sur une preview, vécu le 10-07 : l'écran vide n'invalidait PAS la PR α.)
- **Lire le brut AVANT de conclure « aucune fenêtre n'a raison » (11-07) :** souvent l'une est fidèle. Ici NC disait vrai, iCal mentait (fantôme cache).
- **Inspecter la PROD est permis en LECTURE SEULE quand l'état du bug y vit déjà et n'est pas reproductible en preview (11-07).** « Jamais la prod » vise l'ÉCRITURE (merge/test de fix), pas la lecture d'un état existant.
- **WeekCal ≠ Apple natif** pour la structure iCloud → créer les cas de test dans Apple natif.
- **1re dérive doc (05-07) :** État figé disait « α en pause » alors en prod.
- **2e dérive doc (06-07) :** 4 sacrées mal localisées + `src/sync/` manquant. Cloué par certification cousin contre `main` @ `7d7763a`.

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- **Certification archi : `main` @ `7d7763a`.**
- Commits : `ac0a025` (α scopé lecture seule, 10-07) · `4c2d5cc` (#31, tout en prod) · `b73e5c0` (#32, jamais en prod) · `9b0a126` (α d'origine) · `e1e7763` (tunneling) · `70e595e` (PR-a) · `349ade1` (PR-b).
- **Calendrier de test : `ZZ-TEST-REC`** (iCloud, dédié — jamais l'agenda pro). Cas « Test C3 » (Apple natif, hebdo 10h, 25/07→13h) + cas all-day.
- **Pièce à conviction bug A (11-07) :** `calflow-1783755744987.ics` (calendrier `1925D1D3-…`), event unique écrasé `Test I 1` du 18/07 sans RRULE. Cas SALE → pas un banc d'essai pour le fix.
- Backups locaux type : NC natif (Settings) + `cf_events` préfixé copié via Console.
- `nomadcal_tests_recurrences.html` (QCM 17) ; `ZZ-TEST-REC3.ics`.
