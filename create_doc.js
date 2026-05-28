const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TableOfContents
} = require('docx');
const fs = require('fs');

// ── Layout ──────────────────────────────────────────────────────────────────
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1080; // 0.75 inch
const CW = PAGE_W - MARGIN * 2; // 9746 content width

// ── Brand colours ───────────────────────────────────────────────────────────
const C = {
  terra:   'C1440E',
  tDark:   '8B2E08',
  green:   '2D6A4F',
  sand:    'E8C99A',
  cream:   'FAF5EB',
  brown:   '1C1208',
  brLight: '5C4A32',
  white:   'FFFFFF',
  hdrBg:   'C1440E',
  rowAlt:  'FDF8F2',
  border:  'D5C9B8',
  gray:    'F2F2F2',
  grayMid: 'CCCCCC',
};

// ── Border helpers ───────────────────────────────────────────────────────────
const b1 = (col = C.border) => ({ style: BorderStyle.SINGLE, size: 4, color: col });
const bAll = (col = C.border) => ({ top: b1(col), bottom: b1(col), left: b1(col), right: b1(col) });
const bNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const bAllNone = { top: bNone, bottom: bNone, left: bNone, right: bNone };

// ── Text helpers ─────────────────────────────────────────────────────────────
const tx = (t, o = {}) => new TextRun({ text: String(t), font: 'Arial', size: 20, color: C.brown, ...o });
const txB = (t, o = {}) => tx(t, { bold: true, ...o });
const txW = (t, o = {}) => tx(t, { color: C.white, bold: true, ...o });
const txSm = (t, o = {}) => tx(t, { size: 17, ...o });

// ── Paragraph helpers ────────────────────────────────────────────────────────
const sp = (before = 0, after = 160) => ({ before, after });

const P = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [tx(children)],
  spacing: sp(0, 140),
  ...o,
});

const PB = (children, o = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [txB(children)],
  spacing: sp(0, 100),
  ...o,
});

const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text: t, font: 'Arial', bold: true, size: 40, color: C.terra })],
  spacing: sp(480, 200),
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.terra, space: 4 } },
});

const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text: t, font: 'Arial', bold: true, size: 28, color: C.brown })],
  spacing: sp(320, 140),
});

const h3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  children: [new TextRun({ text: t, font: 'Arial', bold: true, size: 22, color: C.green })],
  spacing: sp(220, 100),
});

const gap = (px = 200) => new Paragraph({ children: [tx('')], spacing: sp(px, 0) });

// ── List helpers ─────────────────────────────────────────────────────────────
const bullet = (t, level = 0) => new Paragraph({
  numbering: { reference: 'bullets', level },
  children: [tx(t)],
  spacing: sp(0, 80),
});

const numbered = (t, level = 0) => new Paragraph({
  numbering: { reference: 'numbers', level },
  children: [tx(t)],
  spacing: sp(0, 80),
});

// ── Table helpers ────────────────────────────────────────────────────────────
const tCell = (content, { w, bg, isHdr = false, align = AlignmentType.LEFT, vAlign = VerticalAlign.TOP, bold = false, colspan, color } = {}) => {
  let paras;
  if (Array.isArray(content) && content[0] instanceof Paragraph) {
    paras = content;
  } else {
    const txt = String(content);
    const runColor = isHdr ? C.white : (color || C.brown);
    paras = [new Paragraph({
      children: [new TextRun({ text: txt, font: 'Arial', size: isHdr ? 19 : 18, bold: isHdr || bold, color: runColor })],
      alignment: align,
      spacing: { before: 0, after: 0 },
    })];
  }
  return new TableCell({
    children: paras,
    width: w ? { size: w, type: WidthType.DXA } : undefined,
    shading: { fill: bg || (isHdr ? C.hdrBg : C.white), type: ShadingType.CLEAR },
    borders: bAll(),
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    verticalAlign: vAlign,
    columnSpan: colspan,
  });
};

const hRow = (cols, widths) => new TableRow({
  tableHeader: true,
  children: cols.map((c, i) => tCell(c, { w: widths[i], isHdr: true })),
});

const dRow = (cols, widths, alt = false) => new TableRow({
  children: cols.map((c, i) => tCell(c, { w: widths[i], bg: alt ? C.rowAlt : C.white })),
});

const makeTable = (headers, rows, widths) => new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    hRow(headers, widths),
    ...rows.map((r, i) => dRow(r, widths, i % 2 === 1)),
  ],
});

// ── Section divider page ─────────────────────────────────────────────────────
const sectionCover = (num, title, subtitle) => [
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({
    children: [tx('')],
    spacing: sp(2000, 0),
  }),
  new Paragraph({
    children: [new TextRun({ text: `0${num}`, font: 'Arial', size: 120, bold: true, color: C.sand })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 40),
  }),
  new Paragraph({
    children: [new TextRun({ text: title, font: 'Arial', size: 56, bold: true, color: C.brown })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 80),
  }),
  new Paragraph({
    children: [new TextRun({ text: subtitle, font: 'Arial', size: 24, color: C.brLight })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 0),
  }),
];

// ═══════════════════════════════════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════════════════════════════════
const coverPage = [
  new Paragraph({ children: [tx('')], spacing: sp(2400, 0) }),
  new Paragraph({
    children: [new TextRun({ text: 'NOMADBASE', font: 'Arial', size: 96, bold: true, color: C.terra })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 60),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Find your path, anywhere.', font: 'Arial', size: 30, color: C.brLight, italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 400),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'STRATEGIC DOCUMENT PACK', font: 'Arial', size: 26, bold: true, color: C.brown, characterSpacing: 80 })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 80),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Version 1.0  ·  May 2026', font: 'Arial', size: 20, color: C.brLight })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 600),
  }),
  new Paragraph({
    children: [new TextRun({ text: 'CONTENTS', font: 'Arial', size: 20, bold: true, color: C.brLight, characterSpacing: 60 })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 60),
  }),
  ...[
    '01   Market Research',
    '02   Competitive Analysis',
    '03   SWOT Analysis',
    '04   Business Model Canvas',
    '05   Product Requirements Document (PRD)',
  ].map(t => new Paragraph({
    children: [new TextRun({ text: t, font: 'Arial', size: 20, color: C.brown })],
    alignment: AlignmentType.CENTER,
    spacing: sp(0, 40),
  })),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1 — MARKET RESEARCH
