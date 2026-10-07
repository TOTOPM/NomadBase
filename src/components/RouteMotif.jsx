import styles from './RouteMotif.module.css';

export default function RouteMotif() {
  return (
    <div className={styles.wrap}>
      <svg
        className={styles.motif}
        viewBox="0 0 320 28"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M4 20 C 70 2, 130 26, 196 10 S 300 4, 316 16" className={styles.line} />
        <circle cx="4" cy="20" r="3.2" className={styles.dot} />
        <circle cx="160" cy="15" r="2.2" className={styles.dotSmall} />
        <circle cx="316" cy="16" r="3.2" className={styles.dot} />
      </svg>
    </div>
  );
}
