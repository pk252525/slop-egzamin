// ITN Final PT Skills Assessment (PTSA): scenarios, addressing (VLSM), configuration steps and IOS command checking.

export const SCENARIOS = [
  {
    id: '011',
    name: 'Scenariusz 1',
    router: 'R1', switch: 'S1', pcA: 'PC-A', pcB: 'PC-B',
    network: '192.168.10.0', lan1Hosts: 100, lan2Hosts: 50,
    secret: 'DontTellAnyone',
  },
  {
    id: '120',
    name: 'Scenariusz 2',
    router: 'Router-A', switch: 'Switch-A', pcA: 'Host-A', pcB: 'Host-B',
    network: '172.16.1.0', lan1Hosts: 60, lan2Hosts: 20,
    secret: 'NoOneShouldKnow',
  },
  {
    id: '211',
    name: 'Scenariusz 3',
    router: 'Central-RT', switch: 'Central-SW', pcA: 'User-A', pcB: 'User-B',
    network: '209.165.201.0', lan1Hosts: 29, lan2Hosts: 17,
    secret: 'NoOneShouldKnow',
  },
];

// values that are the same in every scenario
export const COMMON = {
  consolePassword: 'C@nsPassw!',
  domain: 'netsec.com',
  user: 'netadmin',
  userSecret: 'Ci$co12345',
  minLength: 10,
  rsaBits: 1024,
};

// --- IPv4 helpers ---

const toInt = (ip) => ip.split('.').reduce((n, o) => n * 256 + +o, 0);
const toIp = (n) => [24, 16, 8, 0].map((s) => Math.floor(n / 2 ** s) % 256).join('.');
const maskOf = (prefix) => toIp(2 ** 32 - 2 ** (32 - prefix));

// smallest prefix with enough usable addresses
export const prefixFor = (hosts) => {
  let bits = 2;
  while (2 ** bits - 2 < hosts) bits++;
  return 32 - bits;
};

function subnet(base, prefix) {
  const size = 2 ** (32 - prefix);
  return {
    network: toIp(base),
    prefix,
    mask: maskOf(prefix),
    first: toIp(base + 1),
    second: toIp(base + 2),
    last: toIp(base + size - 2),
    broadcast: toIp(base + size - 1),
    next: base + size,
  };
}

// LAN 1 (larger) uses the first subnet, LAN 2 the next one
export function addressing(s) {
  const lan1 = subnet(toInt(s.network), prefixFor(s.lan1Hosts));
  const lan2 = subnet(lan1.next, prefixFor(s.lan2Hosts));
  return {
    lan1,
    lan2,
    routerG1: lan1.first, // G0/0/1 – LAN 1
    routerG0: lan2.first, // G0/0/0 – LAN 2
    svi: lan1.second,
    pcA: lan1.last,
    pcB: lan2.last,
  };
}

// Fields of the addressing table: [key, label, expected value]
export function addressingFields(s) {
  const a = addressing(s);
  return [
    ['lan1Net', 'LAN 1 – adres sieci / prefiks', `${a.lan1.network}/${a.lan1.prefix}`],
    ['lan1Mask', 'LAN 1 – maska', a.lan1.mask],
    ['lan2Net', 'LAN 2 – adres sieci / prefiks', `${a.lan2.network}/${a.lan2.prefix}`],
    ['lan2Mask', 'LAN 2 – maska', a.lan2.mask],
    ['routerG1', `${s.router} G0/0/1 (pierwszy adres LAN 1)`, a.routerG1],
    ['routerG0', `${s.router} G0/0/0 (pierwszy adres LAN 2)`, a.routerG0],
    ['svi', `${s.switch} SVI (drugi adres LAN 1)`, a.svi],
    ['pcA', `${s.pcA} (ostatni adres LAN 1)`, a.pcA],
    ['pcB', `${s.pcB} (ostatni adres LAN 2)`, a.pcB],
  ];
}

