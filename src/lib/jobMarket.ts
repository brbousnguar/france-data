/**
 * Job Market — salary benchmarks, career paths, and Nantes IT ecosystem
 * Static data sourced from APEC 2024, Glassdoor FR 2024, LinkedIn Salary
 */

// ── Salary benchmarks ────────────────────────────────────────────────────────

export type SalaryRange = {
  role: string
  techStack: string[]
  level: string
  expYears: string
  minK: number
  maxK: number
  medianK: number
  source: string
}

export const SALARY_BENCHMARKS: SalaryRange[] = [
  {
    role: 'Développeur MuleSoft',
    techStack: ['MuleSoft', 'Anypoint Platform'],
    level: 'Débutant',
    expYears: '0 – 2 ans',
    minK: 36, maxK: 46, medianK: 41,
    source: 'APEC / Glassdoor 2024',
  },
  {
    role: 'Développeur MuleSoft',
    techStack: ['MuleSoft', 'Anypoint Platform', 'API Management'],
    level: 'Confirmé',
    expYears: '2 – 5 ans',
    minK: 46, maxK: 62, medianK: 53,
    source: 'APEC / Glassdoor 2024',
  },
  {
    role: 'Lead MuleSoft / Architecte API',
    techStack: ['MuleSoft', 'API Design', 'Integration Patterns'],
    level: 'Senior',
    expYears: '5+ ans',
    minK: 62, maxK: 82, medianK: 70,
    source: 'APEC / LinkedIn 2024',
  },
  {
    role: 'Développeur SAP CC / IS-U',
    techStack: ['SAP', 'ABAP', 'IS-Utilities', 'CCS'],
    level: 'Confirmé',
    expYears: '2 – 5 ans',
    minK: 48, maxK: 65, medianK: 56,
    source: 'APEC / Indeed 2024',
  },
  {
    role: 'Consultant SAP Senior',
    techStack: ['SAP S/4HANA', 'IS-U', 'ABAP'],
    level: 'Senior',
    expYears: '5+ ans',
    minK: 65, maxK: 90, medianK: 76,
    source: 'APEC / LinkedIn 2024',
  },
  {
    role: 'Intégrateur ESB / iPaaS',
    techStack: ['MuleSoft', 'SAP PI/PO', 'REST', 'SOAP'],
    level: 'Confirmé',
    expYears: '2 – 5 ans',
    minK: 44, maxK: 60, medianK: 51,
    source: 'APEC / Indeed 2024',
  },
  {
    role: "Architecte d'Intégration SI",
    techStack: ['Architecture', 'API', 'ESB', 'Microservices'],
    level: 'Expert',
    expYears: '7+ ans',
    minK: 68, maxK: 95, medianK: 80,
    source: 'APEC / LinkedIn 2024',
  },
]

// ── Career progression paths ─────────────────────────────────────────────────

export type CareerPoint = { years: number; salary: number }

export type CareerPath = {
  name: string
  color: string
  description: string
  points: CareerPoint[]
}

export const CAREER_PATHS: CareerPath[] = [
  {
    name: 'MuleSoft / API',
    color: '#0055A4',
    description: 'MuleSoft Developer → Lead API → Architect',
    points: [
      { years: 0, salary: 38 },
      { years: 2, salary: 43 },
      { years: 3, salary: 52 },
      { years: 5, salary: 62 },
      { years: 8, salary: 73 },
      { years: 10, salary: 82 },
    ],
  },
  {
    name: 'SAP / S/4HANA',
    color: '#c0522a',
    description: 'SAP CC Dev → Consultant → Expert S/4HANA',
    points: [
      { years: 2, salary: 50 },
      { years: 3, salary: 55 },
      { years: 5, salary: 66 },
      { years: 8, salary: 78 },
      { years: 10, salary: 87 },
    ],
  },
  {
    name: 'Architecture SI',
    color: '#4a7c59',
    description: 'Intégrateur → Lead Architect → CTO/DSI',
    points: [
      { years: 5, salary: 68 },
      { years: 7, salary: 78 },
      { years: 10, salary: 88 },
      { years: 12, salary: 100 },
    ],
  },
]

