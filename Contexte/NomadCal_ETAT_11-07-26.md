# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, et la reprise. Le déjà-fait scellé vit dans le JOURNAL/ACQUIS. Dernière MAJ : 11/07/2026 (soir : bug A **confirmé terrain iCloud** au Web Inspector ; « doublon » iCal **infirmé** = fantôme d'affichage Apple ; atelier de test nettoyé).*

---

## 🎯 OÙ ON EN EST (charnière)
- **On est dans la couche 2 ÉCRITURE.** α est neutralisé et en prod (`ac0a025`) — le terrain d'écriture est sain.
- **Bascule du 11-07 (matin) :** l'investigation (Brief 4, lecture seule) a transformé l'hypothèse UNIQUE « fabrique à doublons » en **TROIS bugs DISTINCTS, localisés fichier:ligne**. **La racine commune est INFIRMÉE** — pas une routine de date partagée, mais trois mécanismes séparés.
- **Confirmation terrain du 11-07 (soir) :** bug A **reproduit en réel sur la prod** (édition 2ᵉ occurrence) puis **prouvé au brut iCloud** (Web Inspector). Verdict : **écrasement pur** de la série, une seule ressource côté serveur. Le « doublon » qu'affichait iCal = **fantôme d'affichage Apple**, sans ressource réelle derrière (voir Journal 11-07). Prochaine étape annoncée par le capitaine : **refonte EventForm** (prérequis de testabilité, voir plus bas).
- Chaîne parcourue : Brief 2 (prouve bug A côté écriture) → Brief 4 (cartographie → bugs B et C + verdict racine multiple + évaluation de l'option « dates ») → capture terrain 11-07 (brut iCloud, lecture seule).

## 🔭 CHANTIER ACTIF — CORRIGER LES 3 BUGS (3 PR séparées, une variable chacune)
Ordre recommandé (à trancher par le capitaine) : **C → B → A**.

- **Bug A — éditer une occurrence écrase la série. ✅ PROUVÉ TERRAIN iCLOUD (11-07).** `pushEvent` fait un PUT sur le href/UID du **master**, RRULE omise → la série est remplacée par un event unique (UID suffixé `…_<date>`). *Côté écriture/identité.* **Brut du 11-07 :** après édition de la 2ᵉ occurrence, le calendrier de test (`1925D1D3-…`) ne contient plus qu'**UNE** ressource `calflow-1783755744987.ics` — un VEVENT unique `Test I 1`, `DTSTART 20260718T103000`, **sans RRULE** (les seules RRULE = VTIMEZONE `FREQ=YEARLY`, décor Apple). **La série récurrente n'existe plus sur le serveur.** L'intuition « doublon à côté » est **INFIRMÉE par la donnée** : c'est un **écrasement**, pas un doublon réel. Correctif = écriture d'exception conforme RFC 5545 (UID master + `RECURRENCE-ID`, pas d'`EXDATE`) = **ex-Brief 3, EN RÉSERVE**. Touche le corps de la sacrée `pushEvent` → protocole lourd. **Évitable par discipline.**
- **Bug B — fantôme à la création (LE PLUS DANGEREUX).** `mergeEvents` (`mergeStrategy.js:14-20`) **préserve** le master-local `calflow-<ts>` (id sans `_<date>`, `_pending`) car son id n'est jamais un id d'occurrence → il **coexiste** avec l'occurrence n°1 dépliée → **doublon**. Le fantôme **EST** la ressource master → le supprimer (DELETE) **efface toute la série**. *Côté merge/identité.* **Danger PASSIF** : frappe à la simple création + sync, sans action d'Olivier. Prouvé **localement** ; existence côté iCloud **non prouvée sans réseau**. Correctif = zone cœur écriture (`mergeStrategy`) → protocole maximal.
- **Bug C — event à cheval sur minuit mal affiché.** `App.jsx:643-644` : le rendu du segment n'a **aucun clip par jour** → il recolle `startTime` (23:00) sur J+1 au lieu de repartir à 00:00. *Pur AFFICHAGE, zéro donnée en jeu, aucun UTC en cause.* Correctif = ajouter le clip au rendu (jour de début `start→24:00`, jour de fin `00:00→end`, intermédiaires `00:00→24:00`). Le plus **sûr** (réversible, aucune sacrée).

## 🧰 REFONTE EVENTFORM (annoncée par le capitaine 11-07 — PRÉREQUIS DE TESTABILITÉ, pas cosmétique)
- **Trois briques :** (1) **5 roues** (WheelSelect) ; (2) **date de fin de récurrence** (UNTIL propre) ; (3) **mise en conformité Apple des choix de récurrence**.
- **Argument capitaine (retenu) :** sans un EventForm produisant un iCal aligné Apple, **on ne peut pas fabriquer de cas de test propres** → on ne peut pas tester les fix des bugs récurrence. Prolonge la règle « cas de test dans Apple natif » : ici on veut que **NC lui-même** produise des events aussi sains qu'Apple.
- **Statut :** chantier à part entière, à ouvrir **après** rangement du constat 11-07. C'est là que **le cousin (Claude Code)** devient le bon outil → brief à préparer par le timonier (Claude), go explicite d'Olivier requis.
- ⚠️ **À ne pas confondre** avec le bug d'affichage (fantôme iCal) : EventForm agit sur la **saisie/écriture**, pas sur le cache d'affichage Apple.

