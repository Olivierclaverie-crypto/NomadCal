# ROADMAP — NOMADCAL
*Moteur de PLANIFICATION : la source unique du « quoi, dans quel ordre, en combien de PR ». Organisée en LOTS BATCHÉS selon la doctrine de batch (→ Instructions) : batch autorisé hors zone sacrée, une variable à la fois STRICT près des sacrées. Chaque lot précise son risque, ses briefs, et si un BRAINSTORM est requis avant. L'ordre est une SUGGESTION — le capitaine réarbitre à chaque ouverture de lot. Dernière MAJ : 04-08-26 minuit (**lot T CLOS, #46 en prod** — soldé en 1 seule PR ; brainstorm « réordonner vers Neon » toujours ouvert).*

---

## 🧭 VUE D'ENSEMBLE (ordre suggéré)
**~~R1~~ CLOS → ~~T~~ CLOS → E → R2 → R3 → R4**, avec **R5 et H en fillers** (carburant bas : c'est de la parole/des données, pas du code), **K juste avant Neon**, puis **pivot Neon → phase DESK**.

⚠️ **ARBITRAGE OUVERT — « RÉORDONNER VERS NEON ».** Les congés (jusqu'au 01/09) referment la fenêtre de risque terrain. Deux lectures à ne pas confondre :
- **Avancer la DATE de Neon** → *déconseillé par le timonier* : R5, H et K sont des **prérequis écrits, non commencés** ; Neon est une bascule d'archi, pas un lot ; risque de déborder sur la reprise terrain du 01/09, moment où l'app doit être la plus stable.
- **Accélérer le CHEMIN** → tout ce qui n'est pas prérequis passe en dette, et les congés servent **R5 + H + brainstorm EventForm**. Ce sont des chantiers de **papier et de données** : parfaits à carburant bas, sans session cousin, sans PR à tester. Neon arriverait fin août **avec ses fondations prêtes**.
- **Non tranché — brainstorm dédié à ouvrir. C'est la porte la plus structurante à la reprise.**

| Lot | Contenu | Zone sacrée ? | Briefs | Brainstorm avant ? |
|---|---|---|---|---|
| ~~N~~ | ~~Nettoyage manuel~~ | — | — | **CLOS 03-08** |
| ~~R1~~ | ~~Batch affichage (3 défauts)~~ | Non | — | **CLOS 04-08 (4 PR)** |
| ~~T~~ | ~~Audit temporel 360°~~ | Non | — | **CLOS 04-08 (1 PR, #46)** |
| **E** | **EventForm : date de fin en mode horaire** | Non (`pushEvent` = relais fidèle) | INVESTIGUER→CONSEILLER puis EXÉCUTER | **Oui** (design UI, cf. brainstorm EventForm) |
| **R2** | Compositeur récurrence A2→A4 + COUNT | Non (`pushEvent` intacte) | CERTIFIER→PROPOSER puis EXÉCUTER (1–2 PR) | **Oui, court** (design UI) |
| **R3** | Sélecteur d'étendue + delete occurrence (EXDATE) | **OUI** | Protocole complet, PR isolée, JAMAIS batché | **Oui** (cadrage carburant) |
| **R4** | Fonction rapport NomadBook | Non (nouveau module) | INVESTIGUER→CONSEILLER puis EXÉCUTER par tranches | **Oui** (choix techniques + question du jour de fin) |
| **R5** | Modèle de données pré-Neon (intègre NUCLI) | Non (papier) | Aucun (brainstorm pur) | **C'EST** un brainstorm |
| **H** | Chantier données hub (vcf, Cowork→NUCLI, audit) | Non (zéro code NomadCal) | Audit timonier lecture seule | Non (cadré 29-07, note Boucle) |
| **K** | NUCLI dans EventForm | À déterminer (X-prop ICS ?) | INVESTIGUER puis EXÉCUTER | Non (INVESTIGUER tranche) |

## 📅 JALONS (recalés 04-08-26 minuit)
- **J1 — CONSOMMÉ (03/04-08)** : lot **N** + déménagement doc + **lot R1 entier** (4 PR) + **lot T entier** (audit, 2 décisions produit, inventaire terrain, CERTIFIER parseur, PR #46). **5 PR en prod sur la journée.**
- **J2 — Congés (longues sessions)** : **E + R2** (EventForm, éventuellement fusionnés) · **R5 + H en fillers** (soirs carburant bas) · **R3** si carburant devant soi. **Brainstorms à ouvrir : réordonner vers Neon (prioritaire) · EventForm · méthode.**
- **J3 — Fin août/septembre** : **rapport manuel #2 le 07/09** (fin des congés 01/09 — période plus représentative ; = certification-terrain R4) · lot **K** (NUCLI, dernier geste pré-pivot) → **NEON** (le pivot — R5 l'aura préparé).
- **J4 — Automne (post-Neon)** : phase **DESK** (D2→D3→D4) · pont automatique Tableau de bord ↔ NomadCal (étage 3 de la Boucle).
- **DÉCISION GRAVÉE : desk = POST-Neon.** Seul étage anticipable : **ETag/If-Match**.

---

## ~~LOT N — NETTOYAGE~~ ✅ CLOS 03-08-26
*Notes de test supprimées, events de test + γ dans `ZZ-TEST-REC`, EYROLLES traité. Zéro code. → JOURNAL.*

## ~~LOT R1 — BATCH AFFICHAGE~~ ✅ CLOS 04-08-26 (4 PR)
*Le batch « 3 défauts en 1 PR » a éclaté en 4 PR et débusqué une cause racine. Récit complet → JOURNAL.*
- **Item 2** (doublon transitoire) → **#41** · **Item 3** (bande all-day) → **#43** · **Item 1** (event à cheval) → **#44 + #45**.
- **Découvertes adjacentes** → lots **E** et **T**.

## ~~LOT T — AUDIT TEMPOREL 360°~~ ✅ CLOS 04-08-26 (1 PR, #46)
*Récit complet, décisions et leçons → **JOURNAL**. Le lot annoncé « batché par famille » s'est soldé en **1 seule PR** parce que l'inventaire terrain a vidé la population de l'autre famille. **Un lot peut rétrécir, et c'est un succès.***
- **43 sites audités, zéro fautif en zone sacrée.** 2 décisions produit gravées (fuseau Paris · périmètre « Z seul »). Inventaire terrain : population de la famille 1a **nulle, mesurée**. CERTIFIER parseur : 3 OUI + brèche `DESCRIPTION` VALARM découverte.
- **#46** : famille 2 (5 sites, `NomadBook.jsx` + `App.jsx:771`), +10/−7. **Ce n'était pas de l'affichage mais un défaut de DONNÉE** (`syncNoteCount` écrit sur iCloud). Testé au réel, horloge basculée, zéro écriture.
- **Sortie du lot** : règle unique portée aux **INSTRUCTIONS** (§ DOCTRINE TEMPORELLE, règles 7 et 8 — doctrine fuseau + carte des 3 idiomes). ✅ Vérifiée au scellement.
- **Familles 1a + 1b → dette tracée** (file d'attente ci-dessous).

---

## LOT E — EVENTFORM : DATE DE FIN EN MODE HORAIRE
*Découvert en instruisant R1. **PROUVÉ au code ET à l'écran** : NomadCal ne peut pas CRÉER un event qui déborde sur minuit.*
- **Le défaut** : `EventForm.jsx:236` **recolle activement** `endDate` sur `startDate` à chaque changement de date, et **aucun champ de date de fin n'existe en mode horaire** (le champ « Au », `:270-274`, est réservé à la branche all-day). 3 points d'entrée : `EventForm.jsx:73`, `App.jsx:630`, `App.jsx:502`.
- **Zone sacrée : NON.** `pushEvent.js:17` n'est qu'un **relais fidèle**.
- **⚠️ Fusion probable avec R2** : trois chantiers convergent sur EventForm — **E** (date de fin), **R2** (compositeur récurrence), **K** (NUCLI). Trois passages = trois fois le risque de régression.
- **→ BRAINSTORM EVENTFORM** : concevoir la cible UNE fois, puis **livrer en tranches**. ⚠️ « refonte » à manier avec prudence : Neon fin août, doctrine « minimum de code V1 ».
- **➕ Ajout 04-08 (inventaire)** : le gabarit **all-day** de NomadCal écrit `DTEND = DTSTART` là où Apple écrit exclusif (`DTSTART:20260707` / `DTEND:20260709`). **Affichage correct constaté** (le repli du #43 couvre) → pas un bug vécu, mais non conforme RFC pour un client tiers. À raccrocher ici.

## LOT R2 — COMPOSITEUR RÉCURRENCE (objectif FERME sortie publique)
*A1 (intervalle libre) déjà en prod (#37). Restent : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.*
- **Batchable** : tout vit dans `composeRRule` / `parseRRuleToUI` / UI EventForm — `rrule` reste une string, `pushEvent` inchangée (prouvé au #37). Cible : **1–2 PR**.
- **Brainstorm AVANT (court)** : design UI 2 étages (comment COUNT cohabite avec UNTIL — Apple les rend exclusifs). **À fusionner avec le brainstorm EventForm du lot E.**
- **Rappels format (acquis #37)** : UNTIL = fin de journée locale → UTC + `Z` (`…215959Z`), DST-safe via `getTime()` · `INTERVAL=1` jamais écrit.

## LOT R3 — SÉLECTEUR D'ÉTENDUE + DELETE D'OCCURRENCE (LOURD — zone sacrée)
*Ferme le risque : « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE.*
- **Contenu** : sélecteur d'étendue (cette occurrence / à partir de / toute la série) + delete d'occurrence via `EXDATE` + split de série + édition master.
- **Protocole COMPLET** : brainstorm → INVESTIGUER → CONSEILLER → décision → EXÉCUTER en PR isolée(s), une variable à la fois. **JAMAIS batché.**
- **Rappels** : EXDATE en date LOCALE · mécanique voisine du GET-modify-PUT (#35) · tests dans `ZZ-TEST-REC`, cas créés en Apple natif.
- ✅ **Le lot T est clos** — la condition « attendre T » est levée.
- ⚠️ **La dette famille 1a `EXDATE`** (`caldav.js:152`, strip du `Z`) vit dans le territoire exact de ce lot. **La reprendre à ce moment-là** plutôt qu'isolément — et **avec `parseDate:168`**, jamais seule (doctrine #44).

## LOT R4 — FONCTION RAPPORT NOMADBOOK
*DÉBLOQUÉ depuis le rangement des périodes (19-07). Cycle complet prouvé À LA MAIN (06-07). **Simulation #2 au 07/09** = certification-terrain de ce lot.*

**En une phrase :** fin de période, NomadBook transforme les notes de terrain (texte + photos + dictée) en une **synthèse PDF envoyée au chef puis archivée**. Aujourd'hui simulé main ; à terme un bouton.

**Acquis de cadrage (29-07)** : la date de fin de période (slug `rapport-<fin>.ics`) = identité TECHNIQUE ; le moment de génération = geste LIBRE du capitaine. **Le futur bouton ne sera jamais esclave de la date.**

**Squelette stable (5 rubriques)** : CLIENT · MARCHÉ · CONCURRENCE · ALERTES · OUTILS.

**Les 6 specs prouvées :**
1. Les notes portent des **photos** → tirées via `getPhotoURL` (IndexedDB, `photoStore.js`). *Socle existant.*
2. **Format conteneur PDF** (texte + image ensemble). *Prouvé main.*
3. **Archivage 12 mois, accès par lien par user.**
4. **Nommage auto-classant** + **taille photo réglable**.
5. **Purge des notes APRÈS envoi CONFIRMÉ** (jamais avant). Aujourd'hui MANUELLE.
6. **Icône « état vide »** : SVG maison, née sous **charte Orchard**. *Cosmétique — fermé jusqu'à V1.*

- **⭐ QUESTION NEUVE (04-08, observée à l'écran pendant le test du lot T)** : **le jour de fin d'une période n'a AUCUNE période courante** (borne à minuit local = jour de fin exclu). Or c'est **exactement le jour de compilation du rapport**. Conséquence assumée côté données, mais à instruire côté produit : que doit voir le capitaine le jour où il génère son rapport ? → **à traiter au brainstorm de ce lot.**
- **Brainstorm AVANT** : lib PDF côté client, archivage/lien 12 mois (pré ou post-Neon ?), automatisation de la purge et son garde-fou, **+ la question du jour de fin ci-dessus**. Puis INVESTIGUER→CONSEILLER → décision → EXÉCUTER **par tranches**.

## LOT R5 — MODÈLE DE DONNÉES PRÉ-NEON (brainstorm pur, filler)
- Poser sur papier : events, notes, périodes, photos, **NUCLI**, users.
- Ligne produit actée : **les périodes = objets backend NC**, iCloud = fenêtre.
- Trancher (papier) : source maître par champ · format NUCLI (mode texte confirmé côté tableaux ; vérifier Contacts iPhone).
- Alimente : Neon (~fin août) + écran de décision RV + pont Boucle.
- ⚠️ **PRÉREQUIS DE NEON.** Non commencé. Candidat n°1 du brainstorm « réordonner vers Neon ».

## LOT H — CHANTIER DONNÉES HUB (zéro code NomadCal, filler congés)
*Étages 1+2 de la Boucle client (→ note `NomadSuite_NOTE_VISION_BOUCLE_*`).*
- **H1 (Olivier)** : renommage vcf « clients importants » → **« clients »**.
- **H2 (Olivier, Cowork)** : correction MAJ Visites — rapprochement **Nom/Prénom → NUCLI**. LE déverrouillage.
- **H3 (timonier, lecture seule)** : **audit croisé par NUCLI** — Tableau de bord × Tableau visites × vcf clients.
- **Garde-fous** : Tableau visites = IMMUABLE · Nom/Prénom = données de production NomadMail.
- **Ordre interne :** H2 avant H3.
- ⚠️ **PRÉREQUIS DE NEON.** Non commencé. Candidat n°2 du brainstorm « réordonner vers Neon ».

## LOT K — NUCLI DANS EVENTFORM (calé JUSTE AVANT Neon)
- **Contenu** : champ NUCLI dans EventForm, importé du carnet Contacts.
- **Question à trancher par INVESTIGUER** : où vit le NUCLI d'un event ? localStorage seul = perdu au round-trip. Pour survivre : propriété custom dans l'ICS (ex. `X-NOMADCAL-NUCLI`) → territoire de `pushEvent`.
- **Prérequis** : format NUCLI confirmé (lot H) · modèle R5 posé · cible EventForm arbitrée au brainstorm du lot E.

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
- **Dette TZID exotique** (`caldav.js:107-111`) : `get()` jette le fuseau nommé. Non corrigée **sciemment** (périmètre « Z seul »).
- **Brèche `DESCRIPTION` de VALARM** (`caldav.js:109`/`:122`/`:145`) : la `DESCRIPTION` d'une alarme peut atterrir dans les **notes de l'event** si l'event n'a pas la sienne. Chemin réel au code, cas non observé. Même mécanisme théorique sur `SUMMARY`.
- **Clause morte `caldav.js:163`** : test impossible à satisfaire, sans effet, trompeur à la lecture.
- **Repli `caldav.js:105`** : fichier entier scanné si aucun VEVENT — bouché **par le UID** (`:160`), pas par le découpage. À surveiller.
- **Notes déjà mal rattachées** (post-#46) : le fix corrige l'avenir, pas le passé. **Existe-t-il de telles notes ? Non instruit.**

**Antérieures :**
- **Dette #41** — `mergeRecurrenceExceptions` utilise `masterUid` dans la clé de masquage : un VEVENT dégénéré serait masqué à tort. **Aucun producteur connu. Non bloquant.**
- **Dette popover cellule vide** — 3ᵉ `setPopover` dont le `ev` ne se résout à aucune liaison locale. **Préexistant**, à arbitrer.
- **Garde `syncing` mort** — `runSync` (`syncService.js`) teste `if (syncing) return;` mais **aucun** de ses 6 appelants ne le passe → réentrance possible. ⚠️ Son correctif **toucherait la frontière sacrée**. Non arbitré.
- Défauts synchro de fond : B1/B3/B4/γ.
- Drag & drop · vues jour/mois/année · complétion Settings · cosmétique (FERMÉ jusqu'à V1).
- **Bruit de déploiement** : chaque push de `Contexte/*.md` sur `main` déclenche un déploiement Vercel en production. Sans conséquence. À traiter si ça gêne (ex. `.vercelignore`).

**Brainstorms à ouvrir :**
- **⭐ RÉORDONNER LA ROADMAP VERS NEON** — voir § VUE D'ENSEMBLE. **Non tranché, prioritaire.**
- **Brainstorm MÉTHODE** (03-08) : fixer le cas de test avant le brief (piste 1, déjà portée aux Instructions) · scripts de test automatisés (piste 2 — réaliste sur la **logique**, pas sur la fenêtre : ni le timonier ni le cousin n'ont accès à iCloud ; le contrôle Node du #46 en est un premier exemple) · audit ciblé (piste 3).
- **Brainstorm EVENTFORM** (lot E, à fusionner avec R2).
- **Brainstorm R4** — dont la **question du jour de fin** (voir lot R4).

## 🔭 APRÈS V1
- **V2** : frais + géolocalisation.
- **V3** : IA (assistance, complexité invisible). Direction A (consommer) vs B (s'exposer en MCP) non tranchée.
- **NomadSuite** (hub & spokes : NomadCal · NomadGuess · NomadMail autour du hub Excel→Neon, écran de décision RV, NUCLI) → **VISION** (GitHub `Contexte/`) + **note Boucle client**.
