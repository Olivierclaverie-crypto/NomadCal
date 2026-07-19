# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. On NE le relit PAS à chaque session — on vient le consulter quand on est coincé. Il grossit ; c'est normal. Pour l'avancement en cours → fichier « État du projet ». Pour la méthode → Instructions. Pour l'archi → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## ✅ PÉRIODES NOMADBOOK — CHANTIER COMPLET (C + C-bis + TABLE RASE + MIGRATION) — SCELLÉ (19-07-26 SOIR)
*Suite et FIN du chantier périodes. De « 6 notes disparues » (matin, iPhone) à « 10 notes rangées » (soir, desk). Zéro perte. `pushEvent`/`deleteEvent` jamais touchées.*

- **C-bis (#40, mergé) — le 8ᵉ site oublié.** Le lot C (#39) prétendait « 7 sites alignés » mais en avait manqué UN : le compteur de la pastille du pied de page, dans `App.jsx` (IIFE `noteCount`, `cur.uid`). Hors zone balayée par C (NomadBook.jsx + caldavCalendar.js). Fix `cur.uid -> cur.href`, +1/−1. Le cousin #39 l'a reconnu honnêtement (« mon "tous les filtres alignés" était inexact »). LEÇON : « tous les sites » n'est jamais sûr sans un grep hors de la zone évidente.
- **LA CLÉ DU FILTRE = HREF COMPLET, prouvé au brut de l'écran.** Après C-bis, les notes portant `rapport-2026-09-07` (forme courte) restaient INVISIBLES en prod. Une note test créée en prod a révélé sa vraie clé : `/1012673262/calendars/nomadcal-oc/rapport-<fin>.ics` (href COMPLET, avec `.ics`). Aucune des 10 notes historiques n'avait cette forme -> toutes invisibles. LEÇON : ne jamais deviner la forme d'une clé ; la relever sur une note qui S'AFFICHE (terrain-first).
- **PIÈGE PREVIEW/PROD.** Le test C-bis « pastille apparaît » avait été fait sur PREVIEW (bac localStorage isolé, quasi vide). En PROD (vrai bac, 10 notes), « aucune note ». Preview ≠ prod : bacs séparés (WKWebView). Toujours tester la migration sur le bac réel, après force-refresh.
- **TABLE RASE CAPITAINE = alternative élégante au lot A.** Plutôt que le dédoublonnage iCloud chirurgical (DELETE ciblé, brief lourd, irréversible), le capitaine a SUPPRIMÉ toutes les périodes dans NomadBook puis RECRÉÉ 5 périodes propres à la main. PROPFIND après : **5 ressources, une par période**, fraîches (PRODID //NomadCal//FR). Plus AUCUN jumeau. -> LOT A rendu SANS OBJET.
- **RECRÉATION -> nouvel UID mais MÊME href slug.** `createPeriodEvent` génère un UID neuf (`nomadcal-rapport-<nouveau_ts>@nomadcal`) mais le fichier reste `rapport-<endISO>.ics` (dérivé de la date de fin inchangée). Comme le filtre matche sur le HREF (pas l'UID), l'alignement des notes reste stable. C'est la clé de la manœuvre.
- **MIGRATION DES NOTES = par RESTAURATION, pas par code.** Export Settings -> periodId des 11 notes réécrits (par le timonier) sur le href complet du survivant -> restauré via Settings (« Restaurer les données »). Résultat prouvé à l'écran : **10 notes Juil–Sept + 1 Juin–Juil**. Avantages : zéro code jetable (Neon réécrira), réversible (ancien backup = filet), visible à l'écran. « Minimum de code V1 » respecté.
- **DOUBLON iCAL Juin–Juil = FANTÔME de cache Mac** (PROPFIND montre 1 seule ressource). Ignoré, se purge côté Apple. NE PAS supprimer depuis iCal (doctrine 11/07 : le brut prime, ne jamais supprimer un fantôme sans preuve).
- **RESTE (cosmétique) :** supprimer les notes de test (Test B, TEST C1). Fonction rapport NomadBook désormais DÉBLOQUÉE (notes rangées par période).

## 🧭 SESSIONS COUSIN = CLOUD, PAS DESKTOP LOCAL — CLOUÉ (19-07-26)
*Une soirée perdue à croire le « canal GitHub cassé ». Il n'était pas cassé : les fils cousin étaient ouverts au mauvais endroit.*
- **Le cousin (Claude Code) ne pousse/ouvre une PR QUE depuis une session CLOUD** (VM Anthropic, proxy GitHub `127.0.0.1:...` + `$GH_TOKEN=proxy-injected` provisionnés au boot). Une session **Desktop LOCALE** tourne sur le Mac : pas de proxy, `git push` -> `could not read Username`. Symptômes du fil local : `mdfind`/Spotlight, chemins `Library/CloudStorage/OneDrive...` = machine de l'user.
- **REPÈRE VISUEL : l'icône de BRANCHE à côté du fil = session cloud (canal OK).** Pas d'icône = local (pas de canal). À vérifier AVANT tout brief qui doit pousser.
- **Ouvrir une session cloud :** `claude.ai/code` + sélecteur repo -> NomadCal ; OU clic droit sur un fil -> Ouvrir dans -> Cloud.
- **Prérequis (une fois) :** Claude GitHub App autorisée sur le compte avec accès à NomadCal (github.com/apps/claude -> Configure).
- **Test tuyau (5 s) avant brief lourd :** `echo $GH_TOKEN` (=`proxy-injected`) · `git remote -v` (réécrit proxy) · repo déjà cloné à l'arrivée.
- **SÉCURITÉ : jamais de PAT dans le chat.** Le token proxy est injecté par l'environnement, non reproductible en collant un secret. Se règle côté interface/connecteur.
- **La doctrine « mauvaise preview » (14/07) resservie en géant :** un fix qui « ne marche pas » -> suspecter la CIBLE (ici : le mauvais type de session, le mauvais repo OneDrive stale) avant de suspecter le fond.



## ✅ PÉRIODES NOMADBOOK — LOT C : IDENTITÉ FIGÉE — SCELLÉ EN PROD (#39, 19-07-26)
*Chantier NomadBook. Chaîne complète : alerte terrain 16/07 → INVESTIGUER code → PROPFIND serveur → INVESTIGUER→CONSEILLER cousin → brief EXÉCUTER → PR testée au brut → merge. `pushEvent`/`deleteEvent` jamais touchées.*

- **LE BUG, ENFIN COMPRIS.** Les notes NomadBook filtrent sur `note.periodId === currentPeriod.uid` (STRICT, `NomadBook.jsx:469`). L'UID d'une période était **réécrit** par `updatePeriodEvent` (`caldavCalendar.js:276` : `uid = href.split("/").pop().replace(".ics","")`) → la période changeait d'identité → les notes figées sur l'ancien UID (`:601`) devenaient invisibles.
- **DÉCOUVERTE-CLÉ (remontée par le cousin avant de coder) :** le déclencheur n'était PAS l'édition manuelle mais **`syncNoteCount`, appelé à CHAQUE ajout de note** (`caldavCalendar.js:405-406`, déclenché `NomadBook.jsx:608`). → écrire une note réécrivait l'UID de sa propre période. **Résout le mystère du 16/07** : la note « marché » n'a pas disparu par une édition fantôme à 8h42 ; l'écrire a suffi. Leçon : le déclencheur d'un bug peut être un geste anodin et fréquent, pas l'action « évidente ».
- **CE QUI EST EN PROD (#39, `+12/−11`, 2 fichiers) :**
  - **C1** — `updatePeriodEvent` reçoit `uid` en **paramètre** et le réémet tel quel ; `href.split(...)` supprimé (`:276`). `syncNoteCount` propage l'UID. → la bascule à l'ajout de note ET à l'édition est éliminée d'un coup (même chemin).
  - **C2** — **7 sites** de filtre note↔période alignés sur la clé stable `period.href` (préservée par `:290`, contient déjà l'endISO) : `:469`, `:475`, `:601` (fabrication), `:633`, `:655`, `:789`, `:856`. Le cousin a remonté `:633`/`:655` que le brief timonier avait oubliés (`:655` = `deletePeriod` : le laisser sur `.uid` aurait créé une incohérence supprimer↔afficher).
- **PREUVE AU BRUT (preview, ressource `…1782035089446@nomadcal`, ajout d'une note de test) :** `getetag mrg6ps2h→mrg6ps2i`, `DTSTAMP →20260719T153852Z` (PUT frais) **MAIS `UID` INCHANGÉ** — n'est PAS devenu `rapport-2026-09-07` comme avant le fix. Note de test **survit au refresh**. ✅ C1 + C2 prouvés. Compteur `Notes saisies` 2→1 = les 2 anciennes notes (ancien format) ne matchent plus `href`, la neuve = 1 → cohérent.
- **DÉCISIONS CAPITAINE (scellées 19/07, valent pour B et A) :** survivant par paire = slug `rapport-<endISO>.ics` (clé dérivable) ; clé stable = `href` ; **3 lots séparés C→B→A**, A irréversible, B avant A.
- **LEÇON MÉTHODE — le timonier s'est trompé DEUX fois, rattrapé à chaque fois.** (1) Pari initial (b) « deux périodes distinctes » → INVESTIGUER 16/07 tranche (a) « une identité qui bascule » au code. (2) Puis le PROPFIND 19/07 ressuscite (b) au SERVEUR (jumeaux réels) — les deux étaient vrais. (3) Extrapolation « Apple réécrit l'UID depuis le basename » = NON prouvée, abandonnée après objection capitaine (le PRODID = dernier scribe, pas acte de naissance). **Le doute inscrit dans les briefs + l'objection du capitaine ont évité de graver du faux.** Leçon 13/07 resservie : prouver au brut avant de graver une cause.
- **ORIGINE DES JUMEAUX = ancienne + manuelle (témoin capitaine direct).** Doublons vus à plusieurs reprises AVANT l'incident du 16/07 → ce ne sont pas des enfants du bug `periodId`, mais son terreau (allers-retours NC↔Apple lors d'un changement de protocole). Non tranché au code, **pas nécessaire de l'être pour ranger**.
- **RESTE : LOT B** (migration des notes orphelines vers `href`) puis **LOT A** (dédoublonnage iCloud, irréversible, backup frais). C répare le FUTUR (plus de bascule) ; B rattrape le PASSÉ (notes actuelles) ; A nettoie les doublons.

## 🔬 BRUT PÉRIODES — 10 RESSOURCES RÉELLES + EXPORT CLIENT MENTEUR — CLOUÉ (19-07-26)
*PROPFIND nomadcal-oc au Web Inspector (desk). Lecture seule. Le juge = le PROPFIND, pas l'export.*
- **10 ressources = 5 périodes × 2 (paires).** Chaque paire partage la **date de fin** (même `endISO` → même slug de fichier), avec 2 href/UID distincts : un `nomadcal-rapport-<ts>@nomadcal` + un `rapport-<fin>` (PRODID //Apple). → jumeaux **réels sur iCloud**, pas fantômes.
- **Le champ `📊 Notes saisies` (description) porte le compteur au brut.** Juil–Sept : slug=7, UID=2 → cohérent avec l'export natif 16/07 (9 notes coupées 7/2). Zéro perte confirmée côté serveur.
- **EXPORT macOS `NomadCal_OC.ics` = COPIE CLIENT MENTEUSE.** 11 VEVENT, dont **3** pour Juil–Sept (PRODID //Apple//macOS, X-WR-ALARMUID empilés) → mais le PROPFIND n'en montre que **2**. Le 3ᵉ = fantôme de cache Mac. ⚠️ **Ne JAMAIS compter les jumeaux à supprimer depuis un export client** — uniquement au PROPFIND, href par href. (Même famille que le fantôme iCal du 11/07.)
- **Les périodes ne passent PAS par `mergeStrategy.js`** → le fix B (#38) ne les protège pas. Tuyauterie propre : `caldavCalendar.js` + `nb_periods_cache`.

## ✅ RÉCURRENCE-ÉDITION + EVENTFORM + FIX B — SCELLÉS (14→15-07-26)
*Passés de l'État au Journal. Prouvés au brut, mergés, Vercel vert.*
- **Récurrence-édition OK — PR 1 (#35 `pushOccurrenceException`) + PR 2 (#36 enqueue offline).** Édition d'occurrence online+offline → 1 href / 2 VEVENT (master RRULE + exception `RECURRENCE-ID` heure murale locale sans `Z`), master intact. GET-modify-PUT sur href master, fonction voisine (pas de branche dans `pushEvent`). *(Détail complet : entrée FIX BUG A 14-07 ci-dessous.)*
- **EventForm MERGÉ (#37) — 3 lots au brut.** LOT 1 roue des jours adaptative (bissextile, clamp) · LOT 2 intervalle libre A1 `composeRRule` + `parseRRuleToUI` (`pushEvent` inchangée, `rrule` reste une string) · LOT 3 UNTIL DST-safe (`new Date(y,mo-1,d,23,59,59).toISOString()` → `…215959Z`) + `INTERVAL=1` jamais écrit. Brut : `FREQ=WEEKLY;UNTIL=…215959Z;INTERVAL=6;BYDAY=TH` ✅.
- **FIX BUG B MERGÉ (#38) — fantôme mort.** `mergeStrategy.js` seul (`+7/−1`) : `roundTrippedMasters` (Set des `masterUid` iCloud) + condition `!(e.rrule && roundTrippedMasters.has(e.id))` sur la branche `_pending`. Zéro sacrée, zéro DELETE ajouté. **4 scénarios au brut, zéro perte.** ⚠️ Ne couvre PAS : supprimer une occurrence *normale* efface encore la série (href hérité) → chantier sélecteur d'étendue.

## ✅ FIX BUG A — PR #35 SCELLÉE EN PROD (14-07-26)
*Premier fix sur voisinage de sacrée mené de bout en bout via le trio. `pushEvent` jamais touchée. Prouvé au brut, mergé, Vercel vert.*

- **CE QUI EST EN PROD :** `pushOccurrenceException(ev,auth)` (fonction voisine, `src/sync/pushEvent.js`) + routage save handler (`App.jsx`, `editMode==="this"`) + export barrel (`index.js`). **`pushEvent` INTACTE** (ni signature ni corps). `api/caldav.js`/`Contexte/` non touchés.
- **MÉCANIQUE = GET-modify-PUT** sur le href master : relire l'ICS existant → ajouter/remplacer le VEVENT exception (matching `RECURRENCE-ID`) → PUT. Master préservé à l'octet près (RRULE incluse), multi-exceptions natif.
- **PREUVE AU BRUT (preview, série fraîche Apple natif) :** 1 édition → 2 VEVENT (master RRULE + exception) ; 2ᵉ/3ᵉ → 3 puis 4 VEVENT, master toujours intact ; exception éditée sur l'occurrence-ancre (= DTSTART master) → OK, master préservé ; `RECURRENCE-ID;TZID=Europe/Paris:<origine>` heure murale locale, **pas de `Z`** ; offline → message de blocage, **zéro écriture**.
- **2 finitions avant merge (2ᵉ passe cousin, `ca19691`) :** (1) `X-RECURRENCE-EXCEPTION` était écrit en DOUBLE → **retiré** de `buildExceptionVevent` (iCloud pose le sien ; l'appariement passe par `RECURRENCE-ID`, ce X-prop est superflu) → une seule ligne désormais. (2) VEVENT exception **uniformisé** : ajout `CREATED`/`LAST-MODIFIED`/`SEQUENCE:0` → structure déterministe à chaque PUT. Le remplacement (ré-édition) remplace le bloc VEVENT entier → aucune fusion/duplication.
- **⚠️ LEÇON MÉTHODE — la mauvaise preview a failli faire valider un faux positif.** Un brut montrait les 2 corrections ABSENTES → réflexe : « le cousin a raté les deux » ? NON → **on inspectait l'ANCIENNE preview** (cache/URL). Les DEUX corrections absentes d'un coup = signal que ce n'est pas le code mais la cible d'inspection. Après bascule sur la bonne preview + force-refresh → brut propre. **Doctrine re-confirmée : vérifier le titre/URL du Web Inspector + force-refresh AVANT de conclure. Un fix qui « ne marche pas » sur preview = suspecter la preview avant le code.**
- **DOUBLON D'AFFICHAGE POST-MODIF (non bloquant, chantier séparé).** Après édition, NC affiche transitoirement 2 versions de l'occurrence jusqu'à un refresh manuel → **données saines** (brut propre), pur affichage. Idée capitaine : refresh-auto après modif/création → chantier dédié.
- **RESTE (à l'époque) : PR 2 (enqueue offline)** → faite (#36).

## 🔎 BUG B NON REPRODUIT + CONFUSION A/B LEVÉE — CLOUÉ (13-07-26)
*INVESTIGUER terrain (route 3 : prouver avant de fixer). Atelier `ZZ-TEST-REC` vide au départ, serveur sain. Une seule écriture = le cas de test. Brut lu au Web Inspector.*

- **Création d'un récurrent = SAINE (PROUVÉ).** `TEST B` créé dans NC → brut = **une seule** `<response>` : `calflow-1783927450435.ics`, `UID:calflow-1783927450435` (master pur), `RRULE:FREQ=WEEKLY;INTERVAL=1`. **Pas de master-local fantôme monté sur iCloud.** Le doublon décrit par la fiche B **n'apparaît PAS côté serveur** — s'il existe, c'est purement local (state React), jamais poussé. B ne mord pas à la création.
- **Édition d'une occurrence = BUG A, pas B (PROUVÉ).** Modif horaire de la 2ᵉ occurrence → brut = **toujours une seule** ressource, MAIS `UID:calflow-1783927450435_20260725` (suffixé), `DTSTART:20260725T123000`, **RRULE disparue**. = **écrasement du master** = signature EXACTE du bug A.
- **CONFUSION A/B LEVÉE (l'acquis du jour).** Ce qu'Olivier appelait « le doublon B qui apparaît à l'édition » est en fait **le bug A** (écrasement). Leçon : deux bugs de « famille identité master↔occurrence » se ressemblent au vécu ; **seul le brut les sépare**.
- **CIBLE DU FIX A — PROUVÉE AU BRUT (13-07).** UNE seule `<response>` / un seul href, `calendar-data` = **DEUX VEVENT** même UID : master `RRULE:FREQ=WEEKLY` intacte + exception `RECURRENCE-ID;TZID=Europe/Paris:...` (heure murale, sans `Z`), sans RRULE. **Aucun EXDATE.** → **Cible = « même ressource / 2 VEVENT » (modèle A)**. **Le brief initial disait « ressource séparée / 2 href » (modèle B) = ERREUR de rédaction du timonier, levée par le cousin PUIS tranchée au brut.** Leçon : même le timonier doit prouver au brut avant de graver une cible.
- **MÉCANIQUE TRANCHÉE = GET-modify-PUT (canonique CalDAV).** Reconstruire le master depuis le state REJETÉ (preuve : `expandRecurring` écrase l'ancre DTSTART `caldav.js:362`, master hors fenêtre −3 mois introuvable, `rawICS` strippé en prod).
- **DÉCISION ARCHI = fonction voisine, PAS de branche dans la sacrée.** `pushOccurrenceException(ev,auth)` dédiée. **`pushEvent` reste 100 % intacte.** Leçon : sur une sacrée, la meilleure modif est souvent **à côté**, pas dedans.
- **ETag/If-Match OMIS en V1 mono-device (dette tracée) → OBLIGATOIRE avant version DESK.** Multi-device = write-write race réel.

## 🩸 BUG A CONFIRMÉ TERRAIN iCLOUD + FANTÔME D'AFFICHAGE iCAL — CLOUÉ (11-07-26, soir)
*Capture au Web Inspector sur la PROD (lecture seule). Le brut tranche.*
- **Bug A = ÉCRASEMENT, prouvé.** Calendrier de test ne contenait plus qu'**UNE** `<response>` : un seul VEVENT `UID:calflow-..._20260718`, **sans RRULE**. → la série récurrente n'existe plus sur iCloud. L'édition d'occurrence a remplacé le master.
- **Le « doublon » d'iCal = FANTÔME D'AFFICHAGE APPLE.** Serveur = 1 ressource → les 2 events qu'iCal montrait ne correspondent à AUCUNE ressource réelle → cache local non resynchronisé. « Actualiser » + OFF/ON du calendrier → sans effet.
- **⚠️ CACHE PAR-APPAREIL (précisé 12-07).** Fantôme local à chaque device, désynchronisé indépendamment. Purger le serveur ne rafraîchit pas chaque client ; nettoyage = geste **sur chaque appareil**.
- **Les 3 fenêtres, vérité au centre : iCloud = LA VÉRITÉ. NC = FIDÈLE. iCal = MENTAIT (cache).** Ne jamais poser « aucune fenêtre n'a raison » avant d'avoir lu le brut.
- **EXCEPTION AU PROTOCOLE « ne jamais supprimer depuis iCal » — levée proprement.** Autorisé UNIQUEMENT car le brut avait **prouvé** qu'aucune ressource réelle ne vivait derrière. **Doctrine :** on ne lève un garde-fou qu'en démontrant au brut qu'il ne s'applique pas.
- **⚠️ Le fantôme n'est PAS effacé rétroactivement par un fix.** Corriger l'écrasement protège les futures séries, ne purge pas un cache déjà installé.
- **Rappel Web Inspector :** la barre de recherche **ment sur les gros blocs XML** → compter/lire à l'œil. Repère d'un event = sa ligne `SUMMARY:`.

## 🛑 RÈGLE — SERVEUR iCLOUD EN MAINTENANCE = OBSERVATION SUSPENDUE (12-07-26)
- **503 / « verrouillé » / « maintenance » = serveur absent.** Toute observation suspendue : bruts non fiables.
- **Event créé pendant le 503 = né corrompu** (local mais jamais monté sur iCloud) → inexploitable comme cas de test, à jeter.
- **Reprise :** vérifier qu'iCloud répond AVANT de recréer les cas de test.

## 🔬 INVESTIGATION LARGE « FABRIQUE À DOUBLONS » → 3 BUGS DISTINCTS — CLOUÉ (11-07-26)
- **Verdict racine : MULTIPLE, N = 3 bugs distincts.** Deux `toISO` divergents (`helpers.js:13` locale vs `caldav.js:211` UTC).
- **Bug A** — édition d'occurrence écrase la série (`pushEvent.js:37`, UID suffixé `caldav.js:351`, PUT sur href master `App.jsx:764`). ✅ Corrigé (#35).
- **Bug B** — fantôme à la création (`mergeStrategy.js:14-20` préserve le master-local `_pending`). ✅ Corrigé (#38).
- **Bug C** — event à cheval sur minuit (`App.jsx:643-644` sans clip par jour). Pur affichage. Reste.
- **Leçon :** une intuition « racine commune » infirmée garde sa valeur — elle a déclenché la cartographie qui a séparé 3 bugs (3 PR, jamais fusionnées).

## ✅ α NEUTRALISÉ (SCOPÉ LECTURE SEULE) — SCELLÉ EN PROD (10-07-26)
- **Commit `ac0a025`** — `src/utils/caldav.js` (`caldavRequest`). `READ_METHODS = {PROPFIND, REPORT}` → timeout 20 s sur ces deux seulement. PUT / DELETE / MKCALENDAR → `fetch` nu. Un PUT lent mais abouti ne peut plus être avorté → risque de doublon iCloud ÉLIMINÉ. NB : PUT tunnelé en POST (normal de ne pas voir « PUT »).

## 🧭 BRIEF EVENTFORM AVISÉ + ROADMAP RÉCURRENCE ÉTAGÉE — CADRÉ (12-07-26)
- **Roadmap récurrence = objectif FERME, chemin étagé.** Compositeur complet (A1→A4 + COUNT) = ticket d'entrée sortie publique, PAS optionnel. On étage le CALENDRIER, pas l'AMBITION. **A1 (intervalle libre) en V1** (sans lui, pas de tournée réelle → pas de test IRL).
- **Le cousin AVISE (protocole payant).** LOT 2 jugé TRIVIAL (`rrule` reste string, `pushEvent` inchangée). Calcul UNTIL DST-safe validé.
- **Décision design LOT 2 = « unité + champ N »** ; positionnels retirés de l'UI V1 mais **restent lisibles** (parsing inchangé).

## 🍏 CONFORMITÉ NC vs APPLE + BRIQUE 2 (UNTIL) — CLOUÉ (12-07-26)
- **NC déjà QUASI CONFORME à Apple (PROUVÉ).** Écart unique = verbosité (`INTERVAL=1` que NC écrivait, Apple omet) → nettoyé (#37).
- **FORMAT UNTIL D'APPLE — CAPTURÉ :** `UNTIL=20260930T215959Z` = fin de journée LOCALE convertie en UTC + `Z`. DST-safe obligatoire (`getTime()`).
- **DÉCISION BRIQUE 2 : `UNTIL` (date de fin), PAS `COUNT`** (rythme terrain = fin pensée en saison commerciale → toujours une date).
- **Roue des jours = sujet brique 1** (adaptative 28/29/30/31 + bissextile) → fait (#37 LOT 1).

## 🔧 LEÇONS WEB INSPECTOR (méthode)
- **Clés localStorage PRÉFIXÉES, préfixe VARIABLE.** `Object.keys(localStorage)` d'abord. Ne JAMAIS supposer `cf_events` nu.
- **Où taper une commande :** BAS de l'onglet **Console** (`>`).
- **`copy(x)` renvoie `undefined`** (normal) mais met au presse-papier. Pour VOIR : `localStorage.getItem('…')`.
- **La recherche du panneau ment sur les gros XML** → lire/compter à l'œil.
- **Requêtes CalDAV tunnelées en POST** vers `/api/caldav` → chercher `POST`+`caldav`, pas « PROPFIND »/« GET » en clair. La grosse réponse = le listing du dossier ; les petites = PUT unitaires.
- **Repère d'un event = sa ligne `SUMMARY:`** ; distinguer 2 jumeaux de même SUMMARY par leur `UID:`.
- **Ce qu'on surveille sur un PUT test = le champ ciblé (ex. `UID`), pas l'`getetag`** (l'etag bouge à chaque écriture, c'est normal).

## 🗺️ RÉCONCILIATION DOC ↔ ARCHI RÉELLE — SCELLÉE (06-07-26)
- **README racine = SOURCE D'ARCHI CERTIFIÉE** (`main` @ `7d7763a`). README moteur = ossature + renvoi.
- **`src/sync/`** = cœur offline-first / ÉCRITURE. **4 sacrées :** `pushEvent`/`deleteEvent` → `src/sync/pushEvent.js` ; `syncCalendar`/`syncCalDAV` → `src/App.jsx`. PAS dans `caldav.js`.
- `icons/` = 25 SVG. `NomadTask.jsx` (pas `TaskDrawer.jsx`).

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
- **#31 (`4c2d5cc`)** a tout amené en prod : tunneling + PR-a + PR-b + α. **#32 (`b73e5c0`) jamais en prod.** ⚠️ Reverter `4c2d5cc` = INTERDIT.

---

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
- **PR-a (`70e595e`)** : `parseEvents` découpe TOUS les VEVENT (regex `/g`). **PR-b (`349ade1`)** : `mergeRecurrenceExceptions` au rendu, `RECURRENCE-ID` → `getTime()` local. ⚠️ Fusion au RENDU, pas dans la donnée.

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling `e1e7763`** (#31). Prod 401 = clé révoquée → "Se déconnecter" · Preview 405 = Vercel bloque WebDAV → tunneling POST + `X-HTTP-Method-Override` · Preview 401 = coquilles → coller la clé.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- DST-proofing : `getTime()` pour UNTIL ; helpers date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (UTC → off-by-one).

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT + vérifier le titre du Web Inspector** avant d'inspecter.
- **Lire le brut AVANT de conclure « aucune fenêtre n'a raison »** — souvent l'une est fidèle.
- **Inspecter la PROD est permis en LECTURE SEULE** quand l'état du bug y vit déjà et n'est pas reproductible en preview. « Jamais la prod » vise l'ÉCRITURE.
- **Serveur en maintenance = observation suspendue.**
- **Export client (ICS iCal/macOS) = copie du CACHE**, peut mentir → le PROPFIND prime.
- **WeekCal ≠ Apple natif** pour la structure iCloud → cas de test dans Apple natif.
- **Le timonier aussi doit prouver au brut avant de graver une cause/cible** (13/07, resservi 19/07). Le doute s'inscrit dans le brief, ne se grave pas.
- **L'objection du capitaine est un garde-fou** : elle a stoppé l'extrapolation « Apple réécrit l'UID » (19/07).

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- **Certification archi : `main` @ `7d7763a`.**
- Commits/PR : `ac0a025` (α scopé) · `4c2d5cc` (#31) · `e1e7763` (tunneling) · `70e595e` (PR-a) · `349ade1` (PR-b) · `ca19691` (#35 fix A) · #36 (enqueue offline) · #37 (EventForm) · #38 (fix B) · **#39 (LOT C périodes, identité figée, mergé 19-07).**
- **Calendrier de test : `ZZ-TEST-REC`** (iCloud, dédié — jamais l'agenda pro). **Calendrier périodes : `nomadcal-oc`** (NomadBook y est verrouillé).
- **Bruts périodes (19/07) :** PROPFIND `nomadcal-oc` = 10 ressources (5 paires) ; export macOS `NomadCal_OC.ics` = 11 VEVENT (triplon Juil–Sept = cache client). Ressource-témoin C1 : `nomadcal-rapport-1782035089446@nomadcal` (etag `mrg6ps2h`→`mrg6ps2i` après note test).
- Backups locaux : export natif Settings 6 clés (16/07 12:49 + 19/07). ⚠️ ne couvre pas `nb_periods_cache`.