// Random practice scenario: a /24 split into a larger and a smaller LAN.
export function randomScenario() {
  const r = (n) => Math.floor(Math.random() * n);
  const bases = [() => `192.168.${r(256)}.0`, () => `172.${16 + r(16)}.${r(256)}.0`, () => `10.${r(256)}.${r(256)}.0`];
  for (;;) {
    const lan1Hosts = 10 + r(118);
    const lan2Hosts = 5 + r(lan1Hosts);
    const p1 = prefixFor(lan1Hosts);
    const p2 = prefixFor(lan2Hosts);
    if (2 ** (32 - p1) + 2 ** (32 - p2) > 256 || p2 < p1) continue;
    return { ...SCENARIOS[0], id: 'losowy', name: 'Losowe zadanie', network: bases[r(3)](), lan1Hosts, lan2Hosts };
  }
}

// --- configuration steps ---
// Each step: device, task (shown to the learner), expected command lines.
// An expected line is a string (exact command after normalization) or { any: [...] } / { pattern }.

export function steps(s) {
  const a = addressing(s);
  const c = COMMON;
  const rsa = { any: [`crypto key generate rsa general-keys modulus ${c.rsaBits}`, `crypto key generate rsa modulus ${c.rsaBits}`] };
  const save = { any: ['copy running-config startup-config', 'write memory', 'write'] };
  const common = (dev) => [
    { device: dev, task: 'Przejdź z trybu użytkownika do trybu konfiguracji globalnej.', lines: ['enable', 'configure terminal'] },
    { device: dev, task: 'Wyłącz wyszukiwanie DNS (Part 3, Step 1a).', lines: ['no ip domain-lookup'] },
  ];
  const banner = (dev) => ({
    device: dev,
    task: 'Ustaw odpowiedni baner MOTD (Part 3, Step 1d).',
    lines: [{ pattern: /^banner motd (\S).+\1$/, show: 'banner motd #Unauthorized access to this device is prohibited!#' }],
  });
  const consoleLine = (dev) => ({
    device: dev,
    task: `Zabezpiecz logowanie przez konsolę hasłem ${c.consolePassword} (Part 3, Step 1e).`,
    lines: ['line console 0', `password ${c.consolePassword}`, 'login'],
  });
  const security = (dev) => [
    { device: dev, task: `Ustaw zaszyfrowane hasło trybu uprzywilejowanego: ${s.secret} (Part 4, Step 1a).`, lines: [`enable secret ${s.secret}`] },
    { device: dev, task: 'Zaszyfruj wszystkie hasła zapisane otwartym tekstem (Part 4, Step 1b).', lines: ['service password-encryption'] },
  ];
  const ssh = (dev) => [
    { device: dev, task: `Ustaw nazwę domeny ${c.domain} (Part 4, Step 2a).`, lines: [`ip domain-name ${c.domain}`] },
    { device: dev, task: `Utwórz lokalnego użytkownika ${c.user} z hasłem secret ${c.userSecret} (Part 4, Step 2b).`, lines: [`username ${c.user} secret ${c.userSecret}`] },
    {
      device: dev,
      task: 'Linie vty: logowanie z lokalnej bazy użytkowników i dostęp tylko przez SSH (Part 4, Step 2c–2d).',
      lines: ['line vty 0 15', 'login local', 'transport input ssh'],
    },
    { device: dev, task: `Wygeneruj klucz RSA o długości ${c.rsaBits} bitów (Part 4, Step 2e).`, lines: [rsa] },
  ];
  const finish = (dev) => ({ device: dev, task: 'Wyjdź do trybu uprzywilejowanego i zapisz konfigurację do NVRAM.', lines: ['end', save] });
  const desc = (show) => ({ pattern: /^description \S.*$/, show });

  const R = s.router;
  const S = s.switch;
  return [
    ...common(R),
    { device: R, task: `Ustaw nazwę routera: ${R} (Part 3, Step 1b).`, lines: [`hostname ${R}`] },
    banner(R),
    consoleLine(R),
    {
      device: R,
      task: `Skonfiguruj G0/0/0 – LAN 2: opis, adres ${a.routerG0} (pierwszy adres LAN 2) i włącz interfejs (Part 3, Step 2a).`,
      lines: ['interface gigabitethernet 0/0/0', desc('description Connect to Subnet B'), `ip address ${a.routerG0} ${a.lan2.mask}`, 'no shutdown'],
    },
    {
      device: R,
      task: `Skonfiguruj G0/0/1 – LAN 1: opis, adres ${a.routerG1} (pierwszy adres LAN 1) i włącz interfejs (Part 3, Step 2a).`,
      lines: ['interface gigabitethernet 0/0/1', desc('description Connect to Subnet A'), `ip address ${a.routerG1} ${a.lan1.mask}`, 'no shutdown'],
    },
    ...security(R),
    { device: R, task: `Ustaw minimalną długość haseł na ${c.minLength} (Part 4, Step 1c).`, lines: [`security passwords min-length ${c.minLength}`] },
    ...ssh(R),
    finish(R),

    ...common(S),
    { device: S, task: `Ustaw nazwę przełącznika: ${S} (Part 3, Step 1c).`, lines: [`hostname ${S}`] },
    banner(S),
    consoleLine(S),
    {
      device: S,
      task: `Skonfiguruj interfejs SVI VLAN 1: opis, adres ${a.svi} (drugi adres LAN 1) i włącz go (Part 3, Step 2b).`,
      lines: ['interface vlan 1', desc('description Switch Subnet A'), `ip address ${a.svi} ${a.lan1.mask}`, 'no shutdown'],
    },
    {
      device: S,
      task: 'Przełącznik ma być osiągalny z innych sieci – ustaw bramę domyślną (Part 3, Step 2b).',
      lines: [`ip default-gateway ${a.routerG1}`],
    },
    ...security(S),
    ...ssh(S),
    {
      device: S,
      task: `Wyłącz wszystkie nieużywane porty i dodaj im opis (Part 4, Step 3). Używane są tylko F0/5 (router) i F0/6 (${s.pcA}).`,
      lines: [
        { range: 'fastethernet 0/1 - 4, fastethernet 0/7 - 24, gigabitethernet 0/1 - 2' },
        desc('description Unused switch ports'),
        'shutdown',
      ],
    },
    finish(S),
  ];
}

