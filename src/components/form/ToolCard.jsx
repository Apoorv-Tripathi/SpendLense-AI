import { useState } from 'react'
import { Trash2, Copy, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { AI_TOOLS } from '../../constants'
import { useCurrency } from '../../context/CurrencyContext'
import { useThemeStyles } from '../../hooks/useThemeStyles'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function ToolCard({ tool, onUpdate, onRemove, onDuplicate, index, canRemove }) {
  const [collapsed, setCollapsed] = useState(false)
  const { format: formatCurrency , currency} = useCurrency()
  const t = useThemeStyles()

  const selectedToolMeta = AI_TOOLS.find(t => t.id === tool.toolName)
  const planOptions      = selectedToolMeta?.plans || []
  const monthlyCost      = parseFloat(tool.monthlySpend) || 0
  const seats            = parseInt(tool.seats) || 0
  const costPerSeat      = seats > 0 ? monthlyCost / seats : 0

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: t.bgCard,
        border: `1px solid ${selectedToolMeta ? t.borderLight : t.border}`,
        boxShadow: t.isDark ? (selectedToolMeta ? '0 2px 12px rgba(0,0,0,0.25)' : 'none') : '0 1px 4px rgba(0,0,0,0.06)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: `1px solid ${t.border}`, background: t.bgCardDeep }}>
        <GripVertical size={16} style={{ color: t.textFaint, flexShrink: 0 }} />

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {selectedToolMeta ? (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
              style={{ background: `${selectedToolMeta.color}20`, color: selectedToolMeta.color, border: `1px solid ${selectedToolMeta.color}30` }}>
              {selectedToolMeta.icon}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono flex-shrink-0"
              style={{ background: t.bgCardDeep, border: `1px solid ${t.border}`, color: t.textFaint }}>
              {String(index + 1).padStart(2, '0')}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display font-semibold text-sm truncate" style={{ color: t.textPrimary }}>
              {selectedToolMeta?.name || `Tool ${index + 1}`}
            </div>
            {monthlyCost > 0 && (
              <div className="font-mono text-xs" style={{ color: t.textFaint }}>
                {formatCurrency(monthlyCost)}/mo
                {costPerSeat > 0 && (
                  <span className="ml-2" style={{ color: '#58A6FF' }}>
                    · {formatCurrency(costPerSeat)}/seat
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setCollapsed(c => !c)}
            className="p-2 rounded-lg transition-all" style={{ color: t.textFaint }}
            title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          <button onClick={() => onDuplicate(tool.id)}
            className="p-2 rounded-lg transition-all" style={{ color: t.textFaint }}
            title="Duplicate">
            <Copy size={15} />
          </button>
          <button onClick={() => onRemove(tool.id)} disabled={!canRemove}
            className="p-2 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ color: t.textFaint }} title="Remove">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Select
              label="AI Tool" id={`tool-name-${tool.id}`} value={tool.toolName}
              onChange={val => { onUpdate(tool.id, 'toolName', val); onUpdate(tool.id, 'plan', '') }}
              options={AI_TOOLS.map(t => ({ value: t.id, label: t.name }))}
              placeholder="Select a tool…" required
            />
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <Select
              label="Plan / Tier" id={`tool-plan-${tool.id}`} value={tool.plan}
              onChange={val => onUpdate(tool.id, 'plan', val)}
              options={planOptions}
              placeholder={selectedToolMeta ? 'Select a plan…' : 'Select a tool first…'}
            />
          </div>
          <Input
            label="Monthly Spend" id={`tool-spend-${tool.id}`} type="number"
            value={tool.monthlySpend}
            onChange={val => onUpdate(tool.id, 'monthlySpend', val)}
            placeholder="0.00" prefix={currency.symbol} suffix="/mo" min="0" step="0.01" required
          />
          <Input
            label="Number of Seats" id={`tool-seats-${tool.id}`} type="number"
            value={tool.seats}
            onChange={val => onUpdate(tool.id, 'seats', val)}
            placeholder="1" min="1" step="1"
          />
          {costPerSeat > 0 && (
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.18)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#58A6FF' }} />
                <span className="font-body text-xs" style={{ color: t.textMuted }}>Cost per seat</span>
              </div>
              <span className="font-mono text-sm font-semibold" style={{ color: '#58A6FF' }}>
                {formatCurrency(costPerSeat)}<span style={{ color: 'rgba(88,166,255,0.5)', fontSize: '11px' }}>/mo</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
