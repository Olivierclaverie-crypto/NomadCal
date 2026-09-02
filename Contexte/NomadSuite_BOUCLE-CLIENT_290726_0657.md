# NOTE DE VISION PARTAGÉE — LA BOUCLE CLIENT NOMADSUITE
*Note de passerelle : donne la vision commune aux chantiers NomadCal, NomadMail et Cowork (tâche MAJ Visites). À déposer dans le projet NomadMail et dans Cowork. Elle se suffit à elle-même — pas besoin du contexte NomadCal complet pour la lire. Rédigée le 29-07-26 (brainstorm roadmap, session 100 %). Décideur unique : Olivier.*

---

## 🎯 LE POINT D'ARRIVÉE (la fusion cible)

**Une seule saisie, partout à jour.** Deux sens, même boucle :

- **Sens 1 :** Olivier renseigne une **date/heure de RV ou de proposition de RV** dans le **Tableau de bord** (Excel) → l'event se crée **automatiquement dans NomadCal** → synchro iCloud/iCal → **NomadMail** dispose du RV pour le publipostage (4 cas typés : confirmé/proposition × sans/avec programmes).
- **Sens 2 (l'inverse) :** Olivier crée un event **« clients » dans NomadCal** → synchro iCal → le **Tableau de bord** se met à jour.
- **Conséquence visée :** la tâche Cowork « MAJ Visites » devient superflue — le pont fait automatiquement ce qu'elle simule aujourd'hui.

## 🗺️ LE SCHÉMA DE LA BOUCLE

```
        vcf « clients » (ex-« clients importants »)
        = base de renseignement contacts
                    │  (import champs)
                    ▼
   NomadCal ──── events « clients » ──── iCloud/iCal
        ▲                                    │
        │         LA FUSION CIBLE            ▼
   Tableau de bord ◄──────────────► Tableau visites
   (date RV / proposition)          (immuable, MAJ par
        │                           tâche Cowork aujourd'hui)
        ▼
   NomadMail (publipostage : 4 cas RV typés)
```

## 🔑 LA CLÉ DE VOÛTE : LE NUCLI

- **Le NUCLI (identifiant client unique) est la SEULE clé de jointure** entre toutes les sources. Les noms/prénoms n'en sont JAMAIS une : une graphie peut fluctuer, un identifiant non.
- **État du stock :** les NUCLI sont stockés **en mode texte** dans tous les tableaux Excel référents → les zéros initiaux sont préservés (le piège « Excel mange les zéros » est désamorcé côté tableaux). Reste à confirmer que Contacts iPhone les porte au même format.
- **Règle d'or (leçon apprise à la dure sur NomadCal) :** on ne matche jamais sur une forme qui peut fluctuer. La clé d'abord, le pont ensuite.

## 🧱 LES TROIS ÉTAGES DU CHANTIER (dans l'ordre)

**Étage 1 — Gestes immédiats, zéro code NomadCal (pilote : Olivier)**
1. **Renommage du vcf** « clients importants » → **« clients »** (geste Contacts pur).
2. **Correction Cowork : rapprochement Nom/Prénom → NUCLI.** C'est LE déverrouillage. Tant que Cowork matche sur le nom, chaque divergence de graphie casse une ligne. Passé au NUCLI, les graphies peuvent diverger sans rien casser — et l'harmonisation Nom/Prénom rétrograde de « urgence vitale » à « qualité NomadMail » (la formule d'appel du publipostage part telle quelle dans le mail du client : on la soigne, mais elle ne porte plus la jointure).

**Étage 2 — L'audit données (timonier NomadCal, lecture seule, format congés)**
- Croiser par NUCLI : **Tableau de bord × Tableau visites × vcf clients**.
- Sorties attendues : clients **non visités absents** du Tableau de bord (le portefeuille complet doit être dans le hub — « il n'y a pas de petits clients ») · **divergences Nom/Prénom** entre sources · **trous de NUCLI**.
- L'audit **définit** la liste des champs immuables vs mobiles (on ne la devine pas d'avance). Toute correction = liste À VALIDER par Olivier ligne par ligne, zéro écriture automatique.

**Étage 3 — Le pont automatique (post-Neon)**
- La création d'event depuis le Tableau de bord = **écriture** dans NomadCal → chantier lourd, protocole complet, et surtout : le pont temps réel n'a pas de support physique avant le hub **Neon** (backend prévu ~fin août). Un .xlsx n'est pas multi-accès temps réel.
- Rejoint la phase **desk** dans les chantiers post-pivot Neon.

## ⚠️ GARDE-FOUS (valables dans les trois projets)

- **Tableau visites = IMMUABLE** (historique). On y ajoute, on ne réécrit pas.
- **Nom/Prénom = données de production NomadMail** : toute harmonisation se fait avec prudence, avant/après visible, validation Olivier — jamais en masse aveugle.
- **Sens de référence par champ à trancher** (quelle source est reine pour Nom/Prénom ? instinct : le vcf, qui nourrit EventForm et le téléphone — décision Olivier à venir, éclairée par l'audit).
- **Aucune écriture automatisée sans décision explicite d'Olivier.** Les outils proposent, le capitaine dispose.

## 📍 OÙ ÇA VIT

- **Vision complète NomadSuite** (hub & spokes, écran de décision RV, NomadGuess) : `Contexte/NomadCal_VISION_NomadSuite_*.md` (GitHub NomadCal).
- **Planification NomadCal** (lots, jalons) : moteur ROADMAP du projet NomadCal.
- Cette note = l'extrait « boucle client » à l'usage de NomadMail et de Cowork.
