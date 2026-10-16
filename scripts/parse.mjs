// HTML page from itexamanswers.net -> raw question objects (text, exhibits, images, options, explanation).

export const dec = (s) =>
  s.replace(/<br\s*\/?>/g, '\n').replace(/<\/(p|li|tr|div)>/g, '\n').replace(/<[^>]+>/g, '')
    .replace(/&#8217;|&rsquo;/g, "'").replace(/&#8216;|&lsquo;/g, "'").replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"')
    .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#8230;/g, '…').replace(/&#215;/g, '×')
    .replace(/&#8594;/g, '→').replace(/&#8242;/g, "'").replace(/&#8243;/g, '"')
    .replace(/\r/g, '').replace(/[​ ]/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{2,}/g, '\n').trim();

const imgsIn = (s) => [...s.matchAll(/<img[^>]*\ssrc="(https?:[^"]+)"/g)].map((m) => m[1]);
const tableRows = (t) =>
  [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) => [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => dec(c[1])));

export function parse(page) {
  const start = page.search(/<h3>(Checkpoint Exam|CCNA 1 - Introduction)/);
  let end = page.indexOf('<nav class="navigation post-navigation"', start);
  if (end < 0) end = page.length;
  const html = page.slice(start, end)
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<ins[\s\S]*?<\/ins>/g, '')
    .replace(/<button[^>]*>Copy<\/button>/g, '');

  const qs = [];
  for (const raw of html.split(/(?=<p><strong>\d+\.\s)/).slice(1)) {
    const id = +raw.match(/<strong>(\d+)\./)[1];
    const expIdx = raw.search(/<div class="message_box success/);
    const body = expIdx < 0 ? raw : raw.slice(0, expIdx);
    const expHtml = expIdx < 0 ? '' : raw.slice(expIdx);

    const ul = body.match(/<ul[^>]*>([\s\S]*?)<\/ul>/);
    const tbl = body.match(/<table[\s\S]*?<\/table>/);
    // a <pre> holds the options only when an answer in it is highlighted in red, otherwise it is an exhibit
    const pre = [...body.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)].find((m) => /#ff0000/.test(m[1]));
    const first = [ul, pre, tbl].filter(Boolean).sort((a, b) => a.index - b.index)[0];
    const head = body.slice(0, first ? first.index : body.length);
    const exhibits = [...head.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)].map((m) => dec(m[1]));
    const lines = dec(head.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, '\n[EXHIBIT]\n')).split('\n');
    const q = { id, question: lines[0].replace(/^\d+\.\s*/, ''), extra: lines.slice(1).join('\n'), images: imgsIn(head) };
    if (exhibits.length) q.exhibits = exhibits;

    if (first && first === ul) {
      const lis = [...ul[1].matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)];
      q.type = 'choice';
      q.options = lis.map((m) => dec(m[2]));
      q.correct = lis.map((m, i) => (/correct_answer/.test(m[1]) || /#ff0000/.test(m[2]) ? i : -1)).filter((i) => i >= 0);
    } else if (first && first === pre) {
      // options written as lines of a <pre>, correct ones highlighted in red
      const opts = pre[1].split('\n').filter((l) => dec(l));
      q.type = 'choice';
      q.options = opts.map(dec);
      q.correct = opts.map((l, i) => (/#ff0000/.test(l) ? i : -1)).filter((i) => i >= 0);
    } else if (tbl) {
      q.type = 'match';
      q.rows = tableRows(tbl[0]);
    } else q.type = 'unknown';
    const after = dec(body.slice(first ? first.index + first[0].length : body.length));
    if (after) q.after = after;

    q.explanation = dec(expHtml.replace(/<table[\s\S]*?<\/table>/g, '')).replace(/^Explanation:\s*/, '');
    const expTables = [...expHtml.matchAll(/<table[\s\S]*?<\/table>/g)].map((m) => tableRows(m[0]));
    if (expTables.length) q.expTables = expTables;
    const expImgs = imgsIn(expHtml);
    if (expImgs.length) q.expImages = expImgs;
    qs.push(q);
  }
  return qs;
}