// --- normalization of IOS commands (abbreviations, spacing, case) ---

// abbreviation -> full keyword, by the previous word ('' = first word of the command)
const ABBR = {
  '': {
    en: 'enable', ena: 'enable', conf: 'configure', config: 'configure', int: 'interface', inter: 'interface',
    desc: 'description', descr: 'description', serv: 'service', user: 'username', trans: 'transport',
    sec: 'security', shut: 'shutdown', sh: 'shutdown', wr: 'write', host: 'hostname', hostn: 'hostname',
    ban: 'banner', li: 'line', lin: 'line', log: 'login', pass: 'password', passw: 'password', ex: 'exit', exi: 'exit',
  },
  configure: { t: 'terminal', term: 'terminal' },
  line: { con: 'console', cons: 'console' },
  service: { 'password-enc': 'password-encryption', 'password-encrypt': 'password-encryption' },
  ip: { add: 'address', addr: 'address', def: 'default-gateway', 'default-g': 'default-gateway', 'default-gate': 'default-gateway' },
  no: { shut: 'shutdown', sh: 'shutdown' },
  transport: { in: 'input', inp: 'input' },
  security: { pass: 'passwords', passw: 'passwords', password: 'passwords' },
  passwords: { min: 'min-length' },
  key: { gen: 'generate' },
  rsa: { gen: 'general-keys', general: 'general-keys', mod: 'modulus' },
  'general-keys': { mod: 'modulus' },
  copy: { run: 'running-config', running: 'running-config' },
  'running-config': { start: 'startup-config', startup: 'startup-config' },
  write: { mem: 'memory' },
  login: { loc: 'local' },
  banner: { mot: 'motd' },
};

const IFACE = [
  [/^(g|gi|gig|giga|gigabit|gigabitethernet)(?=\d)/, 'gigabitethernet '],
  [/^(f|fa|fas|fast|fastethernet)(?=\d)/, 'fastethernet '],
  [/^(vl|vla|vlan)(?=\d)/, 'vlan '],
];

