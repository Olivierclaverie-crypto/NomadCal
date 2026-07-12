# JOURNAL / ACQUIS — NOMADCAL
*Classeur des leçons apprises à la dure et des chantiers scellés. On NE le relit PAS à chaque session — on vient le consulter quand on est coincé. Il grossit ; c'est normal. Pour l'avancement en cours → fichier « État du projet ». Pour la méthode → Instructions. Pour l'archi → README moteur (+ README racine du repo pour le détail exhaustif).*

---

## 🧭 BRIEF EVENTFORM AVISÉ + ROADMAP RÉCURRENCE ÉTAGÉE — CADRÉ (12-07-26, aprèm)
*Session brainstorm + rédaction brief EXÉCUTER. Aucun code écrit. Le cousin a lu EventForm+WheelSelect et avisé avant de coder.*

- **Roadmap récurrence = objectif FERME, chemin étagé (décision capitaine, tranchée après débat).** Le compositeur complet (niveau des grands) n'est PAS optionnel : c'est un ticket d'entrée de la sortie publique. On étage le CALENDRIER (paliers A1→A4 + COUNT), pas l'AMBITION. Olivier assume de décaler la sortie publique. Piège de conception évité : ne PAS confondre « V1 test famille » (socle fiable, dogfooding IRL) avec « sortie publique » (crédibilité concurrentielle) — les deux n'exigent pas les mêmes paliers. **A1 (intervalle libre) entre en V1** car sans lui, pas de tournée réelle dans NC → pas de test IRL (la force du projet). Multi-jours/positionnel = paliers suivants, pas dans le vécu terrain d'Olivier.
- **Vécu terrain qui fige A1 :** « je reviens jeudi ? — OK — et si on régularisait, toutes les 4 semaines ? — jeudi oui mais plutôt toutes les 6 » → `FREQ=WEEKLY;INTERVAL=6;BYDAY=TH`. Un jour + intervalle libre. Pas de multi-jours dans ce geste.
- **Le cousin AVISE (protocole payant, encore).** Sur le brief 3-lots : (1) faisabilité OK, contenu à `WheelSelect`+`EventForm`+`constants` ; (2) LOT 2 jugé **TRIVIAL** — `rrule` reste une string, `pushEvent` (sacrée) inchangée, une `composeRRule()` remplace juste ce qui remplit la string → la condition d'arrêt du brief était prudente mais inutile ici ; (3) calcul UNTIL DST-safe validé (`new Date(y,mo-1,d,23,59,59).toISOString()` nettoyé → `20260930T215959Z`).
- **⚠️ ALERTE SÉQUENCEMENT levée par le cousin (le point neuf) :** ce brief améliore la SAISIE mais **ne corrige pas le bug B** (fantôme à la création). Or mettre la vraie tournée dans NC = créer des récurrents = **déclencher le fantôme B à chaque fois**. L'améliration de saisie et le sol troué sont deux choses : soigner la saisie ne suffit pas au test IRL. **Décision non tranchée** (corriger B avant / discipline / confirmer B terrain). Leçon : un chantier « qualité de saisie » peut buter sur un bug « qualité de donnée » sous-jacent — les séquencer, ne pas les mélanger.
- **Décision design LOT 2 = option (i) :** remplacer le select figé par « unité + champ N » ; positionnels retirés de l'UI V1 mais **restent lisibles** (parsing inchangé). Non *créables* ≠ non *affichables*.

## 🍏 CONFORMITÉ NC vs APPLE + BRIQUE 2 (UNTIL) CADRÉE — CLOUÉ (12-07-26)
*Étape 0 du chantier EventForm : INVESTIGUER « écarts NC vs Apple », lecture seule, serveur sain. 3 events récurrents identiques créés dans `1925D1D3-…`, montés sur iCloud, bruts lus côte à côte.*

- **NC est déjà QUASI CONFORME à Apple (PROUVÉ au brut).** Sur une hebdo simple, les 3 VEVENT (Apple iPhone `//iPhone OS`, Apple Desk `//macOS`, NC `//NomadCal//FR`) ont le **même `DTSTART;TZID=Europe/Paris`**, même structure saine, cohabitent sans erreur dans le même calendrier. **L'intuition « NC diverge gravement d'Apple » est INFIRMÉE.** La « refonte » EventForm est donc LÉGÈRE.

