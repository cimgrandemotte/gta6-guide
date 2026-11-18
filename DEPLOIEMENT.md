# Déploiement du guide GTA VI

Ce guide explique comment publier le site sur un hébergement statique, puis comment le relier à votre domaine. Le site ne demande ni base de données, ni serveur d’application, ni étape de compilation.

---

## 1. Avant de publier

1. **Choisissez votre domaine** (par exemple `gta6-guide.fr`). Vous pouvez aussi commencer sur un sous-domaine gratuit fourni par l’hébergeur.
2. **Mettez à jour les canoniques et le sitemap** avec ce domaine :

   ```bash
   python3 scripts/build_seo.py https://votre-domaine.fr/
   ```

   Le script ajoute la balise `<link rel="canonical">` à chaque page et régénère `sitemap.xml` et `robots.txt`. Il est sans effet négatif si vous le relancez. Ne le lancez pas avec `https://example.com/` : c’est une valeur de test.

3. **Vérifiez en local** :

   ```bash
   npm run dev
   ```

   Ouvrez <http://localhost:8080>, testez la recherche (raccourci `/`), la carte et la checklist.

---

## 2. Option A — GitHub Pages (recommandé, gratuit)

GitHub Pages sert des fichiers statiques en HTTPS depuis un dépôt.

### 2.1 Créer le dépôt

1. Connectez-vous à GitHub, puis créez un dépôt **public** nommé par exemple `gta6-ultimate-guide`.
   GitHub Free impose un dépôt public pour un site Pages de projet.
2. Dans le dossier du projet :

   ```bash
   cd gta6-ultimate-guide
   git init -b main
   git add .
   git commit -m "Guide GTA VI : première version"
   git remote add origin https://github.com/VOTRE-COMPTE/gta6-ultimate-guide.git
   git push -u origin main
   ```

   Le fichier `.nojekyll` est déjà présent : il désactive le traitement Jekyll, qui ignorerait certains fichiers.

### 2.2 Activer Pages

1. Ouvrez **Settings → Pages**.
2. Dans **Build and deployment**, choisissez **Deploy from a branch**.
3. Branche : `main`, dossier : `/ (root)`. Cliquez sur **Save**.
4. Après une à deux minutes, l’adresse apparaît : `https://VOTRE-COMPTE.github.io/gta6-ultimate-guide/`.

### 2.3 Domaine personnalisé

1. Dans **Settings → Pages → Custom domain**, saisissez votre domaine (par exemple `www.votre-domaine.fr`), puis **Save**. GitHub crée automatiquement le fichier `CNAME`.
2. Chez votre registraire DNS, créez les enregistrements suivants :
   - Pour `www` : un enregistrement **CNAME** `www` vers `VOTRE-COMPTE.github.io.`
   - Pour le domaine nu (`votre-domaine.fr`) : quatre enregistrements **A** vers les adresses IP de GitHub Pages, indiquées dans la documentation GitHub « Managing a custom domain for your GitHub Pages site ». Vérifiez ces adresses dans la documentation au moment de la mise en place.
3. Attendez la vérification DNS (quelques minutes à 24 heures). Cochez ensuite **Enforce HTTPS**.
4. Relancez `python3 scripts/build_seo.py https://votre-domaine.fr/` avec le domaine réel, puis poussez les modifications.

> **Important :** le fichier `CNAME` doit rester à la racine du dépôt. Ne le supprimez pas lors d’une mise à jour.

### 2.3 bis Votre cas : gta6-guide.duckdns.org

Domaine retenu : **https://gta6-guide.duckdns.org/** (sous-domaine gratuit DuckDNS, hébergement GitHub Pages).

- Les canoniques, le sitemap et `robots.txt` sont déjà générés pour ce domaine (`python3 scripts/build_seo.py https://gta6-guide.duckdns.org/`).
- Le fichier `CNAME` à la racine contient `gta6-guide.duckdns.org`.
- Au moment de la préparation, le domaine résolvait vers `185.199.108.153`, une adresse GitHub Pages.
- **Limite DuckDNS :** le service n’accepte que des enregistrements **A** (ou AAAA) et **TXT** sur un sous-domaine, pas de CNAME. Il n’accepte qu’une seule adresse IP par sous-domaine. Vous ne pouvez donc pas utiliser les quatre adresses GitHub ; une seule suffit pour que le site fonctionne, sans redondance.
- Si GitHub signale une erreur DNS sur la page **Settings → Pages**, vérifiez que l’adresse DuckDNS pointe bien vers une adresse GitHub Pages actuelle (consultez la documentation GitHub, car ces adresses peuvent changer), puis cliquez de nouveau sur **Save**.
- Activez **Enforce HTTPS** une fois le certificat émis (quelques minutes à quelques heures).

