# Lire la carte « voisinage de parité »

La question **« quelles cartes voisines sont toutes deux paires ou impaires ? »** renvoie un motif un peu étrange comme `α α . β β` ou `. . . α α`. Voici comment le lire.

## Comment fonctionne la réponse

La main est triée en **5 positions**. Entre deux positions consécutives, on regarde si les deux cartes ont la **même parité** (toutes deux paires, ou toutes deux impaires).

- s'il y a accord de parité → on **groupe** les positions avec une lettre grecque
- sinon → on met un point `.`

Les groupes sont nommés α, β, γ… **dans l'ordre d'apparition** de gauche à droite.

## Exemples

Main : \1N \3B \4N \6B \9V — parités : I I P P I

Voisinages :
- 1↔3 : I I → même parité → groupe
- 3↔4 : I P → différent → coupe
- 4↔6 : P P → même parité → groupe
- 6↔9 : P I → différent → coupe

Réponse : `α α . β β` (la position 1-2 forme un groupe α, la position 3-4 un groupe β).

## Lectures utiles

- **`. . . . .`** — *aucune* paire de voisins ne partage la parité. La main alterne strictement P, I, P, I, P (ou I, P, I, P, I).
- **`α α α α α`** — les **5 cartes ont la même parité**. Soit toutes paires, soit toutes impaires.
- **`α α α α .`** — les 4 premières partagent la parité, la 5ème est de l'autre parité.
- **`α α . β β`** — deux blocs de même parité, séparés par un changement.

## Combiner avec les valeurs

La main est **triée par valeur**. Donc une coupure (`.`) entre deux positions signifie que la valeur passe d'un type de parité à l'autre, ce qui contraint **où** se situent les transitions :

- pas de coupure du tout → soit toutes les cartes ≤ 9 sont paires, soit toutes impaires (très rare car il faut piocher dans un petit ensemble).
- coupure unique au milieu → typiquement, le bas de la main est d'une parité et le haut de l'autre.

Couplez ce motif avec une question de **somme** (qui donne le **nombre** de cartes impaires) et vous obtenez à la fois la **quantité** et la **position** des impaires.
