import { useState } from 'react';
import RouteMotif from './RouteMotif';
import { IconPin, IconLaptop, IconHome, IconWifi, IconPassport, IconUsers, IconCheck } from './icons';
import styles from './Plan.module.css';

const SECTION_ICONS = {
  neighborhoods: IconPin,
  coworking: IconLaptop,
  accommodation: IconHome,
  wifi: IconWifi,
  visa: IconPassport,
  community: IconUsers,
};

export default function Plan({ destination: dest, onBack, onRestart }) {
  const { plan } = dest;
  const [checked, setChecked] = useState(() => plan.firstWeek.map(() => false));

  function toggleStep(i) {
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  const doneCount = checked.filter(Boolean).length;
  const progressPct = Math.round((doneCount / checked.length) * 100);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <span className={styles.logo}>NomadBase</span>
        <span />
      </div>
      <RouteMotif />

      <main className={styles.main}>
        <div className={styles.heroFull} style={{ backgroundImage: `url(${dest.image})` }}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroInner}>
            <h1 className={styles.city}>{dest.name} Plan</h1>
            <p className={styles.sub}>Your complete guide to getting started</p>
          </div>
        </div>

        <div className={`${styles.content} ${styles.contentGap}`}>
          <Section icon={SECTION_ICONS.neighborhoods} title="Best Neighborhoods">
            <ul className={styles.list}>
              {plan.neighborhoods.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </Section>

          <Section icon={SECTION_ICONS.coworking} title="Top Co-working Spaces">
            <ul className={styles.list}>
              {plan.coworking.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Section>

          <Section icon={SECTION_ICONS.accommodation} title="Accommodation">
            <p className={styles.text}>{plan.accommodation}</p>
          </Section>

          <Section icon={SECTION_ICONS.wifi} title="Internet & Connectivity">
            <p className={styles.text}>{plan.wifi}</p>
          </Section>

          <Section icon={SECTION_ICONS.visa} title="Visa Info">
            <p className={styles.text}>{plan.visa}</p>
          </Section>

          <Section icon={SECTION_ICONS.community} title="Finding the Community">
            <p className={styles.text}>{plan.community}</p>
          </Section>

          <div className={styles.timeline}>
            <div className={styles.checklistHeader}>
              <h2 className={styles.timelineTitle}>Your First Week — Step by Step</h2>
              <span className={styles.progressLabel}>{doneCount}/{checked.length} done</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <ul className={styles.timelineList}>
              {plan.firstWeek.map((step, i) => (
                <li key={i} className={styles.timelineItem}>
                  <button
                    className={`${styles.checkBox} ${checked[i] ? styles.checkBoxDone : ''}`}
                    onClick={() => toggleStep(i)}
                    aria-pressed={checked[i]}
                    aria-label={`Mark step ${i + 1} as ${checked[i] ? 'not done' : 'done'}`}
                  >
                    {checked[i] ? <IconCheck /> : i + 1}
                  </button>
                  <span className={checked[i] ? styles.checkTextDone : ''}>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <button className={styles.restartBtn} onClick={onRestart}>
            ↩ Start over with a new destination
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}><span className={styles.sectionIcon}><Icon /></span>{title}</h2>
      {children}
    </div>
  );
}
