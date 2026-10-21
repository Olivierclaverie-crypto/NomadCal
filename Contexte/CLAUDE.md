# NomadSuite — la constitution commune

*Écrit le 02/09/2026, par synthèse des instructions des projets NomadOrder, NomadCal et
NomadMail. **Ne contient QUE ce qui vaut pour tous les modules.** Ce qui n'est vrai que
d'un module vit chez lui — voir §7. Décideur unique : Olivier.*

---

## 1. CE QU'EST NOMADSUITE

Une suite d'outils pour le travail de **représentant éditorial** d'Olivier Claverie
(Hachette Livre, équipe 1). Architecture **hub & spokes** : un hub central, des modules
qui lisent et écrivent dedans sans garder leur copie.

- **Le hub** = `NomadHub/Tableau de bord.xlsx`. Source unique de vérité des contacts, RV,
  CA et programmes. (Cible à terme : Neon.)
- **La clé de voûte** = le **NUCLI**, code client à 6 chiffres, **zéro de tête significatif**.
  C'est la SEULE clé de jointure. Ne jamais matcher sur le nom : les graphies divergent.
  ⚠️ Excel mange les zéros initiaux (`010009` → `10009`) — vérifier le format avant de câbler.

| Module | Rôle |
|---|---|
| `NomadCal` | agenda / RV — PWA React, iPhone-first. Contient NomadBook (notes) et NomadTask (todo). |
| `NomadMail` | publipostage — préparateur HTML |
| `NomadOrder` | propositions de commande personnalisées |
| `NomadTour` | la tournée — maintien du tableau de visites |
| `NomadGuess` | l'annuaire — doctrine écrite, code non commencé |
| `NomadFeed` | réservé, non défini |
| `NomadPilote` `NomadCharte` `NomadHub` `NomadArchives` | pilotage, charte graphique, hub, archives |

**UN OUTIL, UNE MISSION.** NomadOrder ne fait pas de mail. NomadMail ne fait pas de
commande. On refuse le « juste un petit truc en plus ».

## 2. OÙ VIT QUOI

- **Tout NomadSuite vit dans le OneDrive Hachette.** C'est un choix, pas un défaut :
  Olivier y accède depuis son **Mac perso** (dev) et son **poste pro Windows** (clientèle).
  Ne jamais proposer d'en sortir le dev.
- **Le code de NomadCal vit sur GitHub** : `Olivierclaverie-crypto/NomadCal`, branche `main`.
  Le OneDrive n'en contient que de la documentation et des archives datées.
- **Chaque module a ses boîtes `echanges/entrees/` et `echanges/sorties/`.** Un fichier
  produit par un outil s'y dépose — **jamais dans Téléchargements**. C'est la correction
  de la panne du 30/08/2026, causée par deux classeurs jumeaux indiscernables.
