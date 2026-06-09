import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TRADES, COUNTRIES } from '../lib/constants'
import { Badge, Button, Input, Select, Textarea, Modal, Avatar, colorForName, SectionHeader, EmptyState, FormGrid, FormSection } from '../components/UI'

const EMPTY = {
  company_name:'', country:'', industry:'', contact_name:'', contact_email:'',
  contact_phone:'', status:'active', notes:'',
  access_browse:true, access_shortlist:true, access_download_cv:false,
  access_raise_demand:true, access_contact_details:false,
  allowed_trades:[], allowed_countries:[]
}

const INDUSTRIES = ['Healthcare','Elderly Care','Construction','Manufacturing','Retail / F&B','Engineering','IT','Hospitality','Agriculture','Logistics','Other']

export default function Employers() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [accessModalOpen, setAccessModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('employers').select('*').order('created_at', { ascending:false })
    let filtered = data || []
    if (search) filtered = filtered.filter(e => e.company_name?.toLowerCase().includes(search.toLowerCase()) || e.country?.toLowerCase().includes(search.toLowerCase()))
    setList(filtered)
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm(EMPTY); setSelected(null); setModalOpen(true) }
  function openEdit(e) { setForm({...e, allowed_trades:e.allowed_trades||[], allowed_countries:e.allowed_countries||[]}); setSelected(e); setModalOpen(true) }
  function openAccess(e) { setForm({...e, allowed_trades:e.allowed_trades||[], allowed_countries:e.allowed_countries||[]}); setSelected(e); setAccessModalOpen(true) }
  function setF(k,v) { setForm(p => ({...p,[k]:v})) }
  function toggleArr(k, v) { setForm(p => ({...p,[k]: p[k]?.includes(v) ? p[k].filter(x=>x!==v) : [...(p[k]||[]),v]})) }

  async function save() {
    setSaving(true)
    if (!selected) {
      await supabase.from('employers').insert([form])
    } else {
      await supabase.from('employers').update(form).eq('id', selected.id)
    }
    setSaving(false); setModalOpen(false); setAccessModalOpen(false); load()
  }

  async function remove(id) {
    if (!window.confirm('Remove this employer? This will also delete their shortlists and demands.')) return
    await supabase.from('employers').delete().eq('id', id)
    load()
  }

  const statusColors = { active:['#EAF3DE','#3B6D11'], inactive:['#F1EFE8','#5F5E5A'], pending:['#FAEEDA','#854F0B'] }

  return (
    <div>
      <SectionHeader title="Employers"
        action={<Button variant="primary" onClick={openAdd}>+ Invite Employer</Button>} />

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employers..."
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, width:260, outline:'none', fontFamily:'inherit' }} />
        <span style={{ fontSize:12, color:'#aaa', alignSelf:'center' }}>{list.length} employers</span>
      </div>

      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="🏢" title="No employers yet" sub="Invite your first global employer to get started." /> :
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
        {list.map(e => {
          const [bg,tc] = colorForName(e.company_name)
          const [sc,stc] = statusColors[e.status] || statusColors.active
          return (
            <div key={e.id} style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, padding:'1rem 1.25rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                <Avatar name={e.company_name} size={40} color={bg} textColor={tc} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.company_name}</div>
                  <div style={{ fontSize:12, color:'#aaa' }}>{e.country} · {e.industry}</div>
                </div>
                <Badge label={e.status} color={sc} text={stc} />
              </div>
              <div style={{ fontSize:12, color:'#666', marginBottom:12 }}>
                <div>👤 {e.contact_name || '—'}</div>
                <div>✉️ {e.contact_email || '—'}</div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
                {e.access_browse && <span style={{ fontSize:10, padding:'2px 7px', background:'#EAF3DE', color:'#3B6D11', borderRadius:10 }}>Browse</span>}
                {e.access_shortlist && <span style={{ fontSize:10, padding:'2px 7px', background:'#E6F1FB', color:'#185FA5', borderRadius:10 }}>Shortlist</span>}
                {e.access_download_cv && <span style={{ fontSize:10, padding:'2px 7px', background:'#FAEEDA', color:'#854F0B', borderRadius:10 }}>Download CV</span>}
                {e.access_raise_demand && <span style={{ fontSize:10, padding:'2px 7px', background:'#EEEDFE', color:'#3C3489', borderRadius:10 }}>Raise Demand</span>}
                {e.access_contact_details && <span style={{ fontSize:10, padding:'2px 7px', background:'#FAECE7', color:'#4A1B0C', borderRadius:10 }}>Contact Details</span>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>Edit</Button>
                <Button size="sm" variant="blue" onClick={() => openAccess(e)}>Access Control</Button>
                <Button size="sm" variant="danger" onClick={() => remove(e.id)}>Remove</Button>
              </div>
            </div>
          )
        })}
      </div>}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? `Edit: ${selected.company_name}` : 'Invite New Employer'} width={660}>
        <FormSection title="Company Information">
          <FormGrid>
            <Input label="Company Name" value={form.company_name} onChange={v=>setF('company_name',v)} required />
            <Select label="Country" value={form.country} onChange={v=>setF('country',v)} options={COUNTRIES} />
            <Select label="Industry" value={form.industry} onChange={v=>setF('industry',v)} options={INDUSTRIES} />
            <Select label="Status" value={form.status} onChange={v=>setF('status',v)} options={[{value:'active',label:'Active'},{value:'pending',label:'Pending'},{value:'inactive',label:'Inactive'}]} />
          </FormGrid>
        </FormSection>
        <FormSection title="Primary Contact">
          <FormGrid>
            <Input label="Contact Name" value={form.contact_name} onChange={v=>setF('contact_name',v)} />
            <Input label="Contact Email" type="email" value={form.contact_email} onChange={v=>setF('contact_email',v)} />
            <Input label="Contact Phone" value={form.contact_phone} onChange={v=>setF('contact_phone',v)} />
          </FormGrid>
        </FormSection>
        <FormSection title="Notes">
          <Textarea value={form.notes} onChange={v=>setF('notes',v)} placeholder="Internal notes about this employer..." />
        </FormSection>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : selected ? 'Update' : 'Add Employer'}</Button>
        </div>
      </Modal>

      {/* Access Control Modal */}
      <Modal open={accessModalOpen} onClose={() => setAccessModalOpen(false)} title={`Access Control: ${selected?.company_name}`} width={580}>
        <div style={{ background:'#fff8f5', border:'1px solid #ffd4bc', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:12, color:'#854F0B' }}>
          🛡️ You control exactly what this employer can see and do. All contact details remain hidden until you approve.
        </div>

        <FormSection title="Portal Permissions">
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              ['access_browse','Browse & filter beneficiary profiles','Employer can see the profile list (filtered by trade/country you set below)'],
              ['access_shortlist','Shortlist / express interest','Employer can mark profiles they are interested in'],
              ['access_download_cv','Download CV / Resume','Allow employer to download CV files'],
              ['access_raise_demand','Raise demand requests','Employer can submit how many, which trade, which country'],
              ['access_contact_details','View contact details','Show phone/email after you approve a match'],
            ].map(([k,label,desc]) => (
              <label key={k} style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', padding:'10px 12px', background:'#fafafa', borderRadius:8 }}>
                <input type="checkbox" checked={!!form[k]} onChange={e => setF(k, e.target.checked)} style={{ marginTop:2 }} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{label}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection title="Allowed Trades (leave empty = all)">
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {TRADES.map(t => (
              <button key={t} type="button" onClick={() => toggleArr('allowed_trades', t)}
                style={{ padding:'3px 10px', borderRadius:20, fontSize:11, cursor:'pointer', fontFamily:'inherit',
                  background: form.allowed_trades?.includes(t) ? '#E85D26' : '#f4f4f4',
                  color: form.allowed_trades?.includes(t) ? '#fff' : '#555',
                  border: `1px solid ${form.allowed_trades?.includes(t) ? '#E85D26' : '#e0e0e0'}` }}>{t}</button>
            ))}
          </div>
        </FormSection>

        <FormSection title="Allowed Countries (leave empty = all)">
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {COUNTRIES.map(c => (
              <button key={c} type="button" onClick={() => toggleArr('allowed_countries', c)}
                style={{ padding:'3px 10px', borderRadius:20, fontSize:11, cursor:'pointer', fontFamily:'inherit',
                  background: form.allowed_countries?.includes(c) ? '#E85D26' : '#f4f4f4',
                  color: form.allowed_countries?.includes(c) ? '#fff' : '#555',
                  border: `1px solid ${form.allowed_countries?.includes(c) ? '#E85D26' : '#e0e0e0'}` }}>{c}</button>
            ))}
          </div>
        </FormSection>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8 }}>
          <Button variant="ghost" onClick={() => setAccessModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Access Settings'}</Button>
        </div>
      </Modal>
    </div>
  )
}
