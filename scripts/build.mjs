// Builds src/data/<exam>.json for every question exam listed in src/data/exams.json:
// download page -> parse -> normalize -> verification fixes (scripts/fixes/<exam>.mjs) -> checks.
// Exhibit images are copied to public/img/<exam>/.
// Usage: node scripts/build.mjs [cache-dir] [exam-id ...]
import fs from 'fs';
import path from 'path';
import { parse } from './parse.mjs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const exams = JSON.parse(fs.readFileSync('src/data/exams.json', 'utf8'));
const [cache = '.cache', ...only] = process.argv.slice(2);

async function download(url, file) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://itexamanswers.net/' } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return file;
}

// lines left over from the Packet Tracer download widget and other page chrome
const JUNK = /^(Checkpoint Exam:.*|\.\.\.|Download|\d+ downloads|[\d.]+ KB|\d+ file\(s\).*|.*Packet Tracer( file)?|.*Exam( Answers)?( Full)?( Q?\d+)?|ITN \(Version 7\.00\).*|Place the options in the following order:.*)$/;

function normalize(r) {
  let explanation = r.explanation.trim();
  let topic = '';
  const m = explanation.match(/^Topics? ([\d. and,]+?)(?:\n|$)/);
  if (m) {
    topic = m[1].trim();
    explanation = explanation.slice(m[0].length).trim();
  }
  explanation = explanation.replace(/^Place the options in the following order:\s*/, '').trim();

  const lines = [r.question, ...r.extra.split('\n')].filter((l) => l && !JUNK.test(l));
  const ex = lines.indexOf('[EXHIBIT]');
  const before = ex < 0 ? lines : lines.slice(0, ex);
  const after = ex < 0 ? [] : lines.slice(ex + 1);
  const q = { id: r.id, type: r.type, question: before.join('\n') || after.shift() || '', topic, explanation };
  if (r.exhibits) q.exhibit = r.exhibits.join('\n\n');
  if (after.length) q.question2 = after.join('\n');
  if (r.images.length) q.images = r.images;
  if (r.type === 'choice') {
    q.options = r.options;
    q.correct = r.correct;
  }
  // matching tasks: the answer table is in the question, or only in the explanation
  const rows = r.rows || (r.type === 'unknown' && r.expTables?.length === 1 && r.expTables[0]);
  if (rows) q.type = 'match';
  if (rows && rows.every((row) => row.length === 2)) q.pairs = rows.map(([left, right]) => ({ left, right }));
  // images of matching tasks show the solved task; fixes put back the ones that are real exhibits
  if (rows) delete q.images;
  q.raw = r; // available to the fixes, removed before writing
  return q;
}

// Turns a table whose header row holds the categories into item -> category pairs.
function columns(rows) {
  const [head, ...body] = rows;
  return body.flatMap((row) => row.map((left, i) => ({ left, right: head[i] })).filter((p) => p.left));
}

function check(exam, res) {
  const ids = new Set();
  for (const q of res) {
    const where = `${exam.id} #${q.id}`;
    if (ids.has(q.id)) throw new Error(`duplicate id ${where}`);
    ids.add(q.id);
    if (!q.question) throw new Error(`no question text ${where}`);
    if (q.type === 'choice') {
      const n = (q.question + (q.question2 || '')).match(/Choose (two|three|four|five)/i)?.[1]?.toLowerCase();
      const want = { two: 2, three: 3, four: 4, five: 5 }[n] || 1;
      if (!q.correct.length) throw new Error(`no correct answer ${where}`);
      if (q.correct.length !== want) console.warn(`WARN ${where}: ${q.correct.length} correct, question asks for ${want}`);
      if (new Set(q.options).size !== q.options.length) console.warn(`WARN ${where}: duplicate options`);
    } else if (q.type === 'match') {
      if (!q.pairs?.length) throw new Error(`no pairs ${where}`);
    } else throw new Error(`unknown type ${where}`);
    if (!q.explanation) console.warn(`WARN ${where}: no explanation`);
  }
}

for (const exam of exams) {
  if (exam.kind === 'lab' || (only.length && !only.includes(exam.id))) continue;
  const html = fs.readFileSync(await download(exam.source, `${cache}/pages/${exam.id}.html`), 'utf8');
  let res = parse(html).map(normalize);
  const { default: fixes } = await import(`./fixes/${exam.id}.mjs`);
  const fix = (id, f) => {
    const q = res.find((x) => x.id === id);
    if (!q) throw new Error(`fix: no question ${exam.id} #${id}`);
    f(q);
  };
  const drop = (...ids) => (res = res.filter((q) => !ids.includes(q.id)));
  fixes({ fix, drop, all: () => res, columns });
  res.forEach((q) => delete q.raw);
  check(exam, res);

  const imgDir = `public/img/${exam.id}`;
  fs.rmSync(imgDir, { recursive: true, force: true });
  for (const q of res) {
    if (!q.images?.length) continue;
    q.images = await Promise.all(
      q.images.map(async (url) => {
        const name = path.basename(new URL(url).pathname);
        const file = await download(url, `${cache}/img/${name}`);
        fs.mkdirSync(imgDir, { recursive: true });
        fs.copyFileSync(file, `${imgDir}/${name}`);
        return `img/${exam.id}/${name}`;
      }),
    );
  }
  fs.writeFileSync(`src/data/${exam.id}.json`, JSON.stringify(res, null, 2) + '\n');
  exam.questions = res.length;
  console.log(`${exam.id}: ${res.length} questions`);
}
fs.writeFileSync('src/data/exams.json', JSON.stringify(exams, null, 2) + '\n');
