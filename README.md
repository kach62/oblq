# OBLQ — front-end

Veille créative. 257 références, deux éditions par jour.

Ce dépôt contient le **front** uniquement. L'API (`/api/collection`,
`/api/ask`, `/api/pulse`) reste servie par l'app ChatGPT et est
reproxifiée par Netlify — voir `netlify.toml`.

---

## Mettre en ligne (une seule fois, ~10 minutes)

### 1. Créer le dépôt

Sur github.com → **New repository** → nom `oblq`, privé ou public.
Puis, depuis le dossier qui contient ces fichiers :

```bash
git init -b main
```

```bash
git add . && git commit -m "OBLQ : front unifie, cache de collection, calque de mouvement"
```

```bash
git remote add origin https://github.com/<ton-compte>/oblq.git && git push -u origin main
```

### 2. Brancher Netlify

1. app.netlify.com → **Add new site** → **Import an existing project** → GitHub → `oblq`.
2. Build command : **vide**. Publish directory : **`.`** (`netlify.toml` le dit déjà).
3. **Deploy**.

Le site est en ligne. `netlify.toml` reproxifie `/api/*` vers ton app
ChatGPT : la collection, Ask OBLQ et les pulses continuent de fonctionner
sans toucher au back-end.

### 3. Ton domaine

Netlify → **Domain settings** → **Add a custom domain** → `oblq.fr` (ou
celui que tu veux). HTTPS automatique.

### 4. Me donner la main

Connecte GitHub à Claude : **https://claude.ai/connect-github**, puis
installe l'app sur le dépôt `oblq`. À partir de là, je pousse
directement : tu demandes une modification, elle est en ligne en
trente secondes. C'est ce que veut dire « temps réel ».

---

## Architecture

```
index.html             <head> corrige : canonical, polices, defer
oblq.css               les 15 feuilles fusionnees, cascade identique
oblq-motion.css        calque de mouvement (charge en dernier)
seed.js                18 references de surface -> peint la une
oblq-collection.js     cache stale-while-revalidate sur /api/collection
oblq-motion.js         revelation, horloge, morphing, sequence d'ouverture
data-fallback.json     collection figee, servie seulement si l'API tombe
netlify.toml           proxy /api/*, cache, en-tetes de securite
```

### Le chargement, dans l'ordre

1. `index.html` (8 ko) et `oblq.css` partent ensemble.
2. `seed.js` (11 ko compressés) donne 18 références : **la une est peinte**.
3. `app.js` demande `/api/collection`. `oblq-collection.js` intercepte :
   - en cache et frais (< 10 min) → **aucune requête réseau** ;
   - en cache et tiède → servi du cache, revalidé derrière, écran
     rafraîchi seulement si `updatedAt` a changé ;
   - pas de cache → réseau, puis repli sur `data-fallback.json`.
4. `oblq-motion.js` arme la révélation au scroll et reprend l'horloge.

---

## Mesuré, pas estimé

| | avant | après |
|---|---|---|
| Chargement complet (1440 px) | 4 680 ms | **1 806 ms** |
| Requêtes | 34 | **19** |
| Feuilles de style | 15 | **1** (+ le calque de mouvement) |
| Script bloquant | `data.js` 113 ko gzip | `seed.js` **11 ko** gzip |
| `/api/collection` au retour d'onglet | 520 ko à chaque fois | **0 ko** pendant 10 min |
| Écritures DOM de l'horloge | 86 400 / jour | **1 440 / jour**, suspendues hors écran |
| `@keyframes` | 2 | **13 modules** |

Parité vérifiée au navigateur : 257 références, 563 éléments
cliquables, zéro erreur console, zéro débordement horizontal, rendu
identique au pixel près.

---

## Deux décisions qui t'appartiennent

### La typographie

Le CSS charge Barlow Condensed et DM Sans depuis Google Fonts.
**Aucun des 1 037 éléments visibles ne les utilise** : `porto-direction.css`
a tout basculé en Arial avec

```css
.masthead h1, body .masthead h1 {
  font: 500 clamp(80px,16vw,230px)/.8 Arial, sans-serif !important;
}
```

alors que vingt déclarations Barlow Condensed survivent plus haut dans
la cascade, sans effet. Deux sorties :

- **C'est voulu** (Arial comme anti-design, c'est une direction
  défendable) → supprimer le `<link>` Google Fonts du `<head>` et les
  vingt déclarations mortes. Une requête et deux connexions en moins.
- **C'est un accident** → retirer le `!important` de cette règle, et le
  masthead retrouve Barlow Condensed.

Je n'ai rien tranché : le rendu actuel est conservé à l'identique.

### Les notes de production exposées

`/api/collection` renvoie 56 éditions contenant `sourcePolicy`,
`clientContext`, `watchlistAudit`, `designCircle`, `preparation` —
ta cuisine éditoriale interne, publique et indexable. À filtrer côté
API si ce n'est pas délibéré.

---

## Chantier restant

Les 57 `!important` sont toujours là. La fusion conserve l'ordre de
cascade d'origine, donc le rendu est identique, mais les conflits
dorment encore. À traiter en partant de la fin du fichier, règle par
règle, avec une capture avant/après à chaque fois.
