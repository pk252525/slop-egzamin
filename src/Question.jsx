import { NONE, imageUrl } from './lib';

export function Exhibit({ q }) {
  return (
    <>
      {q.images?.map((src) => (
        <figure key={src} className="figure">
          <a href={imageUrl(src)} target="_blank" rel="noreferrer" title="Otwórz w pełnym rozmiarze">
            <img src={imageUrl(src)} alt="Ilustracja do pytania" loading="lazy" />
          </a>
        </figure>
      ))}
      {q.exhibit && <pre className="exhibit">{q.exhibit}</pre>}
    </>
  );
}

export function QuestionMeta({ q }) {
  return (
    <div className="meta">
      <span className="tag">#{q.id}</span>
      {q.topic && <span className="tag">Topic {q.topic}</span>}
      {q.type === 'match' && <span className="tag">dopasowanie</span>}
      {q.unverified && <span className="tag warn">niezweryfikowane</span>}
    </div>
  );
}

export default function Question({ q, answer, onChange, revealed }) {
  const multi = q.type === 'choice' && q.correct.length > 1;

  return (
    <div className="question">
      <QuestionMeta q={q} />
      <h2>{q.question}</h2>
      <Exhibit q={q} />
      {q.question2 && <h2>{q.question2}</h2>}

      {q.type === 'choice' ? (
        <>
          <p className="hint">
            {multi ? `Zaznacz ${q.correct.length} odpowiedzi` : 'Zaznacz jedną odpowiedź'}
          </p>
          <div className="options">
            {q.order.map((i, pos) => {
              const selected = (answer || []).includes(i);
              const correct = q.correct.includes(i);
              let cls = 'option';
              if (selected) cls += ' selected';
              if (revealed && correct) cls += ' correct';
              if (revealed && selected && !correct) cls += ' wrong';
              return (
                <button
                  key={i}
                  className={cls}
                  disabled={revealed}
                  onClick={() => {
                    const cur = answer || [];
                    if (multi) {
                      onChange(selected ? cur.filter((x) => x !== i) : [...cur, i]);
                    } else {
                      onChange([i]);
                    }
                  }}
                >
                  <span className="key">{pos + 1}</span>
                  <span>{q.options[i]}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="hint">Dopasuj każdy element do właściwej odpowiedzi</p>
          <div className="pairs">
            {q.leftOrder.map((i) => {
              const val = (answer || {})[i] || '';
              const expected = q.pairs[i].right ?? NONE;
              let cls = 'pair';
              if (revealed) cls += val === expected ? ' correct' : ' wrong';
              return (
                <div key={i} className={cls}>
                  <div className="left">{q.pairs[i].left}</div>
                  <select
                    value={val}
                    disabled={revealed}
                    onChange={(e) => onChange({ ...(answer || {}), [i]: e.target.value })}
                  >
                    <option value="">— wybierz —</option>
                    {q.choices.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {revealed && val !== expected && <div className="expected">✓ {expected}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {revealed && (q.explanation || q.note) && (
        <div className="explanation">
          {q.explanation && <p>{q.explanation}</p>}
          {q.note && <p className="note">Uwaga z weryfikacji: {q.note}</p>}
        </div>
      )}
    </div>
  );
}