// ═══════════════════════════════════════════════════════════════════════════

const sec1 = [
  ...sectionCover(1, 'Market Research', 'Real data from MBO Partners, Global Citizen Solutions, Buffer & more · 2024–2025'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('01 · Market Research'),
  P('All data sourced from MBO Partners 2025 Digital Nomads Trends Report, Global Citizen Solutions Global Digital Nomad Report 2025, Buffer State of Remote Work, and additional primary sources. Data range: 2023–2025.'),

  gap(160),
  h2('1.1  Market Size & Growth'),

  makeTable(
    ['Metric', 'Figure', 'Source'],
    [
      ['Digital nomads globally (2025)', '40–60 million', 'MBO Partners 2025'],
      ['US digital nomads alone', '18.5M — 12% of US workforce', 'MBO Partners 2025'],
      ['Growth since 2019', '+147% (up from 7.3M)', 'MBO Partners'],
      ['YoY growth rate (2024–2025)', '+2.2%', 'MBO Partners 2025'],
      ['Americans who expressed interest in DN lifestyle', '66 million', 'MBO Partners'],
      ['Americans planning to start within 2–3 years', '21 million', 'MBO Partners'],
      ['Conversion rate (aspiring → active)', '7–9%', 'MBO Partners'],
      ['Market value (2024)', '$35 billion', 'Market.us'],
      ['Projected market value (2032)', '$100 billion', 'Market.us'],
      ['Compound Annual Growth Rate', '20–21%', 'Multiple sources'],
      ['North America market share (2024)', '32.1% (~$10.95B)', 'Market.us'],
      ['Co-working market size (2025)', '$27.64 billion', 'Multiple sources'],
      ['Co-working spaces globally', '35,000+ locations', 'Nomads.com'],
    ],
    [4200, 3200, 2346]
  ),

  gap(120),
  P([txB('Key insight: '), tx('66M Americans are interested in the DN lifestyle. Only 18.5M have made the leap. The 47.5M in between represent the core market NomadBase addresses — the highest-intent, lowest-served segment in this space.')]),

  gap(200),
  h2('1.2  Demographics'),
  h3('Age Distribution'),

  makeTable(
    ['Age Group', 'Share', 'Notes'],
    [
      ['Gen Z (18–24)', '35%', 'Fast-growing segment driven by remote-first career start'],
      ['Millennials (25–40)', '40%', 'Primary income earners, core target audience'],
      ['Gen Z + Millennials combined', '75%', 'NomadBase\'s entire target demographic'],
      ['Modal (peak) age group', '30–39 years (47%)', 'Highest concentration'],
      ['Average age', '36–37 years', 'More mature than the "young backpacker" stereotype'],
    ],
    [2800, 1800, 5146]
  ),

  gap(120),
  h3('Gender & Nationality'),

  makeTable(
    ['Attribute', 'Breakdown'],
    [
      ['Gender split', 'Male 56% · Female 43% · Non-binary 1%'],
      ['Top nationality', 'United States — 31% of all DNs globally (18.5M people)'],
      ['2nd nationality', 'Portugal — 8%'],
      ['3rd nationality', 'Germany — 7%'],
      ['4th nationality', 'Brazil — 5%'],
      ['Education level', '90% have completed higher education'],
    ],
    [3000, 6746]
  ),

  gap(120),
  h3('Income'),

  makeTable(
    ['Income Metric', 'Figure'],
    [
      ['Average annual income', '$123,762'],
      ['Median annual income', '$85,000'],
      ['Monthly average', '$10,393'],
      ['Monthly median', '$7,083'],
      ['Earn $100K–$250K/year', '35%'],
      ['Earn $50K–$100K/year', '34%'],
      ['Household income $75K+', '46%'],
      ['Software engineers (monthly)', '$6,000–$10,000'],
      ['Social media managers (monthly)', '$3,000–$5,000'],
    ],
    [4000, 5746]
  ),

  gap(120),
  P([txB('Key insight: '), tx('Digital nomads are not broke backpackers. They are high-income, highly educated professionals making considered lifestyle choices. A platform that respects their intelligence wins.')]),

  gap(200),
  h2('1.3  Professions & Industries'),
  P('Top 5 professions account for 51% of all DN work:'),
  bullet('Marketing'),
  bullet('Computer Science / IT'),
  bullet('Design & Creative'),
  bullet('Writing & Content'),
  bullet('E-Commerce & Business'),
  gap(80),
  P('Top industries: Information Technology · Creative Services · Sales & Marketing · Finance & Consulting · Research & Development'),

  gap(200),
  h2('1.4  Behaviour & Travel Patterns'),

  makeTable(
    ['Metric', '2023', '2024', '2025', 'Trend'],
    [
      ['Destinations per year', '7.2', '6.6', '6.2', '↓ Fewer, longer'],
      ['Average weeks per destination', '5.4', '5.7', '6.4', '↑ Staying longer'],
      ['% nomads for 3 years or less', '—', '—', '67%', 'Majority are early-stage'],
      ['Nomads for 5+ years', '—', '—', '15%', 'Small experienced base'],
    ],
    [2900, 1300, 1300, 1300, 2946]
  ),

  gap(120),
  P([txB('Strategic implication: '), tx('Nomads are visiting fewer places and staying much longer (6.4 weeks per destination in 2025). This validates building deep, quality plans per destination rather than a data-table directory. Depth beats breadth.')]),
  gap(80),
  P([txB('Satisfaction: '), tx('81% of active digital nomads are highly satisfied with their work and lifestyle. 81% are optimistic about their future careers. The product experience should be aspirational, not anxiety-inducing.')]),

  gap(200),
  h2('1.5  Fears & Barriers to Starting'),
  P('These are the exact fears NomadBase\'s AI agent is designed to address:'),

  makeTable(
    ['Barrier', 'Detail', 'How NomadBase addresses it'],
    [
      ['Internet reliability', '52% cite this as a major concern', 'WiFi question in agent + WiFi info in every plan'],
      ['Financial instability', 'Inconsistent freelance/remote income', 'Budget question + cost-of-living data per destination'],
      ['Social isolation', 'Fear of leaving social circle', 'Community score + community tips in every plan'],
      ['Visa complexity', 'Legal grey zones, process confusion', 'Clear visa info section in every destination plan'],
      ['Work-life balance', 'Lack of structure in a new environment', 'Neighbourhood + co-working recommendations'],
      ['Safety concerns', 'Crime in some destinations', 'Destination curation: only proven nomad hubs'],
      ['Healthcare & insurance', 'No employer coverage', 'Future: insurance partner referrals (Phase 2–3)'],
    ],
    [2200, 2600, 4946]
  ),

  gap(200),
  h2('1.6  Monthly Spending by Region'),

  makeTable(
    ['Region', 'Monthly Budget', 'Sample Destinations'],
    [
      ['Southeast Asia', '$800–$1,500', 'Thailand, Vietnam, Indonesia, Philippines'],
      ['Eastern Europe & Latin America', '$1,200–$2,000', 'Portugal, Colombia, Georgia, Mexico'],
      ['Western Europe & North America', '$2,500–$3,500+', 'UK, France, Germany, US, Australia'],
      ['Middle East & North Africa', 'Highly variable', 'Morocco/Egypt: affordable · UAE/Israel: expensive'],
    ],
    [2800, 2000, 4946]
  ),

  gap(80),
  P('Housing consistently represents 45–55% of total monthly spending. NomadBase\'s three budget tiers (under $1,500 / $1,500–$3,000 / over $3,000) map directly to this regional segmentation.'),

  gap(200),
  h2('1.7  Digital Nomad Visas'),

  makeTable(
    ['Metric', 'Figure', 'Context'],
    [
      ['Countries with DN visa programs (2020)', '~10–15', 'Early adopters: Estonia, Barbados, Bermuda'],
      ['Countries with DN visa programs (2025)', '50–73', 'Governments actively competing for nomad spend'],
      ['Growth (5 years)', '~5×', 'Fastest-growing category in immigration policy'],
      ['Turkey launch', 'April 2024', 'New entrant'],
      ['Italy launch', 'April 2024', 'New entrant'],
      ['Japan launch', 'March 2024', 'New entrant'],
      ['Taiwan launch', 'January 2025', 'Up to 6 months'],
      ['% of aspiring nomads attracted to DN visa countries', '77%', 'MBO Partners'],
    ],
    [3200, 2000, 4546]
  ),

  gap(80),
  P([txB('SEO opportunity: '), tx('Visa information is the highest-intent search category for aspiring nomads. Every destination plan should feature clear, current visa info — this alone drives organic traffic and establishes trust.')]),

  gap(200),
  h2('1.8  Remote Work Macro Trends'),

  makeTable(
    ['Metric', 'Figure', 'Source'],
    [
      ['US workers teleworking at least part-time (2024)', '22.9% — 35.5M people', 'BLS 2024'],
      ['Global workforce working remotely', '~28%', 'Buffer 2023'],
      ['Projected US remote workers end of 2025', '36.2M', 'Forbes projection'],
      ['Hybrid work share', '52%', 'Multiple 2024 sources'],
      ['Fully remote share', '27%', 'Multiple 2024 sources'],
      ['Remote workers using AI tools (2025)', '66%', '2025 data'],
      ['Using AI daily for work', '19%', '2025 data'],
      ['Companies integrating AI productivity tools by 2026', '56%', 'Multiple sources'],
      ['Remote work software market (2024)', '$31.7 billion', 'Multiple sources'],
      ['Remote work software market (2032, projected)', '$97.5 billion (14% CAGR)', 'Multiple sources'],
      ['Workers who want to continue working remotely', '94%', 'Owl Labs'],
      ['Say remote work improves work-life balance', '67%', 'Multiple sources'],
    ],
    [4200, 2800, 2746]
  ),

  gap(120),
  P([txB('AI tailwind: '), tx('66% of remote workers are already using AI tools. The AI revolution is expanding who can work remotely and independently — directly growing NomadBase\'s total addressable market in real time.')]),

  gap(200),
  h2('1.9  Top Destinations — Current Data'),

  makeTable(
    ['Rank', 'City', 'Country', 'Key Stat'],
    [
      ['1', 'Bangkok', 'Thailand', 'Scored 91/100 by nomad indices'],
      ['2', 'Lisbon', 'Portugal', '24% return rate — highest repeat visitation globally'],
      ['3', 'Bali', 'Indonesia', 'Canggu + Ubud community hubs'],
      ['4', 'Chiang Mai', 'Thailand', 'Budget nomad capital of SE Asia'],
      ['5', 'Medellín', 'Colombia', '"Eternal spring" city — 23°C year-round'],
      ['6', 'Mexico City', 'Mexico', 'Largest Latin America nomad hub'],
      ['7', 'Tbilisi', 'Georgia', 'Cheapest European option'],
      ['8', 'Da Nang', 'Vietnam', 'Fast-growing — $20/night avg accommodation'],
      ['9', 'Seoul', 'South Korea', 'World-class tech infrastructure'],
      ['10', 'Istanbul', 'Turkey', 'New DN visa (April 2024)'],
    ],
    [800, 2000, 2000, 4946]
  ),

  gap(120),
  P([txB('Gap in current DB: '), tx('Bangkok, Da Nang, Seoul, Istanbul, Porto are all in the top 10 and not yet in NomadBase. These should be prioritised in the next content sprint.')]),
  gap(120),
  P([txB('Fastest-growing destinations (2024–2025): '), tx('Cape Town (South Africa) · Manila (Philippines) · Da Nang (Vietnam) · Tokyo (+218% YoY in 2023) · Asunción (Paraguay — most consistent growth 2020–2025)')]),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2 — COMPETITIVE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

const sec2 = [
  ...sectionCover(2, 'Competitive Analysis', 'Who exists, what they built, and where the white space is'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('02 · Competitive Analysis'),

  gap(120),
  h2('2.1  Competitor Overview'),

  makeTable(
    ['Competitor', 'Type', 'Core Offering', 'Est. Users', 'Revenue Model'],
    [
      ['Nomad List', 'Direct', 'City data rankings & scores', '100K+ members, 29K customers', '$75/year membership'],
      ['r/digitalnomad', 'Indirect', 'Community Q&A forum', '2.4 million subscribers', 'None (Reddit ads)'],
      ['Facebook Groups', 'Indirect', 'Community discussion', '100K+ per major group', 'None'],
      ['SafetyWing / Boundless', 'Adjacent', 'Insurance + community', '55,000+ community members', 'Insurance premiums'],
      ['Selina', 'Adjacent', 'Co-living/co-working spaces', 'Hospitality brand', 'Room & desk bookings'],
      ['Workfrom', 'Niche', 'Remote work venue database', 'Small', 'Freemium'],
      ['Remote Year', 'Adjacent', 'Organised group travel programs', 'Small', '$2,000–5,000/month per person'],
      ['Anyplace / Flatio', 'Adjacent', 'Mid-term rental platforms', 'Medium', 'Booking commission'],
    ],
    [1900, 1400, 2600, 1946, 1900]
  ),

  gap(200),
  h2('2.2  Deep Dive — Nomad List'),
  P('The most direct competitor. Real published figures:'),

  makeTable(
    ['Metric', 'Figure'],
    [
      ['Revenue 2023', '$704,200'],
      ['Revenue 2024', '$5,300,000'],
      ['YoY growth (2023–2024)', '+652%'],
      ['Customers', '29,000+'],
      ['Community members', '100,000+'],
      ['Team size', 'Solo founder (Pieter Levels)'],
      ['Customer acquisition cost', '$0 — organic press coverage, strong SEO'],
      ['Business model', 'Freemium → $75/year subscription'],
      ['Also operates', 'RemoteOK (remote job board) ~$3M/year additional revenue'],
    ],
    [3600, 6146]
  ),

  gap(120),

  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW / 2 - 80, CW / 2 - 80],
    rows: [
      new TableRow({
        children: [
          tCell('Nomad List STRENGTHS', { w: CW / 2 - 80, isHdr: true }),
          tCell('Nomad List WEAKNESSES', { w: CW / 2 - 80, isHdr: true }),
        ],
      }),
      new TableRow({
        children: [
          tCell([
            P('· Strong brand recognition & SEO authority'),
            P('· Massive data set across 1,000+ cities'),
            P('· Pieter Levels — 500K+ Twitter following'),
            P('· Proven business model ($5.3M ARR)'),
            P('· RemoteOK cross-promotion channel'),
          ], { w: CW / 2 - 80, bg: C.rowAlt }),
          tCell([
            P('· Zero personalization — same data for everyone'),
            P('· No guidance or planning — you\'re on your own'),
            P('· Beginner-hostile — assumes existing knowledge'),
            P('· $75/year paywall before delivering value'),
            P('· Community is weak — primarily a data product'),
            P('· Mobile experience is poor'),
          ], { w: CW / 2 - 80 }),
        ],
      }),
    ],
  }),

  gap(200),
  h2('2.3  Deep Dive — Reddit & Facebook Groups'),
  makeTable(
    ['Platform', 'Subscribers / Members', 'Strength', 'Critical Weakness'],
    [
      ['r/digitalnomad (Reddit)', '2.4 million', 'Massive reach, authentic voices, fast answers', 'Zero structure, zero personalization, zero follow-through'],
      ['r/solotravel (Reddit)', '4.2 million', 'Large community', 'Not nomad-specific'],
      ['Digital Nomads World (Facebook)', '100,000+', 'Active daily discussion', 'Chaotic, no curation, noise-to-signal is terrible'],
      ['Chiang Mai DN (Facebook)', '50,000+', 'Hyper-local, practical', 'Destination-specific only'],
    ],
    [2400, 1800, 2400, 3146]
  ),

  gap(80),
  P([txB('Positioning insight: '), tx('Reddit and Facebook groups create the problem NomadBase solves. A first-timer who posts "where should I go?" on r/digitalnomad gets 80 conflicting opinions and leaves more confused than before. NomadBase is the structured, personalised answer to that chaos.')]),

  gap(200),
  h2('2.4  Feature Comparison Matrix'),

  makeTable(
    ['Feature', 'NomadBase', 'Nomad List', 'Reddit', 'SafetyWing', 'Remote Year'],
    [
      ['AI / guided planning', '✓ (core)', '✗', '✗', '✗', '✗'],
      ['Personalised destination match', '✓ (core)', '✗', '✗', '✗', 'Partial'],
      ['Full action plan per destination', '✓ (core)', '✗', '✗', '✗', '✓ (but curated by them)'],
      ['Beginner-focused experience', '✓', '✗', '✗', '✗', '✗'],
      ['Free to use (no paywall)', '✓', 'Partial', '✓', '✗', '✗'],
      ['Mobile-first design', '✓', 'Partial', '✓', '✓', '✗'],
      ['Community economy', 'Phase 2', '✗', '✗', '✗', '✗'],
      ['Established brand & SEO', '✗ (building)', '✓', '✓', '✓', 'Partial'],
      ['Daily use case', 'Phase 2', '✗', '✓', '✗', '✗'],
      ['Real-time city data', '✗', '✓', '✗', '✗', '✗'],
    ],
    [3000, 1400, 1300, 1200, 1400, 1446]
  ),

  gap(200),
  h2('2.5  Competitive Positioning'),
  P('NomadBase occupies a white space no competitor owns:'),
  gap(80),
  new Paragraph({
    children: [new TextRun({ text: '"Personalised, guided, beginner-friendly planning — free, mobile, no friction."', font: 'Arial', size: 22, bold: true, italics: true, color: C.terra })],
    alignment: AlignmentType.CENTER,
    spacing: sp(120, 120),
    border: {
      top: b1(C.sand), bottom: b1(C.sand),
      left: { style: BorderStyle.SINGLE, size: 24, color: C.terra, space: 8 },
      right: b1(C.sand),
    },
    indent: { left: 360, right: 360 },
  }),
  gap(80),
  P('The closest threat is Nomad List adding an AI planning layer. That risk is real — but their entire brand is built around data power users, not beginners. Repositioning to serve aspiring nomads would require dismantling what made them successful.'),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3 — SWOT
// ═══════════════════════════════════════════════════════════════════════════

const swotW = Math.floor(CW / 2);

const swotCell = (label, labelColor, items, bg) => tCell([
  new Paragraph({
    children: [new TextRun({ text: label, font: 'Arial', size: 24, bold: true, color: labelColor })],
    spacing: sp(0, 120),
    alignment: AlignmentType.CENTER,
  }),
  ...items.map(i => new Paragraph({
    children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 17, color: C.brown })],
    spacing: sp(0, 60),
  })),
], { w: swotW, bg });

