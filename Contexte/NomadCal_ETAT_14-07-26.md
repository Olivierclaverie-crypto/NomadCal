# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, et la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 14/07/2026 (**RÉCURRENCE-ÉDITION OK — PR 1 #35 + PR 2 #36 MERGÉES EN PROD**, prouvées au brut ; blocage offline levé ; **prochaine étape = brief EventForm**).*

---

## ✅ CHANTIER RÉCURRENCE-ÉDITION — CLOS (PR 1 + PR 2 MERGÉES 14-07)
*Bloc de clôture — passera au JOURNAL/ACQUIS, puis sera retiré de l'établi.*
- **PR 1 (#35, `pushOccurrenceException`) MERGÉE.** Éditer une occurrence n'écrase plus la série : GET-modify-PUT sur le href master → ajoute/remplace un VEVENT exception (même UID, `RECURRENCE-ID` heure locale+TZID, sans RRULE), master + RRULE préservés. `pushEvent`/`deleteEvent` intactes.
- **PR 2 (#36, enqueue offline) MERGÉE.** Le blocage temporaire « modification d'occurrence indisponible hors connexion » est **levé**. Op `op:"exception"` enfilée dans `pendingQueue` (file générique `{op,ev,ts}`, aucun changement structurel), rejouée au flush par `pushOccurrenceException(item.ev,auth)` (re-GET master frais). 2 sites `App.jsx` touchés, non sacrés : save handler (→ `enqueueWrite`) + branche `flushQueue` (`else if op==="exception"`, contrôle `r.ok` : succès → quitte la file, 503 → reste pour retry). Écart mineur assumé (r.ok + `onPutSuccess` au lieu du seul `await`) : nécessaire pour « quitte après flush réussi » sans perdre l'op sur 503.
- **PROUVÉ AU BRUT (preview `c7dd6e1` → prod, série FRAÎCHE Apple natif `Test flush`) :** édition offline → op en attente (aucune écriture serveur, message de blocage disparu) → retour réseau → flush → **1 href / 2 VEVENT** (master RRULE intact + exception `RECURRENCE-ID:20260725T180000` heure murale locale sans `Z`). File vide après flush (`cf_pending` absent). Idempotence : remplacement au même `RECURRENCE-ID` → pas de doublon au double flush. Marqueur `VALARM ACTION:NONE` (natif Apple) sur l'exception = bénin, ne déclenche rien.
- **Bug B : NON reproduit au brut (13-07)** — création + édition d'occurrence saines côté serveur. B reste théorique, non reproduit terrain.

## 🩹 CHANTIERS SÉPARÉS RÉVÉLÉS PAR PR 1/2 (à traiter à part, une variable chacun)
- **Refresh d'affichage auto après modif/création** (idée capitaine). Après une édition d'occurrence, NC affiche transitoirement un doublon (ancienne + nouvelle) jusqu'à un refresh manuel qui relance `mergeRecurrenceExceptions`. **Données saines** (brut propre) = pur affichage, le « défaut refresh manuel » connu. Chantier dédié (INVESTIGUER léger : où/quand déclencher le refresh sans boucle/clignotement). NE PAS bricoler dans une PR de fix.
- **Sélecteur d'étendue d'édition** (« cette occurrence / suivantes / toute la série »). N'a jamais existé dans NC (pas une régression). Le socle technique (écriture d'exception) est posé ; l'UI de choix ira dans le **chantier EventForm**.

## 🎯 OÙ ON EN EST (charnière)
- **Couche 2 ÉCRITURE : terrain sain et éprouvé.** α neutralisé en prod (`ac0a025`). Récurrence-édition (A) close par exception RFC + enqueue offline.
- **Chantier actif = refonte EventForm, CADRÉE + AVISÉE cousin.** Observation au brut (3 events récurrents identiques Apple iPhone / Apple Desk / NC) → **NC déjà quasi conforme à Apple** → refonte LÉGÈRE. Brief rédigé + avisé, **2 décisions Olivier en attente** (voir bloc dédié). Prochaine étape concrète du projet.

## 🧰 REFONTE EVENTFORM — CADRAGE COMPLET (brief AVISÉ, go Olivier requis)
*Prérequis de testabilité (sans EventForm aligné Apple, pas de cas de test propres). Serveur sain.*

**Constat conformité (PROUVÉ au brut) :** récurrence hebdo simple → NC produit un VEVENT sain, `DTSTART;TZID=Europe/Paris` identique à Apple. Écart unique : NC écrit `FREQ=WEEKLY;INTERVAL=1`, Apple écrit `FREQ=WEEKLY` nu (INTERVAL=1 = défaut → équivalent RFC 5545, juste bavard).

**Les 3 briques, décidées :**
1. **Roues (WheelSelect) — existent déjà.** Vrai travail = fiabiliser la roue des jours (aujourd'hui `day` = 01→31 fixe → permet « 31 février »). À rendre adaptative (28/29/30/31 + bissextile). Racine corrigée UNE fois → la roue de fin de récurrence en hérite.
2. **Fin de récurrence — DÉCIDÉ : `UNTIL` (date), PAS `COUNT`.** UI = 2 choix (« aucune fin » / « se termine le [date] »). Format cible brut Apple : `UNTIL=AAAAMMJJT215959Z` (fin de journée locale → UTC + `Z`). ⚠️ Calcul UTC **DST-safe** obligatoire (`getTime()`, jamais `.toISOString().slice(0,10)`).
3. **Nettoyage `INTERVAL=1` — DÉCIDÉ : on nettoie.** NC n'écrit `INTERVAL` que si ≥ 2.

**Emplacement (timonier, lecture seule) :** picker de fin en zone conditionnelle sous `Répéter` (si `rrule` ≠ « Aucune »), réutilise `WheelSelect`. EventForm **n'est pas une sacrée** → chantier sans risque sur le cœur écriture.

**Brief V1 (test famille) = 3 lots batchés :** LOT 1 roue des jours adaptative (socle) · LOT 2 A1 intervalle libre (« toutes les [N] unités ») · LOT 3 UNTIL DST-safe + nettoyage INTERVAL=1. Fichiers : `WheelSelect.jsx` + `EventForm.jsx` + `constants.js` (+ `helpers.js` si dates). Zéro sacrée. Détail : `NomadCal_BRIEF_EVENTFORM_AVISE_12-07-26.md`.

**2 DÉCISIONS OLIVIER EN ATTENTE (avant go) :**
1. **Design LOT 2 — TRANCHÉ option (i)** : remplacer le `<select>` figé par « unité + champ N ». Positionnels retirés de l'UI V1, restent lisibles. (À confirmer : impact nul sur positionnels existants type EYROLLES.)
2. **Séquencement bug B — NON TRANCHÉ (point ouvert).** Ce brief améliore la saisie mais ne corrige pas B (fantôme à la création). Routes : (1) corriger B avant (protocole lourd, `mergeStrategy`) / (2) avancer sous discipline « jamais supprimer un doublon depuis iCal » / (3) confirmer B terrain d'abord. **À trancher au prochain brainstorm.**

**Séquence :** décisions Olivier → go explicite → PR isolée + test preview → merge → MAJ moteurs.

## 🧬 ROADMAP RÉCURRENCE ÉTAGÉE — OBJECTIF FERME, CHEMIN PAR PALIERS (décidé 12-07)
*Compositeur de récurrence complet = objectif FERME de la sortie publique, PAS une option. Seul le calendrier est étagé, pas l'ambition.*
- **A1 — intervalle libre** (« toutes les [N] jours/semaines/mois/ans »). ➡️ **DANS LA V1 test famille** (brief EventForm). Besoin terrain PROUVÉ.
- **A2 — multi-jours hebdo** (`BYDAY=MO,TH`). NC sait l'écrire, manque l'UI.
- **A3 — positionnel mensuel** (« le [premier…dernier] [jour] »).
- **A4 — jours du mois par numéro** (« le 4 et le 24 »).
- **COUNT — fin par nombre d'occurrences.** Cas professions libérales. Indépendant de A2-A4.
- **Modèle cible = compositeur Apple** (2 étages : raccourcis + Personnaliser). A2→A4 + COUNT = paliers faits **avant sortie publique**, chacun sa PR.
- **Note produit :** différenciateurs (todo flottante, NomadBook, NomadFeed) stables → pas le goulot.

## 🔭 LES 3 BUGS RÉCURRENCE — après EventForm
Ordre recommandé : **C → B → A**. *(A traité par discipline + PR 1/2 ; le correctif de fond A = exception RFC, désormais EN PLACE.)*
- **Bug A — édition d'occurrence écrase la série. ✅ CORRIGÉ (PR 1 exception + PR 2 offline).** Reste la discipline pour les séries déjà écrasées avant fix.
- **Bug B — fantôme à la création (LE PLUS DANGEREUX).** `mergeEvents` (`mergeStrategy.js:14-20`) préserve le master-local `calflow-<ts>` → coexiste avec l'occurrence n°1 → doublon. Le fantôme EST la ressource master → DELETE dessus efface la série. Danger PASSIF. Prouvé localement ; iCloud non prouvé. Zone cœur écriture → protocole maximal.
- **Bug C — event à cheval sur minuit mal affiché.** `App.jsx:643-644` : rendu sans clip par jour. Pur AFFICHAGE. Correctif = clip par jour. Le plus sûr (réversible, aucune sacrée).

## 🛟 GARDE-FOUS COMPORTEMENTAUX (toujours valables)
- **Bug B :** ne **JAMAIS** supprimer un doublon suspect depuis iCal — CE geste efface la série. Si besoin : supprimer la série entière depuis NC puis recréer.
- **Fantôme iCal :** après un écrasement, iCal peut afficher une série morte que ni « actualiser » ni OFF/ON iCloud ne dissolvent, **cache par-appareil**. **Seul le brut Web Inspector fait foi.** Exception « supprimer depuis iCal » tolérée UNIQUEMENT si le brut a prouvé qu'aucune ressource ne vit derrière.
- **iCloud en 503 / maintenance :** toute observation suspendue (bruts non fiables).
- **Cache PWA iOS :** force-refresh Safari avant de soupçonner le code (sert l'ancien après deploy).

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2 LECTURE~~ · ~~α neutralisé~~ · ~~investigation 3 bugs~~ · ~~bug A confirmé~~ · ~~conformité NC vs Apple~~ · ~~cadrage EventForm~~ · ~~récurrence-édition (PR 1 + PR 2)~~ → **FAITS.**
2. **Refonte EventForm** (cadrée, brief avisé) : 2 décisions Olivier → go → PR.
3. **Corriger les bugs restants :** C (sûr) → B (danger max, protocole lourd). *(A = corrigé.)*
4. **Nettoyage** events de test + **γ** (clearTombstone sur échec).
5. **EYROLLES** (23/07, 2 UID — cas distinct).
6. Drag & drop. 7. Vues jour/mois/année. 8. **Récurrences avancées** (roadmap étagée). 9. Fonction rapport NomadBook (`NomadCal_FONCTION_RAPPORT_06-07-26.md`). 10. Settings + cosmétique.

## 📋 ITEMS EN FILE (pas urgents)
- Défauts synchro de fond : B1 (erreurs avalées `App.jsx:406`), B3 (garde anti-réentrance morte), B4 (couplage flush→lecture), γ (tombstone).
- **Défaut « refresh manuel »** : la synchro d'affichage ne se rafraîchit pas seule.
- **Dette « deux `toISO` divergents »** : `helpers.js:13` (locale) vs `caldav.js:211` (UTC). Recoupe le point dur UNTIL de la brique 2 EventForm.
- **À porter au README quand on CODERA les fix** : rendu multi-jour sans clip (`App.jsx:643`) ; `mergeEvents` garde le master-local ; deux `toISO` divergents ; **nouvel `op:"exception"` de la file (PR 2)**.
- **🔐 Sécurité (hors code) :** mot de passe d'app iCloud passé en clair le 14-07 → **à régénérer** sur appleid.apple.com puis ressaisir dans NC.
- Tests récurrence (QCM 17) : après les fix. Cosmétique = FERMÉ jusqu'à V1.
- **Essaimage** des items transposables (méthode briefing, deux jauges) vers les autres projets.

## 🟢 REPRENDRE EN DÉBUT DE SESSION
1. **Préciser le carburant session à Claude** (ex. « il reste 58 % »).
2. Lire cet État + le README. JOURNAL/ACQUIS seulement si besoin.
3. **Chantier actif : refonte EventForm.** Brief rédigé + avisé (`NomadCal_BRIEF_EVENTFORM_AVISE_12-07-26.md`). **2 décisions Olivier à trancher** (design LOT 2 confirmé sur positionnels existants ; séquencement bug B) → go explicite → PR isolée + test preview → merge.
- **Chantiers séparés notés :** refresh-auto après modif ; sélecteur d'étendue d'édition (→ EventForm).
- **Atelier de test :** `ZZ-TEST-REC` (`1925D1D3-…`) contient des séries de test (`Test flush`, `Test pr 1.2`…) avec exceptions — à nettoyer. Cas de test = série **fraîche** Apple natif, jamais un event déjà écrasé.
- **NE RIEN coder/merger/appliquer sans le go explicite d'Olivier.**