- **Écart unique observé = verbosité, pas non-conformité.** Apple écrit `RRULE:FREQ=WEEKLY` nu ; NC écrit `FREQ=WEEKLY;INTERVAL=1`. `INTERVAL=1` = valeur par défaut RFC 5545 → **strictement équivalent**. **Décision capitaine : on nettoie** (NC n'écrira `INTERVAL` que si ≥ 2).

- **FORMAT UNTIL D'APPLE — CAPTURÉ (le trésor de la brique 2).** Event Apple Desk modifié avec fin « le 30/09/2026 » → brut : `RRULE:FREQ=WEEKLY;UNTIL=20260930T215959Z`. Décodage : **fin de journée LOCALE convertie en UTC + `Z`**. `215959` = 21:59:59 UTC = 23:59:59 Paris (été, UTC+2). ➡️ **Spec NC :** « se termine le [date] » → `UNTIL=AAAAMMJJThhmmssZ` calculé en **instant absolu UTC**. ⚠️ **DST-safe obligatoire** (`getTime()`, jamais `.toISOString().slice(0,10)`) — même famille de piège que la dette « deux toISO ». Point dur du futur brief cousin.

- **DÉCISION BRIQUE 2 : `UNTIL` (date de fin), PAS `COUNT`.** Interface Apple (capture) offre 3 fins : **Jamais** (infini) / **Après** (COUNT, n occurrences) / **Le** (UNTIL, date). Motif terrain capitaine : rythme réel = « toutes les X semaines le [jour] » + fin pensée en **saison commerciale** (année/semestre) → toujours une date. `COUNT` ne correspond à aucun réflexe terrain → écarté (minimum de code V1). UI NC = 2 choix (« aucune fin » / « se termine le [date] »).

- **Roue des jours = vrai sujet brique 1.** `WheelSelect` : `day` toujours 01→31 quel que soit le mois → permet « 31 février » → `2026-02-31` invalide part dans la machine. À rendre adaptative (28/29/30/31 + bissextile). Racine corrigée une fois → la roue de fin de récurrence en hérite (sinon UNTIL invalide possible).

- **Modèle « compositeur » Apple (captures) — pour le futur chantier récurrences avancées.** Apple = 2 étages : raccourcis (jours/semaines/mois/ans) + « Personnaliser » qui déploie par fréquence : intervalle + **multi-jours cochables** (L M M J V S D) + positionnel (« le [premier] [jour] ») + jours du mois par numéro. NC = liste plate figée (18 options) et asymétrique. **Ne PAS rallonger la liste plate — étudier le compositeur.** Chantier à part (déclencheur : professions libérales). NON ouvert.

- **Méthode confirmée :** créer les 3 events **identiques** (une seule variable = qui écrit) + **vérifier qu'ils montent sur iCloud** (apparition dans Desk) avant de lire → la comparaison côte à côte au brut est le seul juge de conformité (pas la seule ligne RRULE, mais tout le VEVENT).

## 🩸 BUG A CONFIRMÉ TERRAIN iCLOUD + FANTÔME D'AFFICHAGE iCAL — CLOUÉ (11-07-26, soir)
*Capture au Web Inspector sur la PROD (lecture seule, aucune écriture). Reproduction réelle : création série hebdo dans NC → OK dans iCal → édition 2ᵉ occurrence dans NC → série disparaît de NC, iCal affiche « série + event modifié » = doublon apparent. Le brut tranche.*

- **Bug A = ÉCRASEMENT, prouvé sur la donnée réelle.** Le calendrier de test (`1925D1D3-5FA1-4FE3-8C5B-FCAC95DC3F23`) ne contenait plus qu'**UNE** `<response>` : `calflow-1783755744987.ics`. Dedans : un seul VEVENT, `UID:calflow-1783755744987_20260718`, `SUMMARY:Test I 1`, `DTSTART 20260718T103000`, **sans RRULE** (seules RRULE = VTIMEZONE `FREQ=YEARLY`, décor Apple). → **La série récurrente n'existe plus sur iCloud.** L'édition d'occurrence a remplacé le master par un event unique daté. Confirme le mécanisme code (`pushEvent` PUT sur href master, RRULE omise).

- **L'intuition « doublon à côté » est INFIRMÉE par le brut.** `FREQ=WEEKLY` introuvable dans le calendrier de test ; une seule ligne `SUMMARY:Test I 1` ; inventaire complet du dossier = **un seul** `<response>`. Pas de seconde ressource, pas de série survivante. Écrasement pur, pas doublon.

- **Le « doublon » d'iCal = FANTÔME D'AFFICHAGE APPLE.** Serveur = 1 ressource → les 2 events qu'iCal montrait ne correspondent à AUCUNE ressource réelle → cache local Apple non resynchronisé. **Résistance prouvée :** « Actualiser » → sans effet ; **OFF/ON du calendrier iCloud** → sans effet non plus. Tombé seulement en le supprimant depuis iCal (voir exception).

- **⚠️ CACHE PAR-APPAREIL (précisé 12-07).** Le fantôme est un cache **local à chaque device**, désynchronisé du serveur indépendamment : supprimé sur iPhone → **persistait sur Desk** ; « toute la série » supprimée sur Desk → event écrasé parti de Desk ET NC (donc d'iCloud) MAIS **persistait sur iPhone**. → **Purger le serveur ne rafraîchit pas chaque client ;** chaque client Apple garde sa propre mémoire tant qu'un resync « béni » n'a pas eu lieu. Nettoyage complet = geste **sur chaque appareil**.

- **Les 3 fenêtres, vérité au centre :** **iCloud = 1 ressource = LA VÉRITÉ.** **NC = FIDÈLE** (affichait 1 event ; sa « perte de série » était normale). **iCal = MENTAIT** (cache). ➡️ Ne jamais poser « aucune fenêtre n'a raison » avant d'avoir lu le brut.

- **EXCEPTION AU PROTOCOLE « ne jamais supprimer depuis iCal » — levée proprement (modèle méthode).** Interdit habituel (bug B : le fantôme EST le master → DELETE efface la série). Ici autorisé car le brut avait **prouvé** qu'aucune ressource réelle ne vivait derrière. Geste inoffensif, comme prédit. **Doctrine :** on ne lève pas un garde-fou pour aller vite — on le lève en **démontrant au brut** qu'il ne s'applique pas.

- **⚠️ Le fantôme n'est PAS effacé rétroactivement par le futur fix A.** Corriger l'écrasement protège les futures séries, ne purge pas un cache iCal déjà installé.

- **Piste (NON prouvée) :** « verrou de méthode Apple » — les clients tiers écrivent dans un iCloud dont Apple contrôle strictement la resync ; produire un iCal aligné Apple pourrait AUSSI réduire ces fantômes. Radar, pas fait.

- **Rappel méthode Web Inspector :** la barre de recherche **ment sur les gros blocs XML** (`.ics`/`FREQ=WEEKLY` « introuvable » alors qu'à l'écran) → **compter/lire à l'œil**. Distinguer réponse fichier unique (`…/xxx.ics`, un `<response>`) d'un inventaire de dossier (`x-final-url` finissant par `/`, 207, gros `Content-Length`). Repère d'un event = sa ligne `SUMMARY:`. Calendriers distincts : `1925D1D3-…` (tests NomadCal) ≠ `M2CD-6-4-…` (EYROLLES/WeekCal).

## 🛑 RÈGLE — SERVEUR iCLOUD EN MAINTENANCE = OBSERVATION SUSPENDUE (12-07-26)
*Vécu le 11-07 après-midi : 503 puis « L'app Calendrier est verrouillée — maintenance des comptes ».*
- **503 / « verrouillé » / « maintenance » = serveur absent.** Toute observation (conformité, caches, sync) est **suspendue** : les bruts sont non fiables. Ne jamais diagnostiquer NC dessus.
- **Event créé pendant le 503 = né corrompu :** enregistré en local sur l'appareil mais **jamais monté sur iCloud** (upload échoué) → absent de Desk et NC → **inexploitable comme cas de test**, à jeter à la reprise. (Ne PAS confondre avec un cache par-device : ici le serveur n'a JAMAIS eu la donnée.)
- **Reprise :** vérifier qu'iCloud répond (plus de 503) AVANT de recréer les cas de test.

## 🔬 INVESTIGATION LARGE « FABRIQUE À DOUBLONS » → 3 BUGS DISTINCTS — CLOUÉ (11-07-26)
*Chaîne Brief 2 (INVESTIGUER, prouve A) → Brief 4 (INVESTIGUER large, cartographie dates). 100 % code, lecture seule.*

- **Verdict racine : MULTIPLE, N = 3 bugs distincts.** L'hypothèse « routine de recalcul de date fragile PARTAGÉE » est INFIRMÉE. Deux `toISO` divergents (`helpers.js:13` locale vs `caldav.js:211` UTC) ; le seul recalcul fragile (`toISO` UTC dans `expandRecurring`, `caldav.js:347`) ne cause aucun des 3 symptômes.
- **Bug A — édition d'occurrence écrase la série (écriture/identité).** `pushEvent.js:37` (`ev.rrule && !ev.isRecurring`), UID suffixé `caldav.js:351`, PUT sur href master `App.jsx:764`. ✅ Confirmé terrain iCloud 11-07. Correctif = exception RFC 5545 (UID master + `RECURRENCE-ID`, pas d'`EXDATE`) = ex-Brief 3, en réserve.
- **Bug B — fantôme à la création (merge/identité) — LE PLUS DANGEREUX.** `mergeEvents` (`mergeStrategy.js:14-20`) préserve le master-local `_pending` → coexiste avec l'occurrence n°1 → doublon. Fantôme = ressource master → `deleteEvent` (`pushEvent.js:99`) efface toute la série. Prouvé localement ; iCloud non prouvable sans réseau. Danger PASSIF.
- **Bug C — event à cheval sur minuit (pur AFFICHAGE).** `App.jsx:643-644` sans clip par jour. Fix = clip par jour. Aucun UTC en cause.
- **Carte des recalculs de date (SAINS) :** `EventForm.jsx:32-33` (endDate existe déjà), `pushEvent.js:12-17`, `App.jsx:578`, `helpers.js:13-17`.
- **Leçon méthode :** une intuition « racine commune » infirmée par le code garde sa valeur — elle a déclenché la cartographie qui a séparé 3 bugs (3 PR, jamais fusionnées). A et B = même famille (identité master ↔ occurrence), deux mécanismes ; C indépendant.