const sec3 = [
  ...sectionCover(3, 'SWOT Analysis', 'Strengths · Weaknesses · Opportunities · Threats'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('03 · SWOT Analysis'),
  P('A strategic assessment of NomadBase\'s current position, resources, and market environment.'),
  gap(160),

  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [swotW, swotW],
    rows: [
      new TableRow({ children: [
        swotCell('STRENGTHS', C.green, [
          'AI planning agent — no competitor has it',
          'Beginner-focused — largest underserved segment',
          'Zero API cost architecture — lean and scalable',
          'Free with no paywall — removes barrier to trial',
          'Mobile-first design for the on-the-go user',
          'Community economy creates network effects',
          'PM-led product — user empathy at the core',
          'React + Vite — modern, extensible tech stack',
        ], 'E8F5EE'),
        swotCell('WEAKNESSES', C.terra, [
          'No defensible moat yet in Phase 1',
          'Solo founder — resource constraints',
          'No existing brand or SEO authority',
          'Destination content requires ongoing curation',
          'No existing nomad community or network',
          'No revenue in Phase 1 — growth-dependent',
          'Only 6 destinations at launch — limited coverage',
          'Agent is rule-based, not true AI (for now)',
        ], 'FEF0EB'),
      ]}),
      new TableRow({ children: [
        swotCell('OPPORTUNITIES', '1C5A8A', [
          '100M+ aspiring nomads — almost entirely unserved',
          '50–73 countries now have DN visa programs',
          'AI revolution expanding who can work remotely',
          'No dominant brand for the aspiring nomad segment',
          'Slow-nomad trend: longer stays → deeper plans',
          'Co-living brands need qualified nomad leads',
          'Travel insurance affiliates (SafetyWing, etc.)',
          'B2B: destination boards, co-working operators',
          'Visa content = highest-intent SEO category',
        ], 'EBF2FA'),
        swotCell('THREATS', '6B2D8B', [
          'Nomad List adds AI layer on existing data & brand',
          'Reddit/Facebook: free, entrenched, huge reach',
          'Airbnb/Booking.com could enter planning space',
          'Destination content staleness at scale',
          'Economic recession reducing remote work',
          'AI commoditisation — agent is easy to clone',
          'Content creators build free alternatives (Substack/YouTube)',
        ], 'F5EBF7'),
      ]}),
    ],
  }),

  gap(240),
  h2('3.1  Risk Register'),

  makeTable(
    ['Threat', 'Probability', 'Severity', 'Response'],
    [
      ['Nomad List adds AI planning', 'Medium', 'High', 'Move fast — own the beginner brand before they pivot'],
      ['Reddit/Facebook communities', 'High (already exists)', 'Medium', 'They create the problem; NomadBase is the solution'],
      ['Content becomes stale', 'High', 'Medium', 'Build content process; move to community editing in Phase 2'],
      ['AI agent gets cloned', 'High', 'Medium', 'Community economy is the real moat — not the agent alone'],
      ['Airbnb enters the space', 'Low', 'High', 'Long-term risk; build community moat now as defence'],
      ['Recession reduces remote work', 'Low–Medium', 'High', 'Diversify destinations across all cost ranges'],
    ],
    [2600, 1400, 1200, 4546]
  ),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4 — BUSINESS MODEL CANVAS