// arguments that keep their case: passwords, secrets, names
const KEEP_CASE = new Set(['password', 'secret', 'hostname', 'username']);

export function normalize(line) {
  const raw = line.trim().replace(/\s+/g, ' ');
  // free text: only the keyword is normalized
  const free = raw.match(/^(desc|descr|description|ban|banner)\s+(.*)$/i);
  if (free) {
    const kw = /^b/i.test(free[1]) ? 'banner' : 'description';
    return `${kw} ${kw === 'banner' ? free[2].replace(/^motd?\b/i, 'motd') : free[2]}`;
  }
  const tokens = raw
    .replace(/\bdomain[ -](lookup|name)\b/gi, 'domain-$1')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 - $2')
    .replace(/\s*,\s*/g, ' , ')
    .split(' ');
  const out = [];
  for (const token of tokens) {
    const prev = out.length ? out[out.length - 1] : '';
    if (KEEP_CASE.has(prev)) {
      out.push(token);
      continue;
    }
    let word = token.toLowerCase();
    if (['interface', 'range', ','].includes(prev)) for (const [re, full] of IFACE) word = word.replace(re, full);
    out.push(ABBR[prev]?.[word] ?? word);
  }
  return out.join(' ').replace(/ , /g, ', ').replace(/\s+/g, ' ');
}

// "fastethernet 0/1 - 4, gigabitethernet 0/1 - 2" -> Set of "fastethernet0/1", ...
function rangePorts(spec) {
  const ports = new Set();
  let type = '';
  for (const part of spec.split(',')) {
    const m = part.trim().match(/^(?:([a-z]+)\s*)?(\d+\/(?:\d+\/)?)(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) return null;
    if (m[1]) type = m[1];
    const from = +m[3];
    const to = m[4] ? +m[4] : from;
    for (let n = from; n <= to; n++) ports.add(`${type}${m[2]}${n}`);
  }
  return ports;
}

function matchLine(expected, line) {
  if (typeof expected === 'string') return line === normalize(expected);
  if (expected.any) return expected.any.some((e) => line === normalize(e));
  if (expected.pattern) return expected.pattern.test(line);
  if (expected.range) {
    const m = line.match(/^interface range (.+)$/);
    const want = rangePorts(normalize(`interface range ${expected.range}`).replace(/^interface range /, ''));
    const got = m && rangePorts(m[1]);
    return !!got && got.size === want.size && [...want].every((p) => got.has(p));
  }
  return false;
}

export const showLine = (e) =>
  typeof e === 'string' ? e : e.any ? e.any[0] : e.show ?? `interface range ${e.range}`;

// Checks the learner's answer for one step. "exit" lines are optional.
export function checkStep(step, text) {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^\S+[>#]\s*/, '')) // pasted prompts such as R1(config)#
    .filter((l) => l.trim() && !l.trim().startsWith('!'))
    .map(normalize)
    .filter((l) => l !== 'exit');
  const want = step.lines;
  const results = want.map((e, i) => matchLine(e, lines[i] ?? ''));
  return { ok: lines.length === want.length && results.every(Boolean), results, extra: Math.max(0, lines.length - want.length) };
}

// Full answer scripts (paste at the Router> / Switch> prompt)
export function script(s, device) {
  const list = steps(s).filter((st) => st.device === device);
  const out = [];
  for (const st of list) {
    const lines = st.lines.map(showLine);
    out.push(`! ${st.task}`);
    out.push(...lines.map((l, i) => (i > 0 && /^(interface|line)/.test(lines[0]) ? ` ${l}` : l)));
    if (/^(interface|line)/.test(lines[0])) out.push(' exit');
    out.push('');
  }
  return out.join('\n').trim() + '\n';
}

export function hostSettings(s) {
  const a = addressing(s);
  return [
    { name: s.pcA, ip: a.pcA, mask: a.lan1.mask, gateway: a.routerG1 },
    { name: s.pcB, ip: a.pcB, mask: a.lan2.mask, gateway: a.routerG0 },
  ];
}
