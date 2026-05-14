# Niveau 0 — Construire un code possible

Avant de chercher la main de l'IA, il faut **savoir reconstruire une main valide**. La règle est très simple, mais elle limite déjà énormément les possibilités.

## La règle du jeu

Le paquet contient **20 jetons** :

- les valeurs **0 à 9**, chacune en **noir** et en **blanc**
- sauf le **5** qui n'existe **qu'en vert**, en deux exemplaires

Une main = **5 cartes triées** dans l'ordre croissant (valeur, puis noir avant blanc avant vert).

## Tenir compte de votre propre main

**C'est l'astuce la plus importante au début :** les cartes que vous avez en main *ne peuvent pas* être dans la main de l'IA. Le paquet est partagé.

Exemple — si vous avez :

\1N \3B \5V \7N \9B

Alors l'IA n'a **aucun** \1N, \3B, \7N, \9B dans sa main. Et il ne reste qu'**un seul** \5V dans le paquet (vous en avez un, l'autre est soit chez l'IA, soit dans la pioche).

## Reconstruire mentalement

Pour vérifier qu'une combinaison est possible, comptez : pour chaque carte que vous imaginez chez l'IA, il doit en rester au moins une dans le paquet *après avoir retiré votre main*.

Cette simple contrainte élimine déjà la moitié des combinaisons théoriques. C'est gratuit, faites-le **avant** de poser la moindre question.