Commandes de publication, depuis le dossier du projet :

```bash
git init -b main
git add .
git commit -m "Guide GTA VI : première version"
git remote add origin https://github.com/VOTRE-COMPTE/gta6-ultimate-guide.git
git push -u origin main
```

Dans **Settings → Pages**, choisissez **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis saisissez `gta6-guide.duckdns.org` dans **Custom domain**.

### 2.4 Mises à jour

Chaque `git push` sur `main` relance la publication. Attendez la fin du déploiement (onglet **Actions**) avant de vérifier le site.

---

## 3. Option B — Netlify ou Cloudflare Pages (glisser-déposer)

1. Créez un compte sur Netlify ou Cloudflare Pages.
2. Choisissez l’option de publication directe par glisser-déposer du dossier, ou connectez le dépôt GitHub.
3. Paramètres de build : **aucun**. Dossier de publication : la racine du projet.
4. Ajoutez votre domaine dans les paramètres du site, puis suivez les enregistrements DNS demandés par la plateforme.
5. Activez HTTPS (automatique sur ces plateformes).

---

## 4. Option C — Serveur Nginx (ou Apache) sur un VPS

Copiez le dossier sur le serveur, par exemple dans `/var/www/gta6-guide`, puis :

```nginx
server {
    listen 80;
    server_name votre-domaine.fr www.votre-domaine.fr;
    root /var/www/gta6-guide;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;

    # Cache long pour les fichiers statiques
    location ~* \.(css|js|jpg|mp3|json)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

Ajoutez ensuite un certificat HTTPS, par exemple avec Certbot :

```bash
sudo certbot --nginx -d votre-domaine.fr -d www.votre-domaine.fr
```

---

## 5. Vérifications après publication

Testez chaque point sur l’adresse publique :

- [ ] La page d’accueil s’affiche avec les images et le compte à rebours.
- [ ] `https://votre-domaine.fr/sitemap.xml` et `/robots.txt` répondent.
- [ ] La recherche (bouton « Rechercher » ou touche `/`) renvoie des résultats.
- [ ] La carte (page Carte) affiche les six repères et les filtres.
- [ ] La checklist (page Guide) conserve la progression après rechargement.
- [ ] Une adresse inexistante affiche la page 404.
- [ ] Le site reste lisible sur téléphone (375 px).
- [ ] Le cadenas HTTPS est présent.

Pour un contrôle des liens, utilisez un outil en ligne ou un crawler local comme `linkchecker` sur l’adresse publique.

---

## 6. Après la sortie (19 novembre 2026)

Le site est publié **avant** la sortie. Le 19 novembre, revérifiez les faits marqués « à confirmer » ou « presse » sur les sources officielles, mettez à jour les pages concernées et relancez la publication. La procédure détaillée est dans le README, section « Mettre à jour après la sortie ».

Surveillez aussi les annonces de Rockstar : la carte imprimable de Leonida est annoncée pour le jour de la sortie sur le site officiel.

---

## 7. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| La recherche ne répond pas en local | Ouverture par `file://` | Utilisez `npm run dev` |
| Le domaine affiche une erreur 404 | Fichier `CNAME` absent ou DNS non propagé | Vérifiez le `CNAME` à la racine et attendez la propagation |
| HTTPS indisponible sur GitHub | Certificat en cours de création | Attendez, puis cochez **Enforce HTTPS** |
| Le sitemap indique `example.com` | `build_seo.py` non relancé avec le vrai domaine | Relancez `python3 scripts/build_seo.py https://votre-domaine.fr/` |
| Une image ne s’affiche pas | Chemin modifié après déplacement | Vérifiez le dossier `assets/images/` |
| Les modifications n’apparaissent pas | Cache du navigateur ou déploiement en cours | Forcez le rechargement (Ctrl+F5) et attendez la fin du déploiement |
