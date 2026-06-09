import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { ROLES } from '../lib/constants'
import { Badge, Button, Input, Select, Modal, SectionHeader, EmptyState, Avatar, colorForName, FormGrid, FormSection } from '../components/UI'

const ROLE_COLORS = {
  superadmin: ['#FAECE7','#4A1B0C'],
  admin: ['#FAEEDA','#854F0B'],
  staff: ['#E6F1FB','#185FA5'],
  employer: ['#EAF3DE','#3B6D11'],
  beneficiary: ['#EEEDFE','#3C3489'],
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [employers, setEmployers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [form, setForm] = useState({ email:'', full_name:'', role:'staff', employer_id:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data: u } = await supabase.from('profiles').select('*').order('created_at', {ascending:false})
    const { data: e } = await supabase.from('employers').select('id, company_name')
    setUsers(u || [])
    setEmployers(e || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function inviteUser() {
    setSaving(true); setMsg('')
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(form.email)
    if (error) {
      setMsg(`Error: ${error.message}`)
    } else {
      if (data?.user?.id) {
        await supabase.from('profiles').upsert([{
          id: data.user.id, email: form.email, full_name: form.full_name,
          role: form.role, employer_id: form.employer_id || null
        }])
      }
      setMsg(`Invitation sent to ${form.email}`)
      load()
    }
    setSaving(false)
  }

  async function updateRole(id, role) {
    await supabase.from('profiles').update({ role }).eq('id', id)
    load()
  }

  return (
    <div>
      <SectionHeader title="Users & Access Control"
        action={<Button variant="primary" onClick={() => { setForm({email:'',full_name:'',role:'staff',employer_id:''}); setMsg(''); setInviteOpen(true) }}>+ Invite User</Button>} />

      <div style={{ background:'#fff8f5', border:'1px solid #ffd4bc', borderRadius:10, padding:'10px 16px', marginBottom:20, fontSize:12, color:'#854F0B' }}>
        🛡️ <strong>Only Super Admins can invite users and assign roles.</strong> Employers get invite-only access with limited permissions set in the Employers section.
      </div>

      {loading ? <div style={{color:'#aaa',padding:'2rem',textAlign:'center'}}>Loading...</div> :
       users.length === 0 ? <EmptyState icon="🔐" title="No users yet" sub="Invite your team and employer contacts." /> :
      <div style={{ background:'#fff', border:'1px solid #e8e8e8', borderRadius:12, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
              {['User','Email','Role','Employer (if applicable)','Actions'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const [bg,tc] = colorForName(u.full_name || u.email)
              const [rc,rtc] = ROLE_COLORS[u.role] || ROLE_COLORS.staff
              const emp = employers.find(e => e.id === u.employer_id)
              return (
                <tr key={u.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                  <td style={{ padding:'10px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Avatar name={u.full_name || u.email} size={30} color={bg} textColor={tc} />
                      <div style={{ fontWeight:600 }}>{u.full_name || '—'}</div>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px', color:'#666' }}>{u.email}</td>
                  <td style={{ padding:'10px 14px' }}><Badge label={ROLES[u.role]||u.role} color={rc} text={rtc} /></td>
                  <td style={{ padding:'10px 14px', color:'#888' }}>{emp?.company_name || '—'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                      style={{ padding:'4px 8px', border:'1px solid #e0e0e0', borderRadius:6, fontSize:12, fontFamily:'inherit', background:'#fff', cursor:'pointer' }}>
                      {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite New User" width={480}>
        <FormSection title="User Details">
          <FormGrid cols={1}>
            <Input label="Full Name" value={form.full_name} onChange={v=>setForm(p=>({...p,full_name:v}))} />
            <Input label="Email Address" type="email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} required />
            <Select label="Role" value={form.role} onChange={v=>setForm(p=>({...p,role:v}))}
              options={Object.entries(ROLES).map(([k,v])=>({value:k,label:v}))} />
            {form.role === 'employer' && (
              <Select label="Link to Employer" value={form.employer_id} onChange={v=>setForm(p=>({...p,employer_id:v}))}
                options={employers.map(e=>({value:e.id,label:e.company_name}))} />
            )}
          </FormGrid>
        </FormSection>
        {msg && (
          <div style={{ background: msg.startsWith('Error') ? '#FCEBEB' : '#EAF3DE', color: msg.startsWith('Error') ? '#A32D2D' : '#3B6D11', padding:'8px 12px', borderRadius:8, fontSize:12, marginBottom:12 }}>
            {msg}
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={inviteUser} disabled={saving || !form.email}>{saving ? 'Sending...' : 'Send Invitation'}</Button>
        </div>
      </Modal>
    </div>
  )
}
