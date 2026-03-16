/**
 * SMIC & Salary Benchmarks
 *
 * Tracks the SMIC (minimum wage) evolution and positions the user's
 * salary against the national and IT sector reference points.
 *
 * Key insight: If the SMIC grows faster than your salary, the gap shrinks —
 * you converge toward the minimum wage in relative terms.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type SMICPoint = {
  date: string         // YYYY-MM (effective date of the SMIC value)
  hourlyBrut: number  // SMIC horaire brut (€/h)
  monthlyBrut: number // SMIC mensuel brut (35h/week = 151.67h)
  label: string       // Human-readable label
}

export type SalaryReference = {
  label: string
  monthlyNet: number
  annualGross: number
  scope: string
  year: number
  source: string
}

export type SMICMultiplePoint = {
  year: number
  smicMensuel: number
  userGrossMensuel: number
  multiple: number           // User gross monthly / SMIC monthly
  realSMIC?: number          // CPI-deflated SMIC (base 2022)
  realUserSalary?: number    // CPI-deflated user salary (base 2022)
}

// ── SMIC historical values (official government publications) ─────────────────
// Source: Journal Officiel, décrets de revalorisation du SMIC
// SMIC mensuel brut = SMIC horaire × 151.67h (durée légale 35h/semaine)

export const SMIC_HISTORY: SMICPoint[] = [
  { date: '2015-01', hourlyBrut: 9.61,  monthlyBrut: 1457.52, label: 'Jan. 2015' },
  { date: '2016-01', hourlyBrut: 9.67,  monthlyBrut: 1466.62, label: 'Jan. 2016' },
  { date: '2017-01', hourlyBrut: 9.76,  monthlyBrut: 1480.27, label: 'Jan. 2017' },
  { date: '2018-01', hourlyBrut: 9.88,  monthlyBrut: 1498.47, label: 'Jan. 2018' },
  { date: '2019-01', hourlyBrut: 10.03, monthlyBrut: 1521.22, label: 'Jan. 2019' },
  { date: '2020-01', hourlyBrut: 10.15, monthlyBrut: 1539.42, label: 'Jan. 2020' },
  { date: '2021-01', hourlyBrut: 10.25, monthlyBrut: 1554.58, label: 'Jan. 2021' },
  { date: '2022-01', hourlyBrut: 10.57, monthlyBrut: 1603.12, label: 'Jan. 2022' },
  { date: '2022-05', hourlyBrut: 10.85, monthlyBrut: 1645.58, label: 'Mai 2022' },
  { date: '2022-08', hourlyBrut: 11.07, monthlyBrut: 1678.95, label: 'Août 2022' },
  { date: '2023-01', hourlyBrut: 11.27, monthlyBrut: 1709.28, label: 'Jan. 2023' },
  { date: '2023-05', hourlyBrut: 11.52, monthlyBrut: 1747.20, label: 'Mai 2023' },
  { date: '2024-01', hourlyBrut: 11.65, monthlyBrut: 1766.92, label: 'Jan. 2024' },
  { date: '2024-11', hourlyBrut: 11.88, monthlyBrut: 1801.80, label: 'Nov. 2024' },
  { date: '2025-01', hourlyBrut: 11.88, monthlyBrut: 1801.80, label: 'Jan. 2025' },
]

// ── Salary reference points (INSEE DADS/DSN 2022 — latest published) ──────────
// Source: INSEE Première n°1985 (2024), APEC Baromètre Emploi Cadre 2023

export const SALARY_REFERENCES: SalaryReference[] = [
  {
    label: 'SMIC brut mensuel',
    monthlyNet: 1430,
    annualGross: 21622,
    scope: 'France entière',
    year: 2025,
    source: 'Décret SMIC Jan. 2025',
  },
  {
    label: 'Salaire médian — tous salariés',
    monthlyNet: 2074,
    annualGross: 27600,
    scope: 'Secteur privé, France',
    year: 2022,
    source: 'INSEE DADS 2022',
  },
  {
    label: 'Salaire médian — cadres (tous secteurs)',
    monthlyNet: 4016,
    annualGross: 60000,
    scope: 'Secteur privé, France',
    year: 2022,
    source: 'INSEE DADS 2022',
  },
  {
    label: "Salaire médian — cadres IT (sect. J)",
    monthlyNet: 3432,
    annualGross: 52000,
    scope: "Information et communication",
    year: 2022,
    source: 'INSEE DADS 2022',
  },
  {
    label: 'Salaire médian — cadres APEC',
    monthlyNet: 3800,
    annualGross: 57000,
    scope: 'Cadres secteur privé, France',
    year: 2023,
    source: 'APEC Baromètre 2023',
  },
]

// ── Calculations ──────────────────────────────────────────────────────────────

export const ANNUAL_SMIC_FOR_CHART: Array<{ year: number; smicMensuel: number }> = [
  { year: 2015, smicMensuel: 1457.52 },
  { year: 2016, smicMensuel: 1466.62 },
  { year: 2017, smicMensuel: 1480.27 },
  { year: 2018, smicMensuel: 1498.47 },
  { year: 2019, smicMensuel: 1521.22 },
  { year: 2020, smicMensuel: 1539.42 },
  { year: 2021, smicMensuel: 1554.58 },
  { year: 2022, smicMensuel: 1678.95 }, // end-of-year value (August revalorisation)
  { year: 2023, smicMensuel: 1747.20 }, // end-of-year value (May revalorisation)
  { year: 2024, smicMensuel: 1801.80 }, // November revalorisation
  { year: 2025, smicMensuel: 1801.80 },
]

/**
 * Compute the user's SMIC multiple for each year.
 * The multiple = user gross monthly / SMIC monthly
 * A declining multiple means the SMIC is catching up to your salary.
 */
