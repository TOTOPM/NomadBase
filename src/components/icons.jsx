const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}

export function IconLaptop(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="10" rx="1.2" />
      <path d="M2.5 19h19" />
      <path d="M9.5 19l1-2.5h3l1 2.5" />
    </svg>
  );
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5V14h4v5.5" />
    </svg>
  );
}

export function IconWifi(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 9.5a14 14 0 0 1 18 0" />
      <path d="M6.5 13.2a9 9 0 0 1 11 0" />
      <path d="M10 17a4 4 0 0 1 4 0" />
      <circle cx="12" cy="20" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPassport(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="1.6" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M8.5 16.5c0-1.9 1.6-2.8 3.5-2.8s3.5 0.9 3.5 2.8" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17.5" cy="10" r="2.2" />
      <path d="M15.5 19c0.3-2.3 1.8-3.8 4-4.2" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function IconCompass(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" />
    </svg>
  );
}