## 🧩 OPTION « DÉBUT DATÉ + FIN DATÉE » (piste candidate d'Olivier) — PARTIELLE
- **Corrige :** la SAISIE dans NC d'events à cheval / multi-jours. Peu coûteux — `endDate` existe déjà en state (`EventForm.jsx:33`, défaut = `startDate`) ; `pushEvent` sait déjà sérialiser `endDate||startDate` (`pushEvent.js:16-17`). **Aucune sacrée touchée** (UI : 2ᵉ WheelSelect daté).
- **Laisse debout :** A (identité écriture), B (merge), **C** (entre par la LECTURE d'un event iCal, la saisie n'y joue aucun rôle). Pour qu'un event à cheval créé dans NC s'**affiche** bien, il faut **AUSSI** le fix C.
- ➡️ Option de correction candidate, à traiter **à part** (pas dans le lot des 3 bugs). Recoupe partiellement la refonte EventForm ci-dessus.

## 🛟 GARDE-FOUS COMPORTEMENTAUX PROVISOIRES (en attendant les fix)
- **Bug A :** ne pas éditer une occurrence unique (déjà la pratique depuis ~3 mois).
- **Bug B :** ne **JAMAIS** supprimer un doublon suspect depuis iCal — c'est CE geste qui efface la série. Si besoin : supprimer la série **entière depuis NC** puis recréer.
- **Fantôme iCal (nouveau 11-07) :** après un écrasement, iCal peut afficher une série morte que **ni « actualiser », ni OFF/ON du calendrier iCloud** ne dissolvent. **Ne jamais s'y fier — seul le brut Web Inspector fait foi.** Exception au garde-fou « ne pas supprimer depuis iCal » tolérée UNIQUEMENT si le brut a **prouvé** qu'aucune ressource réelle ne vit derrière le fantôme (cas du 11-07 — voir Journal).

## 📋 RESTE À FAIRE POUR V1 (ordre)
1. ~~Couche 2 LECTURE~~ · ~~α neutralisé~~ · ~~investigation 3 bugs~~ · ~~bug A confirmé terrain iCloud~~ → **FAITS.**
2. **Refonte EventForm** (prérequis testabilité : 5 roues + fin de récurrence + conformité Apple) — chantier annoncé, brief cousin à préparer.
3. **Corriger les 3 bugs :** C (affichage, sûr) → B (merge, danger max, protocole lourd) → A (écriture RFC = ex-Brief 3).
4. **Nettoyage** events de test + **γ** (clearTombstone sur échec).
5. **EYROLLES** (23/07, 2 UID — cas distinct).
6. Drag & drop (dépend écriture). 7. Vues jour/mois/année. 8. Fonction rapport NomadBook (specs → `NomadCal_FONCTION_RAPPORT_06-07-26.md`). 9. Settings + cosmétique.

## 📋 ITEMS EN FILE (pas urgents)
- Défauts synchro de fond : B1 (erreurs avalées `App.jsx:406`), B3 (garde anti-réentrance morte), B4 (couplage flush→lecture), γ (tombstone).
- **Défaut « refresh manuel »** : la synchro d'affichage ne se rafraîchit pas seule.
- **Dette « deux `toISO` divergents »** : `helpers.js:13` (locale) vs `caldav.js:211` (`toISOString`, UTC). Duplication. N'est PAS la cause des 3 bugs (tous à heure normale / en lecture), mais le seul vrai recalcul fragile (`toISO` UTC dans `expandRecurring`, `caldav.js:347`) reste un off-by-one **possible près de minuit** → à surveiller.
- **À porter au README quand on CODERA les fix** (nouveaux points de vigilance) : rendu multi-jour sans clip (`App.jsx:643`) ; `mergeEvents` garde le master-local ; deux `toISO` divergents.
- Tests récurrence (QCM 17) : après les fix. Cosmétique = FERMÉ jusqu'à V1.
- **Essaimage** des items transposables (méthode briefing, deux jauges) vers les autres projets.

## 🟢 REPRENDRE EN DÉBUT DE SESSION
1. **Préciser le carburant session à Claude** (ex. « il reste 58 % »).
2. Lire cet État + le README. Consulter le JOURNAL/ACQUIS seulement si besoin.
3. Chantier actif : **refonte EventForm** (prérequis testabilité) — le timonier prépare le brief cousin, go explicite d'Olivier requis. À défaut, corriger le **bug C** (le plus sûr pour roder le cycle). Backups + `ZZ-TEST-REC` avant tout PUT.
- **Atelier de test :** nettoyé le 11-07 (fantôme récurrent purgé depuis iCal ; event écrasé `Test I 1` conservé comme pièce à conviction). ⚠️ Cet event est un cas **sale** (série déjà écrasée) → NE PAS l'utiliser comme point de départ pour tester le fix A ; recréer une série **fraîche** dans `ZZ-TEST-REC` via Apple natif.
- **NE RIEN coder/merger/appliquer sans le go explicite d'Olivier.**
