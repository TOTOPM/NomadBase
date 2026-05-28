import { getMatchReasons } from '../utils/scoring';
import styles from './Result.module.css';

export default function Result({ top, all, answers, onViewPlan, onRestart }) {
  const reasons = getMatchReasons(top, answers);
  const runners = all.slice(1, 3);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onRestart}>← Start over</button>
        <span className={styles.logo}>NomadBase</span>
        <span />
      </div>

      <main className={styles.main}>
        <p className={styles.intro}>Based on your answers, your perfect first destination is…</p>

        <div className={styles.card}>
          <div className={styles.flag}>{top.emoji}</div>
          <div className={styles.cardBody}>
            <h1 className={styles.city}>{top.name}</h1>
            <p className={styles.country}>{top.country}</p>
            <p className={styles.tagline}>{top.tagline}</p>

            <div className={styles.budget}>
              <span className={styles.budgetLabel}>Estimated cost</span>
              <span className={styles.budgetValue}>{top.budgetRange}</span>
            </div>
          </div>
        </div>

        <div className={styles.reasons}>
          <h2 className={styles.reasonsTitle}>Why this matches you</h2>
          <div className={styles.reasonList}>
            {reasons.map((r, i) => (
              <div key={i} className={styles.reason}>
                <span className={styles.checkmark}>✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>

        <button className={styles.planBtn} onClick={onViewPlan}>
          See my full plan for {top.name} →
        </button>

        {runners.length > 0 && (
          <div className={styles.alternatives}>
            <p className={styles.altTitle}>Other strong matches</p>
            <div className={styles.altList}>
              {runners.map(dest => (
                <div key={dest.id} className={styles.altCard}>
                  <span className={styles.altFlag}>{dest.emoji}</span>
                  <div>
                    <p className={styles.altCity}>{dest.name}</p>
                    <p className={styles.altCountry}>{dest.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
