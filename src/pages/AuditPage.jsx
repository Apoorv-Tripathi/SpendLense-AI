import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, ArrowRight, Save, Info, Zap } from 'lucide-react'
import { useAuditForm } from '../hooks/useAuditForm'
import { useThemeStyles } from '../hooks/useThemeStyles'
import { USE_CASES } from '../constants'
import { formatLastSaved } from '../utils'
import ToolCard from '../components/form/ToolCard'
import SpendSummary from '../components/form/SpendSummary'
import FormProgress from '../components/form/FormProgress'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

export default function AuditPage({ onGenerateReport, reportLoading }) {
  const navigate = useNavigate()
  const t = useThemeStyles()
  const {
    formState, updateField, addTool, removeTool,
    updateTool, duplicateTool, resetForm,
    totals, isValid, isDirty, lastSaved,
  } = useAuditForm()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!isValid || reportLoading) return
    onGenerateReport(formState)
    navigate('/results')
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="section-tag mb-4 inline-flex">
            <Zap size={10} className="fill-current" /> Free Audit
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight gradient-text mt-3">
            Your AI Spend Audit
          </h1>
          <p className="mt-3 font-body text-base max-w-xl" style={{ color: t.textMuted }}>
            Log every AI tool your team uses. We'll calculate your total spend, per-seat cost, and surface optimization opportunities.
          </p>
          <div className="mt-4 flex items-center gap-2 font-mono text-xs" style={{ color: t.textFaint }}>
            <Save size={11} />
            {isDirty ? 'Saving…' : lastSaved ? formatLastSaved(lastSaved) : 'Auto-saved to browser'}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 rounded-2xl p-5" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
          <FormProgress formState={formState} totals={totals} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            <div className="space-y-8">

              {/* Team Context */}
              <fieldset className="rounded-2xl p-6" style={{ background: t.bgCard, border: `1px solid ${t.border}` }}>
                <legend className="sr-only">Team Information</legend>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(88,166,255,0.10)', border: '1px solid rgba(88,166,255,0.20)' }}>
                    <span className="font-mono text-xs" style={{ color: '#58A6FF' }}>01</span>
                  </div>
                  <h2 className="font-display font-bold text-base" style={{ color: t.textPrimary }}>Team Context</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Team Size" id="team-size" type="number" value={formState.teamSize}
                    onChange={val => updateField('teamSize', val)} placeholder="12" suffix="people" min="1" required />
                  <Select label="Primary Use Case" id="use-case" value={formState.primaryUseCase}
                    onChange={val => updateField('primaryUseCase', val)} options={USE_CASES}
                    placeholder="What's AI used for?" required />
                </div>
              </fieldset>

              {/* AI Tools */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(88,166,255,0.10)', border: '1px solid rgba(88,166,255,0.20)' }}>
                    <span className="font-mono text-xs" style={{ color: '#58A6FF' }}>02</span>
                  </div>
                  <h2 className="font-display font-bold text-base" style={{ color: t.textPrimary }}>
                    AI Tools
                    <span className="ml-2 font-mono text-xs font-normal" style={{ color: t.textFaint }}>
                      ({formState.tools.length} {formState.tools.length === 1 ? 'entry' : 'entries'})
                    </span>
                  </h2>
                </div>

                <div className="flex items-start gap-2 mb-5 rounded-xl px-4 py-3"
                  style={{ background: 'rgba(88,166,255,0.05)', border: '1px solid rgba(88,166,255,0.15)' }}>
                  <Info size={14} style={{ color: '#58A6FF', flexShrink: 0, marginTop: '1px' }} />
                  <p className="font-body text-xs leading-relaxed" style={{ color: t.textMuted }}>
                    Add all AI tools your team pays for — including individual subscriptions, team plans, and API usage. Estimates are fine.
                  </p>
                </div>

                <div className="space-y-4">
                  {formState.tools.map((tool, i) => (
                    <ToolCard key={tool.id} tool={tool} index={i} onUpdate={updateTool}
                      onRemove={removeTool} onDuplicate={duplicateTool} canRemove={formState.tools.length > 1} />
                  ))}
                </div>

                <button type="button" onClick={addTool}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-body text-sm font-medium transition-all duration-200 group"
                  style={{ border: `1px dashed ${t.borderLight}`, color: t.textFaint, background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(88,166,255,0.40)'; e.currentTarget.style.color = '#58A6FF'; e.currentTarget.style.background = 'rgba(88,166,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.borderLight; e.currentTarget.style.color = t.textFaint; e.currentTarget.style.background = 'transparent' }}>
                  <Plus size={16} />
                  Add another tool
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button type="submit" disabled={!isValid || reportLoading}
                  className="btn-primary py-4 px-10 text-sm w-full sm:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                  {reportLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Analysing your stack…
                    </>
                  ) : (
                    <>Generate Audit Report <ArrowRight size={16} /></>
                  )}
                </button>

                {!showResetConfirm ? (
                  <button type="button" onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all"
                    style={{ color: t.textFaint }}>
                    <RotateCcw size={14} /> Reset form
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs" style={{ color: t.textFaint }}>Sure?</span>
                    <button type="button" onClick={() => { resetForm(); setShowResetConfirm(false) }}
                      className="font-body text-xs px-2 py-1 rounded transition-all" style={{ color: '#F85149' }}>
                      Yes, reset
                    </button>
                    <button type="button" onClick={() => setShowResetConfirm(false)}
                      className="font-body text-xs px-2 py-1 rounded transition-all" style={{ color: t.textFaint }}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isValid && (
                <p className="font-body text-xs -mt-2" style={{ color: t.textFaint }}>
                  Complete team size, use case, and at least one tool with spend to generate your report.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <SpendSummary tools={formState.tools} teamSize={formState.teamSize} totals={totals} />
          </div>
        </form>
      </div>
    </div>
  )
}
