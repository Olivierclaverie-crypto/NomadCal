# DOCTRINE DE L'ANNUAIRE — NOMADSUITE · v2
*Règles de tenue du carnet Contacts « Clients ». Établies le 05-08-26, consolidées le 06-08-26 après la réécriture complète. Décideur unique : Olivier. Ce document fait foi pour toute réécriture ou saisie de fiche client.*
*Ce fichier **remplace** `NomadSuite_DOCTRINE_ANNUAIRE_050826_2311.md`. Il absorbe la synthèse de `NomadSuite_ANNUAIRE_RAPPORT_060826_0011.md` (détail des 90 fiches avant/après) et renvoie à `NomadSuite_ANNUAIRE_SAISIE_TERRAIN_060826_0011.md` (listes P2/P3 à remplir en tournée) — ces deux fichiers vivent désormais sur **GitHub `Contexte/` uniquement** (archive + outil), plus dans le Projet.*
*Horodatage : 060826_HHMM (heure de livraison à reporter).*

---

## 0. PRINCIPE FONDATEUR — IDENTITÉ ≠ ACTIVITÉ

**L'annuaire porte l'IDENTITÉ** du point de vente : qui c'est, où c'est, comment on le joint. Données **stables**.

**Le Tableau de bord porte l'ACTIVITÉ** : dernière visite, statut, RV, « pas encore ouvert ». Données **mobiles**.

Toute donnée mobile logée dans une fiche contact devient une donnée fausse en quelques mois, sans que personne ne s'en aperçoive — on ne relit jamais une fiche contact. Le seul pont entre les deux mondes est le **NUCLI**, jamais le nom.

**Portée élargie le 06-08 (carte R5, décision D14) :** ce principe a tranché la question des statuts d'annuaire (prospect / actif…) — un statut est une donnée d'**activité** ; s'il naît un jour, il vivra côté Neon dans l'entité Client, jamais comme structure du carnet. Cas fondateur : Cultura Cergy, « pas encore ouvert », fiche ordinaire.

---

## 1. ÉTAT DE L'ANNUAIRE

### Réécriture du 06-08-26 — 90 fiches, produite et livrée
Fichier : `NomadSuite_ANNUAIRE_CLIENTS_060826_0011.vcf` (90 fiches = export 89 + Cultura Cergy). Source intacte, lecture seule. **Application des 12 règles, décompte :**

| Règle | Application |
|---|---|
| R1 — Id Client dans TITLE | **0 fiche modifiée** — les 90 NUCLI étaient déjà parfaits (6 chiffres, zéros préservés, zéro doublon) |
| R2 — Prénom=ENSEIGNE · Nom=VILLE | 55 fiches renommées ; 6 fiches à champ vide remplies |
| R3 — Table des enseignes | 34 fiches ré-enseignées ; 7 champs Société corrigés (Leclerc HYPER / ESP. CULTUREL) |
| R4 — Département dérivé du CP | 64 fiches corrigées (48 faux + 15 vides + 1) |
| R5 — Aucun fax | 38 fax supprimés, aucune fiche ne perd sa seule ligne |
| R6 — Téléphones | 40 reformatés · 31 types recalculés · 15 « préférés-fax » réparés |
| R7 — Emails travail | 27 « domicile » → « travail » ; les 105 adresses inchangées au caractère près |
| R8 — Interlocuteurs | 47 entrées réécrites sur 40 fiches (table fermée, Prénom NOM) |
| R9 — Photos 400×400 | 72 images redimensionnées ; fichier 7,84 Mo → 2,08 Mo |
| R10 — Logo canonique | 18 fiches reçoivent le logo de leur enseigne ; les 22 images uniques (indés, musées) conservées |
| R11 — Villes | 59 fiches ; 67 graphies → 58 villes ; 6 CEDEX nettoyés |
| R12 — Une adresse, jamais vide | 2 adresses vides supprimées, 2 « domicile » → « travail » |

**Invariants vérifiés :** NUCLI 90/90 identiques · 105 emails identiques · 122 numéros vocaux identiques · rues/CP/pays inchangés · notes et réglages Apple conservés · étiquettes libres non touchées (P6). Seule catégorie disparue : les fax.

**Répartition géographique finale :** 62 → 24 · 95 → 22 · 60 → 19 · 75 → 17 · 80 → 8.

*Le tableau avant/après fiche par fiche (1100 lignes) vit dans `NomadSuite_ANNUAIRE_RAPPORT_060826_0011.md`, GitHub `Contexte/`.*

### Rappel de l'audit du 05-08 (89 fiches, mémoire des défauts d'origine)
64 % de départements faux · 15 fax « préférés » masquant les vraies lignes · 39 % sans email · 60 % sans interlocuteur · 66 graphies de ville. **Aucune donnée d'activité infiltrée — la frontière du principe 0 tenait déjà.** ⚠️ L'export n'était pas exhaustif : Cultura Cergy manquait, découvert par la mémoire du capitaine. **Le brut ne peut pas prouver ce qu'il ne contient pas.**

---

