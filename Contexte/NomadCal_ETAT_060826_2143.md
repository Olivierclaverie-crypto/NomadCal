# ÉTAT DU PROJET NOMADCAL
*Document VIVANT — l'établi : SEULEMENT le chantier actif, les vérifs ouvertes, la reprise. Règle de VIDANGE : chantier scellé → migre au JOURNAL le jour même, l'État ne garde qu'une ligne de renvoi. Cible : ~1 page. Dernière MAJ : 06-08-26 (**R5 : phase papier SCELLÉE** — carte validée en relecture, D13–D15 + A1 gravés · doctrine annuaire v2 + vcf 90 fiches livrés · lot T compressé en renvoi, son détail vit au Journal + Roadmap).*

---

## 🔨 CHANTIER ACTIF — LOT R5 (phase papier scellée, brief INVESTIGUER à rédiger)
*Carte d'architecture cible **relue et validée par le capitaine** (06-08) : `NomadCal_R5_CARTE_060826_*.md` (Projet + `Contexte/`). **15 décisions D1–D15 + amendement A1** — registre en annexe de la carte, récit complet → Journal.*
- **Acquis de la relecture** : **D13** — le lot K se **dissout** (moitié donnée → Neon/annuaire, moitié interface → brainstorm EventForm) · **D14** — le prospect est une fiche ordinaire, sources élargies aux fichiers plats, clause d'ouverture « étude marché prospection » · **D15** — la fiche se **tend** (vCard au partage système, identité nue sans IdC) · **A1** — outils de preuve sous clé.
- **Décidé ≠ prouvé** : le cousin n'est pas intervenu. La carte liste **14 questions INVESTIGUER** (lecture seule).
- **Séquence de scellement restante** : ③ bloc **Journal** (récit des jalons D1–D15 + leçons de session) → suppression GitHub des 2 fichiers DECISIONS (⚠️ **les garder sur `Contexte/` jusque-là**) → ④ **brief INVESTIGUER** cousin (cloud confortable, non obligatoire : lecture seule).

## 📇 ANNUAIRE NOMADSUITE — RÉÉCRITURE LIVRÉE (06-08, adjacent au lot H)
- **Doctrine v2** consolidée (`NomadSuite_DOCTRINE_ANNUAIRE_060826_*.md`, Projet + `Contexte/`) : 12 règles + décompte d'application, P4 clos, P7 ajouté.
- **`NomadSuite_ANNUAIRE_CLIENTS_060826_0011.vcf`** : 90 fiches réécrites, invariants vérifiés (NUCLI 90/90, emails, numéros intacts). **Import iPhone = geste capitaine, statut non tracé ici.**
- Rapport avant/après + listes saisie terrain (P2 : 36 sans email · P3 : 53 sans interlocuteur · 32 cumulent) → **GitHub `Contexte/` uniquement**.
- **NUCLI 90/90 déjà parfaits ⇒ H2 (Cowork Nom/Prénom→NUCLI) ne dépendait pas de la réécriture.**

## 🧾 DETTES TRACÉES
*File d'attente complète et détaillée → **ROADMAP § FILE D'ATTENTE** (familles 1a/1b, TZID exotique, brèche VALARM, clause morte, repli `:105`, note all-day lot E, dettes antérieures).* Rien de neuf depuis le 04-08.

## ⚠️ VIGILANCES OUVERTES
- **⭐ Le jour de fin d'une période n'a AUCUNE période courante** (observé 04-08) — or c'est le jour de compilation du rapport. → **brainstorm R4**.
- **Notes déjà mal rattachées** (post-#46) : le fix corrige l'avenir, pas le passé. Existence non instruite.
- **`TEST MINUIT` reste dans `ZZ-TEST-REC`** (Apple natif, récurrent hebdo). ⚠️ Ne jamais l'éditer depuis NomadCal. ⚠️ Il ne teste rien en famille 1a.
- **NomadCal ne peut pas CRÉER un event à cheval sur minuit** (`EventForm.jsx:236`) → **lot E**.
- **Fantôme iCal Juin–Juil** = cache Mac. À IGNORER. NE PAS supprimer depuis iCal.
- **Events de test à purger** : `Allday &` (`PRODID //NomadCal//FR`) — cosmétique.
- **Branches à supprimer via GitHub UI** : `claude/nomadcal-t-famille2` (#46, mergée) · `claude/nomadcal-cloud-c-bis-7wq1tx` (#41). ⚠️ Proxy cousin refuse `git push --delete` (403) → geste capitaine.
- **Bruit de déploiement** : chaque push de `Contexte/*.md` déclenche un déploiement Vercel. Sans conséquence.

## 🧠 BRAINSTORMS À OUVRIR (non décidés)
- **⭐ RÉORDONNER LA ROADMAP VERS NEON** — le plus structurant. La carte R5 le nourrit directement (le prérequis n°1 a avancé). Détail des deux lectures → ROADMAP § VUE D'ENSEMBLE.
- **Brainstorm EVENTFORM** (lot E + R2, **hérite de la moitié interface du lot K dissous** : champ client/annuaire) · **Brainstorm MÉTHODE** (03-08) · **Brainstorm R4** (dont la question du jour de fin) · **⭐ ÉTUDE MARCHÉ PROSPECTION** (D14 — session timonier + recherche web, **due avant tout engagement V2** sur les statuts d'annuaire).

## ✅ RENVOIS (scellé, détail au JOURNAL)
- **R5 phase papier SCELLÉE (06-08, carte + 15 décisions)** · **Lot T CLOS (04-08, #46 — 43 sites, zéro fautif en sacrée, fuseau Paris gravé)** · **Lot R1 CLOS (04-08, 4 PR)** · **Lot N + déménagement doc CLOS (03-08)** · **Charte Orchard SCELLÉE (30-07)** · **Chantier périodes NomadBook CLOS (19-07)** · **Récurrence** : bug A (#35/#36), bug B (#38), EventForm A1+UNTIL (#37).

## 💾 BACKUPS DE RÉFÉRENCE
- Export natif Settings 6 clés : 16/07 12:49 · 19/07 20:56 (11 notes) · backup corrigé restauré.
- **Annuaire** : export vcf d'origine (89 fiches) conservé intact + vcf réécrit du 06-08.
- ⚠️ Ne couvrent PAS `nb_periods_cache` ni les events (`cf_events` exclus).

## 🧭 REPRENDRE — RITUEL
1. **Olivier donne le carburant session.**
2. Claude lit **cet État + la ROADMAP** → résume → attend le go.
- **NE RIEN coder/merger sans go explicite d'Olivier.**
- **Sessions cousin = CLOUD** (icône branche ⎇) + test tuyau avant brief lourd. *(Un brief lecture seule n'en a pas besoin.)*
- **BRIEFS : un seul bloc, jamais imbriqué · cas de test fixé DANS le brief · brief autoportant** (→ Instructions).
- **⏱️ Repères de temps : « maintenant » / « à la reprise »**, jamais un repère d'horloge inventé.
- **▶️ REPRISE : R5 en cours.** Prochain geste : **③ bloc Journal** (récit jalons + leçons) puis **④ brief INVESTIGUER** (14 questions de la carte). Décision capitaine.
