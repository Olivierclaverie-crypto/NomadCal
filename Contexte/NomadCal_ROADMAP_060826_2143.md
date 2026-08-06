# ROADMAP — NOMADCAL
*Moteur de PLANIFICATION : la source unique du « quoi, dans quel ordre, en combien de PR ». Organisée en LOTS BATCHÉS selon la doctrine de batch (→ Instructions) : batch autorisé hors zone sacrée, une variable à la fois STRICT près des sacrées. Chaque lot précise son risque, ses briefs, et si un BRAINSTORM est requis avant. L'ordre est une SUGGESTION — le capitaine réarbitre à chaque ouverture de lot. Dernière MAJ : 06-08-26 (**R5 : phase papier SCELLÉE** — carte validée, 15 décisions · **lot K DISSOUS par D13** · brainstorm « étude marché prospection » ajouté à la file).*

---

## 🧭 VUE D'ENSEMBLE (ordre suggéré)
**~~R1~~ CLOS → ~~T~~ CLOS → E → R2 → R3 → R4**, avec **R5 (brief INVESTIGUER restant) et H en fillers**, puis **pivot Neon → phase DESK**. **~~K~~ dissous (D13)** : sa moitié donnée part avec Neon/annuaire, sa moitié interface avec le brainstorm EventForm.

⚠️ **ARBITRAGE OUVERT — « RÉORDONNER VERS NEON ».** Les congés (jusqu'au 01/09) referment la fenêtre de risque terrain. Deux lectures à ne pas confondre :
- **Avancer la DATE de Neon** → *déconseillé par le timonier* : R5 et H sont des **prérequis écrits, en cours ou non commencés** ; Neon est une bascule d'archi, pas un lot ; risque de déborder sur la reprise terrain du 01/09, moment où l'app doit être la plus stable.
- **Accélérer le CHEMIN** → tout ce qui n'est pas prérequis passe en dette, et les congés servent **R5 + H + brainstorm EventForm**. Chantiers de **papier et de données** : parfaits à carburant bas. Neon arriverait fin août **avec ses fondations prêtes**. *(06-08 : c'est de fait le chemin suivi — la phase papier de R5 est scellée.)*
- **Non tranché — brainstorm dédié à ouvrir. La carte R5 le nourrit directement.**

