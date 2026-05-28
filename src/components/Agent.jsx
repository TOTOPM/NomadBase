import { useState } from 'react';
import { questions } from '../data/questions';
import styles from './Agent.module.css';

export default function Agent({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = questions[step];
  const progress = ((step) / questions.length) * 100;

  function handleAnswer(value) {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  }

  function handleBack() {
    if (step === 0) {
      onBack();
    } else {
      setStep(step - 1);
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

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <main className={styles.main}>
        <div className={styles.agentBubble}>
          <div className={styles.avatar}>N</div>
          <div className={styles.question}>{current.question}</div>
        </div>

        <div className={styles.options}>
          {current.options.map(opt => (
            <button
              key={opt.value}
              className={styles.option}
              onClick={() => handleAnswer(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
