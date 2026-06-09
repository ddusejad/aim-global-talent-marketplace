import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TRADES, COUNTRIES, LANGUAGE_LEVELS, BENEFICIARY_STATUSES, DOC_STATUSES } from '../lib/constants'
import { Badge, Button, Input, Select, Textarea, Modal, Avatar, colorForName, SectionHeader, EmptyState, FormGrid, FormSection, Tabs } from '../components/UI'

const EMPTY_FORM = {
  full_name:'', gender:'', dob:'', city:'', state:'', phone:'', email:'',
  trade:'', education:'', experience_years:'', experience_details:'',
  target_country:[], german_level:'', english_level:'',
  passport_status:'pending', iti_certificate_status:'pending',
  police_clearance_status:'pending', medical_fitness_status:'pending',
  education_certificate_status:'pending',
  language_exam_date:'', contract_expected_date:'', visa_expected_date:'', deployment_expected_date:'',
  status:'registered', source:'', batch:'', notes:'', readiness_score:0
}

function calcReadiness(f) {
  let score = 0
  if (f.full_name) score += 10
  if (f.trade) score += 10
  if (f.education) score += 5
  if (f.experience_years) score += 5
  if (f.target_country?.length) score += 5
  if (f.german_level && f.german_level !== 'None') score += 15
  if (f.passport_status === 'verified') score += 15
  if (f.iti_certificate_status === 'verified') score += 10
  if (f.police_clearance_status === 'verified') score += 10
  if (f.medical_fitness_status === 'verified') score += 10
  if (f.deployment_expected_date) score += 5
  return Math.min(score, 100)
}