// ═══════════════════════════════════════════════════════════════════════════

const bmcCell = (label, items, w, bg = C.white, labelColor = C.terra) => tCell([
  new Paragraph({
    children: [new TextRun({ text: label, font: 'Arial', size: 16, bold: true, color: labelColor, characterSpacing: 40 })],
    spacing: sp(0, 80),
  }),
  ...(Array.isArray(items) ? items : [items]).map(i => new Paragraph({
    children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brown })],
    spacing: sp(0, 44),
  })),
], { w, bg });

const BMC_H = CW / 5;  // ~1949

const sec4 = [
  ...sectionCover(4, 'Business Model Canvas', 'Nine building blocks of the NomadBase business model'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('04 · Business Model Canvas'),
  P('The Business Model Canvas maps how NomadBase creates, delivers, and captures value. Phase 1 (now) is highlighted separately from Phase 2–3 additions.'),
  gap(160),

  // ROW 1: Key Partners | Key Activities | Value Propositions | Customer Relations | Customer Segments
  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [BMC_H, BMC_H, BMC_H, BMC_H, BMC_H],
    rows: [
      new TableRow({ children: [
        bmcCell('KEY PARTNERS', [
          'Co-working spaces (Phase 2)',
          'Co-living brands — Selina, Outpost',
          'Travel insurance — SafetyWing',
          'Remote job boards (Phase 3)',
          'Destination tourism boards',
          'Visa service providers',
        ], BMC_H, 'FDF8F2'),
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'KEY ACTIVITIES', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Phase 1 (Now)', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          ...['Destination content creation', 'Product development', 'Founder publishing & brand'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 40) })),
          new Paragraph({ children: [new TextRun({ text: 'Phase 2+', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(80, 40) }),
          ...['Community moderation', 'Partner business development', 'SEO & content marketing'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brLight })], spacing: sp(0, 40) })),
        ], { w: BMC_H, bg: 'FDF8F2' }),
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'VALUE PROPOSITIONS', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'For aspiring nomads:', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: '"Know where to go and exactly how to get there — in 5 minutes, free."', font: 'Arial', size: 16, italics: true, color: C.brown })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'For early nomads:', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: '"A community that rewards your experience and helps you grow."', font: 'Arial', size: 16, italics: true, color: C.brown })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'For partners:', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: '"Reach qualified nomads at the moment of destination decision."', font: 'Arial', size: 16, italics: true, color: C.brLight })], spacing: sp(0, 0) }),
        ], { w: BMC_H, bg: 'FEF7F0', vAlign: VerticalAlign.TOP }),
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'CUSTOMER RELATIONSHIPS', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Phase 1', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          ...['Self-service (agent is fully automated)', 'Automated personalization', 'Content relationship via destination guides'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 40) })),
          new Paragraph({ children: [new TextRun({ text: 'Phase 2', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(80, 40) }),
          ...['Community-driven peer support', 'Email digest & notifications', 'Gamified coin economy'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brLight })], spacing: sp(0, 40) })),
        ], { w: BMC_H, bg: 'FDF8F2' }),
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'CUSTOMER SEGMENTS', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Primary', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: 'Aspiring digital nomads (22–40)\n· Remote-capable income\n· Has thought about it, hasn\'t started\n· Afraid of the unknown', font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Secondary', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: 'Early-stage nomads (1–3 years)\n· Wants community & recognition\n· Willing to share knowledge', font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Future (B2B)', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(0, 40) }),
          new Paragraph({ children: [new TextRun({ text: '· Co-living operators\n· Destination tourism boards\n· Remote-first companies', font: 'Arial', size: 16, color: C.brLight })], spacing: sp(0, 0) }),
        ], { w: BMC_H, bg: 'FDF8F2' }),
      ]}),
    ],
  }),

  // ROW 2: Key Resources (spans 2) | (Value Props — already shown) | Channels (spans 2)
  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [BMC_H * 2, BMC_H, BMC_H * 2],
    rows: [
      new TableRow({ children: [
        bmcCell('KEY RESOURCES', [
          'Destination database & plan content',
          'AI planning engine (JS scoring)',
          'Brand and trust (built via content)',
          'Community UGC & social graph (Phase 2)',
          'Partner network (Phase 3)',
        ], BMC_H * 2, C.rowAlt),
        tCell('', { w: BMC_H, bg: 'FEF7F0' }),
        bmcCell('CHANNELS', [
          'Organic search (SEO via destination guides)',
          'Founder personal publishing (LinkedIn, X, Instagram)',
          'Word of mouth — agent results are shareable',
          'Friends & family (Phase 1 launch)',
          'Nomad community seeding (Reddit, FB groups)',
          'Email digest for return visits (Phase 2)',
          'Partner referrals (Phase 2–3)',
        ], BMC_H * 2, C.rowAlt),
      ]}),
    ],
  }),

  // ROW 3: Cost Structure | Revenue Streams
  new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [Math.floor(CW / 2), CW - Math.floor(CW / 2)],
    rows: [
      new TableRow({ children: [
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'COST STRUCTURE', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Phase 1 — Near Zero Cash Costs', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 40) }),
          ...['Hosting: Vercel free tier', 'Domain & basic tools (~$50/year)', 'Content creation (research time)', 'Founder time (main cost)'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 40) })),
          new Paragraph({ children: [new TextRun({ text: 'Phase 2+ — Variable Costs', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(80, 40) }),
          ...['Community management', 'LLM API (when upgrading agent)', 'Marketing & paid acquisition', 'Infrastructure as users scale'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brLight })], spacing: sp(0, 40) })),
        ], { w: Math.floor(CW / 2), bg: 'FDF8F2' }),
        tCell([
          new Paragraph({ children: [new TextRun({ text: 'REVENUE STREAMS', font: 'Arial', size: 16, bold: true, color: C.terra, characterSpacing: 40 })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Phase 1: $0 — growth first', font: 'Arial', size: 15, bold: true, color: C.green })], spacing: sp(0, 80) }),
          new Paragraph({ children: [new TextRun({ text: 'Phase 2:', font: 'Arial', size: 15, bold: true, color: C.brown })], spacing: sp(0, 40) }),
          ...['Partner listings (co-workings, co-livings) — monthly flat fee', 'Affiliate commissions on accommodation, insurance, flights'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brown })], spacing: sp(0, 40) })),
          new Paragraph({ children: [new TextRun({ text: 'Phase 3:', font: 'Arial', size: 15, bold: true, color: C.brLight })], spacing: sp(80, 40) }),
          ...['Premium membership ($9–15/month)', 'Sponsored destination features', 'B2B data & insights (co-living operators, tourism boards)', 'Nomad Coins optional top-up (not pay-to-win)'].map(i => new Paragraph({ children: [new TextRun({ text: `· ${i}`, font: 'Arial', size: 16, color: C.brLight })], spacing: sp(0, 40) })),
        ], { w: CW - Math.floor(CW / 2), bg: 'FDF8F2' }),
      ]}),
    ],
  }),
];

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5 — PRD
// ═══════════════════════════════════════════════════════════════════════════