## 2. LES RÈGLES GRAVÉES

### R1 — Id Client
L'Id Client vit dans le champ `TITLE` de la fiche Contacts, affiché « Fonction » ou « Poste » selon l'appareil. **Format : six chiffres nus, zéros initiaux compris.** Rien d'autre n'entre dans ce champ, et aucun autre champ ne porte d'identifiant.

C'est la **seule clé de jointure NomadSuite**. Le nom n'en est jamais une.

*Pourquoi TITLE : Contacts Apple ne permet pas de champ personnalisé. TITLE est visible sur l'iPhone, éditable à la main, et survit à tous les exports. Le défaut est cosmétique.*
*Pont R5 : dans la carte d'architecture, cet identifiant devient l'**IdC** — passeport facultatif de l'entité Client, distinct de la clé interne (D11).*

### R2 — Nommage
> **Prénom = ENSEIGNE** · **Nom = VILLE**

Sans exception, indépendants compris. Deux axes de lecture pour un seul annuaire, commutables d'un coup de réglage : trier par **Nom** → liste **géographique** (ordre de tournée) ; trier par **Prénom** → liste **par enseigne** (négociation centrale).

### R3 — Table des enseignes (champ Prénom)
`AUCHAN` · `CARREFOUR` · `CULTURA` · `FNAC` · `FURET DU NORD` · `GIBERT JOSEPH LA PLACE` · `LECLERC HYPER` · `LECLERC ESP. CULTUREL` · `MAISON DE LA PRESSE` · `MUSEE ART DECO` · `MUSEE ORANGERIE` · `LIB. …` pour les librairies indépendantes.

**Leclerc scindé en deux enseignes**, les deux graphies commençant par `LECLERC` pour rester contiguës au tri ; distinction doublée dans Société (`ORG:LECLERC;LIBRAIRIE` vs `ORG:LECLERC;ESPACE CULTUREL`). **Préfixe `LIB.` unifié** (point compris) et attribué aux indépendants qui en étaient dépourvus. `SARL BIMAT` est devenue `MAISON DE LA PRESSE` (raison sociale sauvée en Société).

### R4 — Département
Le champ Région/État porte le **département**, **dérivé du code postal** — jamais saisi à la main. Casse uniforme, sans accent : `PAS DE CALAIS`, `VAL D'OISE`, `OISE`, `PARIS`, `SOMME`.

*Une adresse contradictoire fait arbitrer un géocodeur tout seul, et il peut partir à 200 km.*

### R5 — Fax
**Aucun fax dans l'annuaire.** Effet vertueux constaté (Leclerc Fosses) : supprimer le fax « préféré » a suffi à faire remonter le vrai numéro.

### R6 — Téléphones
Format **français espacé** : `03 22 40 32 10`. Type **déduit du préfixe** : `06`/`07` → mobile · le reste → bureau. Pas de « domicile » : ce sont des points de vente. **Un seul numéro préféré par fiche**, toujours une ligne vocale.

