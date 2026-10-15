import fs from 'fs';
const [,, inp, out] = process.argv;
let html = fs.readFileSync(inp, 'utf8');
const start = html.indexOf('<h3>Checkpoint Exam');
let end = html.indexOf('<nav class="navigation post-navigation"', start);
if (end < 0) end = html.length;
html = html.slice(start, end);
const dec = s => s.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '')
  .replace(/&#8217;|&rsquo;/g, "'").replace(/&#8216;|&lsquo;/g, "'").replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
  .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#8230;/g, '…').replace(/&#215;/g,'×')
  .replace(/[\u200b\u00a0]/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
const parts = html.split(/(?=<p><strong>\d+\.\s)/).slice(1);
const qs = [];
for (const p of parts) {
  const num = +p.match(/<strong>(\d+)\./)[1];
  const qEnd = p.indexOf('</strong>');
  let text = dec(p.slice(p.indexOf('<strong>') + 8, qEnd)).replace(/^\d+\.\s*/, '');
  const firstBlock = p.search(/<ul>|<table|<div class="message_box/);
  const head = p.slice(0, firstBlock < 0 ? p.length : firstBlock);
  const imgs = [...head.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]);
  const extra = dec(head.slice(qEnd)).trim();
  if (extra) text += '\n' + extra;
  const ulm = p.match(/<ul>([\s\S]*?)<\/ul>/);
  const tbl = p.match(/<table[\s\S]*?<\/table>/);
  const expM = p.match(/<div class="message_box[^"]*">([\s\S]*?)<\/div>/);
  let explanation = expM ? dec(expM[1]).replace(/^Explanation:\s*/, '') : '';
  const q = { id: num, question: text };
  if (imgs.length) q.images = imgs;
  if (ulm && (!tbl || ulm.index < tbl.index)) {
    const lis = [...ulm[1].matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)];
    q.type = 'choice';
    q.options = lis.map(m => dec(m[2]));
    q.correct = lis.map((m, i) => /correct_answer/.test(m[1]) ? i : -1).filter(i => i >= 0);
  } else if (tbl) {
    q.type = 'match';
    q.pairs = [...tbl[0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c => dec(c[1])));
  } else q.type = 'unknown';
  q.explanation = explanation;
  qs.push(q);
}
fs.writeFileSync(out, JSON.stringify(qs, null, 2));
console.log(qs.length, 'questions;', qs.filter(q=>q.type!=='choice').map(q=>q.id+':'+q.type).join(' '));
console.log('no correct:', qs.filter(q=>q.type==='choice'&&!q.correct.length).map(q=>q.id).join(' '));