const sec5 = [
  ...sectionCover(5, 'Product Requirements Document', 'Full PRD · Version 1.0 · May 2026'),
  new Paragraph({ children: [new PageBreak()] }),

  h1('05 · Product Requirements Document'),
  P([txB('Version: '), tx('1.0  '), txB('Date: '), tx('May 2026  '), txB('Status: '), tx('Active')]),

  gap(160),
  h2('5.1  Problem'),
  P('Becoming a digital nomad is harder than it looks. The lifestyle is more accessible than ever — remote work has exploded, AI tools have lowered barriers to solo work — but aspiring nomads get stuck before they start.'),
  gap(80),
  P('The blockers are not logistical. They are psychological:'),
  bullet('"I don\'t know where to go first."'),
  bullet('"I don\'t know if I can afford it."'),
  bullet('"What if I don\'t know anyone there?"'),
  bullet('"I don\'t know what to do about my visa / apartment / income."'),
  gap(80),
  P('Existing resources (Nomad List, Reddit, Facebook groups) are information archives — you visit them, extract something, and leave. They don\'t guide you. They don\'t know who you are. They don\'t build you a plan.'),
  gap(80),
  new Paragraph({
    children: [new TextRun({ text: 'NomadBase is the platform that walks you from "I want to try this" to "I\'m on a plane."', font: 'Arial', size: 22, bold: true, italics: true, color: C.terra })],
    alignment: AlignmentType.CENTER,
    spacing: sp(120, 120),
    indent: { left: 360, right: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: C.terra, space: 8 } },
  }),

  gap(160),
  h2('5.2  Vision'),
  P('A daily-use platform where aspiring and early-stage digital nomads get personalised guidance, connect with a community, and access a growing ecosystem of experiences and services — all built around real people sharing real experiences.'),

  gap(160),
  h2('5.3  Target Users'),
  h3('Primary — The Dreamer'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['Age', '22–35'],
      ['Income', 'Remote-capable job or freelance income'],
      ['Mindset', 'Has thought about the lifestyle but hasn\'t started'],
      ['Core fear', 'Housing, isolation, money, visas — fear of the unknown'],
      ['Needs', 'Confidence, a concrete first step, a complete plan'],
    ],
    [2400, 7346]
  ),

  gap(120),
  h3('Secondary — The Early Nomad'),
  makeTable(
    ['Attribute', 'Detail'],
    [
      ['Age', '25–40'],
      ['Experience', '1–12 months of nomadic living'],
      ['Mindset', 'Wants community, wants to share what they know'],
      ['Core need', 'Community, discovery, recognition for expertise'],
    ],
    [2400, 7346]
  ),

  gap(160),
  h2('5.4  Goals & Success Metrics'),
  makeTable(
    ['Goal', 'Metric', 'Target (12 months)'],
    [
      ['Destination coverage', 'Destinations in database', '20'],
      ['User base', 'Monthly Active Users (MAU)', '500+'],
      ['Agent engagement', 'Agent sessions completed', '60% completion rate'],
      ['Retention', 'Users returning within 30 days', '40%'],
    ],
    [2800, 3400, 3546]
  ),

  gap(80),
  P([txB('North Star metric: '), tx('Number of users who complete a full agent session and view their destination plan. This is the moment of value delivery — everything else is upstream or downstream of this.')]),

  gap(160),
  h2('5.5  Scope by Phase'),
  makeTable(
    ['Phase', 'Name', 'Core Deliverable'],
    [
      ['Phase 1 (Now)', 'MVP — AI Planning Agent', 'User answers 6 questions, gets a destination recommendation + full action plan. No login required.'],
      ['Phase 2', 'Community Economy', 'Destination & place reviews. Nomad Coins for quality contributions. Partner benefits redemption.'],
      ['Phase 3', 'Marketplace', 'Booking integrations, affiliate partnerships, accommodation listings, nomad-curated experiences.'],
    ],
    [1400, 2400, 5946]
  ),

  gap(200),
  h2('5.6  Phase 1 Requirements — AI Planning Agent'),
  h3('5.6.1  Landing Page'),
  P('Must have:'),
  bullet('Clear value proposition above the fold'),
  bullet('Single CTA: "Start Planning"'),
  bullet('Brief explanation of how the agent works (3 steps)'),
  bullet('No registration required to use the agent'),
  gap(80),
  P('Must not:'),
  bullet('Ask users to sign up before letting them try the product'),
  bullet('Use generic stock imagery or clichéd travel copy'),

  gap(160),
  h3('5.6.2  Agent Conversation Flow'),
  P('The agent asks 6 questions in sequence. Each question is presented one at a time with multiple-choice answers. No free-text input in Phase 1.'),
  gap(80),

  makeTable(
    ['#', 'Question ID', 'Question', 'Options'],
    [
      ['1', 'experience', 'Have you ever lived as a digital nomad before?', 'First time / Tried briefly (1–3 months) / Experienced'],
      ['2', 'budget', 'Monthly budget for living expenses?', '< $1,500 / $1,500–$3,000 / > $3,000'],
      ['3', 'region', 'Region preference?', 'Asia / Europe / Latin America / No preference'],
      ['4', 'priority', 'What matters most to you?', 'Community / Nature / City & culture / Mix'],
      ['5', 'weather', 'Ideal weather?', 'Hot & tropical / Mild & pleasant / Don\'t care'],
      ['6', 'wifi', 'How critical is fast internet?', 'Mission critical / Important, but co-working is fine / Flexible'],
    ],
    [400, 1300, 3200, 4846]
  ),

  gap(80),
  P('Behaviour requirements:'),
  bullet('User can navigate back to any previous question and change their answer'),
  bullet('Progress indicator visible throughout (e.g. "3 of 6")'),
  bullet('No dead ends — every combination of answers must produce at least one result'),
  bullet('Session stored in localStorage — progress survives page refresh'),
  bullet('Anonymous sessions tracked without requiring login'),

  gap(160),
  h3('5.6.3  Recommendation Engine'),

  makeTable(
    ['Factor', 'Weight', 'Logic'],
    [
      ['Budget fit', 'High (×3)', 'Each destination has separate scores for low / mid / high budget tiers'],
      ['Priority match', 'High (×2.5)', 'Community / nature / city scores per destination, scaled by user priority'],
      ['Weather match', 'Medium (×1.5)', 'Hot / mild score per destination matches user preference'],
      ['WiFi reliability', 'Medium (×1–2)', 'Weight doubles if user selects "mission critical"'],
      ['Region', 'Hard filter', 'If user selects a region, all non-matching destinations are excluded'],
    ],
    [1800, 1400, 6546]
  ),

  gap(80),
  P('Rules:'),
  bullet('If region filter returns zero results: show a "no matches" state with prompt to try without a region filter'),
  bullet('Show top recommendation prominently; surface 2 alternatives alongside'),
  bullet('Match reasons are personalised — explain WHY this destination fits this user\'s specific answers'),

  gap(160),
  h3('5.6.4  Result Page'),
  P('Must show:'),
  bullet('Destination name, country, flag emoji'),
  bullet('Tagline'),
  bullet('Estimated monthly cost range'),
  bullet('2–4 personalised match reasons based on actual answers given'),
  bullet('Top 2 alternative destinations (name, country, flag only)'),
  gap(80),
  P('Actions:'),
  bullet('"See my full plan" → navigates to Plan page'),
  bullet('"Start over" → resets agent, returns to landing page'),

  gap(160),
  h3('5.6.5  Plan Page'),
  P('A structured, complete guide for each destination. Content curated by the NomadBase team in Phase 1.'),
  gap(80),
  makeTable(
    ['Section', 'Content'],
    [
      ['Best neighbourhoods', '2–4 neighbourhoods with one-line descriptor each'],
      ['Co-working spaces', '2–3 recommended spaces with brief notes'],
      ['Accommodation', 'Where to look, what to expect, average price range'],
      ['Internet & connectivity', 'WiFi situation, which SIM card to get, speeds to expect'],
      ['Visa info', 'What most nationalities receive on arrival, duration, options for longer stays'],
      ['Finding the community', 'Where nomads gather, which Facebook groups and events to join'],
      ['First-week checklist', '5 ordered, actionable steps for the first 7 days in-destination'],
    ],
    [2800, 6946]
  ),
  gap(80),
  P('Requirements:'),
  bullet('Sticky header with destination name visible while scrolling on mobile'),
  bullet('"Start over" CTA at the bottom of the plan'),
  bullet('All content must be accurate and updated at least every 6 months'),

  gap(160),
  h3('5.6.6  Destination Database — Launch Coverage'),
  makeTable(
    ['Destination', 'Country', 'Region', 'Status'],
    [
      ['Chiang Mai', 'Thailand', 'Asia', '✓ Live at launch'],
      ['Bali', 'Indonesia', 'Asia', '✓ Live at launch'],
      ['Lisbon', 'Portugal', 'Europe', '✓ Live at launch'],
      ['Medellín', 'Colombia', 'Latin America', '✓ Live at launch'],
      ['Tbilisi', 'Georgia', 'Europe', '✓ Live at launch'],
      ['Mexico City', 'Mexico', 'Latin America', '✓ Live at launch'],
      ['Bangkok', 'Thailand', 'Asia', '→ Sprint 2 (highest demand)'],
      ['Da Nang', 'Vietnam', 'Asia', '→ Sprint 2'],
      ['Porto', 'Portugal', 'Europe', '→ Sprint 2'],
      ['Istanbul', 'Turkey', 'Europe', '→ Sprint 3'],
    ],
    [2400, 2000, 2000, 3346]
  ),

  gap(200),
  h2('5.7  Phase 2 Requirements — Community Economy'),
  h3('5.7.1  User Accounts'),
  P('Registration unlocks community features. The agent remains available without an account.'),
  bullet('Registration: email + password, or Google OAuth'),
  bullet('Profile: name, avatar, experience level, current destination, bio'),
  bullet('Trigger registration prompt after completing an agent session — not before'),

  gap(120),
  h3('5.7.2  Reviews'),
  makeTable(
    ['Field', 'Detail'],
    [
      ['Target', 'A specific place (co-working, cafe, accommodation) OR a destination overall'],
      ['Rating', '1–5 stars, required'],
      ['Written review', 'Text, required'],
      ['Month of visit', 'Month selector, required'],
      ['Helpful votes', 'Other users can mark a review as helpful'],
      ['Coins earned', 'Displayed on the review after submission'],
    ],
    [2400, 7346]
  ),

  gap(120),
  h3('5.7.3  Nomad Coins — Earning & Spending'),
  makeTable(
    ['Action', 'Coins Earned'],
    [
      ['Write a review', '10 coins'],
      ['Review marked helpful by 5+ users', '+15 bonus coins'],
      ['Add a new place that gets verified', '25 coins'],
      ['Refer a user who completes an agent session', '20 coins'],
    ],
    [5000, 4746]
  ),

  gap(80),
  P('Spending: Coins are redeemable for partner benefits (co-working day passes, discounts, experiences). Coins never expire.'),
  gap(80),
  P('Rules:'),
  bullet('Coins are earned through contribution — no pay-to-win, ever'),
  bullet('One review per place per user (no farming)'),
  bullet('Helpful vote throttling to prevent manipulation'),
  bullet('Coins balance is a ledger sum — never a mutable field that can drift'),

  gap(200),
  h2('5.8  Non-Functional Requirements'),
  makeTable(
    ['Area', 'Requirement'],
    [
      ['Performance', 'Agent flow loads in < 1.5 seconds on mobile on 4G'],
      ['Mobile', 'All screens fully functional on mobile — primary use case'],
      ['Offline', 'Agent works without internet (answers stored locally, scoring runs client-side)'],
      ['Accessibility', 'WCAG 2.1 AA — readable contrast, keyboard navigation, screen reader labels'],
      ['Privacy', 'No personal data collected without explicit registration. Anonymous sessions use only localStorage.'],
      ['Scalability', 'Adding new destinations requires only updating the JSON data file — no code changes'],
      ['Browser support', 'Latest Chrome, Safari, Firefox on mobile and desktop'],
    ],
    [2200, 7546]
  ),

  gap(160),
  h2('5.9  Out of Scope — Phase 1'),
  bullet('User accounts and authentication'),
  bullet('Real LLM API (replaced by JavaScript scoring engine)'),
  bullet('User-generated content of any kind'),
  bullet('Booking or affiliate integrations'),
  bullet('Mobile native app (PWA is acceptable)'),
  bullet('Multi-language support'),
  bullet('Push notifications'),

  gap(160),
  h2('5.10  Open Questions'),
  makeTable(
    ['#', 'Question', 'Owner', 'Priority'],
    [
      ['1', 'How do we keep destination plan content up-to-date at scale? Manual, community-edited, or AI-assisted?', 'Product', 'High'],
      ['2', 'When does the agent prompt for registration — after session, or only before saving/sharing a plan?', 'Product', 'High'],
      ['3', 'What is the monetisation model before Phase 3? Any B2B angles (relocation services, remote job boards)?', 'Founder', 'Medium'],
      ['4', 'Which CMS or admin tool manages destination content without requiring code changes?', 'Engineering', 'Medium'],
      ['5', 'Is the Nomad Coins economy a closed loop or will coins eventually have real-world monetary value?', 'Product / Legal', 'Low'],
    ],
    [400, 5200, 1600, 1546]
  ),
];

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } },
        }],
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 600, hanging: 300 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20, color: C.brown } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 40, bold: true, font: 'Arial', color: C.terra },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: C.brown },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: C.green },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'NOMADBASE', font: 'Arial', size: 16, bold: true, color: C.terra }),
            new TextRun({ text: '  ·  Strategic Document Pack  ·  Confidential', font: 'Arial', size: 16, color: C.brLight }),
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.sand, space: 4 } },
          spacing: { after: 0 },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: '© 2026 NomadBase  ·  ', font: 'Arial', size: 16, color: C.brLight }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: C.brLight }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.sand, space: 4 } },
          spacing: { before: 0 },
        })],
      }),
    },
    children: [
      ...coverPage,
      ...sec1,
      ...sec2,
      ...sec3,
      ...sec4,
      ...sec5,
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('NomadBase_Strategic_Pack.docx', buf);
  console.log('Done: NomadBase_Strategic_Pack.docx');
});
