import { useState } from 'react';
import { questions } from '../data/questions';
import styles from './Agent.module.css';

const SLIDE = {
  enter: 'slideEnter',
  enterRight: 'slideEnterRight',
  enterLeft: 'slideEnterLeft',
  exitLeft: 'slideExitLeft',
  exitRight: 'slideExitRight',
};

export default function Agent({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [anim, setAnim] = useState(SLIDE.enter);

  const current = questions[step];

  function transition(newStep, dir) {
    setAnim(dir === 'forward' ? SLIDE.exitLeft : SLIDE.exitRight);
    setTimeout(() => {
      setStep(newStep);
      setAnim(dir === 'forward' ? SLIDE.enterRight : SLIDE.enterLeft);
    }, 170);
  }

  function handleAnswer(value) {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      transition(step + 1, 'forward');
    } else {
      onComplete(newAnswers);
    }
  }

  function handleBack() {
    if (step === 0) {
      onBack();
    } else {
      transition(step - 1, 'back');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          ← Back
        </button>
        <span className={styles.logo}>NomadBase</span>
        <span className={styles.stepCount}>{step + 1} / {questions.length}</span>
      </div>

      <div className={styles.dots}>
        {questions.map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < step ? styles.dotDone : ''} ${i === step ? styles.dotActive : ''}`}
          />
        ))}
      </div>

      <main className={styles.main}>
        <div className={`${styles.card} ${styles[anim]}`}>
          <div className={styles.agentBubble}>
            <div className={styles.avatar}>N</div>
            <div className={styles.question}>{current.question}</div>
          </div>

          <div className={styles.options}>
            {current.options.map(opt => (
              <button
                key={opt.value}
                className={`${styles.option} ${answers[current.id] === opt.value ? styles.optionSelected : ''}`}
                onClick={() => handleAnswer(opt.value)}
              >
                {answers[current.id] === opt.value && (
                  <span className={styles.checkmark}>✓</span>
                )}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