## ✅ α NEUTRALISÉ (SCOPÉ LECTURE SEULE) — SCELLÉ EN PROD (10-07-26)
- **Commit `ac0a025`** — `src/utils/caldav.js` (`caldavRequest`, `+15/−9`). `READ_METHODS = {PROPFIND, REPORT}` → timeout 20 s sur ces deux seulement. PUT / DELETE / MKCALENDAR → `fetch` nu. Un PUT lent mais abouti ne peut plus être avorté → risque de doublon iCloud ÉLIMINÉ.
- Tunneling `X-HTTP-Method-Override` intact. 4 sacrées / `api/caldav.js` / `Contexte/` non touchés. Validé preview avant merge. NB : le PUT est tunnelé en POST (normal de ne pas voir « PUT »).

## 🔧 LEÇONS WEB INSPECTOR (méthode)
- **Clés localStorage PRÉFIXÉES, préfixe VARIABLE :** `olivierclaverie01072026_cf_events` / `_cf_tasks` … ET `olivierclaverie@me.com_cf_pending` ET clés nues (`cf_auth`). **Ne JAMAIS supposer `cf_events` nu.** `Object.keys(localStorage)` d'abord.
- **Où taper une commande :** BAS de l'onglet **Console** (`>`). La loupe des Sources cherche du TEXTE, n'exécute pas.
- **`copy(x)` renvoie `undefined`** (normal) mais met la valeur au presse-papier. Pour VOIR : `localStorage.getItem('…')` sans `copy()`.
- **La recherche du panneau ment sur les gros XML** → lire/compter à l'œil.
- **Backup `cf_events` = dans le BON bac** (WKWebView isolé).

