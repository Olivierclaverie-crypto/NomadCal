# ANNUAIRE CLIENTS — RÉÉCRITURE, TABLEAU AVANT / APRÈS
*Application de R1 à R12 de `NomadSuite_DOCTRINE_ANNUAIRE_050826_2311.md`. 90 fiches. Lecture seule sur la source : `Clients.vcf` (89) + `CULTURA CERGY.vcf` (1) n'ont pas été modifiés.*
*Horodatage : 060826_0011. Fichier produit : `NomadSuite_ANNUAIRE_CLIENTS_060826_0011.vcf`.*

---

## 1. CE QUI NE CHANGE PAS (vérifié champ par champ)

| Donnée | Contrôle |
|---|---|
| Id Client (NUCLI) | 90/90 identiques à la source, aucun doublon |
| Adresses email | 105 → 105, **les 105 chaînes sont identiques** (seul le type change) |
| Numéros vocaux | 122 → 122, **les 122 numéros sont identiques** (seuls le format et le type changent) |
| Rues, compléments, codes postaux, pays | inchangés sur les 90 fiches |
| Champ Société (ORG) | inchangé sauf les 5 fiches où la doctrine l'impose |
| Notes, champs phonétiques, réglages Apple | conservés tels quels |
| Étiquettes libres (`direct`, `accueil mag`, `Rayon`, `iCloud`, prénoms…) | **non touchées** — relèvent du point ouvert P6 |
| Fiche Fnac Boulogne « SFanny » | conservée telle quelle (coquille probable, non tranchée) |

Une seule catégorie de donnée disparaît : **les 38 fax**, sur décision R5.

---

## 2. DÉCOMPTE PAR RÈGLE

**R1 — Id Client — six chiffres nus dans TITLE**  
**0 fiche modifiée.** Les 90 NUCLI étaient déjà conformes (6 chiffres, zéros initiaux préservés, aucun doublon). **Cette règle ne touche rien.**

**R2 — Nommage — Prénom = ENSEIGNE · Nom = VILLE**  
**55 fiches** dont le champ N change. 6 fiches avaient un Nom ou un Prénom vide (elles remontaient en tête de liste) : toutes sont remplies.

**R3 — Table des enseignes**  
**34 fiches** changent d'enseigne. **7 fiches** voient leur champ Société corrigé : les 9 Leclerc portent la distinction HYPER / ESP. CULTUREL, et le nom commercial est sauvé en Société pour Leclerc Fosses, SARL Bimat, **Cultura L'Isle Adam (implanté à Mours)** et **Auchan Amiens Dury (implanté à Dury)** — traitement Fosses, décision capitaine 05-08. Le bégaiement LIB. LE GD CERCLE ERAGNY / LIB. GOURMANDE PARIS est supprimé (décision 05-08).

**R4 — Département dérivé du code postal**  
**64 fiches** corrigées : 48 départements faux, 15 vides, +1 (Cultura Cergy). Répartition finale : 62→24 · 95→22 · 60→19 · 75→17 · 80→8.

**R5 — Aucun fax**  
**38 fax supprimés** sur **38 fiches**. Aucune fiche ne perd sa seule ligne : les 122 numéros vocaux sont tous conservés à l'identique.

**R6 — Téléphones — format, type, un seul préféré**  
**40 numéros** reformatés en français espacé · **31 types** recalculés au préfixe (06/07 → mobile, sinon bureau) · **15 fiches** dont le numéro préféré était un fax et a été déplacé sur une ligne vocale.

