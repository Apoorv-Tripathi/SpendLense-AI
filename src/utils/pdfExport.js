import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'

/**
 * Generate a rich HTML report and trigger browser print/PDF
 */
export function exportToPDF(report, currency = { code: 'USD', symbol: '$', rate: 1 }) {
  const { metrics, verdict, context, findings, tools, generatedAt, aiSummary } = report

  const fmt = (n) => {
    const converted = n * currency.rate
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency.code, maximumFractionDigits: 0
    }).format(converted)
  }

  const date = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const moodColors = {
    excellent: '#2DD4BF', good: '#58A6FF', concerning: '#F0883E', critical: '#F85149'
  }
  const moodColor = moodColors[verdict.mood] || '#58A6FF'

  const severityColors = {
    critical: '#F85149', high: '#F0883E', medium: '#D29922', low: '#8B949E', info: '#58A6FF'
  }

  const realFindings = findings.filter(f => f.type !== 'healthy' && f.monthlySavings > 0)
  const activeTools  = tools.filter(t => parseFloat(t.monthlySpend) > 0)

  const wasteScore    = metrics.wasteScore ?? 0
  const healthLabel   = wasteScore >= 75 ? 'Good' : wasteScore >= 50 ? 'Fair' : 'Needs Attention'
  const healthColor   = wasteScore >= 75 ? '#2DD4BF' : wasteScore >= 50 ? '#D29922' : '#F85149'
  const yourWaste     = metrics.wasteRate ? (metrics.wasteRate * 100).toFixed(0) : Math.round((1 - wasteScore / 100) * 100)
  const perEmployee   = metrics.perEmployeeCost ?? 0
  const annualSpend   = metrics.totalMonthlySpend * 12
  const critCount     = metrics.criticalCount ?? realFindings.filter(f => f.severity === 'critical').length
  const highCount     = metrics.highCount ?? realFindings.filter(f => f.severity === 'high').length
  const year1         = metrics.potentialAnnualSavings
  const year2         = year1 * 2
  const year3         = year1 * 3

  // Build per-tool spend % for bar chart
  const totalSpend = metrics.totalMonthlySpend || 1
  const toolBars = activeTools.map(t => {
    const spec = TOOL_KNOWLEDGE[t.toolId] || TOOL_KNOWLEDGE[t.toolName]
    const pct  = Math.min(Math.round((parseFloat(t.monthlySpend) / totalSpend) * 100), 100)
    const color = spec?.color || '#58A6FF'
    return { spec, t, pct, color }
  }).sort((a, b) => parseFloat(b.t.monthlySpend) - parseFloat(a.t.monthlySpend))

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SpendLens Audit Report — ${date}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #ffffff;
      color: #1F2328;
      font-size: 13px;
      line-height: 1.6;
    }
    .page { max-width: 820px; margin: 0 auto; padding: 44px 52px; }
    @media print {
      .page { padding: 24px 36px; }
      .no-break { page-break-inside: avoid; }
      .page-break { page-break-before: always; }
    }

    /* Header */
    .header {
      display: flex; align-items: center; justify-content: space-between;
      padding-bottom: 24px; border-bottom: 2px solid #F0F0F0; margin-bottom: 32px;
    }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, #388BFD, #58A6FF);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 20px;
    }
    .logo-text { font-size: 22px; font-weight: 800; color: #1F2328; }
    .logo-text span { color: #388BFD; }
    .meta { text-align: right; color: #6E7781; font-size: 11px; line-height: 1.8; }

    /* Verdict */
    .verdict {
      padding: 22px 26px; border-radius: 14px; margin-bottom: 28px;
      border-left: 5px solid ${moodColor}; background: ${moodColor}0D;
    }
    .verdict h1 { font-size: 24px; font-weight: 800; color: #1F2328; margin-bottom: 6px; }
    .verdict p  { color: #6E7781; font-size: 13px; }

    /* KPI grid */
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    .kpi {
      padding: 16px; border-radius: 12px;
      border: 1px solid #E8EBEE; background: #FAFBFC;
    }
    .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #8B949E; margin-bottom: 4px; }
    .kpi-value { font-size: 20px; font-weight: 800; }
    .kpi-sub   { font-size: 10px; color: #8B949E; margin-top: 3px; }

    /* AI Summary */
    .ai-box {
      padding: 18px 22px; border-radius: 12px;
      background: #EFF6FF; border-left: 4px solid #58A6FF; margin-bottom: 28px;
    }
    .ai-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #388BFD; font-weight: 700; margin-bottom: 8px; }
    .ai-text  { color: #374151; font-size: 13px; line-height: 1.75; }

    /* Section title */
    .section-title {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
      color: #8B949E; font-weight: 700;
      border-bottom: 1px solid #F0F0F0;
      padding-bottom: 8px; margin-bottom: 16px; margin-top: 28px;
    }

    /* Analytics grid */
    .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 4px; }
    .analytics-card {
      padding: 16px 18px; border-radius: 12px;
      border: 1px solid #E8EBEE; background: #FAFBFC;
    }
    .analytics-card-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #8B949E; margin-bottom: 12px; font-weight: 700; }

    /* Bar rows */
    .bar-row { margin-bottom: 10px; }
    .bar-row-header { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .bar-row-label  { font-size: 12px; font-weight: 600; color: #1F2328; }
    .bar-row-value  { font-size: 12px; font-weight: 700; color: #1F2328; }
    .bar-track { height: 8px; border-radius: 4px; background: #E8EBEE; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 4px; }

    /* Comparison rows */
    .compare-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F6F8FA; }
    .compare-label { font-size: 12px; color: #6E7781; }
    .compare-vals  { display: flex; gap: 16px; font-size: 12px; font-weight: 600; }

    /* Savings projection */
    .proj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .proj-card {
      padding: 14px; border-radius: 10px; text-align: center;
      border: 1px solid #E8EBEE; background: #FAFBFC;
    }
    .proj-year  { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #8B949E; margin-bottom: 6px; }
    .proj-value { font-size: 18px; font-weight: 800; color: #388BFD; }
    .proj-sub   { font-size: 10px; color: #8B949E; margin-top: 3px; }

    /* Tool rows */
    .tool-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 0; border-bottom: 1px solid #F6F8FA;
    }
    .tool-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
    .tool-name { font-weight: 600; font-size: 13px; color: #1F2328; }
    .tool-meta { font-size: 11px; color: #8B949E; margin-top: 1px; }
    .tool-right { text-align: right; }
    .tool-spend { font-weight: 700; font-size: 14px; color: #1F2328; }
    .tool-pct   { font-size: 11px; color: #8B949E; }

    /* Findings */
    .finding {
      padding: 16px 18px; border-radius: 10px;
      margin-bottom: 12px; border: 1px solid #E8EBEE; background: #FAFBFC;
    }
    .finding-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    .finding-tag {
      display: inline-block; padding: 2px 8px; border-radius: 100px;
      font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    }
    .finding-title  { font-weight: 700; font-size: 13px; color: #1F2328; margin: 5px 0 6px; }
    .finding-desc   { font-size: 12px; color: #6E7781; line-height: 1.55; }
    .finding-action {
      font-size: 12px; color: #374151; margin-top: 10px; padding-top: 10px;
      border-top: 1px solid #F0F0F0; display: flex; align-items: flex-start; gap: 6px;
    }
    .finding-savings { font-size: 14px; font-weight: 800; white-space: nowrap; flex-shrink: 0; }
    .finding-annual  { font-size: 11px; text-align: right; margin-top: 2px; }

    /* Insight rows */
    .insight-row {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 10px 0; border-bottom: 1px solid #F6F8FA; font-size: 12px; color: #374151;
    }
    .insight-icon { flex-shrink: 0; margin-top: 1px; }

    /* Score gauge */
    .score-row { display: flex; align-items: center; gap: 16px; padding: 14px 0; }
    .score-circle {
      width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800;
      border: 4px solid ${healthColor};
      color: ${healthColor};
    }
    .score-details { flex: 1; }
    .score-label { font-size: 13px; font-weight: 700; color: #1F2328; }
    .score-sub   { font-size: 11px; color: #8B949E; margin-top: 2px; }

    /* Footer */
    .footer {
      margin-top: 48px; padding-top: 20px;
      border-top: 1px solid #F0F0F0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-text { font-size: 11px; color: #8B949E; }

    /* Badges */
    .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
    .badge {
      padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
      border: 1px solid;
    }
  </style>
</head>
<body>
<div class="page">

  <!-- ── Header ── -->
  <div class="header">
    <div class="logo">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">Spend<span>Lens</span></div>
    </div>
    <div class="meta">
      <div style="font-weight:700;color:#1F2328;font-size:13px;">AI Spend Audit Report</div>
      <div>${date}</div>
      <div>${context.teamSize}-person · ${context.primaryUseCase} team</div>
      <div style="margin-top:4px;">
        <span style="background:${moodColor}15;color:${moodColor};padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;">
          ${verdict.mood}
        </span>
      </div>
    </div>
  </div>

  <!-- ── Verdict ── -->
  <div class="verdict no-break">
    <h1>${verdict.headline}</h1>
    <p>${verdict.subtext}</p>
    <div class="badge-row">
      ${critCount > 0 ? `<span class="badge" style="color:#F85149;border-color:#F8514940;background:#F8514910;">${critCount} critical finding${critCount > 1 ? 's' : ''}</span>` : ''}
      ${highCount > 0 ? `<span class="badge" style="color:#F0883E;border-color:#F0883E40;background:#F0883E10;">${highCount} high finding${highCount > 1 ? 's' : ''}</span>` : ''}
      <span class="badge" style="color:#8B949E;border-color:#8B949E40;background:#8B949E10;">${metrics.toolCount} tool${metrics.toolCount !== 1 ? 's' : ''} audited</span>
      <span class="badge" style="color:#8B949E;border-color:#8B949E40;background:#8B949E10;">${context.teamSize} team members</span>
    </div>
  </div>

  <!-- ── KPI Cards ── -->
  <div class="kpi-grid no-break">
    <div class="kpi">
      <div class="kpi-label">Monthly Spend</div>
      <div class="kpi-value" style="color:#1F2328">${fmt(metrics.totalMonthlySpend)}</div>
      <div class="kpi-sub">${fmt(annualSpend)} / year</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Savings Potential</div>
      <div class="kpi-value" style="color:#388BFD">${fmt(metrics.potentialAnnualSavings)}</div>
      <div class="kpi-sub">${fmt(metrics.potentialMonthlySavings)}/mo · ${metrics.savingsPercent?.toFixed(0) ?? 0}% of spend</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Per Employee</div>
      <div class="kpi-value" style="color:${perEmployee > 80 ? '#F0883E' : '#2DD4BF'}">${fmt(perEmployee)}</div>
      <div class="kpi-sub">per person / month</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Waste Score</div>
      <div class="kpi-value" style="color:${healthColor}">${wasteScore}/100</div>
      <div class="kpi-sub">${healthLabel} · ${yourWaste}% waste rate</div>
    </div>
  </div>

  <!-- ── AI Summary ── -->
  ${aiSummary?.text ? `
  <div class="ai-box no-break">
    <div class="ai-label">⚡ AI-Generated Audit Summary</div>
    <div class="ai-text">${aiSummary.text}</div>
  </div>` : ''}

  <!-- ── Analytics Section ── -->
  <div class="section-title">Analytics &amp; Insights</div>
  <div class="analytics-grid no-break">

    <!-- Spend Health -->
    <div class="analytics-card">
      <div class="analytics-card-title">Spend Health Score</div>
      <div class="score-row">
        <div class="score-circle">${wasteScore}</div>
        <div class="score-details">
          <div class="score-label">${healthLabel}</div>
          <div class="score-sub">Waste rate: ${yourWaste}% (industry avg: 18%)</div>
          <div class="score-sub" style="margin-top:4px;">
            ${wasteScore >= 75 ? '✓ Your AI spend is well-optimised' : wasteScore >= 50 ? '⚠ Room for improvement' : '✗ Significant waste detected'}
          </div>
        </div>
      </div>
    </div>

    <!-- VS Industry -->
    <div class="analytics-card">
      <div class="analytics-card-title">vs Industry Average</div>
      <div class="compare-row">
        <div class="compare-label">Cost / employee / mo</div>
        <div class="compare-vals">
          <span style="color:#F0883E">You: ${fmt(perEmployee)}</span>
          <span style="color:#8B949E">Avg: ${fmt(45)}</span>
        </div>
      </div>
      <div class="compare-row">
        <div class="compare-label">Waste rate</div>
        <div class="compare-vals">
          <span style="color:${parseInt(yourWaste) > 18 ? '#F85149' : '#2DD4BF'}">You: ${yourWaste}%</span>
          <span style="color:#8B949E">Avg: 18%</span>
        </div>
      </div>
      <div class="compare-row">
        <div class="compare-label">Monthly spend</div>
        <div class="compare-vals">
          <span style="color:#58A6FF">You: ${fmt(metrics.totalMonthlySpend)}</span>
          <span style="color:#8B949E">Avg: ${fmt(215)}</span>
        </div>
      </div>
      <div class="compare-row" style="border:none">
        <div class="compare-label">Tools running</div>
        <div class="compare-vals">
          <span style="color:#58A6FF">You: ${metrics.toolCount}</span>
          <span style="color:#8B949E">Avg: 2.9</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Spend Breakdown Chart ── -->
  <div class="analytics-card no-break" style="margin-top:14px;">
    <div class="analytics-card-title">Spend Breakdown by Tool</div>
    ${toolBars.map(({ spec, t, pct, color }) => `
    <div class="bar-row">
      <div class="bar-row-header">
        <span class="bar-row-label">${spec?.name || t.toolName || t.toolId}</span>
        <span class="bar-row-value">${fmt(parseFloat(t.monthlySpend))}/mo &nbsp;<span style="color:#8B949E;font-weight:400">(${pct}%)</span></span>
      </div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`).join('')}
  </div>

  <!-- ── 3-Year Savings Projection ── -->
  <div class="section-title">3-Year Savings Projection</div>
  <div class="proj-grid no-break">
    <div class="proj-card">
      <div class="proj-year">Year 1</div>
      <div class="proj-value">${fmt(year1)}</div>
      <div class="proj-sub">if changes made now</div>
    </div>
    <div class="proj-card">
      <div class="proj-year">Year 2</div>
      <div class="proj-value">${fmt(year2)}</div>
      <div class="proj-sub">cumulative savings</div>
    </div>
    <div class="proj-card">
      <div class="proj-year">Year 3</div>
      <div class="proj-value">${fmt(year3)}</div>
      <div class="proj-sub">cumulative savings</div>
    </div>
  </div>

  <!-- ── Smart Insights ── -->
  ${(metrics.totalMonthlySpend > 0) ? `
  <div class="section-title">Smart Insights</div>
  <div class="no-break">
    ${perEmployee > 80 ? `
    <div class="insight-row">
      <div class="insight-icon">⚠</div>
      <div>At ${fmt(perEmployee)}/employee/mo, your AI spend exceeds the ${fmt(80)} threshold where ROI typically needs justification.</div>
    </div>` : ''}
    ${parseInt(yourWaste) > 18 ? `
    <div class="insight-row">
      <div class="insight-icon">📉</div>
      <div>${yourWaste}% of your AI budget is recoverable — more than double the 18% industry average waste rate.</div>
    </div>` : ''}
    ${metrics.potentialAnnualSavings > 1000 ? `
    <div class="insight-row">
      <div class="insight-icon">💡</div>
      <div>At ${fmt(metrics.potentialAnnualSavings)}/year in potential savings, acting on these findings pays back in the first month.</div>
    </div>` : ''}
    <div class="insight-row">
      <div class="insight-icon">📊</div>
      <div>Your team spends ${fmt(metrics.totalMonthlySpend)} monthly on ${metrics.toolCount} AI tool${metrics.toolCount !== 1 ? 's' : ''} for ${context.teamSize} people — that's ${fmt(annualSpend)} annually.</div>
    </div>
  </div>` : ''}

  <!-- ── Tools Audited ── -->
  <div class="section-title page-break">Tools Audited (${activeTools.length})</div>
  <div class="no-break">
    ${activeTools.map(t => {
      const spec = TOOL_KNOWLEDGE[t.toolId] || TOOL_KNOWLEDGE[t.toolName]
      const spend = parseFloat(t.monthlySpend) || 0
      const seats = parseInt(t.seats) || 1
      const pct   = totalSpend > 0 ? Math.round((spend / totalSpend) * 100) : 0
      const color = spec?.color || '#58A6FF'
      return `
      <div class="tool-row">
        <div style="display:flex;align-items:center">
          <div class="tool-dot" style="background:${color}"></div>
          <div>
            <div class="tool-name">${spec?.name || t.toolName || t.toolId}</div>
            <div class="tool-meta">${seats} seat${seats > 1 ? 's' : ''} · ${t.plan || 'Unknown plan'} · ${fmt(spend / seats)}/seat/mo</div>
          </div>
        </div>
        <div class="tool-right">
          <div class="tool-spend">${fmt(spend)}/mo</div>
          <div class="tool-pct">${pct}% of budget</div>
        </div>
      </div>`
    }).join('')}
    <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:13px;border-top:2px solid #F0F0F0;margin-top:4px;">
      <span>Total</span>
      <span>${fmt(metrics.totalMonthlySpend)}/mo &nbsp;·&nbsp; ${fmt(annualSpend)}/yr</span>
    </div>
  </div>

  <!-- ── Findings ── -->
  ${realFindings.length > 0 ? `
  <div class="section-title" style="margin-top:32px;">Findings &amp; Recommendations (${realFindings.length})</div>
  ${realFindings.map((f, i) => {
    const col = severityColors[f.severity] || '#8B949E'
    return `
    <div class="finding no-break">
      <div class="finding-header">
        <div style="flex:1">
          <span class="finding-tag" style="background:${col}15;color:${col}">${f.tag || f.severity?.toUpperCase()}</span>
          <div class="finding-title">${i + 1}. ${f.title}</div>
          <div class="finding-desc">${f.description}</div>
        </div>
        ${f.monthlySavings > 0 ? `
        <div style="text-align:right">
          <div class="finding-savings" style="color:${col}">-${fmt(f.monthlySavings)}/mo</div>
          <div class="finding-annual" style="color:#8B949E">-${fmt(f.monthlySavings * 12)}/yr</div>
        </div>` : ''}
      </div>
      <div class="finding-action">
        <span style="color:${col};font-weight:700">→</span>
        <span>${f.action}</span>
      </div>
    </div>`
  }).join('')}

  <!-- Savings Summary Table -->
  <div class="analytics-card no-break" style="margin-top:8px;">
    <div class="analytics-card-title">Savings Summary</div>
    ${realFindings.map((f, i) => {
      const col = severityColors[f.severity] || '#8B949E'
      return `
      <div class="compare-row">
        <div class="compare-label">${i + 1}. ${f.title}</div>
        <div class="compare-vals">
          <span style="color:${col}">-${fmt(f.monthlySavings)}/mo</span>
          <span style="color:#8B949E">-${fmt(f.monthlySavings * 12)}/yr</span>
        </div>
      </div>`
    }).join('')}
    <div class="compare-row" style="border:none;margin-top:4px;">
      <div class="compare-label" style="font-weight:700;color:#1F2328">Total potential savings</div>
      <div class="compare-vals">
        <span style="color:#388BFD;font-weight:800">-${fmt(metrics.potentialMonthlySavings)}/mo</span>
        <span style="color:#388BFD;font-weight:800">-${fmt(metrics.potentialAnnualSavings)}/yr</span>
      </div>
    </div>
  </div>` : `
  <div class="section-title" style="margin-top:32px;">Findings</div>
  <div style="padding:20px;text-align:center;color:#8B949E;font-size:13px;background:#FAFBFC;border-radius:10px;border:1px solid #E8EBEE;">
    ✓ No significant issues found. Your AI stack appears well-optimised.
  </div>`}

  <!-- ── Footer ── -->
  <div class="footer">
    <div class="footer-text">Generated by SpendLens · ${date}</div>
    <div class="footer-text">Estimates based on published list pricing. Actual savings depend on contract terms.</div>
  </div>

</div>
<script>window.onload = () => window.print()</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}