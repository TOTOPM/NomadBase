import { getMatchReasons, getMatchBreakdown } from '../utils/scoring';
import RouteMotif from './RouteMotif';
import { IconCheck } from './icons';
import styles from './Result.module.css';

export default function Result({ top, all, answers, onViewPlan, onRestart }) {
  const reasons = getMatchReasons(top, answers);
  const breakdown = getMatchBreakdown(top, answers);
  const runners = all.slice(1, 3);
  const topScore = all[0]?.score || 1;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onRestart}>← Start over</button>
        <span className={styles.logo}>NomadBase</span>
        <span />
      </div>
      <RouteMotif />

      <main className={styles.main}>
        <div className={styles.content}>
          <p className={styles.intro}>Based on your answers, your perfect first destination is…</p>
        </div>

        <div className={styles.photoFull} style={{ backgroundImage: `url(${top.image})` }}>
          <div className={styles.photoOverlay} />
          <div className={styles.photoInner}>
            <h1 className={styles.city}>{top.name}</h1>
            <p className={styles.country}>{top.country}</p>
          </div>
        </div>

        <div className={`${styles.content} ${styles.contentGap}`}>
          <div className={styles.factRow}>
            <p className={styles.tagline}>{top.tagline}</p>
            <div className={styles.budget}>
              <span className={styles.budgetLabel}>Estimated cost</span>
              <span className={styles.budgetValue}>{top.budgetRange}</span>
            </div>
          </div>

          <div className={styles.breakdown}>
            <h2 className={styles.reasonsTitle}>Your match, by the numbers</h2>
            <div className={styles.barList}>
              {breakdown.map((b, i) => (
                <div key={i} className={styles.barRow}>
                  <div className={styles.barLabelRow}>
                    <span className={styles.barLabel}>{b.label}</span>
                    <span className={styles.barValue}>{b.value}/10</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${Math.min(b.value, 10) * 10}%`, animationDelay: `${i * 0.1}s` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reasons}>
            <h2 className={styles.reasonsTitleLoose}>Why this matches you</h2>
            <div className={styles.chipList}>
              {reasons.map((r, i) => (
                <span key={i} className={styles.chip}>
                  <span className={styles.chipCheck}><IconCheck /></span>
                  {r}
                </span>
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
                    <div
                      className={styles.altPhoto}
                      style={{ backgroundImage: `url(${dest.image})` }}
                    />
                    <div className={styles.altBody}>
                      <p className={styles.altCity}>{dest.name}</p>
                      <p className={styles.altCountry}>{dest.country}</p>
                    </div>
                    <div className={styles.altScore}>
                      {Math.round((dest.score / topScore) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