export function computeSMICMultiples(
  userGrossAnnual: number,
): SMICMultiplePoint[] {
  const grossMonthly = userGrossAnnual / 12
  return ANNUAL_SMIC_FOR_CHART.map(p => ({
    year: p.year,
    smicMensuel: p.smicMensuel,
    userGrossMensuel: grossMonthly,
    multiple: Math.round((grossMonthly / p.smicMensuel) * 100) / 100,
  }))
}

/**
 * Compute cumulative SMIC growth between two years (%)
 */
export function smicGrowthSince(fromYear: number): number {
  const from = ANNUAL_SMIC_FOR_CHART.find(p => p.year === fromYear)
  const latest = ANNUAL_SMIC_FOR_CHART[ANNUAL_SMIC_FOR_CHART.length - 1]
  if (!from || !latest) return 0
  return Math.round(((latest.smicMensuel / from.smicMensuel) - 1) * 1000) / 10
}

/**
 * Compute how many extra SMIC months of salary the user loses each year
 * due to SMIC growing faster than their salary.
 */
export function convergenceAlert(
  userGrossAnnual: number,
  fromYear = 2022,
): { smicGrowthPct: number; salaryGrowthPct: number; multipleChange: number; message: string } {
  const fromSMIC = ANNUAL_SMIC_FOR_CHART.find(p => p.year === fromYear)?.smicMensuel ?? 1
  const latestSMIC = ANNUAL_SMIC_FOR_CHART[ANNUAL_SMIC_FOR_CHART.length - 1].smicMensuel

  const smicGrowthPct = Math.round(((latestSMIC / fromSMIC) - 1) * 1000) / 10
  // Assume user salary hasn't changed (conservative)
  const salaryGrowthPct = 0
  const multipleFrom = (userGrossAnnual / 12) / fromSMIC
  const multipleNow = (userGrossAnnual / 12) / latestSMIC
  const multipleChange = Math.round((multipleNow - multipleFrom) * 100) / 100

  const message = smicGrowthPct > 0
    ? `Le SMIC a augmenté de ${smicGrowthPct.toFixed(1)} % depuis ${fromYear}. Sans revalorisation salariale, votre multiple SMIC est passé de ×${multipleFrom.toFixed(2)} à ×${multipleNow.toFixed(2)}.`
    : 'Le SMIC a stagné depuis cette période.'

  return { smicGrowthPct, salaryGrowthPct, multipleChange, message }
}