**R7 — Emails tous typés travail**  
**27 emails** passent de « domicile » à « travail ». Les emails portant une étiquette libre ne sont pas typés (l'étiquette prime) — leur vocabulaire relève de P6.

**R8 — Interlocuteurs — table fermée de 11 fonctions**  
**47 entrées** réécrites sur **40 fiches**. Civilités retirées, casse Prénom NOM, une personne = une entrée (1 fiche scindée en 2). Portée étendue aux étiquettes d'email sur décision capitaine 05-08 : **3 étiquettes converties** (religieux → Libraire Sciences Humaines&Histoire · vendeuse ×2 → Libraire). Les autres étiquettes libres attendent P6.

**R9 — Photos 400 × 400 maximum**  
**72 images** redimensionnées. Fichier : 7,84 Mo → 2,08 Mo. **2 fiches restent sans image** (Musée Orangerie, Musée Art Déco) : aucune source dans l'annuaire, rien à propager.

**R10 — Logo canonique par enseigne de chaîne**  
**18 fiches** reçoivent le logo canonique de leur enseigne. Les librairies indépendantes, Gibert et les deux musées gardent chacun leur image propre : 22 images uniques pour 22 fiches, c'est le comportement attendu.

**R11 — Villes — majuscules, sans accent, abréviations développées**  
**59 fiches**. 67 graphies de ville distinctes au départ → **58 villes** à l'arrivée. **P4 tranché le 05-08 : les 6 fiches CEDEX sont nettoyées** en perspective géolocalisation — mention CEDEX retirée de la ville, boîtes postales (BP) retirées de la rue, code postal Cedex remplacé par celui de la commune (62401→62400 Béthune · 80108→80100 Abbeville · 62701→62700 Bruay · 62012→62000 Arras · 80005→80000 Amiens · 62802→62800 Liévin).

**R12 — Une seule adresse, jamais vide**  
**2 adresses vides supprimées** (Auchan Cergy Pontoise, Cultura Cergy) et **2 adresses typées « domicile »** repassées en « travail » (Furet du Nord Lens, Cultura Cergy).


---

## 3. VUE SYNOPTIQUE DES 90 FICHES

*Trié dans l'ordre du fichier source. « Fax » = nombre de fax supprimés sur la fiche.*

| # | NUCLI | Enseigne avant → après | Ville avant → après | Département avant → après | Fax |
|---:|---|---|---|---|---:|
| 1 | 172312 | LIB. → **LIB. BELLE LURETTE** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 2 | 117358 | (vide) → **GIBERT JOSEPH LA PLACE** | Paris → **PARIS** | (vide) → **PARIS** |  |
| 3 | 136002 | LIB. → **LIB. AU VIEUX CAMPEUR** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 4 | 110171 | CULTURA *(inchangé)* | Amiens → **AMIENS** | (vide) → **SOMME** |  |
| 5 | 225870 | CULTURA *(inchangé)* | Franconville → **FRANCONVILLE** | AISNE → **VAL D'OISE** |  |
| 6 | 489989 | CARREFOUR *(inchangé)* | ERMONT *(inchangé)* | NORD → **VAL D'OISE** |  |
| 7 | 103309 | LIB. → **LIB. COMPAGNIE** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 8 | 465708 | AUCHAN *(inchangé)* | NOYON *(inchangé)* | OISE *(inchangé)* | 1 |
| 9 | 109421 | LIB. → **LIB. LE GD CERCLE** | Éragny → **ERAGNY** | Val d'Oise → **VAL D'OISE** |  |
| 10 | 214353 | CULTURA *(inchangé)* | HENIN BEAUMONT *(inchangé)* | AISNE → **PAS DE CALAIS** |  |
| 11 | 111567 | MAISON DE LA PRESSE *(inchangé)* | BERCK PLAGE *(inchangé)* | PAS DE CALAIS *(inchangé)* |  |
| 12 | 468454 | AUCHAN *(inchangé)* | ST MARTIN BOULOGNE → **SAINT MARTIN BOULOGNE** | PAS DE CALAIS *(inchangé)* | 1 |
| 13 | 116384 | CULTURA *(inchangé)* | Mours → **MOURS** | AISNE → **VAL D'OISE** |  |
| 14 | 453993 | CARREFOUR *(inchangé)* | SANNOIS *(inchangé)* | PAS DE CALAIS → **VAL D'OISE** | 1 |
| 15 | 092270 | FNAC *(inchangé)* | Cergy Pontoise → **CERGY PONTOISE** | (vide) → **VAL D'OISE** |  |
| 16 | 235671 | (vide) → **MUSEE ORANGERIE** | Paris → **PARIS** | (vide) → **PARIS** |  |
| 17 | 102541 | LIB. → **LIB. EYROLLES** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 18 | 466284 | AUCHAN *(inchangé)* | BETHUNE CEDEX → **BETHUNE** | PAS DE CALAIS *(inchangé)* | 1 |
| 19 | 296079 | SARL BIMAT → **MAISON DE LA PRESSE** | LE TOUQUET PARIS PLAGE *(inchangé)* | PAS DE CALAIS *(inchangé)* |  |
| 20 | 561704 | (vide) → **LIB. LA GRAND LIBRAIRIE** | ARRAS *(inchangé)* | AISNE → **PAS DE CALAIS** |  |
| 21 | 100271 | LIB. → **LIB. GALIGNANI** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 22 | 166728 | CARREFOUR *(inchangé)* | Beauvais → **BEAUVAIS** | PAS DE CALAIS → **OISE** |  |
| 23 | 252569 | LIB. → **LIB. CUFAY** | Abbeville → **ABBEVILLE** | PAS DE CALAIS → **SOMME** | 1 |
| 24 | 238527 | MUSEE → **MUSEE ART DECO** | Paris → **PARIS** | (vide) → **PARIS** |  |
| 25 | 065250 | HYPER LECLERC → **LECLERC HYPER** | Pont Ste Maxence → **PONT SAINTE MAXENCE** | AISNE → **OISE** | 1 |
| 26 | 038497 | CARREFOUR *(inchangé)* | AUCHY LES MINES *(inchangé)* | PAS DE CALAIS *(inchangé)* | 1 |
| 27 | 095513 | FNAC *(inchangé)* | Saint-Maximin → **SAINT MAXIMIN** | AISNE → **OISE** |  |
| 28 | 453498 | CARREFOUR *(inchangé)* | ST BRICE SOUS FORET → **SAINT BRICE SOUS FORET** | PAS DE CALAIS → **VAL D'OISE** | 1 |
| 29 | 106328 | LIB. → **LIB. COMME UN ROMAN** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 30 | 450304 | CARREFOUR *(inchangé)* | AIRE S LA LYS → **AIRE SUR LA LYS** | PAS DE CALAIS *(inchangé)* | 1 |
| 31 | 516195 | LIB → **LIB. LES SIGNES** | Compiègne → **COMPIEGNE** | PAS DE CALAIS → **OISE** |  |
| 32 | 490029 | ESP CUL LECLERC → **LECLERC ESP. CULTUREL** | OUTREAU *(inchangé)* | PAS DE CALAIS *(inchangé)* |  |
| 33 | 010009 | FNAC *(inchangé)* | Paris → **PARIS** | (vide) → **PARIS** |  |
| 34 | 091264 | FNAC *(inchangé)* | BOULOGNE SUR MER *(inchangé)* | AISNE → **PAS DE CALAIS** |  |
| 35 | 449363 | CARREFOUR *(inchangé)* | ST MAXIMIN → **SAINT MAXIMIN** | OISE *(inchangé)* |  |
| 36 | 166736 | CARREFOUR *(inchangé)* | Beauvais → **BEAUVAIS** | PAS DE CALAIS → **OISE** | 1 |
| 37 | 458349 | LECLERC → **LECLERC HYPER** | Trie-Chateau → **TRIE CHATEAU** | AISNE → **OISE** | 1 |
| 38 | 018531 | ESP CUL LECLERC → **LECLERC ESP. CULTUREL** | Le Plessis Belleville → **LE PLESSIS BELLEVILLE** | (vide) → **OISE** | 1 |
| 39 | 290460 | LIB. → **LIB. ESPACE PIERRE LECUT** | Ermont → **ERMONT** | PAS DE CALAIS → **VAL D'OISE** |  |
| 40 | 108498 | LIB. → **LIB. STUDIO LIVRE** | ABBEVILLE CEDEX → **ABBEVILLE** | PAS DE CALAIS → **SOMME** |  |
| 41 | 226894 | LIB. → **LIB. LE PRESSE PAPIER** | Argenteuil → **ARGENTEUIL** | PAS DE CALAIS → **VAL D'OISE** |  |
| 42 | 174060 | CARREFOUR *(inchangé)* | COQUELLES *(inchangé)* | PAS DE CALAIS *(inchangé)* | 1 |
| 43 | 489047 | CARREFOUR *(inchangé)* | BRUAY LA BUISSIERE CEDEX → **BRUAY LA BUISSIERE** | PAS DE CALAIS *(inchangé)* |  |
| 44 | 225169 | CULTURA *(inchangé)* | VENETTE *(inchangé)* | AISNE → **OISE** |  |
| 45 | 467373 | AUCHAN *(inchangé)* | NOYELLES GODAULT *(inchangé)* | PAS DE CALAIS *(inchangé)* | 1 |
| 46 | 454769 | CARREFOUR *(inchangé)* | MONTIGNY LES CORMEILLES *(inchangé)* | PAS DE CALAIS → **VAL D'OISE** | 1 |
| 47 | 152819 | AUCHAN *(inchangé)* | SOISY SOUS MONTMORENCY *(inchangé)* | SOMME → **VAL D'OISE** | 1 |
| 48 | 465930 | AUCHAN *(inchangé)* | LONGUENESSE *(inchangé)* | PAS DE CALAIS *(inchangé)* | 1 |
| 49 | 451880 | CARREFOUR *(inchangé)* | L'Isle-Adam → **L'ISLE ADAM** | PAS DE CALAIS → **VAL D'OISE** | 1 |
| 50 | 100149 | LIB. → **LIB. DELAMAIN** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 51 | 445544 | HYPER LECLERC → **LECLERC HYPER** | Franconville → **FRANCONVILLE** | AISNE → **VAL D'OISE** | 1 |
| 52 | 017616 | HYPER LECLERC → **LECLERC HYPER** | OSNY *(inchangé)* | AISNE → **VAL D'OISE** | 1 |
| 53 | 575514 | CULTURA *(inchangé)* | Beauvais → **BEAUVAIS** | (vide) → **OISE** |  |
| 54 | 484550 | AUCHAN *(inchangé)* | TAVERNY *(inchangé)* | SOMME → **VAL D'OISE** | 1 |
| 55 | 110510 | LIB. → **LIB. CROCOLIVRE** | Enghien-les-Bains → **ENGHIEN LES BAINS** | PAS DE CALAIS → **VAL D'OISE** |  |
| 56 | 227488 | CULTURA *(inchangé)* | ST MAXIMIN → **SAINT MAXIMIN** | AISNE → **OISE** |  |
| 57 | 019158 | AUCHAN *(inchangé)* | SARCELLES *(inchangé)* | SOMME → **VAL D'OISE** | 1 |
| 58 | 091298 | FNAC *(inchangé)* | Compiègne → **COMPIEGNE** | AISNE → **OISE** |  |
| 59 | 152801 | AUCHAN *(inchangé)* | NOGENT SUR OISE *(inchangé)* | OISE *(inchangé)* | 1 |
| 60 | 454785 | HYPER LECLERC FOSSES → **LECLERC HYPER** | La Chapelle en Serval → **LA CHAPELLE EN SERVAL** | AISNE → **OISE** | 1 |
| 61 | 484618 | AUCHAN *(inchangé)* | OSNY *(inchangé)* | SOMME → **VAL D'OISE** | 1 |
| 62 | 167973 | CARREFOUR *(inchangé)* | ST MARTIN AU LAERT → **SAINT MARTIN AU LAERT** | PAS DE CALAIS *(inchangé)* | 1 |
| 63 | 173633 | CARREFOUR *(inchangé)* | AMIENS *(inchangé)* | SOMME *(inchangé)* |  |
| 64 | 099069 | FNAC *(inchangé)* | AMIENS *(inchangé)* | AISNE → **SOMME** |  |
| 65 | 247353 | FURET DU NORD *(inchangé)* | Lens → **LENS** | (vide) → **PAS DE CALAIS** |  |
| 66 | 095414 | FNAC *(inchangé)* | HERBLAY *(inchangé)* | (vide) → **VAL D'OISE** |  |
| 67 | 110916 | LIB. → **LIB. ICI** | Paris → **PARIS** | (vide) → **PARIS** |  |
| 68 | 247247 | FURET DU NORD *(inchangé)* | Arras → **ARRAS** | PAS DE CALAIS *(inchangé)* |  |
| 69 | 491902 | AUCHAN *(inchangé)* | Dury → **DURY** | SOMME *(inchangé)* | 1 |
| 70 | 112615 | LIB. → **LIB. VOYAGEURS MONDE** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 71 | 155192 | CARREFOUR *(inchangé)* | BERCK S MER → **BERCK SUR MER** | PAS DE CALAIS *(inchangé)* | 1 |
| 72 | 466755 | AUCHAN *(inchangé)* | CERGY PONTOISE *(inchangé)* | SOMME → **VAL D'OISE** | 1 |
| 73 | 481028 | AUCHAN *(inchangé)* | ARRAS CEDEX → **ARRAS** | PAS DE CALAIS *(inchangé)* | 1 |
| 74 | 226993 | LIB → **LIB. GOURMANDE** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 75 | 107193 | LIB. → **LIB. L'ACACIA** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 76 | 465609 | AUCHAN *(inchangé)* | MERS LES BAINS *(inchangé)* | SOMME *(inchangé)* | 1 |
| 77 | 294728 | LIB. → **LIB. MARTELLE** | AMIENS CEDEX 1 → **AMIENS** | PAS DE CALAIS → **SOMME** | 1 |
| 78 | 236414 | LIB. → **LIB. LES TRAVERSEES** | Paris → **PARIS** | PAS DE CALAIS → **PARIS** |  |
| 79 | 453423 | ESP CUL LECLERC → **LECLERC ESP. CULTUREL** | Moisselles → **MOISSELLES** | PAS DE CALAIS → **VAL D'OISE** |  |
| 80 | 108423 | LIB. BHV *(inchangé)* | Paris → **PARIS** | (vide) → **PARIS** |  |
| 81 | 489245 | CARREFOUR *(inchangé)* | VENDIN LE VIEIL *(inchangé)* | PAS DE CALAIS *(inchangé)* |  |
| 82 | 420836 | AUCHAN *(inchangé)* | MERU *(inchangé)* | 060 → **OISE** | 1 |
| 83 | 111328 | CULTURA *(inchangé)* | Fouquiéres les Bethune → **FOUQUIERES LES BETHUNE** | (vide) → **PAS DE CALAIS** |  |
| 84 | 044172 | CARREFOUR *(inchangé)* | LIEVIN CEDEX → **LIEVIN** | PAS DE CALAIS *(inchangé)* | 1 |
| 85 | 241213 | FURET DU NORD *(inchangé)* | Coquelles → **COQUELLES** | (vide) → **PAS DE CALAIS** |  |
| 86 | 458281 | ESP CUL LECLERC → **LECLERC ESP. CULTUREL** | CHAMBLY *(inchangé)* | PAS DE CALAIS → **OISE** | 1 |
| 87 | 471631 | CARREFOUR *(inchangé)* | Venette → **VENETTE** | OISE *(inchangé)* | 1 |
| 88 | 446062 | AUCHAN *(inchangé)* | BEAUVAIS *(inchangé)* | OISE *(inchangé)* | 1 |
| 89 | 421602 | AUCHAN *(inchangé)* | CALAIS *(inchangé)* | PAS DE CALAIS *(inchangé)* | 1 |
| 90 | 116947 | CULTURA *(inchangé)* | Cergy-Pontoise → **CERGY PONTOISE** | (vide) → **VAL D'OISE** |  |

---

## 4. DÉTAIL FICHE PAR FICHE

### 1 · LIB. BELLE LURETTE → **LIB. BELLE LURETTE PARIS** · NUCLI 172312

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | BELLE LURETTE;LIB.;;; | PARIS;LIB. BELLE LURETTE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Téléphone (format) | +33658020642 | 06 58 02 06 42 | R6 |
| Téléphone (type) | 01 44 61 19 96 — CELL | WORK | R6 |
| Téléphone (type) | 06 14 94 82 81 — HOME | CELL | R6 |
| Téléphone (type) | 06 58 02 06 42 — aucun | CELL | R6 |
| Email (type) | librairiejeunesse@labellelurette.fr — HOME | WORK | R7 |
| Interlocuteur | Pascal Barut [_$!<Assistant>!$_] | Pascal BARUT [Libraire] | R8 |
| Photo (taille) | (356, 354) | (356, 354) (55854 o) | R9 |

### 2 · GIBERT JOSEPH LA PLACE → **GIBERT JOSEPH LA PLACE PARIS** · NUCLI 117358

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ;;;; | PARIS;GIBERT JOSEPH LA PLACE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Téléphone (format) | +33674232484 | 06 74 23 24 84 | R6 |
| Téléphone (type) | 06 74 23 24 84 — aucun | CELL | R6 |
| Photo (taille) | (1024, 1024) | (400, 400) (12435 o) | R9 |

### 3 · LIB. AU VIEUX CAMPEUR → **LIB. AU VIEUX CAMPEUR PARIS** · NUCLI 136002

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | AU VIEUX CAMPEUR;LIB.;;; | PARIS;LIB. AU VIEUX CAMPEUR;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Téléphone (format) | +33671883022 | 06 71 88 30 22 | R6 |
| Téléphone (type) | 06 71 88 30 22 — aucun | CELL | R6 |
| Interlocuteur | Julien Picq [_$!<Manager>!$_] | Julien PICQ [Responsable Librairie] | R8 |
| Photo (taille) | (700, 700) | (400, 400) (26068 o) | R9 |

### 4 · CULTURA AMIENS → **CULTURA AMIENS** · NUCLI 110171

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Amiens | AMIENS | R11 |
| Département | (vide) | SOMME | R4 |
| Téléphone (type) | 03 22 40 32 10 — CELL | WORK | R6 |
| Email (type) | culturalibrairieamiens@gmail.com — HOME | WORK | R7 |
| Photo (logo) | logo propre à la fiche | logo canonique CULTURA | R10 |
| Photo (taille) | (336, 336) | (400, 400) (10701 o) | R9 |

### 5 · CULTURA FRANCONVILLE → **CULTURA FRANCONVILLE** · NUCLI 225870

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Franconville | FRANCONVILLE | R11 |
| Département | AISNE | VAL D'OISE | R4 |
| Email (type) | livrefranconville@gmail.com — HOME | WORK | R7 |
| Photo (logo) | logo propre à la fiche | logo canonique CULTURA | R10 |
| Photo (taille) | (786, 786) | (400, 400) (10701 o) | R9 |

### 6 · CARREFOUR ERMONT → **CARREFOUR ERMONT** · NUCLI 489989

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | NORD | VAL D'OISE | R4 |
| Téléphone (type) | 06 72 43 09 44 — HOME | CELL | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique CARREFOUR | R10 |
| Photo (taille) | (2352, 2352) | (400, 400) (9950 o) | R9 |

### 7 · LIB. COMPAGNIE → **LIB. COMPAGNIE PARIS** · NUCLI 103309

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | COMPAGNIE;LIB.;;; | PARIS;LIB. COMPAGNIE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Photo (taille) | (696, 696) | (400, 400) (12320 o) | R9 |

### 8 · AUCHAN NOYON → **AUCHAN NOYON** · NUCLI 465708

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 03 60 56 01 01 | **supprimé** | R5 |
| Téléphone (format) | 0344098073 | 03 44 09 80 73 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 9 · LIB. LE GD CERCLE ERAGNY → **LIB. LE GD CERCLE ERAGNY** · NUCLI 109421

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | LE GD CERCLE ERAGNY;LIB.;;; | ERAGNY;LIB. LE GD CERCLE;;; | R2 · R3 |
| Ville (adresse) | Éragny | ERAGNY | R11 |
| Département | Val d'Oise | VAL D'OISE | R4 |
| Téléphone (format) | +33 7 69 22 78 73 | 07 69 22 78 73 | R6 |
| Email (type) | m.bouhelal@legrandcercle.fr — HOME | WORK | R7 |
| Interlocuteur | Charlotte (vie pratique) Laetitia (Jeunesse) [Libraires] | Charlotte [Libraire Vie Pratique&Tourisme] + Laetitia [Libraire Jeunesse] | R8 |
| Photo (taille) | (450, 450) | (400, 400) (11402 o) | R9 |

### 10 · CULTURA HENIN B. → **CULTURA HENIN BEAUMONT** · NUCLI 214353

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | HENIN B.;CULTURA;;; | HENIN BEAUMONT;CULTURA;;; | R2 · R3 |
| Département | AISNE | PAS DE CALAIS | R4 |
| Téléphone (format) | 0321080160 | 03 21 08 01 60 | R6 |
| Email (type) | librairie.culturahb@gmail.com — HOME | WORK | R7 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |

### 11 · MAISON DE LA PRESSE BERCK P. → **MAISON DE LA PRESSE BERCK PLAGE** · NUCLI 111567

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | BERCK P.;MAISON DE LA PRESSE;;; | BERCK PLAGE;MAISON DE LA PRESSE;;; | R2 · R3 |
| Téléphone (format) | +33622866573 | 06 22 86 65 73 | R6 |
| Téléphone (type) | 06 22 86 65 73 — aucun | CELL | R6 |
| Photo (taille) | (696, 696) | (400, 400) (6590 o) | R9 |

### 12 · AUCHAN ST MARTIN LES B. → **AUCHAN SAINT MARTIN BOULOGNE** · NUCLI 468454

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST MARTIN LES B.;AUCHAN;;; | SAINT MARTIN BOULOGNE;AUCHAN;;; | R2 · R3 |
| Ville (adresse) | ST MARTIN BOULOGNE | SAINT MARTIN BOULOGNE | R11 |
| Fax | 0321101104 | **supprimé** | R5 |
| Téléphone (format) | 0321101112 | 03 21 10 11 12 | R6 |
| Téléphone (format) | 0321109804 | 03 21 10 98 04 | R6 |
| Téléphone (type) | 03 21 10 11 12 — aucun | WORK | R6 |
| Numéro préféré | 03 21 10 11 04 | 03 21 10 11 12 | R6 |
| Interlocuteur | KARINE RENARD [vendeuse] | Karine RENARD [Libraire] | R8 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 13 · CULTURA L'ISLE ADAM → **CULTURA MOURS** · NUCLI 116384

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | L'ISLE ADAM;CULTURA;;; | MOURS;CULTURA;;; | R2 · R3 |
| Société | ;LIBRAIRIE | CULTURA L'ISLE ADAM;LIBRAIRIE | R3 · §3 |
| Ville (adresse) | Mours | MOURS | R11 |
| Département | AISNE | VAL D'OISE | R4 |
| Téléphone (format) | 0134083000 | 01 34 08 30 00 | R6 |
| Email (type) | j.boron@cultura.fr — HOME | WORK | R7 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |

### 14 · CARREFOUR SANNOIS → **CARREFOUR SANNOIS** · NUCLI 453993

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Fax | 01 39 98 47 30 | **supprimé** | R5 |
| Téléphone (type) | 01 39 98 10 00 — OTHER | WORK | R6 |
| Interlocuteur | Anthony [_$!<Assistant>!$_] | Anthony [Libraire] | R8 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 15 · FNAC CERGY → **FNAC CERGY PONTOISE** · NUCLI 092270

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CERGY;FNAC;;; | CERGY PONTOISE;FNAC;;; | R2 · R3 |
| Ville (adresse) | Cergy Pontoise | CERGY PONTOISE | R11 |
| Département | (vide) | VAL D'OISE | R4 |
| Interlocuteur | DOMINIQUE TERMEAU [_$!<Assistant>!$_] | Dominique TERMEAU [Libraire] | R8 |
| Photo (taille) | (336, 336) | (336, 336) (28248 o) | R9 |

### 16 · MUSEE ORANGERIE → **MUSEE ORANGERIE PARIS** · NUCLI 235671

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ;;;; | PARIS;MUSEE ORANGERIE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Photo (taille) | (aucune) | AUCUNE — pas de source dans l’annuaire | R9 |

### 17 · LIB. EYROLLES → **LIB. EYROLLES PARIS** · NUCLI 102541

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | EYROLLES;LIB.;;; | PARIS;LIB. EYROLLES;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Téléphone (format) | +33619902790 | 06 19 90 27 90 | R6 |
| Téléphone (type) | 01 44 41 11 91 — HOME | WORK | R6 |
| Téléphone (type) | 06 19 90 27 90 — aucun | CELL | R6 |
| Email (type) | jcavalier@eyrolles.com — HOME | WORK | R7 |
| Interlocuteur | Mr Emmanuel KONSTANTIN [_$!<Manager>!$_] | Emmanuel KONSTANTIN [Responsable Librairie] | R8 |
| Photo (taille) | (700, 700) | (400, 400) (14063 o) | R9 |

### 18 · AUCHAN BETHUNE → **AUCHAN BETHUNE** · NUCLI 466284

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | BETHUNE CEDEX | BETHUNE | R11 |
| Fax | 0321565846 | **supprimé** | R5 |
| Téléphone (format) | 0321617171 | 03 21 61 71 71 | R6 |
| Téléphone (format) | 0321617137 | 03 21 61 71 37 | R6 |
| Téléphone (type) | 03 21 61 71 71 — aucun | WORK | R6 |
| Numéro préféré | 03 21 56 58 46 | 03 21 61 71 71 | R6 |
| Interlocuteur | MAGALIE ROUGEMONT [vendeuse] | Magalie ROUGEMONT [Libraire] | R8 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 19 · SARL BIMAT → **MAISON DE LA PRESSE LE TOUQUET PARIS PLAGE** · NUCLI 296079

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ;SARL BIMAT;;; | LE TOUQUET PARIS PLAGE;MAISON DE LA PRESSE;;; | R2 · R3 |
| Société | (vide) | SARL BIMAT; | R3 · §3 |
| Téléphone (type) | 09 64 35 60 12 — HOME | WORK | R6 |
| Interlocuteur | Mme Delphine Dausque [_$!<Manager>!$_] | Delphine DAUSQUE [Responsable Librairie] | R8 |
| Photo (taille) | (696, 696) | (400, 400) (6590 o) | R9 |

### 20 · LA GRAND LIBRAIRIE → **LIB. LA GRAND LIBRAIRIE ARRAS** · NUCLI 561704

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | LA GRAND LIBRAIRIE;;;; | ARRAS;LIB. LA GRAND LIBRAIRIE;;; | R2 · R3 |
| Département | AISNE | PAS DE CALAIS | R4 |
| Email (type) | pratique@lagrandlibrairie.com — HOME | WORK | R7 |
| Interlocuteur | Mr ARNAUD DERVILLE [_$!<Manager>!$_] | Arnaud DERVILLE [Responsable Librairie] | R8 |
| Photo (taille) | (274, 272) | (274, 272) (22280 o) | R9 |

### 21 · LIB. GALIGNANI → **LIB. GALIGNANI PARIS** · NUCLI 100271

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | GALIGNANI;LIB.;;; | PARIS;LIB. GALIGNANI;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Interlocuteur | MME DANIELLE CILLIEN-SABATIER [_$!<Manager>!$_] | Danielle CILLIEN-SABATIER [Responsable Librairie] | R8 |
| Interlocuteur | Raphael Lamarche Vadel [_$!<Assistant>!$_] | Raphael LAMARCHE VADEL [Libraire] | R8 |
| Photo (taille) | (500, 500) | (400, 400) (41785 o) | R9 |

### 22 · CARREFOUR BEAUVAIS CENTRE → **CARREFOUR BEAUVAIS** · NUCLI 166728

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | BEAUVAIS CENTRE;CARREFOUR;;; | BEAUVAIS;CARREFOUR;;; | R2 · R3 |
| Ville (adresse) | Beauvais | BEAUVAIS | R11 |
| Département | PAS DE CALAIS | OISE | R4 |
| Interlocuteur | MR COTTEBRUNE ALEXIS [_$!<Manager>!$_] | Alexis COTTEBRUNE [Responsable Librairie] | R8 |
| Photo (logo) | logo propre à la fiche | logo canonique CARREFOUR | R10 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 23 · LIB. CUFAY → **LIB. CUFAY ABBEVILLE** · NUCLI 252569

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CUFAY;LIB.;;; | ABBEVILLE;LIB. CUFAY;;; | R2 · R3 |
| Ville (adresse) | Abbeville | ABBEVILLE | R11 |
| Département | PAS DE CALAIS | SOMME | R4 |
| Fax | 03 22 20 22 66 | **supprimé** | R5 |
| Téléphone (type) | 03 22 24 04 05 — MAIN | WORK | R6 |
| Interlocuteur | Mr THIERRY DAMAGNEZ [_$!<Manager>!$_] | Thierry DAMAGNEZ [Responsable Librairie] | R8 |
| Interlocuteur | Martine [_$!<Assistant>!$_] | Martine [Libraire] | R8 |
| Photo (taille) | (618, 618) | (400, 400) (23400 o) | R9 |

### 24 · MUSEE ART DECO → **MUSEE ART DECO PARIS** · NUCLI 238527

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ART DECO;MUSEE;;; | PARIS;MUSEE ART DECO;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Photo (taille) | (aucune) | AUCUNE — pas de source dans l’annuaire | R9 |

### 25 · HYPER LECLERC PONT ST M. → **LECLERC HYPER PONT SAINTE MAXENCE** · NUCLI 065250

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | PONT ST M.;HYPER LECLERC;;; | PONT SAINTE MAXENCE;LECLERC HYPER;;; | R2 · R3 |
| Ville (adresse) | Pont Ste Maxence | PONT SAINTE MAXENCE | R11 |
| Département | AISNE | OISE | R4 |
| Fax | 03 44 72 11 65 | **supprimé** | R5 |
| Email (type) | thierry.bedo@pont-sainte-maxence.leclerc — HOME | WORK | R7 |
| Interlocuteur | THIERRY BEDO [_$!<Manager>!$_] | Thierry BEDO [Responsable Librairie] | R8 |
| Photo (logo) | logo propre à la fiche | logo canonique LECLERC HYPER | R10 |
| Photo (taille) | (696, 696) | (400, 400) (18681 o) | R9 |

### 26 · CARREFOUR AUCHY LES MINES → **CARREFOUR AUCHY LES MINES** · NUCLI 038497

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0321637948 | **supprimé** | R5 |
| Téléphone (format) | 0321637900 | 03 21 63 79 00 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 27 · FNAC ST MAXIMIN → **FNAC SAINT MAXIMIN** · NUCLI 095513

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST MAXIMIN;FNAC;;; | SAINT MAXIMIN;FNAC;;; | R2 · R3 |
| Ville (adresse) | Saint-Maximin | SAINT MAXIMIN | R11 |
| Département | AISNE | OISE | R4 |
| Email (type) | librairiefnac.creil@gmail.com — HOME | WORK | R7 |
| Interlocuteur | Sandrine / Vie Pratique [_$!<Assistant>!$_] | Sandrine [Libraire Vie Pratique&Tourisme] | R8 |
| Interlocuteur | Rachel / Jeunesse [_$!<Assistant>!$_] | Rachel [Libraire Jeunesse] | R8 |
| Interlocuteur | MR ERIC HEINTZ [_$!<Assistant>!$_] | Eric HEINTZ [Libraire] | R8 |
| Photo (logo) | logo propre à la fiche | logo canonique FNAC | R10 |
| Photo (taille) | (338, 336) | (336, 336) (28248 o) | R9 |

### 28 · CARREFOUR ST BRICE → **CARREFOUR SAINT BRICE SOUS FORET** · NUCLI 453498

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST BRICE;CARREFOUR;;; | SAINT BRICE SOUS FORET;CARREFOUR;;; | R2 · R3 |
| Ville (adresse) | ST BRICE SOUS FORET | SAINT BRICE SOUS FORET | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Fax | 01 39 92 66 99 | **supprimé** | R5 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 29 · LIB. COMME UN ROMAN → **LIB. COMME UN ROMAN PARIS** · NUCLI 106328

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | COMME UN ROMAN;LIB.;;; | PARIS;LIB. COMME UN ROMAN;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Téléphone (format) | +33 6 24 47 30 82 | 06 24 47 30 82 | R6 |
| Interlocuteur | Mme Karine HENRY [_$!<Manager>!$_] | Karine HENRY [Responsable Librairie] | R8 |
| Interlocuteur | Mr Xavier MONI [_$!<Manager>!$_] | Xavier MONI [Responsable Librairie] | R8 |
| Photo (taille) | (440, 440) | (400, 400) (26238 o) | R9 |

### 30 · CARREFOUR AIRE SUR LA LYS → **CARREFOUR AIRE SUR LA LYS** · NUCLI 450304

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | AIRE S LA LYS | AIRE SUR LA LYS | R11 |
| Fax | 0321388944 | **supprimé** | R5 |
| Téléphone (format) | 0321388900 | 03 21 38 89 00 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 31 · LIB LES SIGNES → **LIB. LES SIGNES COMPIEGNE** · NUCLI 516195

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | LES SIGNES;LIB;;; | COMPIEGNE;LIB. LES SIGNES;;; | R2 · R3 |
| Ville (adresse) | Compiègne | COMPIEGNE | R11 |
| Département | PAS DE CALAIS | OISE | R4 |
| Téléphone (type) | 09 75 72 86 71 — CELL | WORK | R6 |
| Email (type) | matthieudessignes@gmail.com — HOME | WORK | R7 |
| Interlocuteur | Mlle Camille Defourny [_$!<Manager>!$_] | Camille DEFOURNY [Responsable Librairie] | R8 |
| Photo (taille) | (696, 696) | (400, 400) (11598 o) | R9 |

### 32 · ESP CUL LECLERC OUTREAU → **LECLERC ESP. CULTUREL OUTREAU** · NUCLI 490029

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | OUTREAU;ESP CUL LECLERC;;; | OUTREAU;LECLERC ESP. CULTUREL;;; | R2 · R3 |
| Téléphone (format) | 0321102817 | 03 21 10 28 17 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (11478 o) | R9 |

### 33 · FNAC FORUM LES HALLES → **FNAC PARIS** · NUCLI 010009

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | FORUM LES HALLES;FNAC;;; | PARIS;FNAC;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Photo (logo) | logo propre à la fiche | logo canonique FNAC | R10 |
| Photo (taille) | (336, 336) | (336, 336) (28248 o) | R9 |

### 34 · FNAC BOULOGNE SUR MER → **FNAC BOULOGNE SUR MER** · NUCLI 091264

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | AISNE | PAS DE CALAIS | R4 |
| Email (type) | librairie.boulognesurmer@gmail.com — HOME | WORK | R7 |
| Interlocuteur | SFanny / Vie Pratique [_$!<Assistant>!$_] | SFanny [Libraire Vie Pratique&Tourisme] | R8 |
| Interlocuteur | charlotte / Jeunesse [_$!<Assistant>!$_] | Charlotte [Libraire Jeunesse] | R8 |
| Photo (taille) | (336, 336) | (336, 336) (28248 o) | R9 |

### 35 · CARREFOUR ST MAXIMIN → **CARREFOUR SAINT MAXIMIN** · NUCLI 449363

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST MAXIMIN;CARREFOUR;;; | SAINT MAXIMIN;CARREFOUR;;; | R2 · R3 |
| Ville (adresse) | ST MAXIMIN | SAINT MAXIMIN | R11 |
| Téléphone (format) | 0344647800 | 03 44 64 78 00 | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique CARREFOUR | R10 |
| Photo (taille) | (2352, 2352) | (400, 400) (9950 o) | R9 |

### 36 · CARREFOUR BEAUVAIS → **CARREFOUR BEAUVAIS** · NUCLI 166736

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Beauvais | BEAUVAIS | R11 |
| Département | PAS DE CALAIS | OISE | R4 |
| Fax | 01 49 71 73 74 | **supprimé** | R5 |
| Téléphone (type) | 01 49 71 73 73 — OTHER | WORK | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 37 · LECLERC TRIE CHATEAU → **LECLERC HYPER TRIE CHATEAU** · NUCLI 458349

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | TRIE CHATEAU;LECLERC;;; | TRIE CHATEAU;LECLERC HYPER;;; | R2 · R3 |
| Ville (adresse) | Trie-Chateau | TRIE CHATEAU | R11 |
| Département | AISNE | OISE | R4 |
| Fax | 03 44 49 56 28 | **supprimé** | R5 |
| Email (type) | jean-christophe.soudain@trie-chateau.leclerc — HOME | WORK | R7 |
| Interlocuteur | JEAN CHRISTOPHE SOUDAIN [_$!<Manager>!$_] | Jean Christophe SOUDAIN [Responsable Librairie] | R8 |
| Photo (taille) | (2400, 2400) | (400, 400) (18681 o) | R9 |

### 38 · ESP CUL LECLERC PLESSIS B. → **LECLERC ESP. CULTUREL LE PLESSIS BELLEVILLE** · NUCLI 018531

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | PLESSIS B.;ESP CUL LECLERC;;; | LE PLESSIS BELLEVILLE;LECLERC ESP. CULTUREL;;; | R2 · R3 |
| Société | (vide) | LECLERC;ESPACE CULTUREL | R3 · §3 |
| Ville (adresse) | Le Plessis Belleville | LE PLESSIS BELLEVILLE | R11 |
| Département | (vide) | OISE | R4 |
| Fax | 03 44 60 71 49 | **supprimé** | R5 |
| Téléphone (format) | +33610158566 | 06 10 15 85 66 | R6 |
| Téléphone (type) | 06 10 15 85 66 — aucun | CELL | R6 |
| Email (type) | ilona.lagouge@plessis-belleville.leclerc — HOME | WORK | R7 |
| Photo (taille) | (696, 696) | (400, 400) (11478 o) | R9 |

### 39 · LIB. ESPACE PIERRE LECUT → **LIB. ESPACE PIERRE LECUT ERMONT** · NUCLI 290460

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ESPACE PIERRE LECUT;LIB.;;; | ERMONT;LIB. ESPACE PIERRE LECUT;;; | R2 · R3 |
| Ville (adresse) | Ermont | ERMONT | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Email (type) | laurav.espacepierrelecut@orange — HOME | WORK | R7 |
| Interlocuteur | Mr Pierre LECUT [_$!<Manager>!$_] | Pierre LECUT [Responsable Librairie] | R8 |
| Photo (taille) | (668, 668) | (400, 400) (24188 o) | R9 |

### 40 · LIB. STUDIO LIVRE → **LIB. STUDIO LIVRE ABBEVILLE** · NUCLI 108498

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | STUDIO LIVRE;LIB.;;; | ABBEVILLE;LIB. STUDIO LIVRE;;; | R2 · R3 |
| Ville (adresse) | ABBEVILLE CEDEX | ABBEVILLE | R11 |
| Photo (taille) | (450, 450) | (400, 400) (30517 o) | R9 |

### 41 · LIB. LE PRESSE PAPIER → **LIB. LE PRESSE PAPIER ARGENTEUIL** · NUCLI 226894

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | LE PRESSE PAPIER;LIB.;;; | ARGENTEUIL;LIB. LE PRESSE PAPIER;;; | R2 · R3 |
| Ville (adresse) | Argenteuil | ARGENTEUIL | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Interlocuteur | Mr Gilles BRUEY [_$!<Manager>!$_] | Gilles BRUEY [Responsable Librairie] | R8 |
| Photo (taille) | (298, 296) | (298, 296) (34584 o) | R9 |

### 42 · CARREFOUR COQUELLES → **CARREFOUR COQUELLES** · NUCLI 174060

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0321467557 | **supprimé** | R5 |
| Téléphone (format) | 0321467555 | 03 21 46 75 55 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 43 · CARREFOUR BRUAY LA BUISSIERE → **CARREFOUR BRUAY LA BUISSIERE** · NUCLI 489047

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | BRUAY LA BUISSIERE CEDEX | BRUAY LA BUISSIERE | R11 |
| Téléphone (format) | 0321017100 | 03 21 01 71 00 | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique CARREFOUR | R10 |
| Photo (taille) | (2352, 2352) | (400, 400) (9950 o) | R9 |

### 44 · CULTURA VENETTE → **CULTURA VENETTE** · NUCLI 225169

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | AISNE | OISE | R4 |
| Email (type) | cse.compiegne@cultura.fr — HOME | WORK | R7 |
| Interlocuteur | Vanessa [_$!<Assistant>!$_] | Vanessa [Libraire] | R8 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |

### 45 · AUCHAN NOYELLES GODAULT → **AUCHAN NOYELLES GODAULT** · NUCLI 467373

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 03 21 69 83 96 | **supprimé** | R5 |
| Téléphone (format) | 0321698350 | 03 21 69 83 50 | R6 |
| Téléphone (format) | +33664752665 | 06 64 75 26 65 | R6 |
| Téléphone (type) | 06 64 75 26 65 — aucun | CELL | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique AUCHAN | R10 |
| Photo (taille) | (1440, 1440) | (400, 400) (13114 o) | R9 |

### 46 · CARREFOUR MONTIGNY LES C → **CARREFOUR MONTIGNY LES CORMEILLES** · NUCLI 454769

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | MONTIGNY LES C;CARREFOUR;;; | MONTIGNY LES CORMEILLES;CARREFOUR;;; | R2 · R3 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Fax | 01 39 97 63 47 | **supprimé** | R5 |
| Téléphone (type) | 01 39 31 96 30 — CELL | WORK | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 47 · AUCHAN SOISY SOUS M. → **AUCHAN SOISY SOUS MONTMORENCY** · NUCLI 152819

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | SOISY SOUS M.;AUCHAN;;; | SOISY SOUS MONTMORENCY;AUCHAN;;; | R2 · R3 |
| Département | SOMME | VAL D'OISE | R4 |
| Fax | 01 30 38 28 25 | **supprimé** | R5 |
| Téléphone (type) | 01 39 34 91 82 — aucun | WORK | R6 |
| Numéro préféré | 01 30 38 28 25 | 01 39 34 91 82 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 48 · AUCHAN LONGUENESSE → **AUCHAN LONGUENESSE** · NUCLI 465930

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0321982625 | **supprimé** | R5 |
| Téléphone (format) | 0321389672 | 03 21 38 96 72 | R6 |
| Numéro préféré | 03 21 98 26 25 | 03 21 38 96 72 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 49 · CARREFOUR L'ISLE ADAM → **CARREFOUR L'ISLE ADAM** · NUCLI 451880

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | L'Isle-Adam | L'ISLE ADAM | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Fax | 01 34 69 59 35 | **supprimé** | R5 |
| Numéro préféré | 01 34 69 59 35 | 01 34 08 47 79 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 50 · LIB. DELAMAIN → **LIB. DELAMAIN PARIS** · NUCLI 100149

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | DELAMAIN;LIB.;;; | PARIS;LIB. DELAMAIN;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Email (type) | j.camus@librairie-delamain.com — HOME | WORK | R7 |
| Interlocuteur | MR François DEFEVRE [_$!<Manager>!$_] | François DEFEVRE [Responsable Librairie] | R8 |
| Photo (taille) | (560, 560) | (400, 400) (36059 o) | R9 |

### 51 · HYPER LECLERC FRANCONVILLE LA G. → **LECLERC HYPER FRANCONVILLE** · NUCLI 445544

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | FRANCONVILLE LA G.;HYPER LECLERC;;; | FRANCONVILLE;LECLERC HYPER;;; | R2 · R3 |
| Société | ;LIBRAIRIE | LECLERC;LIBRAIRIE | R3 · §3 |
| Ville (adresse) | Franconville | FRANCONVILLE | R11 |
| Département | AISNE | VAL D'OISE | R4 |
| Fax | 01 30 72 98 35 | **supprimé** | R5 |
| Numéro préféré | 01 30 72 98 35 | 01 30 72 62 62 | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique LECLERC HYPER | R10 |
| Photo (taille) | (2372, 2372) | (400, 400) (18681 o) | R9 |

### 52 · HYPER LECLERC OSNY → **LECLERC HYPER OSNY** · NUCLI 017616

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | OSNY;HYPER LECLERC;;; | OSNY;LECLERC HYPER;;; | R2 · R3 |
| Société | ;LIBRAIRIE | LECLERC;LIBRAIRIE | R3 · §3 |
| Département | AISNE | VAL D'OISE | R4 |
| Fax | 01 30 30 35 23 | **supprimé** | R5 |
| Numéro préféré | 01 30 30 35 23 | 01 30 30 12 26 | R6 |
| Interlocuteur | BLANDINE DA SILVA [_$!<Manager>!$_] | Blandine DA SILVA [Responsable Librairie] | R8 |
| Photo (taille) | (2400, 2400) | (400, 400) (18681 o) | R9 |

### 53 · CULTURA BEAUVAIS → **CULTURA BEAUVAIS** · NUCLI 575514

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Beauvais | BEAUVAIS | R11 |
| Département | (vide) | OISE | R4 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |

### 54 · AUCHAN TAVERNY → **AUCHAN TAVERNY** · NUCLI 484550

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | SOMME | VAL D'OISE | R4 |
| Fax | 01 39 60 30 06 | **supprimé** | R5 |
| Téléphone (type) | 01 34 18 90 00 — aucun | WORK | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 55 · LIB. CROCOLIVRE → **LIB. CROCOLIVRE ENGHIEN LES BAINS** · NUCLI 110510

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CROCOLIVRE;LIB.;;; | ENGHIEN LES BAINS;LIB. CROCOLIVRE;;; | R2 · R3 |
| Ville (adresse) | Enghien-les-Bains | ENGHIEN LES BAINS | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Téléphone (format) | +33661497594 | 06 61 49 75 94 | R6 |
| Téléphone (type) | 06 61 49 75 94 — aucun | CELL | R6 |
| Email (type) | crocolivre@gmail.com — HOME | WORK | R7 |
| Photo (taille) | (1000, 1000) | (400, 400) (11607 o) | R9 |

### 56 · CULTURA ST MAXIMIN → **CULTURA SAINT MAXIMIN** · NUCLI 227488

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST MAXIMIN;CULTURA;;; | SAINT MAXIMIN;CULTURA;;; | R2 · R3 |
| Ville (adresse) | ST MAXIMIN | SAINT MAXIMIN | R11 |
| Département | AISNE | OISE | R4 |
| Interlocuteur | MR NICOLAS CALVARIN [_$!<Manager>!$_] | Nicolas CALVARIN [Responsable Librairie] | R8 |
| Photo (logo) | logo propre à la fiche | logo canonique CULTURA | R10 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |

### 57 · AUCHAN SARCELLES → **AUCHAN SARCELLES** · NUCLI 019158

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | SOMME | VAL D'OISE | R4 |
| Fax | 0177654340 | **supprimé** | R5 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 58 · FNAC COMPIEGNE → **FNAC COMPIEGNE** · NUCLI 091298

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Compiègne | COMPIEGNE | R11 |
| Département | AISNE | OISE | R4 |
| Photo (logo) | logo propre à la fiche | logo canonique FNAC | R10 |
| Photo (taille) | (338, 336) | (336, 336) (28248 o) | R9 |

### 59 · AUCHAN NOGENT/OISE → **AUCHAN NOGENT SUR OISE** · NUCLI 152801

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | NOGENT/OISE;AUCHAN;;; | NOGENT SUR OISE;AUCHAN;;; | R2 · R3 |
| Fax | 0344668401 | **supprimé** | R5 |
| Téléphone (format) | 0344668426 | 03 44 66 84 26 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 60 · HYPER LECLERC FOSSES → **LECLERC HYPER LA CHAPELLE EN SERVAL** · NUCLI 454785

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ;HYPER LECLERC FOSSES;;; | LA CHAPELLE EN SERVAL;LECLERC HYPER;;; | R2 · R3 |
| Société | LECLERC;LIBRAIRIE | LECLERC FOSSES;LIBRAIRIE | R3 · §3 |
| Ville (adresse) | La Chapelle en Serval | LA CHAPELLE EN SERVAL | R11 |
| Département | AISNE | OISE | R4 |
| Fax | 01 34 68 23 22 | **supprimé** | R5 |
| Numéro préféré | 01 34 68 23 22 | 01 34 31 96 00 | R6 |
| Interlocuteur | Laurence hermant [CR] | Laurence HERMANT [Responsable Librairie] | R8 |
| Photo (taille) | (2400, 2400) | (400, 400) (18681 o) | R9 |

### 61 · AUCHAN OSNY → **AUCHAN OSNY** · NUCLI 484618

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | SOMME | VAL D'OISE | R4 |
| Fax | 01 30 38 28 25 | **supprimé** | R5 |
| Téléphone (type) | 01 34 35 12 11 — aucun | WORK | R6 |
| Numéro préféré | 01 30 38 28 25 | 01 34 35 12 11 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 62 · CARREFOUR ST MARTIN AU LAERT → **CARREFOUR SAINT MARTIN AU LAERT** · NUCLI 167973

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ST MARTIN AU LAERT;CARREFOUR;;; | SAINT MARTIN AU LAERT;CARREFOUR;;; | R2 · R3 |
| Ville (adresse) | ST MARTIN AU LAERT | SAINT MARTIN AU LAERT | R11 |
| Fax | 0321887948 | **supprimé** | R5 |
| Téléphone (format) | 0321887900 | 03 21 88 79 00 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 63 · CARREFOUR AMIENS → **CARREFOUR AMIENS** · NUCLI 173633

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Téléphone (format) | 0322662570 | 03 22 66 25 70 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 64 · FNAC AMIENS → **FNAC AMIENS** · NUCLI 099069

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | AISNE | SOMME | R4 |
| Photo (taille) | (336, 336) | (336, 336) (28248 o) | R9 |

### 65 · FURET DU NORD LENS → **FURET DU NORD LENS** · NUCLI 247353

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Lens | LENS | R11 |
| Département | (vide) | PAS DE CALAIS | R4 |
| Adresse | HOME | WORK | R12 |
| Email (type) | alebriez@furet.com — HOME | WORK | R7 |
| Photo (taille) | (2400, 2402) | (400, 400) (18082 o) | R9 |

### 66 · FNAC HERBLAY → **FNAC HERBLAY** · NUCLI 095414

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | (vide) | VAL D'OISE | R4 |
| Email (type) | resp.editorial.herblay@fnac.com — HOME | WORK | R7 |
| Interlocuteur | MME SOPHIE OLIVE [_$!<Assistant>!$_] | Sophie OLIVE [Libraire] | R8 |
| Photo (logo) | logo propre à la fiche | logo canonique FNAC | R10 |
| Photo (taille) | (338, 336) | (336, 336) (28248 o) | R9 |

### 67 · LIB. ICI → **LIB. ICI PARIS** · NUCLI 110916

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ICI;LIB.;;; | PARIS;LIB. ICI;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Téléphone (format) | +33616460699 | 06 16 46 06 99 | R6 |
| Téléphone (type) | 01 85 01 67 30 — HOME | WORK | R6 |
| Téléphone (type) | 06 16 46 06 99 — aucun | CELL | R6 |
| Email (type) | armande.bourgault@icilibrairie.fr — HOME | WORK | R7 |
| Photo (taille) | (334, 334) | (334, 334) (24600 o) | R9 |

### 68 · FURET DU NORD ARRAS → **FURET DU NORD ARRAS** · NUCLI 247247

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Arras | ARRAS | R11 |
| Email (type) | furetarras@furet.com — HOME | WORK | R7 |
| Photo (taille) | (2400, 2402) | (400, 400) (18082 o) | R9 |

### 69 · AUCHAN AMIENS DURY → **AUCHAN DURY** · NUCLI 491902

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | AMIENS DURY;AUCHAN;;; | DURY;AUCHAN;;; | R2 · R3 |
| Société | AUCHAN     R101;BAZAR | AUCHAN AMIENS DURY;BAZAR | R3 · §3 |
| Ville (adresse) | Dury | DURY | R11 |
| Fax | 0322895910 | **supprimé** | R5 |
| Téléphone (format) | 0322335300 | 03 22 33 53 00 | R6 |
| Numéro préféré | 03 22 89 59 10 | 03 22 33 53 36 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 70 · LIB. VOYAGEURS MONDE → **LIB. VOYAGEURS MONDE PARIS** · NUCLI 112615

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | VOYAGEURS MONDE;LIB.;;; | PARIS;LIB. VOYAGEURS MONDE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Email (type) | croulleau@voyageursdumonde.fr — HOME | WORK | R7 |
| Interlocuteur | Lisa Fiquet [_$!<Manager>!$_] | Lisa FIQUET [Responsable Librairie] | R8 |
| Photo (taille) | (380, 380) | (380, 380) (18058 o) | R9 |

### 71 · CARREFOUR BERCK S MER → **CARREFOUR BERCK SUR MER** · NUCLI 155192

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | BERCK S MER;CARREFOUR;;; | BERCK SUR MER;CARREFOUR;;; | R2 · R3 |
| Ville (adresse) | BERCK S MER | BERCK SUR MER | R11 |
| Fax | 0321890505 | **supprimé** | R5 |
| Téléphone (format) | 0321890500 | 03 21 89 05 00 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 72 · AUCHAN CERGY PONTOISE CEDEX → **AUCHAN CERGY PONTOISE** · NUCLI 466755

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CERGY PONTOISE CEDEX;AUCHAN;;; | CERGY PONTOISE;AUCHAN;;; | R2 · R3 |
| Département | SOMME | VAL D'OISE | R4 |
| Adresse | ;;;;SOMME;; | (supprimée) | R12 |
| Fax | 01 34 35 51 36 | **supprimé** | R5 |
| Téléphone (type) | 01 34 35 51 01 — aucun | WORK | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 73 · AUCHAN ARRAS → **AUCHAN ARRAS** · NUCLI 481028

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | ARRAS CEDEX | ARRAS | R11 |
| Fax | 0321519878 | **supprimé** | R5 |
| Téléphone (format) | 0321519563 | 03 21 51 95 63 | R6 |
| Numéro préféré | 03 21 51 98 78 | 03 21 51 95 63 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 74 · LIB GOURMANDE PARIS → **LIB. GOURMANDE PARIS** · NUCLI 226993

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | GOURMANDE PARIS;LIB;;; | PARIS;LIB. GOURMANDE;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Téléphone (type) | 06 20 82 52 65 — HOME | CELL | R6 |
| Interlocuteur | Mme Déborah DUPONT DAGUET [_$!<Manager>!$_] | Déborah DUPONT DAGUET [Responsable Librairie] | R8 |
| Photo (taille) | (316, 316) | (316, 316) (45851 o) | R9 |

### 75 · LIB. L'ACACIA → **LIB. L'ACACIA PARIS** · NUCLI 107193

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | L'ACACIA;LIB.;;; | PARIS;LIB. L'ACACIA;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Interlocuteur | MR JEAN PAUL VECCHIOLI [_$!<Manager>!$_] | Jean Paul VECCHIOLI [Responsable Librairie] | R8 |
| Photo (taille) | (322, 322) | (322, 322) (36045 o) | R9 |

### 76 · AUCHAN MERS LES BAINS → **AUCHAN MERS LES BAINS** · NUCLI 465609

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0235507204 | **supprimé** | R5 |
| Téléphone (format) | 0235505709 | 02 35 50 57 09 | R6 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 77 · LIB. MARTELLE → **LIB. MARTELLE AMIENS** · NUCLI 294728

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | MARTELLE;LIB.;;; | AMIENS;LIB. MARTELLE;;; | R2 · R3 |
| Ville (adresse) | AMIENS CEDEX 1 | AMIENS | R11 |
| Fax | 03 22 92 89 33 | **supprimé** | R5 |
| Email (type) | anne.martelle@librairiemartelle.com — HOME | WORK | R7 |
| Interlocuteur | Mme ANNE MARTELLE [_$!<Manager>!$_] | Anne MARTELLE [Responsable Librairie] | R8 |
| Photo (taille) | (184, 182) | (184, 182) (18107 o) | R9 |

### 78 · LIB. LES TRAVERSEES → **LIB. LES TRAVERSEES PARIS** · NUCLI 236414

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | LES TRAVERSEES;LIB.;;; | PARIS;LIB. LES TRAVERSEES;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | PAS DE CALAIS | PARIS | R4 |
| Interlocuteur | Monsieur FRON Antoine [_$!<Manager>!$_] | Antoine FRON [Responsable Librairie] | R8 |
| Interlocuteur | Mathilde [_$!<Assistant>!$_] | Mathilde [Libraire] | R8 |
| Interlocuteur | Ludovic [_$!<Assistant>!$_] | Ludovic [Libraire] | R8 |
| Photo (taille) | (360, 360) | (360, 360) (20249 o) | R9 |

### 79 · ESP CUL LECLERC MOISSELLES → **LECLERC ESP. CULTUREL MOISSELLES** · NUCLI 453423

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | MOISSELLES;ESP CUL LECLERC;;; | MOISSELLES;LECLERC ESP. CULTUREL;;; | R2 · R3 |
| Ville (adresse) | Moisselles | MOISSELLES | R11 |
| Département | PAS DE CALAIS | VAL D'OISE | R4 |
| Email (type) | rayon.librairie@moisselles.leclerc — HOME | WORK | R7 |
| Interlocuteur | Mme Isabelle POILBOIS [_$!<Manager>!$_] | Isabelle POILBOIS [Responsable Librairie] | R8 |
| Photo (taille) | (696, 696) | (400, 400) (11478 o) | R9 |

### 80 · LIB. BHV → **LIB. BHV PARIS** · NUCLI 108423

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | ;LIB. BHV;;; | PARIS;LIB. BHV;;; | R2 · R3 |
| Ville (adresse) | Paris | PARIS | R11 |
| Département | (vide) | PARIS | R4 |
| Téléphone (format) | 0142749634 | 01 42 74 96 34 | R6 |
| Téléphone (format) | +33 6 66 32 95 22 | 06 66 32 95 22 | R6 |
| Interlocuteur | Mr Pascal Pannetier [_$!<Manager>!$_] | Pascal PANNETIER [Responsable Librairie] | R8 |
| Photo (taille) | (600, 600) | (400, 400) (7573 o) | R9 |

### 81 · CARREFOUR VENDIN LE VIEIL → **CARREFOUR VENDIN LE VIEIL** · NUCLI 489245

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Téléphone (format) | 0321087683 | 03 21 08 76 83 | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique CARREFOUR | R10 |
| Photo (taille) | (2352, 2352) | (400, 400) (9950 o) | R9 |

### 82 · AUCHAN MERU → **AUCHAN MERU** · NUCLI 420836

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Département | 060 | OISE | R4 |
| Fax | 0344225446 | **supprimé** | R5 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 83 · CULTURA FOUQUIERES → **CULTURA FOUQUIERES LES BETHUNE** · NUCLI 111328

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | FOUQUIERES;CULTURA;;; | FOUQUIERES LES BETHUNE;CULTURA;;; | R2 · R3 |
| Ville (adresse) | Fouquiéres les Bethune | FOUQUIERES LES BETHUNE | R11 |
| Département | (vide) | PAS DE CALAIS | R4 |
| Téléphone (type) | 03 66 13 01 20 — CELL | WORK | R6 |
| Email (type) | culturabethune.livres@gmail.com — HOME | WORK | R7 |
| Photo (logo) | logo propre à la fiche | logo canonique CULTURA | R10 |
| Photo (taille) | (812, 812) | (400, 400) (10701 o) | R9 |

### 84 · CARREFOUR LIEVIN → **CARREFOUR LIEVIN** · NUCLI 044172

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | LIEVIN CEDEX | LIEVIN | R11 |
| Fax | 0321447601 | **supprimé** | R5 |
| Téléphone (format) | 0321443333 | 03 21 44 33 33 | R6 |
| Numéro préféré | 03 21 44 76 01 | 03 21 44 33 33 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 85 · FURET DU NORD COQUELLES → **FURET DU NORD COQUELLES** · NUCLI 241213

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Coquelles | COQUELLES | R11 |
| Département | (vide) | PAS DE CALAIS | R4 |
| Photo (taille) | (2400, 2402) | (400, 400) (18082 o) | R9 |

### 86 · ESP CUL LECLERC CHAMBLY → **LECLERC ESP. CULTUREL CHAMBLY** · NUCLI 458281

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CHAMBLY;ESP CUL LECLERC;;; | CHAMBLY;LECLERC ESP. CULTUREL;;; | R2 · R3 |
| Département | PAS DE CALAIS | OISE | R4 |
| Fax | 01 30 28 93 01 | **supprimé** | R5 |
| Téléphone (format) | 0134708000 | 01 34 70 80 00 | R6 |
| Téléphone (type) | 01 34 70 80 00 — aucun | WORK | R6 |
| Numéro préféré | 01 30 28 93 01 | 01 30 28 93 00 | R6 |
| Photo (logo) | logo propre à la fiche | logo canonique LECLERC ESP. CULTUREL | R10 |
| Photo (taille) | (696, 696) | (400, 400) (11478 o) | R9 |

### 87 · CARREFOUR VENETTE → **CARREFOUR VENETTE** · NUCLI 471631

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Ville (adresse) | Venette | VENETTE | R11 |
| Fax | 0344903553 | **supprimé** | R5 |
| Numéro préféré | 03 44 90 35 53 | 03 44 90 52 79 | R6 |
| Photo (taille) | (696, 696) | (400, 400) (9950 o) | R9 |

### 88 · AUCHAN BEAUVAIS → **AUCHAN BEAUVAIS** · NUCLI 446062

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0344028555 | **supprimé** | R5 |
| Téléphone (format) | 0344124275 | 03 44 12 42 75 | R6 |
| Email (type) | delbreton@auchan.fr — HOME | WORK | R7 |
| Interlocuteur | AURELIE SINAYEN [cr] | Aurelie SINAYEN [Responsable Librairie] | R8 |
| Interlocuteur | DELPHINE [vendeuse] | Delphine [Libraire] | R8 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 89 · AUCHAN CALAIS → **AUCHAN CALAIS** · NUCLI 421602

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Fax | 0321968150 | **supprimé** | R5 |
| Téléphone (format) | 0321469268 | 03 21 46 92 68 | R6 |
| Téléphone (type) | 03 21 46 92 68 — aucun | WORK | R6 |
| Numéro préféré | 03 21 96 81 50 | 03 21 46 92 68 | R6 |
| Interlocuteur | CHRISTOPHE [vendeur] | Christophe [Libraire] | R8 |
| Photo (taille) | (720, 720) | (400, 400) (13114 o) | R9 |

### 90 · CULTURA CERGY → **CULTURA CERGY PONTOISE** · NUCLI 116947

| Champ | Avant | Après | Règle |
|---|---|---|---|
| Nom / Prénom | CERGY;CULTURA;;; | CERGY PONTOISE;CULTURA;;; | R2 · R3 |
| Ville (adresse) | Cergy-Pontoise | CERGY PONTOISE | R11 |
| Département | (vide) | VAL D'OISE | R4 |
| Adresse | ;;;;AISNE;;France | (supprimée) | R12 |
| Adresse | HOME | WORK | R12 |
| Interlocuteur | Vanessa [_$!<Assistant>!$_] | Vanessa [Libraire] | R8 |
| Photo (logo) | (aucune image) | logo canonique CULTURA | R10 |
| Photo (taille) | (800, 800) | (400, 400) (10701 o) | R9 |
