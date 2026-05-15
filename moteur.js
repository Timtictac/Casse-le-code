// Modèle de Break the Code (port JS de moteur.py).
// Cartes, mains, poids, catalogue de questions, entropie sur sous-ensemble.

const ORDRE_COULEUR = { N: 0, B: 1, V: 2 };

// Deck : 20 jetons. Pour v = 5, couleur "V" (deux exemplaires) ; sinon "N"/"B".
export const deck = [];
for (let v = 0; v < 10; v++) {
  for (const c of ['N', 'B']) {
    deck.push([v, v === 5 ? 'V' : c]);
  }
}

const cléCarte = (c) => c[0] * 3 + ORDRE_COULEUR[c[1]];

// Trie une main de 5 cartes selon (valeur, couleur).
export function mainTriée(cartes) {
  return [...cartes].sort((a, b) => cléCarte(a) - cléCarte(b));
}

// Sérialisation canonique d'une main (déjà triée) : "vC vC vC vC vC".
export function cléMain(main) {
  return main.map(([v, c]) => `${v}${c}`).join(' ');
}

// Énumération de toutes les combinaisons de 5 cartes parmi un multiset d'indices.
function* combinations(n, k) {
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx.slice();
    let i = k - 1;
    while (i >= 0 && idx[i] === i + n - k) i--;
    if (i < 0) return;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

// Toutes les mains pondérées issues d'un sous-multiset du deck.
// `cartesRestantes` peut contenir des doublons (ex. deux 5V).
export function mainsDepuis(cartesRestantes) {
  const compteur = new Map(); // clé -> { main, poids }
  for (const combo of combinations(cartesRestantes.length, 5)) {
    const main = mainTriée(combo.map((i) => cartesRestantes[i]));
    const k = cléMain(main);
    const entrée = compteur.get(k);
    if (entrée) entrée.poids++;
    else compteur.set(k, { main, poids: 1 });
  }
  const cands = [];
  const pds = [];
  for (const { main, poids } of compteur.values()) {
    cands.push(main);
    pds.push(poids);
  }
  return { candidats: cands, poids: pds };
}

// --- Factories de questions --------------------------------------------------

const estNoire = (c) => c[1] === 'N';
const estBlanche = (c) => c[1] === 'B';

const qCombien = (critère) => (main) => main.reduce((s, c) => s + (critère(c) ? 1 : 0), 0);
const qSomme = (prédicat) => (main) =>
  main.reduce((s, c, i) => s + (prédicat(c, i) ? c[0] : 0), 0);
const qDiff = (filtre = () => true) => (main) => {
  const vs = main.filter(filtre).map((c) => c[0]);
  if (vs.length === 0) return null;
  return Math.max(...vs) - Math.min(...vs);
};

// Étiquetage des motifs d'adjacence (cf. table_adjacences dans moteur.py).
function tableAdjacences(taille) {
  const lettre = (n) => String.fromCharCode(945 + n); // α, β, γ, …
  const table = new Map();
  const nbMotifs = 1 << (taille - 1);
  for (let m = 0; m < nbMotifs; m++) {
    const motif = [];
    for (let i = 0; i < taille - 1; i++) motif.push(Boolean((m >> i) & 1));
    const étiquettes = Array(taille).fill(0);
    let numéro = 1;
    for (let i = 0; i < motif.length; i++) {
      if (motif[i]) {
        étiquettes[i] = numéro;
        étiquettes[i + 1] = numéro;
      } else {
        if (étiquettes[i] !== 0) numéro++;
        étiquettes[i + 1] = 0;
      }
    }
    const repr = étiquettes.map((e) => (e === 0 ? '.' : lettre(e - 1))).join(' ');
    table.set(motif.join(','), repr);
  }
  return table;
}

const FORMAT_ADJ = tableAdjacences(5);

const qAdjacence = (relation) => (main) => {
  const motif = [];
  for (let i = 0; i < main.length - 1; i++) {
    motif.push(Boolean(relation(main[i], main[i + 1])));
  }
  return FORMAT_ADJ.get(motif.join(','));
};

// --- Catalogue ---------------------------------------------------------------

export const questions = [
  ['Somme des cartes noires',                     qSomme((c) => estNoire(c))],
  ['Somme des cartes blanches',                   qSomme((c) => estBlanche(c))],
  ['Somme des 3 cartes de gauche',                qSomme((_, i) => i + 1 <= 3)],
  ['Somme des 3 cartes du milieu',                qSomme((_, i) => 2 <= i + 1 && i + 1 <= 4)],
  ['Somme des 3 cartes de droite',                qSomme((_, i) => i + 1 >= 3)],
  ['Somme de toutes les cartes',                  qSomme(() => true)],
  ['Écart entre la plus grande et la plus petite carte', qDiff()],
  ['Écart entre la plus grande et la plus petite carte noire',   qDiff(estNoire)],
  ['Écart entre la plus grande et la plus petite carte blanche', qDiff(estBlanche)],
  ['Quelles cartes voisines se suivent (ex. 3 puis 4) ?',        qAdjacence((a, b) => a[0] + 1 === b[0])],
  ['Quelles cartes voisines ont la même couleur ?',              qAdjacence((a, b) => a[1] === b[1])],
  ['Quelles cartes voisines ont même parité ET même couleur ?',  qAdjacence((a, b) => a[0] % 2 === b[0] % 2 && a[1] === b[1])],
];

// --- Entropie sur un sous-ensemble de mains ----------------------------------

// H(X) = -Σ p log2 p, pondérée par `poids`. Les réponses sont regroupées par
// égalité stricte (Number, String, ou null) ; on convertit en clé via String().
export function entropieSur(question, mainsListe, poidsListe) {
  const groupes = new Map();
  let total = 0;
  for (let i = 0; i < mainsListe.length; i++) {
    const rep = question(mainsListe[i]);
    const k = rep === null ? '∅' : String(rep);
    const w = poidsListe[i];
    groupes.set(k, (groupes.get(k) || 0) + w);
    total += w;
  }
  if (total === 0) return 0;
  let H = 0;
  for (const w of groupes.values()) {
    if (w <= 0) continue;
    const p = w / total;
    H -= p * Math.log2(p);
  }
  return H;
}
