import { useEffect, useMemo, useState } from 'react';
import Question, { QuestionMeta } from './Question';
import {
  questions,
  prepare,
  shuffle,
  isCorrect,
  isComplete,
  loadStats,
  saveStats,
  record,
  NONE,
} from './lib';
import './App.css';

const SOURCE_URL =
  'https://itexamanswers.net/ccna-1-v7-modules-1-3-basic-network-connectivity-and-communications-exam-answers.html';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState(loadStats);
  const [shuffleOpts, setShuffleOpts] = useState(true);
  const [examSize, setExamSize] = useState(20);

  useEffect(() => saveStats(stats), [stats]);

  const mastered = questions.filter((q) => stats[q.id]?.streak >= 2).length;
  const wrongIds = questions.filter((q) => stats[q.id]?.last === false).map((q) => q.id);
  const seen = questions.filter((q) => stats[q.id]).length;

  function start(mode, list) {
    setSession({
      mode,
      items: list.map((q) => prepare(q, shuffleOpts)),
      idx: 0,
      answers: {},
      revealed: {},
    });
    setScreen('session');
  }

  return (
    <div className="app">
      <header>
        <button className="brand" onClick={() => setScreen('home')}>
          slop-egzamin
        </button>
        <span className="subtitle">CCNA 1 v7 · Modules 1–3</span>
      </header>

      {screen === 'home' && (
        <main className="home">
          <h1>Siskoł Nauka</h1>
          <p className="lead">
            {questions.length} pytań z egzaminu CCNA 1 v7, moduły 1–3: Basic Network Connectivity and Communications, z odpowiedziami i
            wyjaśnieniami. Odpowiedzi zostały zweryfikowane.
          </p>

          <dl className="stats">
            <Stat label="przerobione" value={`${seen}/${questions.length}`} />
            <Stat label="opanowane" value={`${mastered}/${questions.length}`} />
            <Stat label="do powtórki" value={wrongIds.length} />
          </dl>
          <div className="progress" title="Opanowane = 2 poprawne odpowiedzi z rzędu">
            <div style={{ width: `${(mastered / questions.length) * 100}%` }} />
          </div>

          <ol className="modes">
            <ModeCard
              title="Nauka"
              desc="Wszystkie pytania po kolei, wynik i wyjaśnienie od razu po każdej odpowiedzi."
              onClick={() => start('learn', questions)}
            />
            <ModeCard
              title="Nauka losowa"
              desc="Wszystkie pytania w losowej kolejności, z natychmiastowym sprawdzaniem."
              onClick={() => start('learn', shuffle(questions))}
            />
            <ModeCard
              title="Egzamin próbny"
              desc={`Losowe pytania bez podpowiedzi, wynik na końcu (zalicza się od 70%).`}
              onClick={() => start('exam', shuffle(questions).slice(0, examSize))}
            >
              <select
                value={examSize}
                
                onChange={(e) => setExamSize(+e.target.value)}
              >
                {[10, 20, 40, questions.length].map((n) => (
                  <option key={n} value={n}>
                    {n === questions.length ? `wszystkie (${n})` : `${n} pytań`}
                  </option>
                ))}
              </select>
            </ModeCard>
            <ModeCard
              title="Powtórka błędów"
              desc={
                wrongIds.length
                  ? `Pytania, na które ostatnio odpowiedziałeś źle (${wrongIds.length}).`
                  : 'Na razie nie masz błędnych odpowiedzi.'
              }
              disabled={!wrongIds.length}
              onClick={() =>
                start('learn', shuffle(questions.filter((q) => wrongIds.includes(q.id))))
              }
            />
            <ModeCard
              title="Przeglądaj"
              desc="Lista wszystkich pytań z poprawnymi odpowiedziami i wyszukiwarką."
              onClick={() => setScreen('browse')}
            />
          </ol>

          <div className="settings">
            <label>
              <input
                type="checkbox"
                checked={shuffleOpts}
                onChange={(e) => setShuffleOpts(e.target.checked)}
              />
              Mieszaj kolejność odpowiedzi
            </label>
            {seen > 0 && (
              <button
                className="link"
                onClick={() => confirm('Wyzerować postęp nauki?') && setStats({})}
              >
                Wyzeruj postęp
              </button>
            )}
          </div>

          <footer>
            Źródło pytań:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              itexamanswers.net
            </a>
            . Skróty: <kbd>1</kbd>–<kbd>6</kbd> zaznacza odpowiedź, <kbd>Enter</kbd> sprawdza
            / przechodzi dalej.
          </footer>
        </main>
      )}

      {screen === 'session' && session && (
        <Session
          session={session}
          setSession={setSession}
          onRecord={(id, ok) => setStats((s) => record(s, id, ok))}
          onFinish={() => setScreen('results')}
          onExit={() => setScreen('home')}
        />
      )}

      {screen === 'results' && session && (
        <Results session={session} onHome={() => setScreen('home')} />
      )}

      {screen === 'browse' && <Browse onHome={() => setScreen('home')} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ModeCard({ title, desc, onClick, disabled, children }) {
  return (
    <li className={'mode' + (disabled ? ' disabled' : '')}>
      <button className="mode-main" disabled={disabled} onClick={onClick}>
        <span className="mode-title">{title}</span>
        <span className="mode-desc">{desc}</span>
      </button>
      {children && <div className="mode-extra">{children}</div>}
    </li>
  );
}

function Session({ session, setSession, onRecord, onFinish, onExit }) {
  const { mode, items, idx, answers, revealed } = session;
  const q = items[idx];
  const answer = answers[idx];
  const isRevealed = mode === 'learn' && revealed[idx];
  const last = idx === items.length - 1;
  const answeredCount = Object.keys(answers).filter((i) => isComplete(items[i], answers[i])).length;

  const update = (patch) => setSession((s) => ({ ...s, ...patch }));
  const setAnswer = (a) => update({ answers: { ...answers, [idx]: a } });
  const go = (i) => update({ idx: i });

  function check() {
    if (!isComplete(q, answer)) return;
    onRecord(q.id, isCorrect(q, answer));
    update({ revealed: { ...revealed, [idx]: true } });
  }

  function finishExam() {
    const missing = items.length - answeredCount;
    if (missing && !confirm(`Bez odpowiedzi: ${missing}. Zakończyć egzamin?`)) return;
    items.forEach((it, i) => onRecord(it.id, isCorrect(it, answers[i])));
    onFinish();
  }

  function next() {
    if (!last) go(idx + 1);
    else if (mode === 'exam') finishExam();
    else onFinish();
  }

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'SELECT') return;
      const n = parseInt(e.key, 10);
      if (q.type === 'choice' && n >= 1 && n <= q.order.length && !isRevealed) {
        const i = q.order[n - 1];
        const cur = answer || [];
        if (q.correct.length > 1) setAnswer(cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]);
        else setAnswer([i]);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (mode === 'learn' && !isRevealed) check();
        else next();
      } else if (e.key === 'ArrowRight' && (mode === 'exam' || isRevealed) && !last) {
        go(idx + 1);
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        go(idx - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const correctSoFar = Object.keys(revealed).filter((i) => isCorrect(items[i], answers[i])).length;
  const result = isRevealed ? isCorrect(q, answer) : null;

  return (
    <main className="session">
      <div className="toolbar">
        <button className="link" onClick={onExit}>
          ← Menu
        </button>
        <span>
          {mode === 'exam' ? 'Egzamin' : 'Nauka'} · pytanie {idx + 1}/{items.length}
          {mode === 'learn' && Object.keys(revealed).length > 0 && (
            <> · dobrze {correctSoFar}/{Object.keys(revealed).length}</>
          )}
          {mode === 'exam' && <> · odpowiedziano {answeredCount}</>}
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${((idx + 1) / items.length) * 100}%` }} />
      </div>

      <Question key={idx} q={q} answer={answer} onChange={setAnswer} revealed={isRevealed} />

      {result !== null && (
        <div className={'verdict ' + (result ? 'ok' : 'bad')}>
          {result ? 'Poprawnie.' : 'Błędnie. Poprawna odpowiedź jest oznaczona na zielono.'}
        </div>
      )}

      <div className="actions">
        <button disabled={idx === 0} onClick={() => go(idx - 1)}>
          ← Wstecz
        </button>
        {mode === 'learn' && !isRevealed ? (
          <button className="primary" disabled={!isComplete(q, answer)} onClick={check}>
            Sprawdź
          </button>
        ) : (
          <button className="primary" onClick={next}>
            {last ? (mode === 'exam' ? 'Zakończ egzamin' : 'Podsumowanie') : 'Dalej →'}
          </button>
        )}
        {mode === 'exam' && !last && (
          <button onClick={finishExam}>Zakończ</button>
        )}
      </div>

      {mode === 'exam' && (
        <div className="dots">
          {items.map((it, i) => (
            <button
              key={i}
              className={
                'dot' + (i === idx ? ' current' : '') + (isComplete(it, answers[i]) ? ' done' : '')
              }
              onClick={() => go(i)}
              title={`Pytanie ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

function Results({ session, onHome }) {
  const { items, answers, mode } = session;
  const done = mode === 'exam' ? items.map((_, i) => i) : Object.keys(session.revealed).map(Number);
  const correct = done.filter((i) => isCorrect(items[i], answers[i])).length;
  const pct = done.length ? Math.round((correct / done.length) * 100) : 0;
  const [onlyWrong, setOnlyWrong] = useState(true);
  const shown = done.filter((i) => !onlyWrong || !isCorrect(items[i], answers[i]));

  return (
    <main className="results">
      <h1>{mode === 'exam' ? (pct >= 70 ? 'Zdane' : 'Niezdane') : 'Podsumowanie'}</h1>
      <div className="score">
        <strong>{pct}%</strong>
        <span>
          {correct} z {done.length} poprawnie
        </span>
      </div>
      <div className="actions">
        <button className="primary" onClick={onHome}>
          Wróć do menu
        </button>
        <label>
          <input type="checkbox" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} />
          pokaż tylko błędne
        </label>
      </div>
      {shown.map((i) => (
        <div key={i} className="review">
          <Question q={items[i]} answer={answers[i]} onChange={() => {}} revealed />
          <div className={'verdict ' + (isCorrect(items[i], answers[i]) ? 'ok' : 'bad')}>
            {isCorrect(items[i], answers[i]) ? 'Poprawnie' : 'Błędnie'}
          </div>
        </div>
      ))}
    </main>
  );
}

function Browse({ onHome }) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return questions;
    return questions.filter((q) =>
      JSON.stringify([q.question, q.question2, q.options, q.pairs, q.explanation])
        .toLowerCase()
        .includes(t),
    );
  }, [query]);

  return (
    <main className="browse">
      <div className="toolbar">
        <button className="link" onClick={onHome}>
          ← Menu
        </button>
        <input
          type="search"
          placeholder="Szukaj w pytaniach i odpowiedziach…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <span>{list.length}</span>
      </div>
      {list.map((q) => (
        <article key={q.id} className="browse-item">
          <QuestionMeta q={q} />
          <h2>{q.question}</h2>
          {q.exhibit && <pre className="exhibit">{q.exhibit}</pre>}
          {q.question2 && <h2>{q.question2}</h2>}
          {q.type === 'choice' ? (
            <ul>
              {q.options.map((o, i) => (
                <li key={i} className={q.correct.includes(i) ? 'correct' : ''}>
                  {o}
                </li>
              ))}
            </ul>
          ) : (
            <table>
              <tbody>
                {q.pairs.map((p, i) => (
                  <tr key={i}>
                    <td>{p.left}</td>
                    <td className="correct">{p.right ?? NONE}</td>
                  </tr>
                ))}
                {(q.distractors || []).map((d) => (
                  <tr key={d} className="unused">
                    <td>—</td>
                    <td>{d} (nieużywane)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {q.explanation && <p className="explanation-inline">{q.explanation}</p>}
          {q.note && <p className="note">Uwaga z weryfikacji: {q.note}</p>}
        </article>
      ))}
    </main>
  );
}