## 🗺️ RÉCONCILIATION DOC ↔ ARCHI RÉELLE — SCELLÉE (06-07-26)
- **README racine = SOURCE D'ARCHI CERTIFIÉE** (`main` @ `7d7763a`). README moteur = ossature + renvoi (forme A+).
- **`src/sync/`** (`pushEvent.js`, `pendingQueue.js`, `mergeStrategy.js`, `index.js`) = cœur offline-first / ÉCRITURE.
- **4 sacrées :** `pushEvent`/`deleteEvent` → `src/sync/pushEvent.js` ; `syncCalendar`/`syncCalDAV` → `src/App.jsx`. PAS dans `caldav.js`.
- `icons/` = 25 SVG. `WheelSelect`, `Toast/` oubliés. `TaskDrawer.jsx` n'existe pas → `NomadTask.jsx`.

## 🧬 LIGNÉE `main` — CLOUÉE PAR LE COUSIN (05-07-26)
- **#31 (`4c2d5cc`)** a tout amené en prod : tunneling + PR-a + PR-b + α. **#32 (`b73e5c0`) jamais en prod.** ⚠️ Reverter `4c2d5cc` = INTERDIT (détruirait synchro + couche 2 lecture).

## ⏱️ α (TIMEOUT 20 s) — HISTORIQUE (résolu le 10-07)
- Était : `AbortController` + `setTimeout(20000)` sur TOUTES les requêtes. Spéculatif, dangereux en écriture. Résolu par option B (timeout gardé en lecture, retiré en écriture). Commit `ac0a025`.

