import React from 'react'

export function Badge({ status, label, color, text }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 10px', borderRadius:20,
      fontSize:11, fontWeight:600, background: color || '#E6F1FB', color: text || '#185FA5'
    }}>{label || status}</span>
  )
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #e8e8e8', borderRadius:12,
      padding:'1.25rem', ...style
    }}>{children}</div>
  )
}

export function Button({ children, onClick, variant = 'default', size = 'md', disabled, style = {}, type = 'button' }) {
  const base = {
    display:'inline-flex', alignItems:'center', gap:6, borderRadius:8,
    fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer',
    border:'none', transition:'all .15s', fontFamily:'inherit',
    opacity: disabled ? 0.5 : 1,
  }
  const sizes = { sm: { padding:'5px 12px', fontSize:12 }, md: { padding:'8px 16px', fontSize:13 }, lg: { padding:'11px 22px', fontSize:14 } }
  const variants = {
    default: { background:'#f4f4f4', color:'#1a1a1a' },
    primary: { background:'#E85D26', color:'#fff' },
    blue: { background:'#1D4ED8', color:'#fff' },
    danger: { background:'#FCEBEB', color:'#A32D2D' },
    ghost: { background:'transparent', color:'#555', border:'1px solid #e8e8e8' },
    success: { background:'#EAF3DE', color:'#3B6D11' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, placeholder, type = 'text', required, style = {} }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'#555' }}>{label}{required && <span style={{color:'#E85D26'}}> *</span>}</label>}
      <input
        type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8,
          fontSize:13, outline:'none', fontFamily:'inherit',
          background:'#fafafa', ...style
        }}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options, required, style = {} }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'#555' }}>{label}{required && <span style={{color:'#E85D26'}}> *</span>}</label>}
      <select value={value || ''} onChange={e => onChange(e.target.value)} required={required}
        style={{
          padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8,
          fontSize:13, outline:'none', fontFamily:'inherit', background:'#fafafa', ...style
        }}>
        <option value="">Select...</option>
        {options.map(o => (
          <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
            {typeof o === 'string' ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:'#555' }}>{label}</label>}
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
          padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8,
          fontSize:13, outline:'none', fontFamily:'inherit', background:'#fafafa', resize:'vertical'
        }} />
    </div>
  )
}

export function Modal({ open, onClose, title, children, width = 600 }) {
  if (!open) return null
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:'#fff', borderRadius:14, width:'100%', maxWidth:width,
        maxHeight:'90vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0', position:'sticky', top:0, background:'#fff', zIndex:1
        }}>
          <h3 style={{ fontSize:16, fontWeight:700, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#888', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'1.25rem' }}>{children}</div>
      </div>
    </div>
  )
}

export function Avatar({ name, size = 36, color = '#E6F1FB', textColor = '#185FA5' }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : '?'
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:color, color:textColor,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: size * 0.33, fontWeight:700, flexShrink:0
    }}>{initials}</div>
  )
}

const AVATAR_COLORS = [
  ['#E6F1FB','#0C447C'],['#E1F5EE','#085041'],['#FAEEDA','#633806'],
  ['#FAECE7','#4A1B0C'],['#EEEDFE','#3C3489'],['#EAF3DE','#173404'],
]
export function colorForName(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

export function StatCard({ label, value, sub, color = '#E85D26' }) {
  return (
    <div style={{
      background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:10,
      padding:'14px 18px', borderLeft:`3px solid ${color}`
    }}>
      <div style={{ fontSize:11, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:.5, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, color:'#1a1a1a', lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

export function SectionHeader({ title, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>{title}</h2>
      {action}
    </div>
  )
}

export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#aaa' }}>
      <div style={{ fontSize:40, marginBottom:12 }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:600, color:'#888', marginBottom:6 }}>{title}</div>
      {sub && <div style={{ fontSize:13 }}>{sub}</div>}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:4, borderBottom:'1px solid #f0f0f0', marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          style={{
            padding:'8px 16px', border:'none', background:'none', cursor:'pointer',
            fontSize:13, fontWeight: active === t.key ? 700 : 500,
            color: active === t.key ? '#E85D26' : '#888',
            borderBottom: active === t.key ? '2px solid #E85D26' : '2px solid transparent',
            marginBottom:-1, transition:'all .15s', fontFamily:'inherit'
          }}>{t.label}</button>
      ))}
    </div>
  )
}

export function FormGrid({ children, cols = 2 }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:14 }}>
      {children}
    </div>
  )
}

export function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:12, fontWeight:700, color:'#E85D26', textTransform:'uppercase', letterSpacing:.5, marginBottom:12, paddingBottom:6, borderBottom:'1px solid #f0f0f0' }}>{title}</div>
      {children}
    </div>
  )
}