| Lot | Contenu | Zone sacrée ? | Briefs | Brainstorm avant ? |
|---|---|---|---|---|
| ~~N~~ | ~~Nettoyage manuel~~ | — | — | **CLOS 03-08** |
| ~~R1~~ | ~~Batch affichage (3 défauts)~~ | Non | — | **CLOS 04-08 (4 PR)** |
| ~~T~~ | ~~Audit temporel 360°~~ | Non | — | **CLOS 04-08 (1 PR, #46)** |
| **E** | **EventForm : date de fin en mode horaire** | Non (`pushEvent` = relais fidèle) | INVESTIGUER→CONSEILLER puis EXÉCUTER | **Oui** (design UI, cf. brainstorm EventForm) |
| **R2** | Compositeur récurrence A2→A4 + COUNT | Non (`pushEvent` intacte) | CERTIFIER→PROPOSER puis EXÉCUTER (1–2 PR) | **Oui, court** (design UI) |
| **R3** | Sélecteur d'étendue + delete occurrence (EXDATE) | **OUI** | Protocole complet, PR isolée, JAMAIS batché | **Oui** (cadrage carburant) |
| **R4** | Fonction rapport NomadBook | Non (nouveau module) | INVESTIGUER→CONSEILLER puis EXÉCUTER par tranches | **Oui** (choix techniques + question du jour de fin) |
| **R5** | Modèle de données pré-Neon | Non (papier + INVESTIGUER lecture seule) | **Phase papier SCELLÉE 06-08** → brief INVESTIGUER (14 questions) | Fait (carte validée) |
| **H** | Chantier données hub (vcf, Cowork→NUCLI, audit) | Non (zéro code NomadCal) | Audit timonier lecture seule | Non (cadré 29-07, note Boucle) |
| ~~K~~ | ~~NUCLI dans EventForm~~ | — | — | **DISSOUS 06-08 (D13)** |

## 📅 JALONS (recalés 06-08-26)
- **J1 — CONSOMMÉ (03/04-08)** : lot **N** + déménagement doc + **lot R1 entier** (4 PR) + **lot T entier**. **5 PR en prod sur la journée.**
- **J2 — Congés (longues sessions)** : ✅ **R5 phase papier scellée (06-08)** + doctrine annuaire v2 · restent : **brief INVESTIGUER R5** · **E + R2** (brainstorm EventForm) · **H** en filler · **R3** si carburant devant soi. **Brainstorms : réordonner vers Neon (prioritaire) · EventForm · méthode.**
- **J3 — Fin août/septembre** : **rapport manuel #2 le 07/09** (= certification-terrain R4) → **NEON** (le pivot — la carte R5 + le brief INVESTIGUER l'auront préparé ; *plus de lot K sur le chemin*).
- **J4 — Automne (post-Neon)** : phase **DESK** (D2→D3→D4) · pont automatique Tableau de bord ↔ NomadCal (étage 3 de la Boucle) · **trappe annuaire + NomadGuess** (naissent avec Neon, cf. carte R5).
- **DÉCISION GRAVÉE : desk = POST-Neon.** Seul étage anticipable : **ETag/If-Match**.

---

## ~~LOT N — NETTOYAGE~~ ✅ CLOS 03-08-26
*Zéro code. → JOURNAL.*

## ~~LOT R1 — BATCH AFFICHAGE~~ ✅ CLOS 04-08-26 (4 PR)
*Le batch « 3 défauts en 1 PR » a éclaté en 4 PR et débusqué une cause racine. → JOURNAL.*
- **Item 2** → **#41** · **Item 3** → **#43** · **Item 1** → **#44 + #45**. **Découvertes adjacentes** → lots **E** et **T**.

## ~~LOT T — AUDIT TEMPOREL 360°~~ ✅ CLOS 04-08-26 (1 PR, #46)
*Récit complet → **JOURNAL**. Le lot annoncé « batché par famille » s'est soldé en **1 seule PR** (inventaire terrain : population de l'autre famille nulle). **Un lot peut rétrécir, et c'est un succès.***
- **43 sites audités, zéro fautif en zone sacrée.** 2 décisions produit (fuseau Paris · périmètre « Z seul »). CERTIFIER parseur : 3 OUI + brèche `DESCRIPTION` VALARM.
- **#46** : famille 2 — un défaut de DONNÉE (`syncNoteCount`), testé au réel, horloge basculée.
- **Sortie du lot** : règles 7 et 8 portées aux **INSTRUCTIONS** (§ DOCTRINE TEMPORELLE). **Familles 1a + 1b → dette tracée** (file ci-dessous).

---

