import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BENEFICIARY_STATUSES, SHORTLIST_STATUSES, DEMAND_STATUSES, TRADES, COUNTRIES, LANGUAGE_LEVELS } from '../lib/constants'
import { Badge, Button, Modal, Select, Textarea, Input, Avatar, colorForName, EmptyState, SectionHeader, FormGrid, FormSection } from '../components/UI'

export function EmployerBrowse() {
  const { profile } = useAuth()
  const [employer, setEmployer] = useState(null)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTrade, setFilterTrade] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [shortlisting, setShortlisting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      if (!profile?.employer_id) { setLoading(false); return }
      const { data: emp } = await supabase.from('employers').select('*').eq('id', profile.employer_id).single()
      setEmployer(emp)
      if (!emp?.access_browse) { setLoading(false); return }
      let q = supabase.from('beneficiaries').select('id, aim_id, full_name, trade, target_country, status, readiness_score, german_level, english_level, education, experience_years')
      if (emp.allowed_trades?.length) q = q.in('trade', emp.allowed_trades)
      if (filterTrade) q = q.eq('trade', filterTrade)
      if (filterLang) q = q.eq('german_level', filterLang)
      if (filterStatus) q = q.eq('status', filterStatus)
      const { data } = await q
      let filtered = data || []
      if (emp.allowed_countries?.length) filtered = filtered.filter(b => b.target_country?.some(c => emp.allowed_countries.includes(c)))
      setList(filtered)
      setLoading(false)
    }
    load()
  }, [profile, filterTrade, filterLang, filterStatus])

  async function shortlist(beneficiary_id) {
    setShortlisting(true); setMsg('')
    const { error } = await supabase.from('shortlists').upsert([{ employer_id: profile.employer_id, beneficiary_id, status:'interested' }], { onConflict:'employer_id,beneficiary_id' })
    if (error) setMsg('Already shortlisted or an error occurred.')
    else setMsg('Added to your shortlist! AIM will review and respond.')
    setShortlisting(false)
    setTimeout(() => setMsg(''), 3000)
  }

  if (!employer?.access_browse) return (
    <div style={{ textAlign:'center', padding:'4rem 1rem', color:'#aaa' }}>
      <div style={{ fontSize:40 }}>🔒</div>
      <div style={{ fontSize:15, fontWeight:600, color:'#888', marginTop:12 }}>Browse access not enabled</div>
      <div style={{ fontSize:13, marginTop:6 }}>Please contact your AIM administrator.</div>
    </div>
  )

  return (
    <div>
      <SectionHeader title="Browse Profiles" />
      <div style={{ background:'#f0f5ff', border:'1px solid #bdd3f8', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#185FA5' }}>
        🔒 Contact details are hidden. Shortlist profiles you're interested in — AIM will review and share details after approval.
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <select value={filterTrade} onChange={e=>setFilterTrade(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Trades</option>
          {(employer?.allowed_trades?.length ? employer.allowed_trades : TRADES).map(t=><option key={t}>{t}</option>)}
        </select>
        <select value={filterLang} onChange={e=>setFilterLang(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Language Levels</option>
          {LANGUAGE_LEVELS.map(l=><option key={l}>{l}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Statuses</option>
          {Object.entries(BENEFICIARY_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#aaa', alignSelf:'center' }}>{list.length} profiles</span>
      </div>
      {msg && <div style={{ background:'#EAF3DE', color:'#3B6D11', padding:'8px 14px', borderRadius:8, fontSize:12, marginBottom:12 }}>{msg}</div>}
      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="🔍" title="No matching profiles" sub="Adjust your filters or contact AIM to add more beneficiaries." /> :
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {list.map(b => {
          const [bg,tc] = colorForName(b.full_name)
          const st = BENEFICIARY_STATUSES[b.status] || BENEFICIARY_STATUSES.registered
          return (
            <div key={b.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, padding:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <Avatar name={b.full_name} size={38} color={bg} textColor={tc} />
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{b.full_name.split(' ')[0]} {b.full_name.split(' ').slice(-1)[0][0]}.</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>Profile #{b.aim_id}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:12, marginBottom:10 }}>
                <div style={{ background:'#fafafa', borderRadius:6, padding:'5px 8px' }}>
                  <div style={{ fontSize:10, color:'#aaa' }}>Trade</div>
                  <div style={{ fontWeight:600 }}>{b.trade}</div>
                </div>
                <div style={{ background:'#fafafa', borderRadius:6, padding:'5px 8px' }}>
                  <div style={{ fontSize:10, color:'#aaa' }}>German</div>
                  <div style={{ fontWeight:600 }}>{b.german_level || '—'}</div>
                </div>
                <div style={{ background:'#fafafa', borderRadius:6, padding:'5px 8px' }}>
                  <div style={{ fontSize:10, color:'#aaa' }}>Experience</div>
                  <div style={{ fontWeight:600 }}>{b.experience_years||0} yrs</div>
                </div>
                <div style={{ background:'#fafafa', borderRadius:6, padding:'5px 8px' }}>
                  <div style={{ fontSize:10, color:'#aaa' }}>Readiness</div>
                  <div style={{ fontWeight:600, color: b.readiness_score>=75?'#3B6D11':b.readiness_score>=50?'#E85D26':'#A32D2D' }}>{b.readiness_score||0}%</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <Badge label={st.label} color={st.color} text={st.text} />
                <div style={{ flex:1 }} />
                {employer?.access_shortlist && (
                  <Button size="sm" variant="blue" onClick={() => shortlist(b.id)} disabled={shortlisting}>+ Shortlist</Button>
                )}
              </div>
            </div>
          )
        })}
      </div>}
    </div>
  )
}

export function EmployerShortlist() {
  const { profile } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile?.employer_id) { setLoading(false); return }
    const { data } = await supabase.from('shortlists')
      .select('*, beneficiaries(full_name, aim_id, trade, target_country, status, readiness_score, german_level, phone, email)')
      .eq('employer_id', profile.employer_id)
      .order('created_at', {ascending:false})
    setList(data || [])
    setLoading(false)
  }, [profile])

  useEffect(() => { load() }, [load])

  const [employer, setEmployer] = useState(null)
  useEffect(() => {
    if (profile?.employer_id) supabase.from('employers').select('access_contact_details').eq('id', profile.employer_id).single().then(({data})=>setEmployer(data))
  }, [profile])

  return (
    <div>
      <SectionHeader title="My Shortlist" />
      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="⭐" title="No shortlisted profiles yet" sub="Browse profiles and shortlist the ones you're interested in." /> :
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
              {['Profile','Trade','Country','German Level','Readiness','Status','Contact'].map(h=>(
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(s => {
              const b = s.beneficiaries
              const [bg,tc] = colorForName(b?.full_name||'')
              const st = SHORTLIST_STATUSES[s.status]||SHORTLIST_STATUSES.interested
              return (
                <tr key={s.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={b?.full_name||'?'} size={28} color={bg} textColor={tc} />
                      <div>
                        <div style={{ fontWeight:600 }}>{b?.full_name ? `${b.full_name.split(' ')[0]} ${b.full_name.split(' ').slice(-1)[0][0]}.` : '—'}</div>
                        <div style={{ fontSize:11, color:'#aaa' }}>{b?.aim_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{b?.trade||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>{b?.target_country?.join(', ')||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>{b?.german_level||'—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ fontSize:12, fontWeight:600, color: b?.readiness_score>=75?'#3B6D11':b?.readiness_score>=50?'#E85D26':'#A32D2D' }}>{b?.readiness_score||0}%</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}><Badge label={st.label} color={st.color} text={st.text} /></td>
                  <td style={{ padding:'10px 14px' }}>
                    {s.status === 'approved' && employer?.access_contact_details
                      ? <div style={{ fontSize:12 }}><div>{b?.phone}</div><div style={{color:'#aaa'}}>{b?.email}</div></div>
                      : <span style={{ fontSize:11, color:'#aaa' }}>🔒 Pending AIM approval</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>}
    </div>
  )
}

export function EmployerDemands() {
  const { profile } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [employer, setEmployer] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ trade:'', country:'', count_required:'', language_required:'', intake_date:'', notes:'' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!profile?.employer_id) { setLoading(false); return }
    const { data: emp } = await supabase.from('employers').select('*').eq('id', profile.employer_id).single()
    setEmployer(emp)
    const { data } = await supabase.from('demands').select('*').eq('employer_id', profile.employer_id).order('created_at',{ascending:false})
    setList(data || [])
    setLoading(false)
  }, [profile])

  useEffect(() => { load() }, [load])

  async function submit() {
    setSaving(true)
    await supabase.from('demands').insert([{ ...form, employer_id: profile.employer_id, count_required: parseInt(form.count_required)||0, status:'open' }])
    setSaving(false); setModalOpen(false); load()
  }

  if (!employer?.access_raise_demand) return (
    <div style={{ textAlign:'center', padding:'4rem 1rem', color:'#aaa' }}>
      <div style={{ fontSize:40 }}>🔒</div>
      <div style={{ fontSize:15, fontWeight:600, color:'#888', marginTop:12 }}>Demand submission not enabled</div>
      <div style={{ fontSize:13, marginTop:6 }}>Please contact your AIM administrator.</div>
    </div>
  )

  return (
    <div>
      <SectionHeader title="My Demands" action={<Button variant="blue" onClick={() => { setForm({trade:'',country:'',count_required:'',language_required:'',intake_date:'',notes:''}); setModalOpen(true) }}>+ Raise Demand</Button>} />
      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="📋" title="No demands yet" sub="Raise your first demand and AIM will start mapping profiles." /> :
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {list.map(d => {
          const st = DEMAND_STATUSES[d.status]||DEMAND_STATUSES.open
          const pct = Math.round(((d.count_mapped||0)/d.count_required)*100)
          return (
            <div key={d.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, padding:'1rem 1.25rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontSize:15, fontWeight:700 }}>{d.trade} · {d.country}</div>
                <Badge label={st.label} color={st.color} text={st.text} />
              </div>
              <div style={{ display:'flex', gap:20, fontSize:12, color:'#666', marginBottom:10 }}>
                <span>👥 {d.count_required} positions</span>
                {d.language_required && <span>🗣 {d.language_required}</span>}
                {d.intake_date && <span>📅 {new Date(d.intake_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>}
              </div>
              <div style={{ background:'#f0f0f0', borderRadius:4, height:6, overflow:'hidden' }}>
                <div style={{ background: pct>=100?'#3B6D11':'#E85D26', width:`${pct}%`, height:'100%', borderRadius:4, transition:'width .3s' }} />
              </div>
              <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{d.count_mapped||0} of {d.count_required} mapped by AIM</div>
            </div>
          )
        })}
      </div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Raise a New Demand" width={520}>
        <FormSection title="Requirement Details">
          <FormGrid>
            <Select label="Trade Required" value={form.trade} onChange={v=>setForm(p=>({...p,trade:v}))} options={employer?.allowed_trades?.length ? employer.allowed_trades : TRADES} required />
            <Select label="Country" value={form.country} onChange={v=>setForm(p=>({...p,country:v}))} options={employer?.allowed_countries?.length ? employer.allowed_countries : COUNTRIES} required />
            <Input label="Number of Positions" type="number" value={form.count_required} onChange={v=>setForm(p=>({...p,count_required:v}))} required />
            <Select label="Language Level Required" value={form.language_required} onChange={v=>setForm(p=>({...p,language_required:v}))} options={LANGUAGE_LEVELS} />
            <Input label="Expected Intake Date" type="date" value={form.intake_date} onChange={v=>setForm(p=>({...p,intake_date:v}))} />
          </FormGrid>
        </FormSection>
        <FormSection title="Additional Notes">
          <Textarea value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Any specific skills, certifications, or requirements..." />
        </FormSection>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="blue" onClick={submit} disabled={saving}>{saving ? 'Submitting...' : 'Submit Demand'}</Button>
        </div>
      </Modal>
    </div>
  )
}
