# CHARTE GRAPHIQUE ORCHARD
*Document transverse : la loi visuelle commune à TOUS les projets Orchard (NomadCal, NomadMail, NomadGuess, documents, sites, PDF, PowerPoint, mails HTML…). Se suffit à elle-même. À déposer dans chaque projet concerné + GitHub `Contexte/`. Toute maquette, tout livrable, tout brief cousin touchant au visuel se réfère à CE fichier. Décisions arrêtées le 30-07-26 (brainstorm couleurs + typo, corail certifié au brut de NomadMail ; graisses corrigées au réel des fichiers : Phenomena n'a PAS de Medium). Décideur unique : Olivier.*

---

## 🎨 ESPRIT
**Sobre, pro, moderne.** Une palette resserrée de **9 couleurs — pas une de plus** : les crèmes portent, les olives structurent, le corail accentue (rare et précieux), les encres racontent. La modernité vient de la retenue : gradation sans couleur intermédiaire, accent unique, typographie condensée qui signe.

## 🎨 LA PALETTE (9 couleurs, tokens nommés)

| Token | Nom | Hex | Rôle |
|---|---|---|---|
| `--creme-page` | Crème page | `#FDF8F0` | Fond de page, fond général, texte sur olive profond |
| `--olive-voile` | Olive voile | `#F1EFDE` | Fond de bloc/chapitre, grilles, pastilles d'état calme |
| `--olive-dore` | Olive doré | `#B5AE79` | Bordures, éléments inactifs, désactivé, séparateurs marqués |
| `--olive-orchard` | Olive Orchard | `#7D7742` | Titres de rubrique, focus, états intermédiaires, liens/actions discrètes |
| `--olive-profond` | Olive profond | `#4A4526` | Grands titres, fonds de boutons primaires, en-têtes, barres de navigation |
| `--corail-orchard` | Corail Orchard | `#E78067` | ACCENT : chiffres, texte sur bouton primaire, onglet actif, badges pleins |
| `--corail-profond` | Corail profond | `#A8492F` | Texte d'alerte/erreur, urgences en petit texte, chiffres critiques en petit |
| `--encre` | Encre | `#2B2A25` | Texte courant (encre chaude, débleuie, assortie aux crèmes) |
| `--encre-douce` | Encre douce | `#6B675C` | Texte secondaire, légendes, métadonnées |

**Origine certifiée :** corail `#E78067` = extrait au pixel de NomadMail (mesure 30-07-26). Crème page `#FDF8F0` = fond historique NomadCal/NomadMail, confirmé au même brut.

**Il n'y a PAS de :** bleu (débarqué le 30-07), corail voile (fond corail pâle interdit), couleur ambre/orange intermédiaire (choix assumé, voir gradation).

## 📐 RÈGLES D'USAGE DES COULEURS

### Hiérarchie des fonds
- **Page** = crème page. **Blocs/chapitres/grilles** = olive voile. C'est TOUTE la hiérarchie des fonds — deux niveaux suffisent.
- **Le corail ne s'utilise JAMAIS en fond doux/pâle.** Un accent voilé n'accentue plus rien. Le corail est plein ou il n'est pas.
- Grands aplats sombres (en-têtes de document, barres de navigation) = olive profond, texte crème page.

### Boutons — 4 niveaux, zéro couleur nouvelle
| Niveau | Fond | Texte | Bordure |
|---|---|---|---|
| **Primaire (signature Orchard)** | olive profond | **corail Orchard** | — |
| Secondaire | transparent | olive profond | olive doré 0.5px |
| Discret | transparent | olive Orchard | — |
| Désactivé | olive voile | olive doré | — |
- ⚠️ **Garde-fou contraste (mesuré WCAG)** : le duo signature olive profond/corail Orchard = **3,54:1** → autorisé UNIQUEMENT en **Bold (700)** et ≥ 13px. Jamais de corail profond sur olive profond (1,69:1 — illisible, mesuré et rejeté le 30-07).
- Un seul bouton primaire par vue. La signature frappe parce qu'elle est seule.

### Navigation
- Barre = olive profond · onglet **actif = corail Orchard** · inactifs = olive doré · titre = crème page.
- Badge compteur / notification = corail Orchard **plein** (texte `#4A1B0E` ou encre) — c'est le territoire réservé du « petit critique ».

### Formulaires
- Champ au repos : fond blanc/crème, bordure olive doré pâle 0.5px.
- **Focus : bordure olive Orchard 1.5px.**
- **Erreur / alerte : texte et bordure corail profond.** Le corail profond est LA couleur du texte d'alerte, partout.

### États & gradation (fenêtres DAN, statuts…)
**Gradation olive → corail, SANS intermédiaire ambre — la touche moderne :**
1. Calme / posé / validé → olive profond sur olive voile.
2. Intermédiaire / fenêtre orange → **olive Orchard** (gras).
3. Critique / fenêtre rouge / urgent → **corail profond** (texte) ; la ligne critique peut prendre un fond `#FDF4EF` très léger (teinte de rang, pas un fond corail).
- Registre courant de l'urgence = la retenue (texte corail profond, souligné corail) ; le corail plein = frappe unique (badge, pastille isolée).

### Chiffres (rapports, NomadMail, tableaux de bord)
- **Négatifs / baisses = corail Orchard** (l'usage NomadMail historique, conservé tel quel).
- **Positifs / hausses = olive profond.**
- En petit corps (<14px), les chiffres critiques passent en corail profond (lisibilité).

## ✒️ TYPOGRAPHIE

### Les deux voix
- **Phenomena (Fontfabric, gratuite) = la voix qui titre.** Territoire : grands titres, sous-titres, chiffres, boutons, badges, en-têtes, **et les petits libellés de signalétique** (états, métadonnées courtes type « DAN 28/09 · Fenêtre orange »).
- **Police système = la voix qui raconte.** Territoire : les **paragraphes uniquement** — corps de texte, texte courant des rapports, contenus longs. (La système ne parle que dans les paragraphes ; tout le reste est Phenomena.)
- Le contraste entre les deux polices crée la hiérarchie : on distingue titre et contenu d'un coup d'œil, sans artifice.

### Graisses Phenomena — 3 seulement (au réel des fichiers : pas de Medium dans la famille)
| Graisse | Usage |
|---|---|
| **Bold 700** | Grands titres, chiffres, boutons signature |
| **Regular 400** | Sous-titres, badges, petits libellés, boutons secondaires |
| **Light 300** | Très grands formats affiche uniquement |

### Règle du petit (plein soleil iPhone)
- **En dessous de 14px : Phenomena en Regular (400) minimum + letter-spacing +0,3px — JAMAIS Light.** Si la lisibilité terrain l'exige (plein soleil), monter en Bold.
- **Plancher absolu : 12px.** Rien en dessous, aucune exception.
- Phenomena n'a **pas d'italique** : l'emphase se fait par la graisse ou la couleur, jamais par un italique simulé.

### Fallbacks par support
| Support | Titres/chiffres | Corps |
|---|---|---|
| Web / PWA / mail HTML | `Phenomena, 'Barlow Condensed', -apple-system, sans-serif` | `-apple-system, 'Segoe UI', sans-serif` |
| PDF (génération) | Phenomena embarquée (licence gratuite OK) | Police système embarquée ou Helvetica/Arial |
| PowerPoint | Phenomena installée ; sinon **Barlow Condensed**, sinon Arial Narrow | Aptos / Calibri |
- ⚠️ Mail HTML : Phenomena ne sera PAS installée chez le destinataire → le fallback Barlow Condensed/system est la règle réelle ; concevoir les mails pour qu'ils restent beaux en fallback.

## 🖼️ ICÔNES — RÈGLE UNIFIÉE
*(Unifie les pratiques divergentes : NomadCal stroke 1.5 vs NomadMail stroke 2 — désormais une règle par TAILLE, pas par projet.)*
- **Style : outline uniquement, jamais de fill.** Grille de dessin 48×48.
- **Stroke par taille de rendu :** rendu ≤ 32px → **stroke 2** (lisibilité) · rendu > 32px → **stroke 1.5** (finesse).
- **Couleurs :** sur fond clair (crèmes) → olive profond · sur fond olive profond → crème page · accent ponctuel → corail Orchard. *(L'ancien duo bleu `#2B5A9E` + or `#F5C97A` des icônes NomadCal est OBSOLÈTE — migration au fil des retouches, pas de big-bang.)*
- Coins arrondis (`stroke-linecap="round"`, `stroke-linejoin="round"`), registre « instrument gravé » : sobre, précis, pas d'illustration.

## 📄 APPLICATION PAR SUPPORT

### Surfaces (tous supports)
- Cartes : fond blanc ou crème page, bordure 0.5px olive doré pâle (`#E0D9C4` toléré comme mélange crème/doré), rayon **12px**. Petits éléments (champs, boutons) : rayon 8px. Pastilles : 999px.
- Pas d'ombres portées décoratives, pas de dégradés : l'esprit Orchard est plat et net.

### Documents HTML / sites
- Fond page crème, sections en olive voile, un seul accent corail visible par écran autant que possible.

### PDF (rapports NomadBook…)
- En-tête : bandeau olive profond, titre Phenomena Bold crème, sous-titre olive doré.
- Rubriques : titre Phenomena Regular olive Orchard (peut être en capitales + letter-spacing), corps en police système encre, blocs sur olive voile.
- Chiffres : Phenomena Bold, corail (négatif) / olive profond (positif).

### PowerPoint
- Master : fond crème page · titres Phenomena Bold olive profond · slide de section : fond olive profond, titre crème, ponctuation corail.
- Un chiffre-clé par slide en très grand corail = la signature Orchard en présentation.

### Mails (NomadMail)
- Bannière olive profond, chiffres corail (l'existant NomadMail est déjà conforme sur le corail), boutons = signature Orchard, penser fallback typo.

## 🧭 GARDE-FOUS (résumé exécutoire)
1. **9 couleurs, pas une de plus.** Toute nouvelle teinte = décision Olivier + MAJ de cette charte.
2. **Corail = rare.** Jamais en fond pâle, un seul accent fort par vue.
3. **Contraste mesuré avant gravé** : tout nouveau duo texte/fond se mesure (seuils 4,5:1 texte normal, 3:1 gros gras). Le duo signature 3,54:1 = gras ≥13px obligatoire.
4. **Gradation sans intermédiaire** : olive → corail. Pas d'ambre.
5. **Phenomena ne raconte pas, la système ne titre pas.**
6. **Plancher 12px partout, Regular+espacement sous 14px, jamais Light en petit.**
7. Cette charte prime sur les habitudes de chaque projet ; les écarts existants (icônes bleu/or NomadCal) migrent au fil de l'eau, sans big-bang.
