import questions from './data/questions.json';

export { questions };

export const NONE = '— nie pasuje do niczego —';

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function matchChoices(q) {
  const rights = [...new Set(q.pairs.map((p) => p.right).filter(Boolean))];
  const all = [...rights, ...(q.distractors || [])];
  if (q.pairs.some((p) => p.right === null)) all.push(NONE);
  return all;
}

// Prepares a question for display: shuffles answers/pairs, keeps the original indices.
export function prepare(q, shuffleOptions) {
  if (q.type === 'choice') {
    const order = q.options.map((_, i) => i);
    return { ...q, order: shuffleOptions ? shuffle(order) : order };
  }
  return {
    ...q,
    leftOrder: shuffle(q.pairs.map((_, i) => i)),
    choices: shuffleOptions ? shuffle(matchChoices(q)) : matchChoices(q),
  };
}

export function isCorrect(q, answer) {
  if (q.type === 'choice') {
    const sel = [...(answer || [])].sort();
    const ok = [...q.correct].sort();
    return sel.length === ok.length && sel.every((v, i) => v === ok[i]);
  }
  return q.pairs.every((p, i) => (answer || {})[i] === (p.right ?? NONE));
}

export function isComplete(q, answer) {
  if (q.type === 'choice') return (answer || []).length === q.correct.length;
  return q.pairs.every((_, i) => (answer || {})[i]);
}

const KEY = 'slop-egzamin-stats-v1';

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveStats(stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function record(stats, id, ok) {
  const s = stats[id] || { seen: 0, ok: 0, streak: 0 };
  return {
    ...stats,
    [id]: { seen: s.seen + 1, ok: s.ok + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0, last: ok },
  };
}