---

## ✅ RESTRUCTURATION DE LA DOC — SCELLÉE (05-07-26)
- 4 fichiers moteurs : Instructions · README · État · Journal/Acquis. Double jeu Projet + `Contexte/`. MAJ à l'ÉVÉNEMENT, seulement les fichiers touchés, horodatage `JJ-MM-AA`. Conflit → les 4 moteurs gagnent.

## ✅ COUCHE 2 LECTURE — SCELLÉE (PR-a lit, PR-b fusionne)
- **PR-a (`70e595e`)** : `parseEvents` découpe TOUS les VEVENT (regex `/g`). **PR-b (`349ade1`)** : `mergeRecurrenceExceptions` au rendu `allEvs`, `RECURRENCE-ID` → `getTime()` local, stableId `${UID}_exc_${recurrenceId}`. ⚠️ Fusion au RENDU, pas dans la donnée.

## ✅ SYNCHRO — CLOSE ET MERGÉE EN PROD
- **Tunneling `e1e7763`** (#31). Prod 401 = clé révoquée → **"Se déconnecter"** · Preview 405 = Vercel bloque WebDAV → tunneling POST + `X-HTTP-Method-Override` · Preview 401 = coquilles → coller la clé.

## ✅ COUCHE 1 RÉCURRENCE — SCELLÉE
- DST-proofing : `getTime()` pour UNTIL ; helpers date locale pour EXDATE — jamais `.toISOString().slice(0,10)` (UTC → off-by-one). **← même règle que le point dur UNTIL de la brique 2 EventForm.**

---

## 📚 LEÇONS SYNCHRO (capital méthodo)
- **Web Inspector au câble prime sur les logs Vercel.** « Reconnecter » ne vide pas `cf_auth` ; seul **"Se déconnecter"** le fait. Toujours COLLER les clés. Isolation WKWebView : bac PWA ≠ Safari ≠ preview.

## 🧭 LEÇONS MÉTHODE (gravées — anti-perte de temps)
- **TOUJOURS se redonner le lien preview EXACT + vérifier le titre du Web Inspector** avant d'inspecter.
- **Une preview vide = clé périmée dans le `cf_auth` de CE bac** → Se déconnecter/reconnecter en collant. Pas un bug du code.
- **Lire le brut AVANT de conclure « aucune fenêtre n'a raison » (11-07) :** souvent l'une est fidèle.
- **Inspecter la PROD est permis en LECTURE SEULE quand l'état du bug y vit déjà et n'est pas reproductible en preview (11-07).** « Jamais la prod » vise l'ÉCRITURE.
- **Serveur en maintenance = observation suspendue (12-07)** — voir entrée dédiée.
- **WeekCal ≠ Apple natif** pour la structure iCloud → cas de test dans Apple natif.
- Dérives doc : α « en pause » alors en prod (05-07) ; 4 sacrées mal localisées + `src/sync/` manquant (06-07, cloué par certification cousin).

## 🗂️ ARTEFACTS DE RÉFÉRENCE
- **Certification archi : `main` @ `7d7763a`.**
- Commits : `ac0a025` (α scopé) · `4c2d5cc` (#31) · `b73e5c0` (#32, jamais prod) · `9b0a126` (α d'origine) · `e1e7763` (tunneling) · `70e595e` (PR-a) · `349ade1` (PR-b).
- **Calendrier de test : `ZZ-TEST-REC`** (iCloud, dédié — jamais l'agenda pro).
- **Pièce à conviction bug A (11-07) :** `calflow-1783755744987.ics` (calendrier `1925D1D3-…`), event écrasé `Test I 1` du 18/07 sans RRULE. Cas SALE → pas un banc d'essai pour le fix.
- **Bruts conformité (12-07) :** Apple iPhone `1B94DD7E-….ics`, Apple Desk `CD88A2D6-….ics` (avec UNTIL `20260930T215959Z`), NC `calflow-1783835296152.ics` — calendrier `1925D1D3-…`.
- Backups locaux type : NC natif (Settings) + `cf_events` préfixé via Console.
- `nomadcal_tests_recurrences.html` (QCM 17) ; `ZZ-TEST-REC3.ics`.