### R7 — Emails
Tous typés **travail**. Les emails à étiquette libre gardent leur étiquette (l'étiquette prime) — vocabulaire en P6.

### R8 — Interlocuteurs : table des fonctions (11 valeurs, vocabulaire fermé)
1. `Responsable Librairie` · 2. `Libraire` *(générique, s'affine à la visite)* · 3. `Libraire Jeunesse` · 4. `Libraire Vie Pratique&Tourisme` · 5. `Libraire Beaux Arts` · 6. `Libraire Littérature&YA` · 7. `Libraire Policier & SF` · 8. `Libraire BD&Manga` · 9. `Libraire Sciences Humaines&Histoire` · 10. `Libraire Parascolaire&Universitaire` · 11. `Libraire Collectivités`

**Conversions gravées :** `Manager`, `CR` → `Responsable Librairie` · `Assistant`, `vendeur`, `vendeuse` → `Libraire` · `religieux` → `Libraire Sciences Humaines&Histoire`.
**Valeur écrite « Prénom NOM »**, casse uniforme, civilité retirée. Une personne = une entrée.
⚠️ Les étiquettes `direct`, `accueil mag`, `Other`… désignent des lignes, pas des personnes — elles n'entrent pas dans cette table (P6).
*Pont R5 : ce modèle enseigne+fonctions réalise déjà l'entité Interlocuteur rattachée à un Client (D11).*

### R9 — Photos
**400 × 400 maximum.** Aucune fiche n'est privée d'image quand une source existe dans l'annuaire.

### R10 — Logo canonique
**Un logo unique par enseigne de chaîne** (le plus fréquent déjà présent), appliqué à toutes ses fiches. **Les indépendants gardent chacun le leur.**

### R11 — Villes
**MAJUSCULES, sans accents, sans CEDEX, abréviations développées.** `AIRE SUR LA LYS` · `SAINT BRICE SOUS FORET` · `COMPIEGNE`.
**Précision gravée le 05-08 (P4 tranché) :** les mentions CEDEX sont retirées de la ville, les boîtes postales retirées de la rue, et le **CP Cedex remplacé par celui de la commune** (62401→62400 Béthune · 80108→80100 Abbeville · 62701→62700 Bruay · 62012→62000 Arras · 80005→80000 Amiens · 62802→62800 Liévin) — en perspective géolocalisation.

*Le nom de ville étant l'index de tri (R2), toute divergence de graphie déclasse une fiche.*

### R12 — Une seule adresse, jamais vide
Une fiche porte **une adresse exploitable**, typée travail. Les adresses vides ou résiduelles sont supprimées.

---

## 3. CAS D'ESPÈCE RÉSOLUS

**Le « traitement Fosses »** — quand le nom commercial diffère de la commune d'implantation : Nom = **commune réelle** (tri géographiquement honnête), nom commercial **sauvé dans Société** (la recherche iPhone balayant tous les champs, il reste trouvable). Appliqué à : `LECLERC FOSSES` (implanté La Chapelle-en-Serval, vérifié source officielle) · `CULTURA L'ISLE ADAM` (implanté Mours) · `AUCHAN AMIENS DURY` (implanté Dury).
**Leçon :** l'hypothèse « adresse de facturation » a été démentie par la source officielle — elle ne devient pas une règle, seulement un point de vigilance.

**`SARL BIMAT` (Le Touquet)** — Maison de la Presse confirmée par le capitaine (le logo le disait déjà, au bit près). Sans risque Cowork : la jointure « MAJ Visites » passe par le NUCLI `296079`, pas par le carnet.

**`CULTURA CERGY` (116947)** — Magasin pas encore ouvert, absent de l'export, découvert par la mémoire du capitaine. « Pas encore ouvert » n'entre pas dans l'annuaire (principe 0) : information du Tableau de bord. Sa fiche cumulait six défauts, tous réparés.

**Le bégaiement `LIB. LE GD CERCLE ERAGNY` / `LIB. GOURMANDE PARIS`** — doublon de graphie supprimé (décision 05-08).

---

## 4. POINTS OUVERTS

| # | Point | Nature |
|---|---|---|
| **P1** | **Exhaustivité du portefeuille** — combien de clients hors du groupe « Clients » ? | Audit **H3** (Tableau de bord × Tableau visites × vcf, croisés par NUCLI). Roadmap : H2 avant H3. |
| **P2** | **36 fiches sans email** | Saisie terrain — liste nominative dans `NomadSuite_ANNUAIRE_SAISIE_TERRAIN_060826_0011.md` (GitHub). |
| **P3** | **53 fiches sans interlocuteur nommé** (bloque la formule d'appel NomadMail) | Saisie terrain — même fichier. **32 fiches cumulent P2+P3** : les plus muettes, à prioriser en tournée. |
| **P5** | **Typographie du `&`** dans la table des fonctions — collé ou espacé ? | Non tranché. |
| **P6** | **Vocabulaire des coordonnées de structure** (`Magasin`, `Ligne directe`…) | Proposé, non validé. |
| **P7** | **3 noms dormants hors champs prévus** (Delamain : notes · Crocolivre : notes + phonétiques) | Signalés, pas déplacés — aucune règle ne dit quoi en faire. |

*P4 (CEDEX) : **tranché et appliqué** le 05-08 — absorbé par R11.*

---

## 5. CE QUE CE CHANTIER A CONFIRMÉ DE LA DOCTRINE NOMADCAL

- **Mesurer la population avant de corriger.** Le NUCLI étant déjà parfait (90/90), le déverrouillage Cowork (H2) ne dépend pas de la réécriture. Le chantier a rétréci avant de commencer.
- **Le brut tranche contre la mémoire — et contre le timonier.** Nom/Prénom inversés dans la mémoire du capitaine ; hypothèse « facturation » du timonier démentie par la source officielle. La pièce en main décide.
- **Le brut ne prouve pas ce qu'il ne contient pas.** Cultura Cergy, indétectable par analyse du fichier.
- **Graduation par irréversibilité.** Fax supprimés sur décision explicite, export d'origine en sauvegarde ; noms dormants (P7) tracés plutôt que déplacés.
- **Le principe 0 est devenu un principe d'architecture** : il a fondé D14 (carte R5) — le statut est une donnée d'activité, jamais une structure d'annuaire.

---

## 6. JOURNAL

**05-08-26** — Chantier ouvert. Inventaire complet des 89 fiches en lecture seule. Douze règles gravées, six points ouverts. Trois cas d'espèce résolus. Découverte d'un export non exhaustif.
**06-08-26 (0h11)** — **Réécriture produite** : 90 fiches, `NomadSuite_ANNUAIRE_CLIENTS_060826_0011.vcf`, invariants vérifiés (NUCLI, emails, numéros intacts). P4 appliqué. Rapport avant/après et listes de saisie terrain livrés.
**06-08-26** — **Doctrine consolidée en v2** : synthèse de la réécriture absorbée, P4 clos, P7 ajouté, ponts vers la carte R5 (D11, D14) tracés. Rapport et Saisie terrain archivés sur GitHub `Contexte/` uniquement.
