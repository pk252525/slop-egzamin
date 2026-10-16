import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SCENARIOS,
  COMMON,
  addressing,
  addressingFields,
  randomScenario,
  prefixFor,
  steps,
  checkStep,
  showLine,
  script,
  hostSettings,
} from './ptsa';

const TABS = [
  ['zadanie', 'Zadanie'],
  ['adresacja', 'Adresacja'],
  ['komendy', 'Komendy'],
  ['skrypty', 'Rozwiązanie'],
];

function remembered(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function remember(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export default function Lab({ exam }) {
  const [tab, setTab] = useState(() => remembered('grypser-lab-tab', 'zadanie'));
  const [scenarioId, setScenarioId] = useState(() => remembered('grypser-lab-scenario', SCENARIOS[0].id));
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  useEffect(() => remember('grypser-lab-tab', tab), [tab]);
  useEffect(() => remember('grypser-lab-scenario', scenarioId), [scenarioId]);

  return (
    <main className="home lab">
      <a className="back" href="#/">
        ← Wszystkie egzaminy
      </a>
      <h1>{exam.title}</h1>
      <p className="lead">
        Zadanie praktyczne w Packet Tracerze: podział sieci na dwie podsieci, podstawowa konfiguracja
        routera i przełącznika, zabezpieczenia i SSH. Na egzaminie dostaniesz jeden z trzech scenariuszy –
        różnią się nazwami urządzeń, adresem sieci, liczbą hostów i hasłem enable secret.
      </p>

      <div className="lab-bar">
        <label>
          Scenariusz{' '}
          <select value={scenario.id} onChange={(e) => setScenarioId(e.target.value)}>
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}: {s.router} / {s.switch}, {s.network}/24
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'zadanie' && <Task s={scenario} />}
      {tab === 'adresacja' && <Addressing key={scenario.id} s={scenario} />}
      {tab === 'komendy' && <Commands key={scenario.id} s={scenario} />}
      {tab === 'skrypty' && <Scripts s={scenario} />}

      <footer>
        Źródło:{' '}
        <a href={exam.source} target="_blank" rel="noreferrer">
          itexamanswers.net
        </a>
        . Skrypty w zakładce „Rozwiązanie” są zgodne z kluczem odpowiedzi ze źródła dla każdego scenariusza.
      </footer>
    </main>
  );
}

function Task({ s }) {
  return (
    <section className="lab-section prose">
      <h2>Topologia i nazwy urządzeń</h2>
      <pre className="exhibit">{`${s.pcA} ── F0/6 [${s.switch}] F0/5 ── G0/0/1 [${s.router}] G0/0/0 ── ${s.pcB}`}</pre>
      <table className="data">
        <tbody>
          <tr>
            <th>Sieć</th>
            <td>{s.network}/24</td>
          </tr>
          <tr>
            <th>LAN 1 (pierwsza podsieć)</th>
            <td>{s.lan1Hosts} hostów – za G0/0/1</td>
          </tr>
          <tr>
            <th>LAN 2</th>
            <td>{s.lan2Hosts} hostów – za G0/0/0</td>
          </tr>
          <tr>
            <th>Hasło enable secret</th>
            <td>
              <code>{s.secret}</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Part 1 – Budowa sieci</h2>
      <p>
        Umieść router i przełącznik w szafie, połącz urządzenia kablami miedzianymi prostymi (straight-through)
        zgodnie z topologią, włącz router i komputery.
      </p>

      <h2>Part 2 – Plan adresacji</h2>
      <ul>
        <li>Podziel {s.network}/24 na dwie podsieci: LAN 1 ({s.lan1Hosts} hostów) jako pierwszą, potem LAN 2 ({s.lan2Hosts} hostów).</li>
        <li>Pierwszy adres każdej podsieci → interfejs routera (LAN 1: G0/0/1, LAN 2: G0/0/0).</li>
        <li>Ostatni adres każdej podsieci → komputer ({s.pcA} w LAN 1, {s.pcB} w LAN 2).</li>
        <li>Drugi adres LAN 1 → SVI przełącznika {s.switch}.</li>
      </ul>

      <h2>Part 3 – Podstawowa konfiguracja</h2>
      <ul>
        <li>Wyłącz DNS lookup, nadaj nazwy {s.router} i {s.switch}, ustaw baner.</li>
        <li>Hasło konsoli: <code>{COMMON.consolePassword}</code>.</li>
        <li>Interfejsy routera i SVI przełącznika: opis + adres; przełącznik ma być osiągalny z innych sieci.</li>
      </ul>

      <h2>Part 4 – Zabezpieczenia</h2>
      <ul>
        <li>
          Zaszyfrowane hasło trybu uprzywilejowanego <code>{s.secret}</code>, szyfrowanie wszystkich haseł,
          minimalna długość hasła {COMMON.minLength} (tylko router).
        </li>
        <li>
          SSH na obu urządzeniach: domena <code>{COMMON.domain}</code>, użytkownik <code>{COMMON.user}</code> z hasłem
          secret <code>{COMMON.userSecret}</code>, logowanie vty z lokalnej bazy, tylko SSH, klucz RSA {COMMON.rsaBits}{' '}
          bitów.
        </li>
        <li>Wyłącz nieużywane porty przełącznika i dodaj im opis.</li>
      </ul>

      <h2>Part 5 – Komputery</h2>
      <p>Skonfiguruj {s.pcA} i {s.pcB} adresami z części 2 i sprawdź łączność.</p>
    </section>
  );
}

