# Casse le Code — version web statique

Portage 100 % navigateur du jeu : plus de backend Flask, tout (moteur,
énumération des mains, IA basée sur l'entropie) tourne en JS dans la page.

## Structure

- `index.html` — page unique (HTML + CSS + script de rendu).
- `jeu.js` — état de partie, joueurs, stratégie IA, API publique appelée par la page.
- `moteur.js` — deck, mains, poids, catalogue de questions, entropie.

## Lancer en local

Comme `index.html` charge `jeu.js` comme **module ES**, ouvrir le fichier
directement (`file://`) ne suffit pas — il faut un petit serveur HTTP :

```sh
cd web
python3 -m http.server 8000
```

puis ouvrir `http://localhost:8000`.

