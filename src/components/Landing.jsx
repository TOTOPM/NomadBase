import Globe from './Globe';
import styles from './Landing.module.css';

export default function Landing({ onStart }) {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <span className={styles.logo}>NomadBase</span>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>AI-Powered Planning</div>
          <h1 className={styles.headline}>
            Find your path,<br />anywhere.
          </h1>
          <p className={styles.sub}>
            Answer a few questions and our agent will recommend your perfect
            first nomad destination — then build you a complete plan to get there.
          </p>
          <button className={styles.cta} onClick={onStart}>
            Start Planning →
          </button>
        </div>

        <div className={styles.globeSection}>
          <p className={styles.globeLabel}>15 destinations · more coming soon</p>
          <Globe />
        </div>

        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>01</div>
            <h3>Answer a few questions</h3>
            <p>Budget, lifestyle, region, priorities — we learn what matters to you.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>02</div>
            <h3>Get your match</h3>
            <p>We recommend the destination that fits you best, with the reasons why.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>03</div>
            <h3>Your complete plan</h3>
            <p>Neighborhoods, co-working spaces, visa info, first-week checklist — all of it.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 NomadBase · Built for those who roam</p>
      </footer>
    </div>
  );
}