function Addressing({ s: initial }) {
  const [s, setS] = useState(initial);
  const [values, setValues] = useState({});
  const [checked, setChecked] = useState(false);
  const fields = useMemo(() => addressingFields(s), [s]);
  const a = addressing(s);
  const norm = (v) => (v || '').trim().replace(/\s+/g, '').replace(/^\//, '');
  const ok = (key, expected) => norm(values[key]) === norm(expected);
  const score = fields.filter(([k, , e]) => ok(k, e)).length;

  function newTask(next) {
    setS(next);
    setValues({});
    setChecked(false);
  }

  const bits = (hosts) => 32 - prefixFor(hosts);

  return (
    <section className="lab-section">
      <p className="hint">
        {s.id === 'losowy' ? 'Losowe zadanie' : s.name}: sieć {s.network}/24, LAN 1 – {s.lan1Hosts} hostów, LAN 2 –{' '}
        {s.lan2Hosts} hostów. Wpisz adresy, prefiks w formacie <code>adres/prefiks</code>.
      </p>
      <div className="fields">
        {fields.map(([key, label, expected]) => (
          <label key={key} className={'field' + (checked ? (ok(key, expected) ? ' correct' : ' wrong') : '')}>
            <span>{label}</span>
            <input
              value={values[key] || ''}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
              spellCheck={false}
              autoComplete="off"
              inputMode="decimal"
            />
            {checked && !ok(key, expected) && <span className="expected">✓ {expected}</span>}
          </label>
        ))}
      </div>

      {checked && (
        <>
          <div className={'verdict ' + (score === fields.length ? 'ok' : 'bad')}>
            {score}/{fields.length} poprawnie
          </div>
          <div className="explanation">
            <p>
              LAN 1: {s.lan1Hosts} hostów wymaga {bits(s.lan1Hosts)} bitów hosta (2^{bits(s.lan1Hosts)} − 2 ={' '}
              {2 ** bits(s.lan1Hosts) - 2}), więc /{a.lan1.prefix} ({a.lan1.mask}): {a.lan1.network} – {a.lan1.broadcast}.
            </p>
            <p>
              LAN 2: {s.lan2Hosts} hostów wymaga {bits(s.lan2Hosts)} bitów hosta (2^{bits(s.lan2Hosts)} − 2 ={' '}
              {2 ** bits(s.lan2Hosts) - 2}), więc /{a.lan2.prefix} ({a.lan2.mask}): zaczyna się zaraz po LAN 1,{' '}
              {a.lan2.network} – {a.lan2.broadcast}.
            </p>
            <p>
              Bramy domyślne: {s.pcA} → {a.routerG1}, {s.pcB} → {a.routerG0}, {s.switch} → {a.routerG1}.
            </p>
          </div>
        </>
      )}

      <div className="actions">
        <button onClick={() => newTask(randomScenario())}>Losowe zadanie</button>
        {s !== initial && <button onClick={() => newTask(initial)}>Wróć do scenariusza</button>}
        {checked ? (
          <button className="primary" onClick={() => setValues(Object.fromEntries(fields.map(([k, , e]) => [k, e])))}>
            Pokaż rozwiązanie
          </button>
        ) : (
          <button className="primary" onClick={() => setChecked(true)}>
            Sprawdź
          </button>
        )}
      </div>
    </section>
  );
}

function Commands({ s }) {
  const all = useMemo(() => steps(s), [s]);
  const [device, setDevice] = useState('all');
  const list = device === 'all' ? all : all.filter((st) => st.device === device);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({});
  const ref = useRef(null);
  const step = list[idx];

  useEffect(() => ref.current?.focus(), [idx, device]);

  // only the first attempt at a step counts
  function check(r = checkStep(step, text)) {
    const key = step.device + step.task;
    setResult(r);
    setScore((sc) => (key in sc ? sc : { ...sc, [key]: r.ok }));
  }

  function go(i) {
    setIdx(i);
    setText('');
    setResult(null);
  }

  const done = Object.values(score);
  const finished = idx >= list.length;

  return (
    <section className="lab-section">
      <div className="toolbar">
        <select
          value={device}
          onChange={(e) => {
            setDevice(e.target.value);
            go(0);
          }}
          aria-label="Urządzenie"
        >
          <option value="all">Router i przełącznik</option>
          <option value={s.router}>Tylko {s.router}</option>
          <option value={s.switch}>Tylko {s.switch}</option>
        </select>
        <span>
          {finished ? 'koniec' : `krok ${idx + 1}/${list.length}`} · dobrze {done.filter(Boolean).length}/{done.length}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${(Math.min(idx + 1, list.length) / list.length) * 100}%` }} />
      </div>

      {finished ? (
        <div>
          <p>
            Koniec ćwiczenia: {done.filter(Boolean).length} z {done.length} kroków za pierwszym podejściem.
          </p>
          <div className="actions">
            <button
              className="primary"
              onClick={() => {
                setScore({});
                go(0);
              }}
            >
              Od początku
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="meta">
            <span className="tag">{step.device}</span>
            <span className="tag">{step.lines.length === 1 ? '1 komenda' : `${step.lines.length} komendy`}</span>
          </div>
          <h2 className="step-task">{step.task}</h2>
          <textarea
            ref={ref}
            className="cli"
            rows={Math.max(2, step.lines.length + 1)}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                result ? go(idx + 1) : check();
              }
            }}
            placeholder={`${step.device}(config)# …  (jedna komenda w linii, skróty typu "int g0/0/0" są OK)`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
          {result && (
            <>
              <div className={'verdict ' + (result.ok ? 'ok' : 'bad')}>
                {result.ok ? 'Poprawnie.' : 'Nie do końca. Wzorcowe komendy:'}
              </div>
              <pre className="exhibit solution">
                {step.lines.map((l, i) => (
                  <span key={i} className={result.results[i] ? 'line-ok' : 'line-bad'}>
                    {showLine(l)}
                    {'\n'}
                  </span>
                ))}
              </pre>
              {result.extra > 0 && <p className="note">Wpisano {result.extra} komend(y) za dużo.</p>}
            </>
          )}
          <div className="actions">
            <button disabled={idx === 0} onClick={() => go(idx - 1)}>
              ← Wstecz
            </button>
            {!result && <button onClick={() => check({ ok: false, results: [], extra: 0 })}>Pokaż odpowiedź</button>}
            {result ? (
              <button className="primary" onClick={() => go(idx + 1)}>
                Dalej →
              </button>
            ) : (
              <button className="primary" disabled={!text.trim()} onClick={() => check()}>
                Sprawdź
              </button>
            )}
          </div>
          <p className="hint">
            <kbd>Ctrl</kbd>+<kbd>Enter</kbd> sprawdza / przechodzi dalej. Komendy <code>exit</code> są opcjonalne.
          </p>
        </>
      )}
    </section>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="link"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
    >
      {copied ? 'skopiowano' : 'kopiuj'}
    </button>
  );
}