export default function Beneficiaries() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTrade, setFilterTrade] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('beneficiaries').select('*').order('created_at', { ascending:false })
    if (filterTrade) q = q.eq('trade', filterTrade)
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data } = await q
    let filtered = data || []
    if (filterCountry) filtered = filtered.filter(b => b.target_country?.includes(filterCountry))
    if (search) filtered = filtered.filter(b => b.full_name?.toLowerCase().includes(search.toLowerCase()) || b.aim_id?.toLowerCase().includes(search.toLowerCase()) || b.trade?.toLowerCase().includes(search.toLowerCase()))
    setList(filtered)
    setLoading(false)
  }, [search, filterTrade, filterCountry, filterStatus])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm(EMPTY_FORM); setSelected(null); setModalOpen(true) }
  function openEdit(b) { setForm({...b, target_country: b.target_country || []}); setSelected(b); setModalOpen(true) }
  function openDetail(b) { setSelected(b); setTab('profile'); setDetailOpen(true) }
  function setF(k, v) { setForm(p => ({...p, [k]: v})) }
  function toggleCountry(c) {
    setForm(p => ({...p, target_country: p.target_country?.includes(c) ? p.target_country.filter(x=>x!==c) : [...(p.target_country||[]),c]}))
  }

  async function save() {
    setSaving(true)
    const readiness_score = calcReadiness(form)
    const payload = { ...form, readiness_score, updated_at: new Date().toISOString() }
    if (!selected) {
      const aim_id = `AIM-${Date.now().toString().slice(-6)}`
      await supabase.from('beneficiaries').insert([{ ...payload, aim_id }])
    } else {
      await supabase.from('beneficiaries').update(payload).eq('id', selected.id)
    }
    setSaving(false); setModalOpen(false); load()
  }

  async function remove(id) {
    if (!window.confirm('Delete this beneficiary? This cannot be undone.')) return
    await supabase.from('beneficiaries').delete().eq('id', id)
    load()
  }

  const docFields = [
    { key:'passport_status', label:'Passport' },
    { key:'iti_certificate_status', label:'ITI/Trade Certificate' },
    { key:'police_clearance_status', label:'Police Clearance' },
    { key:'medical_fitness_status', label:'Medical Fitness' },
    { key:'education_certificate_status', label:'Education Certificate' },
  ]

  return (
    <div>
      <SectionHeader title="Beneficiaries"
        action={<Button variant="primary" onClick={openAdd}>+ Register Beneficiary</Button>} />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, ID, trade..."
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, width:220, outline:'none', fontFamily:'inherit' }} />
        <select value={filterTrade} onChange={e=>setFilterTrade(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Trades</option>
          {TRADES.map(t=><option key={t}>{t}</option>)}
        </select>
        <select value={filterCountry} onChange={e=>setFilterCountry(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Countries</option>
          {COUNTRIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Statuses</option>
          {Object.entries(BENEFICIARY_STATUSES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#aaa', alignSelf:'center' }}>{list.length} beneficiaries</span>
      </div>

      {/* Table */}
      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="👥" title="No beneficiaries found" sub="Register your first beneficiary to get started." /> :
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
              {['ID','Name','Trade','Target Country','Lang Level','Readiness','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(b => {
              const [bg,tc] = colorForName(b.full_name)
              const st = BENEFICIARY_STATUSES[b.status] || BENEFICIARY_STATUSES.registered
              return (
                <tr key={b.id} style={{ borderBottom:'1px solid #f5f5f5' }} onMouseEnter={e=>e.currentTarget.style.background='#fafafa'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:'10px 14px', color:'#aaa', fontFamily:'monospace', fontSize:11 }}>{b.aim_id}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={b.full_name} size={28} color={bg} textColor={tc} />
                      <div>
                        <div style={{ fontWeight:600 }}>{b.full_name}</div>
                        <div style={{ fontSize:11, color:'#aaa' }}>{b.city}, {b.state}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{b.trade}</td>
                  <td style={{ padding:'10px 14px' }}>{b.target_country?.join(', ') || '—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {b.german_level && b.german_level !== 'None' && <Badge label={`DE: ${b.german_level}`} color="#EAF3DE" text="#3B6D11" />}
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:40, height:5, background:'#f0f0f0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${b.readiness_score||0}%`, height:'100%', background: b.readiness_score>=75?'#3B6D11':b.readiness_score>=50?'#E85D26':'#A32D2D', borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:11, color:'#888' }}>{b.readiness_score||0}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}><Badge label={st.label} color={st.color} text={st.text} /></td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Button size="sm" variant="ghost" onClick={() => openDetail(b)}>View</Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => remove(b.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? `Edit: ${selected.full_name}` : 'Register New Beneficiary'} width={720}>
        <FormSection title="Basic Information">
          <FormGrid>
            <Input label="Full Name" value={form.full_name} onChange={v=>setF('full_name',v)} required />
            <Select label="Gender" value={form.gender} onChange={v=>setF('gender',v)} options={['Male','Female','Other']} />
            <Input label="Date of Birth" type="date" value={form.dob} onChange={v=>setF('dob',v)} />
            <Input label="Phone" value={form.phone} onChange={v=>setF('phone',v)} />
            <Input label="Email" type="email" value={form.email} onChange={v=>setF('email',v)} />
            <Input label="City" value={form.city} onChange={v=>setF('city',v)} />
            <Input label="State" value={form.state} onChange={v=>setF('state',v)} />
            <Select label="Source" value={form.source} onChange={v=>setF('source',v)} options={['B2C Walk-in','B2B Partner','B2G Programme','Job Fair','Referral','Online','Other']} />
            <Input label="Batch/Programme" value={form.batch} onChange={v=>setF('batch',v)} />
            <Select label="Status" value={form.status} onChange={v=>setF('status',v)} options={Object.entries(BENEFICIARY_STATUSES).map(([k,v])=>({value:k,label:v.label}))} />
          </FormGrid>
        </FormSection>

        <FormSection title="Trade & Education">
          <FormGrid>
            <Select label="Trade" value={form.trade} onChange={v=>setF('trade',v)} options={TRADES} required />
            <Input label="Education Qualification" value={form.education} onChange={v=>setF('education',v)} />
            <Input label="Years of Experience" type="number" value={form.experience_years} onChange={v=>setF('experience_years',v)} />
            <div style={{gridColumn:'span 1'}}>
              <Textarea label="Experience Details" value={form.experience_details} onChange={v=>setF('experience_details',v)} rows={2} />
            </div>
          </FormGrid>
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#555', marginBottom:8 }}>Target Countries (select all applicable)</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {COUNTRIES.map(c => (
                <button key={c} type="button" onClick={() => toggleCountry(c)}
                  style={{
                    padding:'4px 12px', borderRadius:20, fontSize:12, cursor:'pointer',
                    background: form.target_country?.includes(c) ? '#E85D26' : '#f4f4f4',
                    color: form.target_country?.includes(c) ? '#fff' : '#555',
                    border: `1px solid ${form.target_country?.includes(c) ? '#E85D26' : '#e0e0e0'}`,
                    fontFamily:'inherit'
                  }}>{c}</button>
              ))}
            </div>
          </div>
        </FormSection>

        <FormSection title="Language Proficiency">
          <FormGrid>
            <Select label="German Level" value={form.german_level} onChange={v=>setF('german_level',v)} options={LANGUAGE_LEVELS} />
            <Select label="English Level" value={form.english_level} onChange={v=>setF('english_level',v)} options={LANGUAGE_LEVELS} />
          </FormGrid>
        </FormSection>

        <FormSection title="Document Status">
          <FormGrid>
            {docFields.map(d => (
              <Select key={d.key} label={d.label} value={form[d.key]} onChange={v=>setF(d.key,v)} options={Object.entries(DOC_STATUSES).map(([k,v])=>({value:k,label:v.label}))} />
            ))}
          </FormGrid>
        </FormSection>

        <FormSection title="Deployment Timeline">
          <FormGrid>
            <Input label="Language Exam Date" type="date" value={form.language_exam_date} onChange={v=>setF('language_exam_date',v)} />
            <Input label="Contract Expected Date" type="date" value={form.contract_expected_date} onChange={v=>setF('contract_expected_date',v)} />
            <Input label="Visa Expected Date" type="date" value={form.visa_expected_date} onChange={v=>setF('visa_expected_date',v)} />
            <Input label="Deployment Expected Date" type="date" value={form.deployment_expected_date} onChange={v=>setF('deployment_expected_date',v)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Notes">
          <Textarea label="Internal Notes" value={form.notes} onChange={v=>setF('notes',v)} rows={3} />
        </FormSection>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : selected ? 'Update Beneficiary' : 'Register Beneficiary'}</Button>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selected?.full_name || ''} width={700}>
        {selected && (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:'0 0 16px', borderBottom:'1px solid #f0f0f0' }}>
              <Avatar name={selected.full_name} size={52} {...(()=>{const [bg,tc]=colorForName(selected.full_name);return{color:bg,textColor:tc}})()}  />
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>{selected.full_name}</div>
                <div style={{ fontSize:12, color:'#aaa', marginTop:2 }}>{selected.aim_id} · {selected.trade} · {selected.city}, {selected.state}</div>
                <div style={{ display:'flex', gap:6, marginTop:6 }}>
                  <Badge {...(BENEFICIARY_STATUSES[selected.status]||BENEFICIARY_STATUSES.registered)} label={(BENEFICIARY_STATUSES[selected.status]||BENEFICIARY_STATUSES.registered).label} />
                  <Badge label={`Readiness: ${selected.readiness_score||0}%`} color={selected.readiness_score>=75?'#EAF3DE':selected.readiness_score>=50?'#FAEEDA':'#FCEBEB'} text={selected.readiness_score>=75?'#3B6D11':selected.readiness_score>=50?'#854F0B':'#A32D2D'} />
                </div>
              </div>
              <div style={{ marginLeft:'auto' }}>
                <Button variant="ghost" size="sm" onClick={() => { setDetailOpen(false); openEdit(selected) }}>Edit Profile</Button>
              </div>
            </div>
            <Tabs active={tab} onChange={setTab} tabs={[{key:'profile',label:'Profile'},{key:'documents',label:'Documents'},{key:'timeline',label:'Timeline'},{key:'language',label:'Language'}]} />
            {tab === 'profile' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, fontSize:13 }}>
                {[['Trade',selected.trade],['Education',selected.education],['Experience',`${selected.experience_years||0} years`],['Target Countries',selected.target_country?.join(', ')||'—'],['Phone',selected.phone],['Email',selected.email],['Source',selected.source],['Batch',selected.batch]].map(([l,v]) => (
                  <div key={l} style={{ padding:'8px 12px', background:'#fafafa', borderRadius:8 }}>
                    <div style={{ fontSize:11, color:'#aaa', marginBottom:2 }}>{l}</div>
                    <div style={{ fontWeight:600 }}>{v||'—'}</div>
                  </div>
                ))}
                {selected.notes && <div style={{ gridColumn:'span 2', padding:'8px 12px', background:'#fafafa', borderRadius:8 }}>
                  <div style={{ fontSize:11, color:'#aaa', marginBottom:2 }}>Notes</div>
                  <div>{selected.notes}</div>
                </div>}
              </div>
            )}
            {tab === 'documents' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['Passport','passport_status'],['ITI/Trade Certificate','iti_certificate_status'],['Police Clearance','police_clearance_status'],['Medical Fitness','medical_fitness_status'],['Education Certificate','education_certificate_status']].map(([l,k]) => {
                  const st = DOC_STATUSES[selected[k]] || DOC_STATUSES.pending
                  return (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#fafafa', borderRadius:8 }}>
                      <span style={{ flex:1, fontSize:13, fontWeight:500 }}>📄 {l}</span>
                      <Badge label={st.label} color={st.color} text={st.text} />
                    </div>
                  )
                })}
              </div>
            )}
            {tab === 'timeline' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {[['Language Exam',selected.language_exam_date,'🎓'],['Contract Signing',selected.contract_expected_date,'📝'],['Visa Application',selected.visa_expected_date,'🛂'],['Deployment',selected.deployment_expected_date,'✈️']].map(([l,d,icon]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'#fafafa', borderRadius:8 }}>
                    <span style={{ fontSize:20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{l}</div>
                      <div style={{ fontSize:12, color:'#aaa' }}>{d ? new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : 'Not set'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'language' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[['German',selected.german_level],['English',selected.english_level]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#fafafa', borderRadius:8 }}>
                    <span style={{ fontSize:13, fontWeight:500 }}>{l}</span>
                    {v && v !== 'None' ? <Badge label={v} color="#EAF3DE" text="#3B6D11" /> : <span style={{ fontSize:12, color:'#aaa' }}>Not assessed</span>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
