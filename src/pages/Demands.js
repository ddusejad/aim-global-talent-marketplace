import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { TRADES, COUNTRIES, LANGUAGE_LEVELS, DEMAND_STATUSES } from '../lib/constants'
import { Badge, Button, Input, Select, Textarea, Modal, SectionHeader, EmptyState, FormGrid, FormSection } from '../components/UI'

export default function Demands() {
  const [list, setList] = useState([])
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ employer_id:'', trade:'', country:'', count_required:'', language_required:'', intake_date:'', notes:'', status:'open' })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('demands').select('*, employers(company_name, country)').order('created_at',{ascending:false})
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data: demands } = await q
    const { data: emps } = await supabase.from('employers').select('id, company_name').eq('status','active')
    setList(demands || [])
    setEmployers(emps || [])
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm({ employer_id:'', trade:'', country:'', count_required:'', language_required:'', intake_date:'', notes:'', status:'open' }); setSelected(null); setModalOpen(true) }
  function openEdit(d) { setForm({ employer_id:d.employer_id, trade:d.trade, country:d.country, count_required:d.count_required, language_required:d.language_required||'', intake_date:d.intake_date||'', notes:d.notes||'', status:d.status }); setSelected(d); setModalOpen(true) }
  function setF(k,v) { setForm(p=>({...p,[k]:v})) }

  async function save() {
    setSaving(true)
    if (!selected) {
      await supabase.from('demands').insert([{ ...form, count_required: parseInt(form.count_required)||0 }])
    } else {
      await supabase.from('demands').update({ ...form, count_required: parseInt(form.count_required)||0 }).eq('id', selected.id)
    }
    setSaving(false); setModalOpen(false); load()
  }

  async function remove(id) {
    if (!window.confirm('Delete this demand?')) return
    await supabase.from('demands').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <SectionHeader title="Employer Demands"
        action={<Button variant="primary" onClick={openAdd}>+ Add Demand</Button>} />

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Statuses</option>
          {Object.entries(DEMAND_STATUSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#aaa', alignSelf:'center' }}>{list.length} demands</span>
      </div>

      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="📋" title="No demands yet" sub="Demands can be added by you or raised by employers from their portal." /> :
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
              {['Employer','Trade','Country','Required','Mapped','Language','Intake Date','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(d => {
              const st = DEMAND_STATUSES[d.status] || DEMAND_STATUSES.open
              const pct = Math.round(((d.count_mapped||0) / d.count_required) * 100)
              return (
                <tr key={d.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                  <td style={{ padding:'10px 14px', fontWeight:600 }}>{d.employers?.company_name || '—'}</td>
                  <td style={{ padding:'10px 14px' }}>{d.trade}</td>
                  <td style={{ padding:'10px 14px' }}>{d.country}</td>
                  <td style={{ padding:'10px 14px', fontWeight:700 }}>{d.count_required}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:40, height:5, background:'#f0f0f0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background: pct>=100?'#3B6D11':pct>=50?'#E85D26':'#A32D2D', borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:11, color:'#888' }}>{d.count_mapped||0}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{d.language_required || '—'}</td>
                  <td style={{ padding:'10px 14px', color:'#888' }}>{d.intake_date ? new Date(d.intake_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={st.label} color={st.color} text={st.text} /></td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(d)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => remove(d.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selected ? 'Edit Demand' : 'Add New Demand'} width={540}>
        <FormSection title="Demand Details">
          <FormGrid>
            <Select label="Employer" value={form.employer_id} onChange={v=>setF('employer_id',v)} required
              options={employers.map(e => ({value:e.id, label:e.company_name}))} />
            <Select label="Trade Required" value={form.trade} onChange={v=>setF('trade',v)} options={TRADES} required />
            <Select label="Country" value={form.country} onChange={v=>setF('country',v)} options={COUNTRIES} required />
            <Input label="Positions Required" type="number" value={form.count_required} onChange={v=>setF('count_required',v)} required />
            <Select label="Language Required" value={form.language_required} onChange={v=>setF('language_required',v)} options={LANGUAGE_LEVELS.map(l => ({value:l,label:`German ${l}`}))} />
            <Input label="Intake / Start Date" type="date" value={form.intake_date} onChange={v=>setF('intake_date',v)} />
            <Select label="Status" value={form.status} onChange={v=>setF('status',v)} options={Object.entries(DEMAND_STATUSES).map(([k,v])=>({value:k,label:v.label}))} />
          </FormGrid>
        </FormSection>
        <FormSection title="Notes">
          <Textarea value={form.notes} onChange={v=>setF('notes',v)} placeholder="Any specific requirements, notes..." />
        </FormSection>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8 }}>
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : selected ? 'Update' : 'Add Demand'}</Button>
        </div>
      </Modal>
    </div>
  )
}