function Scripts({ s }) {
  const a = addressing(s);
  const blocks = [
    [`Router ${s.router}`, `Konsola z ${s.pcA}, Desktop › Terminal, wklej przy znaku zachęty Router>.`, script(s, s.router)],
    [`Przełącznik ${s.switch}`, `Konsola z ${s.pcB}, Desktop › Terminal, wklej przy znaku zachęty Switch>.`, script(s, s.switch)],
  ];
  return (
    <section className="lab-section">
      <h2>Adresacja</h2>
      <table className="data">
        <tbody>
          <tr>
            <th>LAN 1</th>
            <td>
              {a.lan1.network}/{a.lan1.prefix} ({a.lan1.mask})
            </td>
          </tr>
          <tr>
            <th>LAN 2</th>
            <td>
              {a.lan2.network}/{a.lan2.prefix} ({a.lan2.mask})
            </td>
          </tr>
          <tr>
            <th>{s.router} G0/0/1 / G0/0/0</th>
            <td>
              {a.routerG1} / {a.routerG0}
            </td>
          </tr>
          <tr>
            <th>{s.switch} SVI</th>
            <td>{a.svi}</td>
          </tr>
        </tbody>
      </table>

      {blocks.map(([title, how, text]) => (
        <div key={title}>
          <div className="script-head">
            <h2>{title}</h2>
            <CopyButton text={text} />
          </div>
          <p className="hint">{how}</p>
          <pre className="exhibit">{text}</pre>
        </div>
      ))}

      <h2>Komputery (Desktop › IP Configuration)</h2>
      <table className="data">
        <thead>
          <tr>
            <th>Host</th>
            <th>Adres IP</th>
            <th>Maska</th>
            <th>Brama</th>
          </tr>
        </thead>
        <tbody>
          {hostSettings(s).map((h) => (
            <tr key={h.name}>
              <td>{h.name}</td>
              <td>{h.ip}</td>
              <td>{h.mask}</td>
              <td>{h.gateway}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        Weryfikacja: <code>show ip interface brief</code>, <code>show ip ssh</code>, ping między komputerami,{' '}
        <code>
          ssh -l {COMMON.user} {a.routerG1}
        </code>{' '}
        z {s.pcA}.
      </p>
    </section>
  );
}
