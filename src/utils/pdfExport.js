import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'

export function exportToPDF(report, currency = { code: 'USD', symbol: '$', rate: 1 }) {
  const { metrics, verdict, context, findings, tools, generatedAt, aiSummary } = report

  const fmt = (n) => {
    const converted = n * currency.rate

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0
    }).format(converted)
  }

  const date = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const moodColors = {
    excellent: '#2DD4BF',
    good: '#58A6FF',
    concerning: '#F0883E',
    critical: '#F85149'
  }

  const moodColor = moodColors[verdict.mood] || '#58A6FF'

  const severityColors = {
    critical: '#F85149',
    high: '#F0883E',
    medium: '#D29922',
    low: '#8B949E',
    info: '#58A6FF'
  }

  const realFindings = findings.filter(
    (f) => f.type !== 'healthy' && f.monthlySavings > 0
  )

  const activeTools = tools.filter(
    (t) => parseFloat(t.monthlySpend) > 0
  )

  const wasteScore = metrics.wasteScore ?? 0

  const healthLabel =
    wasteScore >= 75
      ? 'Good'
      : wasteScore >= 50
      ? 'Fair'
      : 'Needs Attention'

  const healthColor =
    wasteScore >= 75
      ? '#2DD4BF'
      : wasteScore >= 50
      ? '#D29922'
      : '#F85149'

  const yourWaste = metrics.wasteRate
    ? (metrics.wasteRate * 100).toFixed(0)
    : Math.round((1 - wasteScore / 100) * 100)

  const perEmployee = metrics.perEmployeeCost ?? 0
  const annualSpend = metrics.totalMonthlySpend * 12

  const critCount =
    metrics.criticalCount ??
    realFindings.filter((f) => f.severity === 'critical').length

  const highCount =
    metrics.highCount ??
    realFindings.filter((f) => f.severity === 'high').length

  const year1 = metrics.potentialAnnualSavings
  const year2 = year1 * 2
  const year3 = year1 * 3

  const totalSpend = metrics.totalMonthlySpend || 1

  const toolBars = activeTools
    .map((t) => {
      const spec =
        TOOL_KNOWLEDGE[t.toolId] ||
        TOOL_KNOWLEDGE[t.toolName]

      const pct = Math.min(
        Math.round(
          (parseFloat(t.monthlySpend) / totalSpend) * 100
        ),
        100
      )

      const color = spec?.color || '#58A6FF'

      return { spec, t, pct, color }
    })
    .sort(
      (a, b) =>
        parseFloat(b.t.monthlySpend) -
        parseFloat(a.t.monthlySpend)
    )

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>SpendLens Audit Report — ${date}</title>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #ffffff;
  color: #1F2328;
  font-size: 13px;
  line-height: 1.6;
}

.page {
  max-width: 820px;
  margin: 0 auto;
  padding: 44px 52px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 2px solid #F0F0F0;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #388BFD, #58A6FF);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
}

.logo-text span {
  color: #388BFD;
}

.meta {
  text-align: right;
  color: #6E7781;
  font-size: 11px;
}

.verdict {
  padding: 22px 26px;
  border-radius: 14px;
  margin-bottom: 28px;
  border-left: 5px solid ${moodColor};
  background: ${moodColor}15;
}

.verdict h1 {
  font-size: 24px;
  margin-bottom: 6px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.kpi {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #E8EBEE;
  background: #FAFBFC;
}

.kpi-label {
  font-size: 10px;
  text-transform: uppercase;
  color: #8B949E;
}

.kpi-value {
  font-size: 20px;
  font-weight: 800;
}

.section-title {
  font-size: 11px;
  text-transform: uppercase;
  color: #8B949E;
  border-bottom: 1px solid #F0F0F0;
  padding-bottom: 8px;
  margin: 28px 0 16px;
}

.bar-row {
  margin-bottom: 10px;
}

.bar-track {
  height: 8px;
  border-radius: 4px;
  background: #E8EBEE;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
}

.tool-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #F6F8FA;
}

