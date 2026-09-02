# 💡 BOÎTE À IDÉES — NomadSuite (vision V2/V3)
*Défriché en brainstorm le 19-07-26 (soir). NON priorisé, NON cadré, NON à coder. Vit sur GitHub `Contexte/` UNIQUEMENT (jamais dans la connaissance du Projet — on la ressort quand un chantier suite s'ouvre). Capitalisation de vision pour ne rien reperdre. Priorité actuelle du projet = calendrier V1 + fonction rapport (→ ROADMAP). Ceci vit APRÈS. Dernière MAJ : 29-07-26 (renommage/déménagement seulement, fond inchangé).*

---

## 🎯 L'ANGLE PRODUIT (le différenciateur)
**« Les ponts automatiques que les leaders ne font pas — ou font trop compliqués. »**
Les gros outils (CRM éditeurs, Salesforce) sont en silos : le CRM ne parle pas au calendrier, qui ne parle pas au mailing, qui ne parle pas aux notes terrain. Olivier vit la tournée comme UN SEUL FLUX. Le pont EST le produit.

## 🏗️ ARCHITECTURE CIBLE — hub & spokes
```
                 ┌──────────────────────┐
                 │   HUB CENTRAL         │
                 │  Excel (auj.) →       │
                 │  Neon (~fin août)     │   = source unique
                 │  contacts·RV·CA·DAN   │
                 └──────────┬───────────┘
           ┌────────────────┼────────────────┐
           ▼                ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ NomadGuess   │ │  NomadCal    │ │  NomadMail   │
   │ (répertoire) │ │ (agenda/RV)  │ │ (publipostage)│
   └──────────────┘ └──────────────┘ └──────────────┘
```
- **Le hub = source de vérité.** Chaque module lit/écrit dans le hub, ne garde pas sa copie.
- **Excel = hub prototype** (tant qu'UN SEUL outil écrit à la fois — un .xlsx n'est pas multi-accès temps réel).
- **Neon = hub réel** (interactif, bidirectionnel). Le vrai pont temps réel n'a pas de support physique AVANT Neon.
- ⚠️ Cohérent avec la ligne produit du 19/07 : les données NomadBook/périodes vivent DANS NC, pas en cadeau iCloud. Neon rend NC propriétaire ; iCloud/Excel deviennent des fenêtres.

## 🔑 LA CLÉ DE VOÛTE — le NUCLI
- Identifiant client unique (ex. `575514`), présent dans CHAQUE onglet de l'Excel.
- **Déjà mis en conformité Excel ↔ Contacts iPhone** (nettoyage fait récemment par Olivier). ✅
- C'est la clé de mariage client ↔ RV ↔ programmes/DAN. Sans lui, on matcherait sur le nom (formes divergentes = piège, cf. `rapport-2026-09-07` court vs href complet).
- ⚠️ **PIÈGE FORMAT À VÉRIFIER (terrain-first) :** Excel mange les zéros initiaux (`010009` → `10009`). Vérifier que Contacts iPhone et Excel portent le NUCLI au MÊME format avant de câbler le pont. La clé d'abord, le pont ensuite (leçon periodId du 19/07).

## 🧭 L'INSIGHT CENTRAL — ce n'est pas un pont d'écriture, c'est un TABLEAU DE DÉCISION
Le vrai besoin d'Olivier n'est pas « synchroniser 2 sources » — c'est **décider une date de RV en croisant des infos qui vivent dans les 2 sources**.
- Aujourd'hui : il fait ce croisement DANS SA TÊTE, en jonglant entre Livre de bord et NC. C'est ça, la douleur.
- **Hiérarchie de décision (donnée par Olivier) :**
  1. **CONTRAINTE PROGRAMME** → fixe la FENÊTRE (« voir ce client AVANT la DAN d'Astérix 15/09 »). Les formules orange (-10j) / rouge (-5j) du Livre de bord.
  2. **LOGIQUE DE TOURNÉE** → choisit le JOUR dans la fenêtre (« je suis déjà dans le secteur ce jour-là »).
  3. **PAS de tri par CA** → **« il n'y a pas de petits clients »** (valeur métier ferme). L'`Evolution/25` est un contexte affiché, jamais un critère de priorité.
- **Écran cible :** au moment de poser un RV, afficher côte à côte : (client + programmes à caser + DAN + CA-contexte) | (créneaux libres + congés + RV perso + réunions + secteur géo). La contrainte allume l'urgence, la tournée propose le jour, Olivier tranche. L'outil ne décide jamais à sa place.
- **Avantage technique :** un écran de décision LIT les 2 sources (facile) et n'ÉCRIT qu'une fois, au « OK » final. → évite le cauchemar du bidirectionnel temps réel avec conflits.

## 🧩 CE QUI EXISTE DÉJÀ (ne pas reconstruire)
- **NomadMail = le préparateur de publipostage HTML** (1,2 Mo, fonctionnel). Titre « Préparateur de publipostage — Représentant éditorial ». Fait déjà : bannière+objet, formule d'appel, corps, **import xlsx (choix onglet)**, **4 cas RV typés** (confirmé/proposition × sans/avec programmes), blocs argumentaire (titre/EAN/photos/boutons), paliers commerciaux, signature. Envoi via `mailto:` + export + presse-papier. → Premier spoke déjà branché sur le hub Excel.
- **Le hub Excel = « Tableau de bord.xlsx ».** Onglets par enseigne (`10_LibContact`, `13_CulturaContact`, `14_FnacContact`, `15_FuretContact`, Leclerc…) avec NUCLI, raison sociale, ville, CP, EMAIL, date RV, Evolution/25, civilité, prénom/nom. + listes d'alerte (`20_Liste_AlerteVente`, `21_Liste_News_BdC`, `23_Liste_CampagneLib`) + onglet « Livre de bord » (dates campagnes par mois/programme, DAN) + « Réglages » (formules orange/rouge).
- **NomadCal = agenda/RV.** EventForm importe déjà des données du **carnet de contacts iPhone** (nom, adresse, mail). PAS de fiche contact NC autonome.

## 🔨 CHANTIERS IDENTIFIÉS (non priorisés, une variable à la fois)
1. **NUCLI dans EventForm.** Refonte EventForm → ajouter un champ NUCLI, importé du carnet iPhone en même temps que l'adresse. Prérequis vérifié : NUCLI déjà présent dans Contacts (nettoyage fait). ⚠️ Vérifier le format (zéros initiaux) avant.
2. **Écran de décision RV** (le cœur). Croise Livre de bord (programmes/DAN) × NC (créneaux/congés/perso/secteur) via le NUCLI. Lit les 2, écrit au « OK ».
3. **Pont NC ↔ Livre de bord.** Bidirectionnel = objectif, mais chantier POST-Neon (support physique). Avant Neon : demi-pont (1 sens auto + 1 sens semi-manuel export/import). Question source de vérité par champ (RV = NC roi ? CA = Excel roi ?) à trancher — modèle « source maître par champ » recommandé.
4. **Géocoding / vérif adresses (module NomadGuess).** Un script (codé par le cousin) branché sur une API de géocoding — **API Adresse gouvernementale FR (gratuite, excellente pour adresses FR)** ou Google Maps Geocoding — qui lit l'export Contacts (vCard) + l'Excel, vérifie/corrige, ressort les corrections À VALIDER. ⚠️ Claude (timonier) n'a PAS accès au carnet iPhone — ne peut ni le lire ni y écrire. Ce module se CODE, ne se fait pas à la main par le timonier. Le timonier PEUT en revanche auditer l'Excel fourni (incohérences CP/ville, doublons, formats) et chercher une adresse ponctuelle sur le web.

## 🗺️ SÉQUENÇAGE SUGGÉRÉ (à réarbitrer — RIEN n'est décidé)
- **Pré-Neon, faisable tôt :** NUCLI dans EventForm (petit) · audit Excel adresses (timonier, immédiat) · demi-pont lecture. *(Le modèle de données papier = lot R5 de la Roadmap, filler.)*
- **Post-Neon (~fin août+) :** hub réel · pont bidirectionnel · écran de décision RV complet · module géocoding.
- **Toujours :** V1 calendrier + fonction rapport NomadBook restent prioritaires AVANT cette suite.

---
*Rangé dans la boîte à idées. À mûrir, pas à coder. On pioche quand un chantier s'ouvre — sans enflammer les connexions. 😄*
