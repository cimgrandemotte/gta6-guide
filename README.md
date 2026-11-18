# GTA VI — The Ultimate Guide

> Guide fan **non officiel** de *Grand Theft Auto VI*. Site statique en français (anglais secondaire), esthétique Vice City néon cinématographique.
> *Unofficial fan guide. French first, English secondary. Not affiliated with Rockstar Games or Take-Two Interactive.*

**Dernière vérification des faits : 18 novembre 2026.** Date de sortie annoncée par Rockstar : **19 novembre 2026** (PS5, Xbox Series X|S).

---

## Sommaire

- [Ce que contient le site](#ce-que-contient-le-site)
- [Structure du projet](#structure-du-projet)
- [Lancer le site en local](#lancer-le-site-en-local)
- [Régénérer les fichiers générés](#régénérer-les-fichiers-générés)
- [Politique de sources](#politique-de-sources)
- [Accessibilité, SEO, performance](#accessibilité-seo-performance)
- [Tests et contrôle qualité](#tests-et-contrôle-qualité)
- [Mettre à jour après la sortie](#mettre-à-jour-après-la-sortie)
- [Limites connues](#limites-connues)
- [Déploiement](#déploiement)
- [Crédits, images et audio](#crédits-images-et-audio)
- [Avertissement légal](#avertissement-légal)

---

## Ce que contient le site

| Zone | Contenu |
|---|---|
| **Accueil** | Compte à rebours calendaire, bandeau d’actualités, personnages, carte, conseils, recherche rapide |
| **Histoire** | Présentation de l’intrigue telle qu’annoncée par Rockstar |
| **Personnages** | Jason Duval, Lucia Caminos et le reste du casting officiel |
| **Carte & régions** | Les six régions officielles et une carte conceptuelle interactive |
| **Armes** | Ce que Rockstar montre officiellement, modèles rapportés, listes à ignorer |
| **Véhicules** | Véhicules nommés officiellement (boutique et éditions) |
| **Gameplay** | Commandes, recherche policière, profil criminel (signalés par la presse, à vérifier) |
| **Guide** | Conseils de démarrage et **checklist personnelle** de lancement |
| **Online** | État de l’information sur le multijoueur (aucun mode annoncé au lancement) |
| **Collectibles** | Collectibles signalés, non confirmés par Rockstar |
| **Secrets** | Observations relevées dans les vidéos officielles ; rumeurs clairement marquées |
| **Éditions** | Standard, Ultime, bonus de précommande, Classic Car Collection |
| **Musique** | Six stations de radio, album et partition officiels |
| **Actualités** | Chronologie datée (septembre à novembre 2026), officiel ou presse |
| **Quiz** | 11 questions, correction et source pour chaque réponse |

### Interactions

- **Recherche globale** : bouton « Rechercher » dans l’en-tête, raccourci `/` ou Ctrl+K.
- **Filtres par niveau de confiance** : Officiel, Presse, Communauté, Rumeur.
- **Carte interactive** (page Carte) : repères des régions, recherche, filtres région et niveau, liste de tous les lieux.
- **Checklist persistante** (page Guide) : enregistrée dans le navigateur, export et import JSON, réinitialisation.

Aucune donnée personnelle n’est collectée. La checklist reste dans le `localStorage` du navigateur de l’utilisateur.

---

## Structure du projet

```
gta6-ultimate-guide/
├── index.html                  Accueil
├── 404.html                    Page introuvable
├── pages/
│   ├── histoire/index.html
│   ├── personnages/index.html
│   ├── carte/index.html        Carte interactive
│   ├── armes/index.html
│   ├── vehicules/index.html
│   ├── gameplay/index.html
│   ├── guide/index.html        Checklist de lancement
│   ├── online/index.html
│   ├── collectibles/index.html
│   ├── secrets/index.html
│   ├── editions/index.html
│   ├── soundtrack/index.html
│   ├── news/index.html
│   └── quiz/index.html
├── assets/
│   ├── css/                    design_system, components, animations, responsive, home, pages, interactions
│   ├── js/                     site (entrée), search, filters, atlas, checklist, main, components, animations
│   ├── data/                   atlas.json (repères de la carte), search-index.json (index de recherche)
│   ├── images/                 38 images JPG (générées par IA et images de référence sourcées)
│   └── audio/                  1 fichier MP3 synthétique (ambiance de l’accueil)
├── scripts/
│   ├── build_search_index.py   Génère assets/data/search-index.json
│   ├── build_seo.py            Canonique, sitemap.xml, robots.txt
│   └── generate_placeholder_audio.py
├── research_data.json          Sources et notes de vérification par étape
├── workflow_master.yaml        Étapes du projet (S0 à S7)
├── sitemap.xml, robots.txt, .nojekyll
├── package.json                Script `npm run dev`
└── DEPLOIEMENT.md              Guide de publication
```

Tous les liens sont **relatifs** : le site fonctionne depuis un sous-dossier, un domaine racine ou un hébergement statique sans configuration.

---

## Lancer le site en local

Prérequis : Python 3 (aucune dépendance) et, optionnellement, Node.js pour `npm run dev`.

```bash
cd gta6-ultimate-guide
npm run dev
# ou directement :
python3 -m http.server 8080 --bind 0.0.0.0
```

Ouvrez ensuite <http://localhost:8080>.

**Important :** la recherche globale et la carte chargent des fichiers JSON. Elles ne fonctionnent pas en ouvrant `index.html` directement depuis le système de fichiers (`file://`), car le navigateur bloque ces requêtes. Utilisez toujours un petit serveur HTTP, comme ci-dessus.

---

## Régénérer les fichiers générés

Trois fichiers sont produits par des scripts. Relancez-les après toute modification de titre, de description ou de domaine.

| Commande | Effet |
|---|---|
| `npm run build:index` | Met à jour `assets/data/search-index.json` |
| `npm run build:seo -- https://votre-domaine.fr/` | Ajoute les canoniques, génère `sitemap.xml` et `robots.txt` |
| `npm run build` | Met à jour l’index de recherche. Le SEO se lance séparément, car il demande votre domaine |
| `python3 scripts/check_media.py` | Vérifie qu’aucune image n’est dupliquée ni orpheline, et qu’aucun PNG, SVG, WebP ou GIF n’est présent |

Sans Node.js, lancez directement :

```bash
python3 scripts/build_search_index.py
python3 scripts/build_seo.py https://votre-domaine.fr/
```

---

## Politique de sources

Chaque fait du site est classé dans l’un des niveaux suivants. Le niveau est affiché par une étiquette colorée :

- **Officiel** : publié par Rockstar Games (site, Newswire, boutique) ou confirmé par l’éditeur.
- **Presse** : article de médias reconnus. Les informations de presse sont datées.
- **Communauté** : contenu de fans, forums, Reddit, YouTube. Jamais utilisé seul pour un fait.
- **Rumeur** : fuite, spéculation ou information non vérifiée. Affichée uniquement pour être démentie ou contextualisée.

Règles appliquées :
- Aucun total d’armes, de véhicules, de collectibles ou de missions n’est repris sans source officielle.
- Les scores d’agrégateurs (Metacritic, OpenCritic) varient selon l’heure ; ils sont présentés comme des valeurs à vérifier.
- Les démentis (par exemple la fausse lettre annonçant un report en 2027) sont indiqués comme tels.
- Les sources consultées pour chaque étape sont listées dans `research_data.json`.

---

## Accessibilité, SEO, performance

- **Accessibilité** : navigation au clavier, liens d’évitement, contrastes vérifiés (axe-core, 0 violation sur les 15 pages), textes alternatifs sur toutes les images, `prefers-reduced-motion` respecté, boîtes de dialogue natives.
- **SEO** : titres et descriptions uniques, Open Graph, balise canonique, `sitemap.xml`, `robots.txt`, données structurées (`VideoGame`) sur l’accueil.
- **Performance** : aucune dépendance JavaScript externe ; images JPG et audio MP3 optimisés ; `loading="lazy"` sur les images hors écran.
- **Responsive** : testé à 375, 768, 1024 et 1280 px, sans débordement horizontal.

---

## Tests et contrôle qualité

Le projet n’utilise pas de framework de test. Les vérifications suivantes ont été faites :

1. **Liens et ressources** : aucun lien interne ou ancre cassé.
2. **axe-core** (Chromium) : 0 violation sur les 15 pages.
3. **Navigateur** : recherche, filtres, carte, persistance de la checklist, export, import et réinitialisation.
4. **Syntaxe** : `node --check` sur chaque fichier JavaScript, `json.load` sur les fichiers JSON.

Pour refaire un contrôle rapide des liens, ouvrez la console du navigateur sur chaque page ou utilisez un outil comme `linkchecker` sur l’adresse locale.

---

## Mettre à jour après la sortie

Le 19 novembre 2026, plusieurs pages passeront de « à confirmer » à « confirmé » ou « démenti ». Procédure conseillée :

1. Vérifier chaque information sur une source officielle (Newswire, site Rockstar, support) avant de modifier une page.
2. Mettre à jour la page concernée et son étiquette de niveau.
3. Ajouter la date de vérification et la source dans `research_data.json`.
4. Relancer `python3 scripts/build_search_index.py` si un titre a changé.
5. Vérifier les liens et l’accessibilité (voir ci-dessus).

Les listes de collectibles, de missions et de secrets doivent rester vides ou marquées « non confirmé » tant que Rockstar ou un test vérifié ne les documente pas.

---

## Limites connues

- Le site ne contient pas de carte officielle du jeu. La carte interactive utilise une **image conceptuelle générée par IA** ; les positions sont indicatives.
- La carte officielle imprimable de Leonida est annoncée pour le 19 novembre 2026. Elle n’est pas encore intégrée car elle n’est pas encore publiée.
- Le mode en ligne n’est pas annoncé au lancement ; la page Online le signale.
- La checklist est locale au navigateur : pas de compte, pas de synchronisation entre appareils (l’export JSON permet de transférer la progression).
- Les conseils sur l’affichage (VRR, interpolation, mode performance) sont des avis communautaires et ne figurent pas dans le site.

---

## Déploiement

Le guide complet, avec GitHub Pages, Netlify, Cloudflare Pages, un serveur Nginx et le domaine personnalisé, se trouve dans **[DEPLOIEMENT.md](DEPLOIEMENT.md)**.

En résumé : publiez le contenu du dossier tel quel sur un hébergement statique, puis relancez `scripts/build_seo.py` avec votre domaine réel.

**Adresse prévue :** https://gta6-guide.duckdns.org/ (GitHub Pages, fichier `CNAME` à la racine). Les canoniques et le sitemap sont déjà générés pour cette adresse.

---

## Crédits, images et audio

- **Images générées** : par IA (JPG), conceptuelles, légendées comme telles. Chaque image n’apparaît qu’une fois sur le site.
- **Images de référence** : captures et visuels trouvés sur des sites de presse, wikis et fan galleries, listés dans `assets/data/media.json` avec leur source et leur statut. Elles restent à vérifier et peuvent être retirées sur demande des ayants droit.
- **Audio** : fichiers MP3 synthétiques de maquette, générés par `scripts/generate_placeholder_audio.py`. Ils ne sont pas des extraits de la bande originale. Le seul fichier conservé est l’ambiance de l’accueil, branchée sur le site ; les autres fichiers ont été retirés.
- **Polices** : Google Fonts (Bebas Neue, Inter, JetBrains Mono, Orbitron, Rajdhani), sous leurs licences respectives.
- **Données** : sources listées dans `research_data.json`. Aucune carte communautaire ni code tiers n’a été copié.

---

## Avertissement légal

Site de fans **non officiel**, sans affiliation avec Rockstar Games ou Take-Two Interactive. *Grand Theft Auto*, *GTA*, *Rockstar Games*, *Vice City* et *Leonida* sont des marques de leurs propriétaires respectifs. Le contenu est fourni à titre informatif. Il ne remplace pas les communiqués officiels. Ne téléchargez aucun « build », « leak » ou archive de GTA VI proposé sur GitHub, Telegram ou ailleurs : ces fichiers ne sont pas vérifiables et peuvent être des arnaques ou des logiciels malveillants.

---

## English summary

Unofficial fan guide for *Grand Theft Auto VI* (release announced for 19 November 2026). Static HTML/CSS/JavaScript, no build step, no framework. Pages are in French with English secondary text. Features: global search, confidence-level filters, a conceptual interactive map, a persistent launch checklist with JSON export/import, SEO basics and an accessibility audit with 0 axe-core violations. Facts are labelled official, press, community or rumour. Deployment instructions are in `DEPLOIEMENT.md`.
