import { useMemo, useState } from 'react';
import { answerIsFilled, quizProgress } from '../../store/selectors';
import { Button, Progress, Textarea } from '../ui';

/**
 * Questionnaire de diagnostic : une question à la fois (carrousel).
 * Contrôlé : `reponses` = doc.reponses, `onAnswer(questionId, valeur)`.
 */
export function QuizStep({ questions, reponses, onAnswer, onDone, doneLabel = 'Continuer' }) {
  const [index, setIndex] = useState(() => {
    const firstUnanswered = questions.findIndex((q) => !answerIsFilled(reponses[q.id]));
    return firstUnanswered === -1 ? 0 : firstUnanswered;
  });
  const [dir, setDir] = useState('fwd');
  const progress = quizProgress(reponses, questions);
  const question = questions[index];

  const goto = (i, direction = 'fwd') => {
    if (i < 0 || i >= questions.length) return;
    setDir(direction);
    setIndex(i);
  };

  return (
    <div className="quiz">
      <div className="quiz-progress">
        <span>Question {index + 1}/{questions.length}</span>
        <Progress value={(progress.answered / progress.total) * 100} />
        <span>{progress.answered}/{progress.total}</span>
      </div>
      <div className="quiz-dots">
        {questions.map((q, i) => (
          <button key={q.id} type="button" className={`quiz-dot ${answerIsFilled(reponses[q.id]) ? 'is-answered' : ''} ${i === index ? 'is-current' : ''}`} onClick={() => goto(i, i > index ? 'fwd' : 'back')} title={q.texte}>
            {answerIsFilled(reponses[q.id]) && i !== index ? <i className="fa-solid fa-check" /> : i + 1}
          </button>
        ))}
      </div>

      <div className="card quiz-card">
        <div key={question.id} className={`quiz-body ${dir === 'back' ? 'back' : ''}`}>
          <h3 className="question-text">{question.texte}</h3>
          {question.aide && <p className="muted small mb-2">{question.aide}</p>}
          <AnswerField question={question} value={reponses[question.id]} onChange={(v) => onAnswer(question.id, v)} />
        </div>
        <div className="quiz-nav">
          <Button variant="default" icon="fa-solid fa-arrow-left" disabled={index === 0} onClick={() => goto(index - 1, 'back')}>Précédent</Button>
          {index === questions.length - 1
            ? <Button variant="primary" iconRight="fa-solid fa-arrow-right" onClick={onDone}>{doneLabel}</Button>
            : <Button variant="primary" iconRight="fa-solid fa-arrow-right" onClick={() => goto(index + 1, 'fwd')}>Suivant</Button>}
        </div>
      </div>
    </div>
  );
}

function AnswerField({ question, value, onChange }) {
  const list = useMemo(() => (Array.isArray(value) ? value : value ? [value] : []), [value]);
  if (question.type === 'choix_multiple') {
    return (
      <div className="options-grid">
        {question.options.map((opt) => {
          const checked = list.includes(opt);
          return (
            <label key={opt} className={`option ${checked ? 'is-checked' : ''}`}>
              <input type="checkbox" checked={checked} onChange={() => onChange(checked ? list.filter((o) => o !== opt) : [...list, opt])} />
              <span className="box">{checked && <i className="fa-solid fa-check" />}</span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'choix_unique') {
    return (
      <div className="options-grid">
        {question.options.map((opt) => {
          const checked = value === opt;
          return (
            <label key={opt} className={`option radio ${checked ? 'is-checked' : ''}`}>
              <input type="radio" name={question.id} checked={checked} onChange={() => onChange(opt)} />
              <span className="box">{checked && <i className="fa-solid fa-check" />}</span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'oui_non') {
    return (
      <div className="options-row">
        {['Oui', 'Non'].map((opt) => {
          const checked = value === opt;
          return (
            <label key={opt} className={`option radio ${checked ? 'is-checked' : ''}`}>
              <input type="radio" name={question.id} checked={checked} onChange={() => onChange(opt)} />
              <span className="box">{checked && <i className="fa-solid fa-check" />}</span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }
  return <Textarea rows={3} placeholder="Notez la réponse…" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}
