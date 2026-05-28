import styles from './Plan.module.css';

export default function Plan({ destination: dest, onBack, onRestart }) {
  const { plan } = dest;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.logo}>NomadBase</span>
        <span />
      </div>

      <main className={styles.main}>
        <div className={styles.hero}>
          <span className={styles.flag}>{dest.emoji}</span>
          <div>
            <h1 className={styles.city}>{dest.name} Plan</h1>
            <p className={styles.sub}>Your complete guide to getting started</p>
          </div>
        </div>

        <Section title="Best Neighborhoods">
          <ul className={styles.list}>
            {plan.neighborhoods.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </Section>

        <Section title="Top Co-working Spaces">
          <ul className={styles.list}>
            {plan.coworking.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </Section>

        <Section title="Accommodation">
          <p className={styles.text}>{plan.accommodation}</p>
        </Section>

        <Section title="Internet & Connectivity">
          <p className={styles.text}>{plan.wifi}</p>
        </Section>

        <Section title="Visa Info">
          <p className={styles.text}>{plan.visa}</p>
        </Section>

        <Section title="Finding the Community">
          <p className={styles.text}>{plan.community}</p>
        </Section>

        <Section title="Your First Week — Step by Step">
          <ol className={styles.checklist}>
            {plan.firstWeek.map((step, i) => (
              <li key={i} className={styles.checkItem}>
                <span className={styles.stepDot}>{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <button className={styles.restartBtn} onClick={onRestart}>
          ↩ Start over with a new destination
        </button>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}
