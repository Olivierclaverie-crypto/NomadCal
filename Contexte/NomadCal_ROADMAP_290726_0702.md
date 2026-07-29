# ROADMAP — NOMADCAL
*Moteur de PLANIFICATION : la source unique du « quoi, dans quel ordre, en combien de PR ». Organisée en LOTS BATCHÉS selon la doctrine de batch (→ Instructions) : batch autorisé hors zone sacrée, une variable à la fois STRICT près des sacrées. Chaque lot précise son risque, ses briefs, et si un BRAINSTORM est requis avant. L'ordre est une SUGGESTION — le capitaine réarbitre à chaque ouverture de lot. Dernière MAJ : 29-07-26 (brainstorm jalons : desk post-Neon, lots H données hub + K NUCLI, jalons J1→J4).*

---

## 🧭 VUE D'ENSEMBLE (ordre suggéré)
**N → R1 → R2 → R3 → R4**, avec **R5 et H en fillers** (carburant bas : c'est de la parole/des données, pas du code), **K juste avant Neon**, puis **pivot Neon → phase DESK**.
Arbitrage ouvert : R3 (sélecteur d'étendue) peut passer avant R2 si le risque terrain « supprimer une occurrence efface la série » devient pressant.

| Lot | Contenu | Zone sacrée ? | Briefs | Brainstorm avant ? |
|---|---|---|---|---|
| **N** | Nettoyage manuel | Non (zéro code) | Aucun | Non |
| **R1** | Batch affichage (3 défauts de rendu) | Non | 1 INVESTIGUER groupé → 1 EXÉCUTER batché | Non |
| **R2** | Compositeur récurrence A2→A4 + COUNT | Non (`pushEvent` intacte) | CERTIFIER→PROPOSER puis EXÉCUTER (1–2 PR) | **Oui, court** (design UI) |
| **R3** | Sélecteur d'étendue + delete occurrence (EXDATE) | **OUI** | Protocole complet, PR isolée, JAMAIS batché | **Oui** (cadrage carburant) |
| **R4** | Fonction rapport NomadBook | Non (nouveau module) | INVESTIGUER→CONSEILLER puis EXÉCUTER par tranches | **Oui** (choix techniques) |
| **R5** | Modèle de données pré-Neon (intègre NUCLI) | Non (papier) | Aucun (brainstorm pur) | **C'EST** un brainstorm |
| **H** | Chantier données hub (vcf, Cowork→NUCLI, audit) | Non (zéro code NomadCal) | Audit timonier lecture seule | Non (cadré 29-07, note Boucle) |
| **K** | NUCLI dans EventForm | À déterminer (X-prop ICS ?) | INVESTIGUER puis EXÉCUTER | Non (INVESTIGUER tranche) |

## 📅 JALONS (décision capitaine 29-07-26)
- **J1 — Début août (avant congés)** : rapport manuel #2 (= certification-terrain R4 → suppression du vieux fichier FONCTION_RAPPORT) + lot **N**.
- **J2 — Congés (longues sessions)** : **R1** → **R2** → **R5 + H en fillers** (soirs carburant bas) · **R3** si carburant devant soi.
- **J3 — Fin août/septembre** : lot **K** (NUCLI, dernier geste pré-pivot) → **NEON** (le pivot — R5 l'aura préparé) · R3 si pas déjà fait.
- **J4 — Automne (post-Neon)** : phase **DESK** (D2→D3→D4) · pont automatique Tableau de bord ↔ NomadCal (étage 3 de la Boucle).
- **DÉCISION GRAVÉE : desk = POST-Neon.** Un desk pré-Neon = deux bacs localStorage isolés qui divergent + code jetable (contraire à « minimum de code V1 »). Seul étage anticipable : **ETag/If-Match** (protège déjà le mono-device, ex. deux onglets).

---

## LOT N — NETTOYAGE (manuel capitaine, zéro code)
- Supprimer les notes de test : « Test B » + « TEST C1 – à supprimer ».
- Nettoyage events de test + γ dans `ZZ-TEST-REC`.
- EYROLLES (23/07, 2 UID) : constater/purger au brut d'abord (doctrine fantômes).
- Fantôme iCal Juin–Juil : IGNORER (se purge côté Apple).

## LOT R1 — BATCH AFFICHAGE (pur rendu, réversible, zéro sacrée)
*Trois défauts de même famille (rendu), batchables en 1 PR après une investigation groupée.*
1. **Bug C — event à cheval sur minuit** : rendu sans clip par jour (`App.jsx:643-644` @ certification 7d7763a). Témoin : event 23:00 J → 01:00 J+1. ⚠️ Le brief INVESTIGUER existant (corrigé) est à ÉLARGIR aux 2 autres items, pas à réécrire.
2. **Refresh d'affichage auto après modif** : la grille affiche en retard, OK après refresh manuel. Données saines (prouvé au brut #35) — pur affichage.
3. **Rendu périodes all-day sur 2 jours** (NomadBook) : `DTEND=endISO+1` = pattern all-day standard CORRECT ; si défaut, c'est au RENDU.
- **Chaîne :** 1 INVESTIGUER groupé (3 items, `file:line` ancrés au HEAD du jour) → arbitrage capitaine → 1 EXÉCUTER batché. Si un item s'avère toucher une sacrée → il sort du batch.

## LOT R2 — COMPOSITEUR RÉCURRENCE (objectif FERME sortie publique)
*A1 (intervalle libre) déjà en prod (#37). Restent : **A2** multi-jours hebdo · **A3** positionnel mensuel · **A4** jours du mois par numéro · **COUNT**. Modèle = compositeur Apple 2 étages.*
- **Batchable** : tout vit dans `composeRRule` / `parseRRuleToUI` / UI EventForm — `rrule` reste une string, `pushEvent` inchangée (déjà prouvé au #37). Cible : **1–2 PR** au lieu de 4 (ex. PR₁ = A2+A3+A4, PR₂ = COUNT + finitions), à trancher après brainstorm.
- **Brainstorm AVANT (court, une soirée)** : design UI du compositeur 2 étages (quels étages, quelles roues, comment COUNT cohabite avec UNTIL — Apple les rend exclusifs).
- **Rappels format (acquis #37)** : UNTIL = fin de journée locale → UTC + `Z` (`…215959Z`), DST-safe via `getTime()` · `INTERVAL=1` jamais écrit · positionnels déjà LISIBLES (parsing inchangé), il s'agit de les rendre COMPOSABLES.

## LOT R3 — SÉLECTEUR D'ÉTENDUE + DELETE D'OCCURRENCE (LOURD — zone sacrée)
*Ferme le risque : « supprimer une occurrence efface la série » (href hérité). GROS chantier ÉCRITURE.*
- **Contenu** : sélecteur d'étendue (cette occurrence / à partir de / toute la série) + delete d'occurrence via `EXDATE` + split de série + édition master.
- **Protocole COMPLET** : brainstorm de cadrage avec carburant → INVESTIGUER → CONSEILLER (stratégie EXDATE vs split) → décision capitaine → EXÉCUTER en PR isolée(s), une variable à la fois. **JAMAIS batché.**
- **Rappels** : EXDATE en date LOCALE (jamais `.toISOString().slice(0,10)`) · mécanique attendue voisine du GET-modify-PUT (#35) · fonction voisine plutôt que branche dans une sacrée · tests dans `ZZ-TEST-REC`, cas créés en Apple natif.

## LOT R4 — FONCTION RAPPORT NOMADBOOK (absorbe l'ancien fichier FONCTION_RAPPORT)
*DÉBLOQUÉ depuis le rangement des périodes (19-07). Cycle complet prouvé À LA MAIN (06-07) : rapport Juin–Juillet 2026 réellement envoyé, tout depuis l'iPhone. **Simulation #2 prévue début août** (période estivale clôturée tôt par le capitaine — congés) = certification-terrain de ce lot.*

**En une phrase :** fin de période, NomadBook transforme les notes de terrain (texte + photos + dictée) en une **synthèse PDF envoyée au chef puis archivée**. Aujourd'hui simulé main ; à terme un bouton.

**Acquis de cadrage (29-07)** : la date de fin de période (slug `rapport-<fin>.ics`) = identité TECHNIQUE ; le moment de génération = geste LIBRE du capitaine (clôture anticipée pour congés, etc.). **Le futur bouton ne sera jamais esclave de la date.**

**Squelette stable du rapport (5 rubriques)** : CLIENT · MARCHÉ · CONCURRENCE · ALERTES · OUTILS. Une photo peut s'intégrer dans une rubrique (testé : Murdle Junior dans CONCURRENCE).

**Les 6 specs prouvées (à implémenter) :**
1. Les notes portent des **photos** → le rapport les tire via `getPhotoURL` (IndexedDB, `photoStore.js` — vrais binaires, le `blob:` n'est que l'URL d'affichage). *Socle existant.*
2. **Format conteneur PDF** (texte + image dans un seul document ; un bloc texte pur ne peut pas contenir d'image). *Prouvé main.*
3. **Archivage 12 mois, accès par lien par user** → le PDF léger est le bon véhicule.
4. **Nommage auto-classant** (tri chrono) + **taille photo réglable** en mise en page.
5. **Purge des notes APRÈS envoi CONFIRMÉ** (jamais avant), archive = filet anti-perte. Ordre du geste : valider/envoyer → PUIS purger. Aujourd'hui purge MANUELLE.
6. **Icône « état vide »** : SVG maison `icons/` (strokeWidth 1.5, bleu `#2B5A9E` + or `#F5C97A`). *Cosmétique — fermé jusqu'à finition V1.*

**Méthode (à ne pas re-découvrir)** : le rapport manuel = simulation du futur bouton, reproductible chaque période en attendant · le PDF généré côté Claude vit en espace temporaire → la copie qui compte = celle qu'Olivier télécharge/envoie.

- **Brainstorm AVANT** : choix techniques — lib de génération PDF côté client, mécanique d'archivage/lien 12 mois (pré-Neon vs post-Neon ?), automatisation de la purge (et son garde-fou). Puis chaîne INVESTIGUER→CONSEILLER → décision → EXÉCUTER **par tranches** (génération PDF d'abord, envoi ensuite, archivage/purge enfin).

## LOT R5 — MODÈLE DE DONNÉES PRÉ-NEON (brainstorm pur, filler)
*Zéro code. À faire TÔT et par petits bouts (carburant bas) : évite de recoder en septembre.*
- Poser sur papier le modèle : events, notes, périodes, photos, **NUCLI**, users.
- Ligne produit actée : **les périodes = objets backend NC**, iCloud = fenêtre (idem Excel côté Suite).
- Trancher (papier) : source maître par champ (RV = NC roi ? CA = Excel roi ? Nom/Prénom = vcf roi ? — éclairé par l'audit du lot H), format NUCLI (mode texte confirmé côté tableaux ; vérifier Contacts iPhone au même format).
- Alimente : Neon (~fin août) + écran de décision RV (→ VISION, GitHub) + pont Boucle (→ note Boucle).

## LOT H — CHANTIER DONNÉES HUB (zéro code NomadCal, filler congés)
*Étages 1+2 de la Boucle client (→ note `NomadSuite_NOTE_VISION_BOUCLE_*`, déposée dans NomadMail + Cowork). Prépare le hub AVANT Neon : « il n'y a pas de petits clients », le portefeuille complet doit être dans le Tableau de bord.*
- **H1 (Olivier, geste Contacts)** : renommage vcf « clients importants » → **« clients »**.
- **H2 (Olivier, côté Cowork)** : correction de la tâche MAJ Visites — rapprochement **Nom/Prénom → NUCLI**. LE déverrouillage : la jointure ne casse plus sur les graphies ; l'harmonisation Nom/Prénom rétrograde en « qualité NomadMail ».
- **H3 (timonier, lecture seule)** : **audit croisé par NUCLI** — Tableau de bord × Tableau visites × vcf clients. Sorties : clients non visités absents du Tableau de bord · divergences Nom/Prénom · trous de NUCLI. L'audit DÉFINIT la liste immuables/mobiles. Toute correction = liste à valider par Olivier ligne par ligne, zéro écriture auto.
- **Garde-fous** : Tableau visites = IMMUABLE (on ajoute, on ne réécrit pas) · Nom/Prénom = données de production NomadMail (prudence, avant/après visible).
- **Ordre interne :** H2 avant H3 (auditer sur des jointures fiables).

## LOT K — NUCLI DANS EVENTFORM (calé JUSTE AVANT Neon — décision 29-07)
*La clé de la fusion NomadMail/NomadGuess entre dans NomadCal. Attend son heure : juste avant le pivot Neon, pour que le hub naisse avec des events déjà clés.*
- **Contenu** : champ NUCLI dans EventForm, importé du carnet Contacts en même temps que nom/adresse/mail.
- **Question technique à trancher par INVESTIGUER** : où vit le NUCLI d'un event ? localStorage seul = perdu au round-trip iCloud. Pour survivre : propriété custom dans l'ICS (ex. `X-NOMADCAL-NUCLI`) → la sérialisation est le territoire de `pushEvent` → peut-être trivial, peut-être voisinage de sacrée. **L'INVESTIGUER décide du protocole (batché ou PR isolée).**
- **Prérequis** : format NUCLI confirmé Contacts ↔ tableaux (lot H) · modèle de données R5 posé.

---

## 🖥️ PHASE DESK (POST-NEON — décision gravée 29-07-26)
*Pas un lot : une PHASE à 4 étages, qui s'ouvre après le pivot Neon.*
| Étage | Contenu | Dépendance |
|---|---|---|
| **D1** | Données partagées entre appareils (fin des bacs localStorage isolés) | **= Neon** (structurel, aucun contournement propre) |
| **D2** | **ETag/If-Match** sur les écritures (write-write race iPhone↔desk) | ⚠️ Territoire `pushEvent` = zone sacrée, PR isolée, protocole complet. **Anticipable avant desk** (protège déjà le mono-device : deux onglets). |
| **D3** | UI grand écran (grille semaine sur 27", souris/clavier, densité) | Pur rendu, batchable, aucun prérequis technique |
| **D4** | Auth multi-device (login/clé posé proprement par appareil) | S'appuie sur Neon (comptes) |
- **Ordre suggéré : D2 → D3 → D4** (D1 = Neon lui-même). Le pont automatique Tableau de bord ↔ NomadCal (étage 3 de la Boucle) rejoint cette phase.

---

## 📥 FILE D'ATTENTE (non lotis, à raccrocher quand un lot s'ouvre)
- Défauts synchro de fond : B1/B3/B4/γ · dette « deux `toISO` divergents » (`helpers.js:13` locale vs `caldav.js:211` UTC).
- Drag & drop · vues jour/mois/année · complétion Settings · cosmétique (FERMÉ jusqu'à V1).
- Sécurité : mot de passe d'app iCloud régénéré + reco faciale (14-07). OK.

## 🔭 APRÈS V1
- **V2** : frais + géolocalisation comme base de calcul.
- **V3** : IA (assistance, complexité invisible). Direction A (consommer l'IA) vs B (s'exposer en MCP) non tranchée.
- **NomadSuite** (hub & spokes : NomadCal · NomadGuess · NomadMail autour du hub Excel→Neon, écran de décision RV, NUCLI) → détail complet dans **VISION** (GitHub `Contexte/`) + **note Boucle client** (`NomadSuite_NOTE_VISION_BOUCLE_*`, partagée NomadMail + Cowork).