// ── Nantes IT ecosystem ───────────────────────────────────────────────────────

export type ITCompany = {
  name: string
  type: string
  relevance: string
  url: string
}

export const NANTES_IT_COMPANIES: ITCompany[] = [
  { name: 'Capgemini', type: 'ESN / Conseil', relevance: 'SAP, MuleSoft, Intégration SI', url: 'https://www.capgemini.com/fr-fr/carrieres/' },
  { name: 'Sopra Steria', type: 'ESN / Conseil', relevance: 'SAP, Intégration, Transformation digitale', url: 'https://careers.soprasteria.com/fr' },
  { name: 'Axians', type: 'ESN / Infra', relevance: 'Intégration, API, Cloud', url: 'https://www.axians.fr/carrieres/' },
  { name: 'SQLI (votre employeur)', type: 'ESN / Digital', relevance: 'MuleSoft, E-commerce, Intégration', url: 'https://www.sqli.com/fr-fr/carrieres' },
  { name: 'CGI', type: 'ESN / Conseil', relevance: 'SAP, ERP, Intégration', url: 'https://www.cgi.com/france/fr-fr/careers' },
  { name: 'Niji', type: 'ESN / Studio', relevance: 'Intégration API, Back-end', url: 'https://www.niji.fr/rejoindre-niji' },
  { name: 'Business & Decision', type: 'ESN / Data', relevance: 'SAP BW, BI, Data', url: 'https://www.businessdecision.fr/offres-emploi' },
]

// ── France Travail search URL builder ────────────────────────────────────────

export function buildFranceTravailUrl(keyword: string, region = 'R52'): string {
  // R52 = Pays de la Loire
  const base = 'https://candidat.francetravail.fr/offres/recherche'
  const params = new URLSearchParams({
    motsCles: keyword,
    lieux: region,
    offresPartenaires: 'true',
    rayon: '30',
    tri: '0',
  })
  return `${base}?${params}`
}

export const QUICK_SEARCHES = [
  { label: 'MuleSoft — Pays de la Loire', keyword: 'MuleSoft', emoji: '🔌' },
  { label: 'SAP CC / IS-U — PDL', keyword: 'SAP IS-U', emoji: '⚙️' },
  { label: 'Intégrateur SI — Nantes', keyword: 'intégrateur middleware Nantes', emoji: '🔗' },
  { label: 'API Integration — PDL', keyword: 'API integration ESB', emoji: '🌐' },
  { label: 'Anypoint Platform', keyword: 'Anypoint Platform iPaaS', emoji: '☁️' },
]

// ── Market context ────────────────────────────────────────────────────────────

export type MarketSignal = {
  title: string
  body: string
  sentiment: 'positive' | 'neutral' | 'negative'
  source: string
}

export const MARKET_SIGNALS: MarketSignal[] = [
  {
    title: 'Migration SAP S/4HANA : forte demande',
    body: 'Le support de SAP ECC6 prend fin en 2027. Les projets de migration S/4HANA génèrent une forte demande pour les profils SAP CC/IS-U jusqu\'en 2026-2027.',
    sentiment: 'positive',
    source: 'SAP / DSAG 2024',
  },
  {
    title: 'MuleSoft Certified Developer : +15-20% de salaire',
    body: 'La certification MuleSoft Certified Developer (MCD) Level 1 ou Level 2 est fortement valorisée sur le marché et justifie une revalorisation significative.',
    sentiment: 'positive',
    source: 'Salesforce / APEC 2024',
  },
  {
    title: 'Ralentissement recrutement IT post-2023',
    body: 'Après les excès de recrutement de 2021-2022, le marché IT français s\'est normalisé en 2023-2024. Les ESN recrutent avec davantage de sélectivité.',
    sentiment: 'neutral',
    source: 'APEC Baromètre 2024',
  },
  {
    title: 'iPaaS / API Economy : croissance continue',
    body: 'Le marché de l\'intégration cloud (MuleSoft, Azure Integration, AWS) continue de croître avec la multiplication des projets de migration et d\'interconnexion SI.',
    sentiment: 'positive',
    source: 'Gartner iPaaS MQ 2024',
  },
]
