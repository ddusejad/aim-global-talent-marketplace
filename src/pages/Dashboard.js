import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { StatCard, Card, Badge, Avatar, colorForName } from '../components/UI'
import { BENEFICIARY_STATUSES, DEMAND_STATUSES } from '../lib/constants'

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({ total:0, ready:0, employers:0, demands:0, openings:0 })
  const [recentBenefs, setRecentBenefs] = useState([])
  const [recentDemands, setRecentDemands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: total },
        { count: ready },
        { count: employers },
        { data: demands },
        { data: benefs },
      ] = await Promise.all([
        supabase.from('beneficiaries').select('*', {count:'exact',head:true}),
        supabase.from('beneficiaries').select('*', {count:'exact',head:true}).eq('status','deployment_ready'),
        supabase.from('employers').select('*', {count:'exact',head:true}).eq('status','active'),
        supabase.from('demands').select('*').eq('status','open').order('created_at',{ascending:false}).limit(5),
        supabase.from('beneficiaries').select('*').order('created_at',{ascending:false}).limit(5),
      ])
      const openings = demands?.reduce((a,d) => a + (d.count_required - d.count_mapped), 0) || 0
      setStats({ total: total||0, ready: ready||0, employers: employers||0, demands: demands?.length||0, openings })
      setRecentBenefs(benefs || [])
      setRecentDemands(demands || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color:'#888', fontSize:13, marginTop:4 }}>Here's what's happening on the platform today.</p>
      </div>

      {/* Admin control banner */}
      {(profile?.role === 'superadmin' || profile?.role === 'admin') && (
        <div style={{
          background:'linear-gradient(135deg, #E85D26, #c44d1e)', borderRadius:12,
          padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <div>
            <div style={{ color:'#fff', fontSize:13, fontWeight:700 }}>🛡️ You have full platform control</div>
            <div style={{ color:'rgba(255,255,255,.75)', fontSize:12, marginTop:2 }}>
              All employer access, profile mapping, and demand approvals require your sign-off.
            </div>
          </div>
          <div style={{ fontSize:22, color:'rgba(255,255,255,.3)' }}>AIM</div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        <StatCard label="Total Beneficiaries" value={loading ? '...' : stats.total} sub="across all trades" color="#E85D26" />
        <StatCard label="Deployment Ready" value={loading ? '...' : stats.ready} sub="readiness score ≥ 75" color="#3B6D11" />
        <StatCard label="Active Employers" value={loading ? '...' : stats.employers} sub="onboarded & active" color="#185FA5" />
        <StatCard label="Open Demands" value={loading ? '...' : `${stats.demands} (${stats.openings} slots)`} sub="unfilled positions" color="#854F0B" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Recent beneficiaries */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:.4, color:'#888', margin:0 }}>Recent Registrations</h3>
            <a href="/beneficiaries" style={{ fontSize:12, color:'#E85D26', textDecoration:'none' }}>View all →</a>
          </div>
          {loading ? <div style={{ color:'#ccc', fontSize:13 }}>Loading...</div> :
           recentBenefs.length === 0 ? <div style={{ color:'#ccc', fontSize:13 }}>No beneficiaries yet.</div> :
           recentBenefs.map(b => {
            const [bg,tc] = colorForName(b.full_name)
            const st = BENEFICIARY_STATUSES[b.status] || BENEFICIARY_STATUSES.registered
            return (
              <div key={b.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                <Avatar name={b.full_name} color={bg} textColor={tc} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.full_name}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{b.trade} · {b.target_country?.[0] || '—'}</div>
                </div>
                <Badge label={st.label} color={st.color} text={st.text} />
              </div>
            )
          })}
        </Card>

        {/* Open demands */}
        <Card>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', letterSpacing:.4, color:'#888', margin:0 }}>Open Demands</h3>
            <a href="/demands" style={{ fontSize:12, color:'#E85D26', textDecoration:'none' }}>View all →</a>
          </div>
          {loading ? <div style={{ color:'#ccc', fontSize:13 }}>Loading...</div> :
           recentDemands.length === 0 ? <div style={{ color:'#ccc', fontSize:13 }}>No open demands yet.</div> :
           recentDemands.map(d => {
            const filled = d.count_mapped || 0
            const pct = Math.round((filled / d.count_required) * 100)
            return (
              <div key={d.id} style={{ padding:'8px 0', borderBottom:'1px solid #f5f5f5' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{d.trade} · {d.country}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{filled}/{d.count_required}</div>
                </div>
                <div style={{ background:'#f0f0f0', borderRadius:4, height:5, overflow:'hidden' }}>
                  <div style={{ background: pct >= 100 ? '#3B6D11' : pct >= 50 ? '#E85D26' : '#A32D2D', width:`${pct}%`, height:'100%', borderRadius:4 }} />
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