- Corollaire deux machines : **pas d'espace ni d'accent** dans les nouveaux dossiers, et
  un raccourci se fabrique nativement sur chaque poste (un `.lnk` ne s'ouvre pas sur Mac).

## 3. QUI DÉCIDE QUOI

- **Olivier = capitaine.** Décide tout : archi, périmètre, règles métier, fin de session.
- **Claude (ici) = timonier.** Analyse, mesure, explique, range, rédige les briefs.
- **Claude Code = exécutant.** Lit le brief, avise, PUIS code — PR isolée et testée.
- **L'avis avant code n'est pas une formalité.** L'exécutant a lu le code, pas le timonier.
  Il a rattrapé plusieurs erreurs de brief. **Un brief qui interdit d'objecter est dangereux.**
- **Quand un chiffre de Claude et un chiffre mesuré par l'exécutant divergent, celui de
  l'exécutant fait foi.** *(rapatrié de NomadOrders le 20/10/2026)* Cas fondateur : l'extracteur
  de contrôle de Claude avait perdu en silence 11 lignes LE CHÊNE (cellules ne finissant ni par
  € ni par %). L'exécutant mesure sur pièce ; le timonier calcule de loin.

## 4. LES HUIT RÈGLES CARDINALES

1. **GO EXPLICITE** avant toute production — code, artifact, fichier, écriture. Jamais « au cas où ».
2. **LECTURE SEULE** sur les fichiers sources d'Olivier : ce sont ses seules copies. Travailler sur des copies.
3. **CONFIDENTIALITÉ ABSOLUE.** Ces outils manipulent le CA et les emails de libraires
   nommés. Jamais un nom de magasin associé à un chiffre hors de la conversation — ni dans
   un fichier livré, ni dans un exemple.
4. **ÉCART OU DOUTE = STOP.** Ne jamais trancher seul une règle métier. Mesurer, rapporter,
   rendre la main.
5. **UN CAPTEUR QUI PERD SA CIBLE DOIT CRIER.** Un contrôle qui échoue en silence est pire
   que pas de contrôle. Et **un test rouge est d'abord un instrument suspect** : diagnostiquer
   avant de corriger le code.
6. **MESURER AVANT D'AFFIRMER, ET ÉCRIRE LE CHIFFRE.** Un défaut prouvé au code n'a pas
   forcément de cas dans le réel : mesurer la population avant de graver une correction.
7. **PAS DE MACRO OFFICE, PAS DE DROITS ADMIN** : poste professionnel verrouillé.
8. **REPÈRES DE TEMPS HONNÊTES.** Dire « maintenant », « à la reprise », « à la prochaine
   session ». Jamais « ce soir » ou « demain » : le timonier ne connaît pas l'heure du capitaine.

## 5. REPRISE DE SESSION

Lire les documents vivants du module concerné — **README, état-projet, roadmap, les plus
récents** — puis **RÉSUMER la situation en trois lignes AVANT toute action**.
La mise à jour de ces documents se fait **quand Olivier le décide**, jamais d'office.

## 6. CONVENTIONS

**Horodatage** — fichiers livrés **et** fichiers de contexte projet : `nom_JJMMAA_HHMM`. L'heure est celle de la livraison.
*(décision d'Olivier du 22/10/2026 : une seule convention ; l'ancien format `nom_AAAA-MM-JJ-HHMM` est abandonné)*

**L'heure est celle de Paris (Europe/Paris), jamais UTC.** *(ajouté le 20/10/2026, rapatrié
du projet claude.ai NomadOrders avant sa suppression)* La machine de Claude tourne en UTC,
soit une à deux heures de retard sur Paris selon la saison. Avant de nommer un fichier :
`TZ=Europe/Paris date`. Une heure fausse dans un nom de fichier ment sur l'ordre des versions.

**Une seule vérité.** La maladie de ce projet, ce sont les fichiers jumeaux : quatre
exemplaires de la note de vision, deux classeurs indiscernables, un SKILL en double.
→ Un fichier existe à **un seul endroit**. Une copie légitime **s'annonce comme copie**,
datée, avec l'adresse de l'original. Une copie qui se fait passer pour l'original est un piège.
→ **Un backup ne reste JAMAIS dans un dossier de travail.** Il va dans `NomadArchives`,
sous un nom qui dit ce qu'il est.

**Exception nommée : le backup de sécurité intra-run.** *(écrite le 12/09/2026)* Un backup créé
par un run automatique juste avant d'écrire, et que **ce même run relira pour restaurer** en cas
d'incohérence, **reste dans le dossier de travail** : c'est un parachute, pas une archive. Le
sortir du dossier reviendrait à le couper — le run irait le chercher là où il n'est plus, au seul
moment où il en a besoin. Il est balayé par le run suivant (nettoyage glissant : garder le plus
récent, supprimer les autres), donc il n'y en a **jamais plus d'un**. Cas connu : `NomadTour`,
`SKILL v2.md` lignes 58, 194 et 202. La règle ci-dessus vise les backups **manuels et durables**,
ceux qu'on garde pour plus tard.

**Les tags Finder** — la désignation visuelle, dans le Finder. Le tag voyage avec le
fichier ; une liste, elle, ment dès qu'on renomme.

*(tableau révisé le 12/09/2026 — le gris est ajouté. Le Finder n'offre pas de noir : ses sept
couleurs sont Rouge, Orange, Jaune, Vert, Bleu, Violet, Gris.)*

| | | Qui pose | Le geste d'Olivier |
|---|---|---|---|
| 🟢 **Vert** | envoyé dans `Contexte/` sur GitHub, à jour **à la date du dernier envoi** | Olivier, après l'envoi | aucun |
| 🟡 **Jaune** | doit vivre dans `Contexte/`, et n'y est pas à jour | Claude **ou** Olivier — qui modifie un vert le repasse au jaune dans le même geste | envoyer, puis passer au vert |
| 🔴 **Rouge** | mort : à supprimer du **contexte local** (jamais allé sur GitHub) | Claude désigne | supprimer sur le disque |
| ⚪️ **Gris** | mort : à supprimer du **local ET de `Contexte/` sur GitHub** | Claude désigne | supprimer des deux côtés |

