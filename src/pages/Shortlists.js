import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { SHORTLIST_STATUSES, BENEFICIARY_STATUSES } from '../lib/constants'
import { Badge, Button, Modal, Select, Textarea, SectionHeader, EmptyState, Avatar, colorForName } from '../components/UI'

export default function Shortlists() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [employers, setEmployers] = useState([])
  const [form, setForm] = useState({ employer_id:'', beneficiary_id:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const [filterEmployer, setFilterEmployer] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('shortlists')
      .select('*, beneficiaries(full_name, aim_id, trade, target_country, status, readiness_score), employers(company_name, country)')
      .order('created_at', {ascending:false})
    if (filterEmployer) q = q.eq('employer_id', filterEmployer)
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data } = await q
    const { data: emps } = await supabase.from('employers').select('id, company_name').eq('status','active')
    const { data: benefs } = await supabase.from('beneficiaries').select('id, full_name, aim_id, trade, status')
    setList(data || [])
    setEmployers(emps || [])
    setBeneficiaries(benefs || [])
    setLoading(false)
  }, [filterEmployer, filterStatus])

  useEffect(() => { load() }, [load])

  async function updateStatus(id, status) {
    await supabase.from('shortlists').update({ status }).eq('id', id)
    load()
  }

  async function map() {
    setSaving(true)
    await supabase.from('shortlists').upsert([{ ...form, status:'interested' }], { onConflict:'employer_id,beneficiary_id' })
    setSaving(false); setMapModalOpen(false); load()
  }

  async function remove(id) {
    if (!window.confirm('Remove this mapping?')) return
    await supabase.from('shortlists').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <SectionHeader title="Shortlists & Mappings"
        action={<Button variant="primary" onClick={() => { setForm({employer_id:'',beneficiary_id:'',notes:''}); setMapModalOpen(true) }}>+ Map Beneficiary to Employer</Button>} />

      <div style={{ background:'#fff8f5', border:'1px solid #ffd4bc', borderRadius:10, padding:'10px 16px', marginBottom:16, fontSize:12, color:'#854F0B' }}>
        🛡️ <strong>Admin control:</strong> Employers can express interest, but only you can approve. Approved matches are the only ones where contact details become visible.
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <select value={filterEmployer} onChange={e=>setFilterEmployer(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Employers</option>
          {employers.map(e => <option key={e.id} value={e.id}>{e.company_name}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', background:'#fff' }}>
          <option value="">All Statuses</option>
          {Object.entries(SHORTLIST_STATUSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#aaa', alignSelf:'center' }}>{list.length} mappings</span>
      </div>

      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       list.length === 0 ? <EmptyState icon="⭐" title="No shortlists yet" sub="Map beneficiaries to employers or wait for employers to express interest." /> :
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
              {['Beneficiary','Trade','Employer','Readiness','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map(s => {
              const b = s.beneficiaries
              const e = s.employers
              const st = SHORTLIST_STATUSES[s.status] || SHORTLIST_STATUSES.interested
              const bst = BENEFICIARY_STATUSES[b?.status] || BENEFICIARY_STATUSES.registered
              const [bg,tc] = colorForName(b?.full_name || '')
              return (
                <tr key={s.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={b?.full_name||'?'} size={28} color={bg} textColor={tc} />
                      <div>
                        <div style={{ fontWeight:600 }}>{b?.full_name || '—'}</div>
                        <div style={{ fontSize:11, color:'#aaa' }}>{b?.aim_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}>{b?.trade || '—'}</td>
                  <td style={{ padding:'10px 14px', fontWeight:600 }}>{e?.company_name || '—'} <span style={{fontWeight:400,color:'#aaa'}}>({e?.country})</span></td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:36, height:5, background:'#f0f0f0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${b?.readiness_score||0}%`, height:'100%', background: b?.readiness_score>=75?'#3B6D11':b?.readiness_score>=50?'#E85D26':'#A32D2D', borderRadius:3 }} />
                      </div>
                      <span style={{ fontSize:11, color:'#888' }}>{b?.readiness_score||0}</span>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px' }}><Badge label={st.label} color={st.color} text={st.text} /></td>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      {s.status !== 'approved' && <Button size="sm" variant="success" onClick={() => updateStatus(s.id,'approved')}>✓ Approve</Button>}
                      {s.status !== 'on_hold' && <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id,'on_hold')}>Hold</Button>}
                      {s.status !== 'rejected' && <Button size="sm" variant="danger" onClick={() => updateStatus(s.id,'rejected')}>Reject</Button>}
                      <Button size="sm" variant="danger" onClick={() => remove(s.id)}>Del</Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>}

      <Modal open={mapModalOpen} onClose={() => setMapModalOpen(false)} title="Map Beneficiary to Employer" width={480}>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Select label="Select Employer" value={form.employer_id} onChange={v=>setForm(p=>({...p,employer_id:v}))} required
            options={employers.map(e => ({value:e.id, label:e.company_name}))} />
          <Select label="Select Beneficiary" value={form.beneficiary_id} onChange={v=>setForm(p=>({...p,beneficiary_id:v}))} required
            options={beneficiaries.map(b => ({value:b.id, label:`${b.full_name} (${b.aim_id}) – ${b.trade}`}))} />
          <Textarea label="Notes (optional)" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Why this match?" rows={2} />
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:4 }}>
            <Button variant="ghost" onClick={() => setMapModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={map} disabled={saving || !form.employer_id || !form.beneficiary_id}>{saving ? 'Mapping...' : 'Map Now'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