## LOT E — EVENTFORM : DATE DE FIN EN MODE HORAIRE
*Découvert en instruisant R1. **PROUVÉ au code ET à l'écran** : NomadCal ne peut pas CRÉER un event qui déborde sur minuit.*
- **Le défaut** : `EventForm.jsx:236` **recolle activement** `endDate` sur `startDate`, et **aucun champ de date de fin n'existe en mode horaire** (`:270-274` réservé all-day). 3 points d'entrée : `EventForm.jsx:73`, `App.jsx:630`, `App.jsx:502`.
- **Zone sacrée : NON.** `pushEvent.js:17` n'est qu'un **relais fidèle**.
- **⚠️ Fusion probable avec R2** : les chantiers convergent sur EventForm — **E** (date de fin), **R2** (compositeur récurrence), et désormais **la moitié interface du lot K dissous** (D13 : champ client puisant dans l'annuaire, cf. carte R5 couche 4 — *la donnée attend Neon, le design se conçoit au brainstorm*).
- **→ BRAINSTORM EVENTFORM** : concevoir la cible UNE fois, puis **livrer en tranches**. ⚠️ « refonte » à manier avec prudence : doctrine « minimum de code V1 ».
- **➕ Ajout 04-08** : le gabarit **all-day** écrit `DTEND = DTSTART` là où Apple écrit exclusif. Affichage correct constaté (repli #43), non conforme RFC pour un client tiers. À raccrocher ici.

## LOT R2 — COMPOSITEUR RÉCURRENCE (objectif FERME sortie publique)
*A1 (intervalle libre) en prod (#37). Restent : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.*
- **Batchable** : tout vit dans `composeRRule` / `parseRRuleToUI` / UI EventForm — `rrule` reste une string, `pushEvent` inchangée (prouvé au #37). Cible : **1–2 PR**.
- **Brainstorm AVANT (court)** : design UI 2 étages (COUNT vs UNTIL — Apple les rend exclusifs). **À fusionner avec le brainstorm EventForm du lot E.**
- **Rappels format (acquis #37)** : UNTIL = fin de journée locale → UTC + `Z` (`…215959Z`), DST-safe via `getTime()` · `INTERVAL=1` jamais écrit.

## LOT R3 — SÉLECTEUR D'ÉTENDUE + DELETE D'OCCURRENCE (LOURD — zone sacrée)
*Ferme le risque : « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE.*
- **Contenu** : sélecteur d'étendue (cette occurrence / à partir de / toute la série) + delete via `EXDATE` + split de série + édition master.
- **Protocole COMPLET** : brainstorm → INVESTIGUER → CONSEILLER → décision → EXÉCUTER en PR isolée(s), une variable à la fois. **JAMAIS batché.**
- **Rappels** : EXDATE en date LOCALE · mécanique voisine du GET-modify-PUT (#35) · tests dans `ZZ-TEST-REC`, cas créés en Apple natif.
- ⚠️ **La dette famille 1a `EXDATE`** (`caldav.js:152`, strip du `Z`) vit dans le territoire exact de ce lot. **La reprendre à ce moment-là** — et **avec `parseDate:168`**, jamais seule (doctrine #44).

## LOT R4 — FONCTION RAPPORT NOMADBOOK
*DÉBLOQUÉ depuis le rangement des périodes (19-07). Cycle complet prouvé À LA MAIN (06-07). **Simulation #2 au 07/09** = certification-terrain de ce lot.*

**En une phrase :** fin de période, NomadBook transforme les notes de terrain (texte + photos + dictée) en une **synthèse PDF envoyée au chef puis archivée**. Aujourd'hui simulé main ; à terme un bouton.

**Acquis de cadrage (29-07)** : la date de fin de période (slug `rapport-<fin>.ics`) = identité TECHNIQUE ; le moment de génération = geste LIBRE du capitaine.

**Squelette stable (5 rubriques)** : CLIENT · MARCHÉ · CONCURRENCE · ALERTES · OUTILS. *(⚠️ Écart tracé : la règle « autant de rubriques que d'utilisées » gravée à la carte R5 (D7) — à réconcilier au brainstorm.)*

**Les 6 specs prouvées :** photos via `getPhotoURL` · conteneur PDF · archivage 12 mois + lien par user · nommage auto-classant + taille photo réglable · **purge des notes APRÈS envoi CONFIRMÉ** · icône « état vide » Orchard (fermé jusqu'à V1).

- **⭐ Question du jour de fin (04-08)** : le jour de fin d'une période n'a AUCUNE période courante — or c'est le jour de compilation. → **brainstorm de ce lot**.
- **Éclairage carte R5 (D7)** : le Rapport est un **module à part** qui **copie et survit à ses sources** — le brainstorm hérite de ce cadre.
- **Brainstorm AVANT** : lib PDF côté client, archivage/lien 12 mois (pré ou post-Neon ?), automatisation de la purge et son garde-fou, question du jour de fin, réconciliation des rubriques. Puis INVESTIGUER→CONSEILLER → décision → EXÉCUTER **par tranches**.

## LOT R5 — MODÈLE DE DONNÉES PRÉ-NEON · ⭐ PHASE PAPIER SCELLÉE 06-08-26
*Carte d'architecture cible **validée en relecture capitaine** : `NomadCal_R5_CARTE_060826_*.md` (Projet + `Contexte/`). **15 décisions D1–D15 + amendement A1** — registre en annexe de la carte.*
- **L'essentiel** : 5 couches (sources · douane · hub · modules · interface) · **format pivot** (le hub ne voit jamais TZID/href/ETag) · entités **Client (clé interne ≠ IdC)** et Interlocuteur · ICS propre (D12) · protocole de départ dès V1 (D3) · Neon en jumeau (voile 4 phases).
- **NUCLI → IdC** partout (généralisation) · **NomadGuess réparti** dans les couches (entités au hub, traducteurs à la douane, trappe aux réglages, données sur Neon).
- **RESTE : le brief INVESTIGUER** — 14 questions lecture seule (extractibilité de la frontière, accès stockage directs, périodes, naissance du hub, double porte, API Outlook/Google, limites ICS, carnet iOS, extensibilité, App Store, fantômes du lot K, chaîne vCard sortante, fichiers plats entrants). Session cousin cloud confortable, non obligatoire.
- Alimente : Neon (~fin août) + écran de décision RV + pont Boucle. **PRÉREQUIS DE NEON — la moitié papier est faite.**

## LOT H — CHANTIER DONNÉES HUB (zéro code NomadCal, filler congés)
*Étages 1+2 de la Boucle client (→ note `NomadSuite_NOTE_VISION_BOUCLE_*`).*
- **H1 (Olivier)** : renommage vcf « clients importants » → **« clients »**.
- **H2 (Olivier, Cowork)** : correction MAJ Visites — rapprochement **Nom/Prénom → NUCLI**. LE déverrouillage. ✅ *Éclairage 06-08 : l'audit annuaire a prouvé les **NUCLI 90/90 parfaits** — H2 ne dépendait pas de la réécriture, il peut s'appuyer sur l'existant.*
- **H3 (timonier, lecture seule)** : **audit croisé par NUCLI** — Tableau de bord × Tableau visites × vcf clients. *(= P1 de la doctrine annuaire : exhaustivité du portefeuille.)*
- **Chantier adjacent LIVRÉ (06-08)** : doctrine annuaire **v2** + **vcf 90 fiches réécrit** (`NomadSuite_ANNUAIRE_CLIENTS_060826_0011.vcf`) — 12 règles appliquées, invariants vérifiés. Saisie terrain P2/P3 → listes sur `Contexte/`.
- **Garde-fous** : Tableau visites = IMMUABLE · Nom/Prénom = données de production NomadMail.
- **Ordre interne :** H2 avant H3. ⚠️ **PRÉREQUIS DE NEON.**

## ~~LOT K — NUCLI DANS EVENTFORM~~ ✅ DISSOUS 06-08-26 (décision D13, carte R5)
*La question du lot (« où vit l'identifiant d'un event pour survivre au round-trip ? ») a sa réponse : **il ne voyage pas — il vit chez nous.** D12 (ICS propre) referme la piste `X-NOMADCAL-NUCLI`.*
- **Moitié donnée** → la référence client est une donnée d'annuaire/Neon (clé interne, D11) — naît avec Neon.
- **Moitié interface** → le champ client de l'EventForm (recherche dans l'annuaire, D8) — se conçoit au **brainstorm EventForm** (lot E).
- **Coût accepté** : pas de rattachement client des events avant Neon. **Bénéfice** : zéro propriété custom, zéro PR zone sacrée, zéro double migration.
- **Reste à vérifier (question 12 du brief INVESTIGUER R5)** : aucun fantôme de code ne suppose une X-prop NUCLI.

---

## 🖥️ PHASE DESK (POST-NEON — décision gravée 29-07-26)
| Étage | Contenu | Dépendance |
|---|---|---|
| **D1** | Données partagées entre appareils | **= Neon** |
| **D2** | **ETag/If-Match** sur les écritures | ⚠️ Territoire `pushEvent` = zone sacrée, PR isolée. **Anticipable avant desk.** |
| **D3** | UI grand écran | Pur rendu, batchable |
| **D4** | Auth multi-device | S'appuie sur Neon |
- **Ordre suggéré : D2 → D3 → D4.**

---

## 📥 FILE D'ATTENTE (non lotis, à raccrocher quand un lot s'ouvre)

**Issues du lot T (04-08) — détail et preuves dans le JOURNAL :**
- **Famille 1a — strip du `Z`** (`caldav.js:168` parseDate · `:152` EXDATE). Fautif au code, **population nulle mesurée**, cas de test **non fabricable**. ⚠️ Les deux sites se corrigent **ENSEMBLE** (doctrine #44). `EXDATE` → à reprendre avec **R3**.
- **Famille 1b — `caldav.js:294` (`curISO`)**. Reliquat de la classe #44, effet nul. Part avec 1a.
- **Dette TZID exotique** (`caldav.js:107-111`) : `get()` jette le fuseau nommé. Non corrigée **sciemment** (périmètre « Z seul »). *(Cohérent avec la doctrine fuseau Paris — règle 7 des Instructions — et avec le format pivot de la carte R5.)*
- **Brèche `DESCRIPTION` de VALARM** (`caldav.js:109`/`:122`/`:145`) : la `DESCRIPTION` d'une alarme peut atterrir dans les **notes de l'event**. Chemin réel au code, cas non observé. Même mécanisme théorique sur `SUMMARY`.
- **Clause morte `caldav.js:163`** · **Repli `caldav.js:105`** (bouché par le UID `:160` — à surveiller si `:160` est relâché).
- **Notes déjà mal rattachées** (post-#46) : le fix corrige l'avenir, pas le passé. Existence non instruite.

**Antérieures :**
- **Dette #41** — `mergeRecurrenceExceptions` : un VEVENT dégénéré serait masqué à tort. Aucun producteur connu. Non bloquant.
- **Dette popover cellule vide** — 3ᵉ `setPopover` sans liaison locale. Préexistant, à arbitrer.
- **Garde `syncing` mort** — `runSync` (`syncService.js`) : réentrance possible. ⚠️ Correctif = frontière sacrée. Non arbitré.
- Défauts synchro de fond : B1/B3/B4/γ.
- Drag & drop · vues jour/mois/année · complétion Settings · cosmétique (FERMÉ jusqu'à V1).
- **Bruit de déploiement** : push de `Contexte/*.md` → déploiement Vercel. Sans conséquence. À traiter si ça gêne (`.vercelignore`).

**Brainstorms à ouvrir :**
- **⭐ RÉORDONNER LA ROADMAP VERS NEON** — voir § VUE D'ENSEMBLE. **Non tranché, prioritaire.**
- **Brainstorm EVENTFORM** (lot E + R2 + moitié interface de K).
- **Brainstorm MÉTHODE** (03-08) : cas de test avant brief · scripts de test (logique seulement — ni timonier ni cousin n'ont iCloud) · audit ciblé.
- **Brainstorm R4** — dont la question du jour de fin et la réconciliation des rubriques.
- **⭐ ÉTUDE MARCHÉ PROSPECTION** (D14, 06-08) : session timonier + recherche web — les commerciaux prospecteurs (statuts, fichiers direction) sont-ils un marché pour NomadSuite ? **Due avant tout engagement V2 sur les statuts d'annuaire.** Si oui : statut = donnée d'activité Neon, jamais une structure du carnet.

## 🔭 APRÈS V1
- **V2** : frais + géolocalisation (la géoloc naît avec les frais — D6, carte R5).
- **V3** : IA (assistance, complexité invisible) · service second fournisseur (porte B, D1). Direction A vs B non tranchée.
- **NomadSuite** (hub & spokes : NomadCal · NomadGuess · NomadMail autour du hub Excel→Neon, écran de décision RV) → **VISION** (GitHub `Contexte/`) + **note Boucle client** + **carte R5** (l'architecture qui les porte).