.finding {
  padding: 16px 18px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #E8EBEE;
  background: #FAFBFC;
}

.footer {
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
}
</style>
</head>

<body>

<div class="page">

<div class="header">
  <div class="logo">
    <div class="logo-icon">⚡</div>
    <div class="logo-text">
      Spend<span>Lens</span>
    </div>
  </div>

  <div class="meta">
    <div><strong>AI Spend Audit Report</strong></div>
    <div>${date}</div>
    <div>${context.teamSize}-person · ${context.primaryUseCase} team</div>
  </div>
</div>

<div class="verdict">
  <h1>${verdict.headline}</h1>
  <p>${verdict.subtext}</p>
</div>

<div class="kpi-grid">

  <div class="kpi">
    <div class="kpi-label">Monthly Spend</div>
    <div class="kpi-value">${fmt(metrics.totalMonthlySpend)}</div>
  </div>

  <div class="kpi">
    <div class="kpi-label">Annual Savings</div>
    <div class="kpi-value">${fmt(metrics.potentialAnnualSavings)}</div>
  </div>

  <div class="kpi">
    <div class="kpi-label">Per Employee</div>
    <div class="kpi-value">${fmt(perEmployee)}</div>
  </div>

  <div class="kpi">
    <div class="kpi-label">Waste Score</div>
    <div class="kpi-value">${wasteScore}/100</div>
  </div>

</div>

${
  aiSummary?.text
    ? `
<div class="section-title">AI Summary</div>

<div class="finding">
  ${aiSummary.text}
</div>
`
    : ''
}

<div class="section-title">
Spend Breakdown
</div>

${toolBars
  .map(
    ({ spec, t, pct, color }) => `
<div class="bar-row">

  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
    <span>${spec?.name || t.toolName || t.toolId}</span>

    <span>
      ${fmt(parseFloat(t.monthlySpend))}
      (${pct}%)
    </span>
  </div>

  <div class="bar-track">
    <div
      class="bar-fill"
      style="width:${pct}%;background:${color}"
    ></div>
  </div>

</div>
`
  )
  .join('')}

<div class="section-title">
Tools Audited
</div>

${activeTools
  .map((t) => {
    const spec =
      TOOL_KNOWLEDGE[t.toolId] ||
      TOOL_KNOWLEDGE[t.toolName]

    const spend = parseFloat(t.monthlySpend) || 0
    const seats = parseInt(t.seats) || 1

    return `
<div class="tool-row">

  <div>
    <div>
      <strong>${spec?.name || t.toolName || t.toolId}</strong>
    </div>

    <div style="font-size:11px;color:#8B949E;">
      ${seats} seats · ${t.plan || 'Unknown plan'}
    </div>
  </div>

  <div>
    ${fmt(spend)}/mo
  </div>

</div>
`
  })
  .join('')}

<div class="section-title">
Findings & Recommendations
</div>

${realFindings
  .map((f, i) => {
    const col =
      severityColors[f.severity] || '#8B949E'

    return `
<div class="finding">

  <div style="display:flex;justify-content:space-between;margin-bottom:8px;">

    <div>
      <div
        style="
          display:inline-block;
          background:${col}15;
          color:${col};
          padding:2px 8px;
          border-radius:999px;
          font-size:10px;
          margin-bottom:6px;
        "
      >
        ${f.tag || f.severity}
      </div>

      <div>
        <strong>${i + 1}. ${f.title}</strong>
      </div>
    </div>

    <div style="color:${col};font-weight:700;">
      -${fmt(f.monthlySavings)}/mo
    </div>

  </div>

  <div style="margin-bottom:8px;">
    ${f.description}
  </div>

  <div>
    → ${f.action}
  </div>

</div>
`
  })
  .join('')}

<div class="footer">
  <div>
    Generated by SpendLens · ${date}
  </div>

  <div>
    Estimated pricing data
  </div>
</div>

</div>

<script>
window.onload = () => window.print()
</script>

</body>
</html>
`

  const win = window.open('', '_blank')

  if (win) {
    win.document.write(html)
    win.document.close()
  }
}