import examList from './data/exams.json';

export const EXAMS = examList;
export const examById = (id) => EXAMS.find((e) => e.id === id);

// question data is split per exam and loaded on demand
const loaders = import.meta.glob(['./data/*.json', '!./data/exams.json'], { import: 'default' });
export const loadQuestions = (id) => loaders[`./data/${id}.json`]();

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

// Progress: { [examId]: { [questionId]: { seen, ok, streak, last } } }
const KEY = 'grypser-stats-v2';
const OLD_KEY = 'slop-egzamin-stats-v1'; // single exam (modules 1–3)

export function loadStats() {
  try {
    const stats = JSON.parse(localStorage.getItem(KEY));
    if (stats) return stats;
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    return old ? { 'm1-3': old } : {};
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

export function record(stats, examId, id, ok) {
  const exam = stats[examId] || {};
  const s = exam[id] || { seen: 0, ok: 0, streak: 0 };
  return {
    ...stats,
    [examId]: { ...exam, [id]: { seen: s.seen + 1, ok: s.ok + (ok ? 1 : 0), streak: ok ? s.streak + 1 : 0, last: ok } },
  };
}

export function summary(examStats = {}) {
  const list = Object.values(examStats);
  return {
    seen: list.length,
    mastered: list.filter((s) => s.streak >= 2).length,
    wrong: list.filter((s) => s.last === false).length,
  };
}

export const imageUrl = (path) => import.meta.env.BASE_URL + path;