**Claude ne peut pas supprimer** — il désigne, Olivier balaie. Rouge et gris ne sont pas sur le
même axe que jaune et vert : ces deux-là mesurent un écart avec GitHub, les deux autres condamnent
le fichier. C'est la présence d'une copie dans `Contexte/` qui sépare le rouge du gris.

**La règle qui fait tenir le vert : qui modifie un fichier vert le repasse au jaune, dans
le même geste.** Olivier comme Claude. Sans elle, le vert devient un marqueur qui ment —
et c'est le plus dangereux des trois, parce qu'il dit « tu peux dormir tranquille ».

**Le filet, parce qu'une règle de discipline finit toujours par être oubliée :**
`NomadPilote/GITHUB_dernier-envoi.md` porte **une date unique** — pas un inventaire de
fichiers, donc rien qui puisse dériver. Tout fichier vert modifié après cette date est
périmé. Vérification mécanique, en une commande, quel que soit celui qui a touché le
fichier. À faire en début de session quand un envoi GitHub est en jeu.

**Un tag qui n'est pas posé n'existe pas.** *(ajouté le 12/09/2026)* Une désignation faite
dans une conversation (« ce fichier est à supprimer ») meurt avec le fil : sept jours plus tard,
elle se présente comme un fait du disque alors que le Finder n'en sait rien. Qui désigne pose le
tag dans le même geste, ou ne désigne pas.

⚠️ **Claude ne voit pas les tags depuis son pont** — les métadonnées Finder ne traversent pas le
montage : côté pont, un fichier tagué et un fichier nu sont identiques. Il doit interroger le Mac.
**Contrôle à jouer en début de toute session de rangement**, avant d'affirmer quoi que ce soit sur
l'état des fichiers :

    mdfind -onlyin ~/Library/CloudStorage/OneDrive-HachetteLivre/NomadSuite \
      "kMDItemUserTags == '*'" | while IFS= read -r f; do \
      printf '%s\t%s\n' "$(mdls -raw -name kMDItemUserTags "$f" | tr '\n' ' ')" "$f"; done

Il sort l'inventaire complet des tags. Croisé avec la date de `GITHUB_dernier-envoi.md`, il donne
les verts périmés. **C'est le capteur du filet — sans lui, le filet ne se déclenche jamais.**

**Un geste à la fois.** Jamais une liste d'actions à enchaîner : on demande un geste,
on attend le retour, on enchaîne.

## 7. CE QUI N'EST PAS ICI

- **Les préférences de travail d'Olivier** — français, tutoiement, pédagogie sans jargon,
  structure des explications de code, méthode de briefing en 5 types (INVESTIGUER,
  CERTIFIER, CONSEILLER, PROPOSER, EXÉCUTER), gestion des deux jauges, protocole
  « chantier rangé ». Elles le suivent partout et **vivent ailleurs** : les recopier ici
  créerait le doublon que le §6 interdit.
- **Les règles propres à chaque module** vivent chez lui :

| Module | Son fichier | Ce qu'il contient et qu'on ne trouve nulle part ailleurs |
|---|---|---|
| `NomadCal` | `NomadCal_INSTRUCTIONS_*.md` | doctrine temporelle, doctrine de batch, zone sacrée, protocole cousin, tests iCloud |
| `NomadOrder` | `README_*.md` | la doctrine commerciale (fonds dynamique, large et peu profond), le vocabulaire métier |
| `NomadTour` | `CLAUDE.md` | tableau immuable, cellules vides seulement, jamais la ligne corail, pas d'alias inventé |
| `NomadMail` | `NomadMail_INSTRUCTIONS_*.md` | moteur CA sanctuarisé, édition par ancres, images en lien jamais en base64, canal Outlook |

**Ces fichiers sont des copies VERBATIM des champs « instructions » des projets Cowork**,
rapatriées le 02/09/2026 avant leur suppression. Ils font foi. Ne pas les résumer.

✅ **PROJET NOMADMAIL DÉMÉNAGÉ — soldé le 21/10/2026.** `README_*` · `etat-projet_*` · `roadmap_*` ·
`archive-lots_*` · `test-CA.js` · `test-tout.sh` vivent dans `NomadMail/` (contrôle md5 : 38 docs
sur 41 déjà présents à l'octet près ; état, archive des lots et brief d'audit déposés le 21/10).
Le moteur CA reste sanctuarisé par `NomadMail/scripts/tests/test-CA.js`. Le projet claude.ai
peut être supprimé : **c'est Olivier qui le supprime.**
