# ROADMAP — NOMADCAL
*Moteur de PLANIFICATION : la source unique du « quoi, dans quel ordre, en combien de PR ». Organisée en LOTS BATCHÉS selon la doctrine de batch (→ Instructions) : batch autorisé hors zone sacrée, une variable à la fois STRICT près des sacrées. Chaque lot précise son risque, ses briefs, et si un BRAINSTORM est requis avant. L'ordre est une SUGGESTION — le capitaine réarbitre à chaque ouverture de lot. Dernière MAJ : 29-07-26.*

---

## 🧭 VUE D'ENSEMBLE (ordre suggéré)
**N → R1 → R2 → R3 → R4**, avec **R5 en filler** (carburant bas : c'est de la parole, pas du code).
Arbitrage ouvert : R3 (sélecteur d'étendue) peut passer avant R2 si le risque terrain « supprimer une occurrence efface la série » devient pressant.

| Lot | Contenu | Zone sacrée ? | Briefs | Brainstorm avant ? |
|---|---|---|---|---|
| **N** | Nettoyage manuel | Non (zéro code) | Aucun | Non |
| **R1** | Batch affichage (3 défauts de rendu) | Non | 1 INVESTIGUER groupé → 1 EXÉCUTER batché | Non |
| **R2** | Compositeur récurrence A2→A4 + COUNT | Non (`pushEvent` intacte) | CERTIFIER→PROPOSER puis EXÉCUTER (1–2 PR) | **Oui, court** (design UI) |
| **R3** | Sélecteur d'étendue + delete occurrence (EXDATE) | **OUI** | Protocole complet, PR isolée, JAMAIS batché | **Oui** (cadrage carburant) |
| **R4** | Fonction rapport NomadBook | Non (nouveau module) | INVESTIGUER→CONSEILLER puis EXÉCUTER par tranches | **Oui** (choix techniques) |
| **R5** | Modèle de données pré-Neon | Non (papier) | Aucun (brainstorm pur) | **C'EST** un brainstorm |

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
*DÉBLOQUÉ depuis le rangement des périodes (19-07). Cycle complet prouvé À LA MAIN (06-07) : rapport Juin–Juillet 2026 réellement envoyé, tout depuis l'iPhone.*

**En une phrase :** fin de période, NomadBook transforme les notes de terrain (texte + photos + dictée) en une **synthèse PDF envoyée au chef puis archivée**. Aujourd'hui simulé main ; à terme un bouton.

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
- Poser sur papier le modèle : events, notes, périodes, photos, NUCLI, users.
- Ligne produit actée : **les périodes = objets backend NC**, iCloud = fenêtre (idem Excel côté Suite).
- Trancher (papier) : source maître par champ (RV = NC roi ? CA = Excel roi ?), format NUCLI (zéros initiaux mangés par Excel — vérifier Contacts ↔ Excel AVANT tout pont).
- Alimente : Neon (~fin août) + écran de décision RV (→ VISION, GitHub).

---

## 📥 FILE D'ATTENTE (non lotis, à raccrocher quand un lot s'ouvre)
- Défauts synchro de fond : B1/B3/B4/γ · dette « deux `toISO` divergents » (`helpers.js:13` locale vs `caldav.js:211` UTC).
- **ETag/If-Match** : OBLIGATOIRE avant version desk (multi-device).
- Drag & drop · vues jour/mois/année · complétion Settings · cosmétique (FERMÉ jusqu'à V1).
- Sécurité : mot de passe d'app iCloud régénéré + reco faciale (14-07). OK.

## 🔭 APRÈS V1
- **V2** : frais + géolocalisation comme base de calcul.
- **V3** : IA (assistance, complexité invisible). Direction A (consommer l'IA) vs B (s'exposer en MCP) non tranchée.
- **NomadSuite** (hub & spokes : NomadCal · NomadGuess · NomadMail autour du hub Excel→Neon, écran de décision RV, NUCLI) → détail complet dans **VISION** (GitHub `Contexte/`).
