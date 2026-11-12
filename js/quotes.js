/** Normalise une citation ou un extrait pour la recherche (césures, espaces, traits d'union souples). */
export function normalizeQuote(text) {
  if (text == null) return '';
  return String(text)
    .replace(/\u00ad/g, '-')
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/-\s+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Vrai si `quote` apparaît dans `haystack` après normalisation. */
export function quoteFoundIn(haystack, quote) {
  const h = normalizeQuote(haystack);
  const q = normalizeQuote(quote);
  if (!q) return false;
  if (h.includes(q)) return true;
  // Variante : trait d'union de césure devenu espace
  const qSpace = q.replace(/-/g, ' ');
  const hSpace = h.replace(/-/g, ' ');
  return hSpace.includes(qSpace);
}
