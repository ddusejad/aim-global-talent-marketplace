import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_ADMIN = [
  { path:'/dashboard', icon:'📊', label:'Dashboard' },
  { path:'/beneficiaries', icon:'👥', label:'Beneficiaries' },
  { path:'/employers', icon:'🏢', label:'Employers' },
  { path:'/demands', icon:'📋', label:'Demands' },
  { path:'/shortlists', icon:'⭐', label:'Shortlists' },
  { path:'/users', icon:'🔐', label:'Users & Access' },
  { path:'/settings', icon:'⚙️', label:'Settings' },
]

const NAV_EMPLOYER = [
  { path:'/employer/browse', icon:'🔍', label:'Browse Profiles' },
  { path:'/employer/shortlist', icon:'⭐', label:'My Shortlist' },
  { path:'/employer/demands', icon:'📋', label:'My Demands' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isEmployer = profile?.role === 'employer'
  const nav = isEmployer ? NAV_EMPLOYER : NAV_ADMIN

  return (
    <div style={{
      width:220, minHeight:'100vh', background:'#0f1117',
      display:'flex', flexDirection:'column', flexShrink:0
    }}>
      {/* Logo */}
      <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:8, background:'#E85D26',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:12, fontWeight:800, color:'#fff', letterSpacing:.5
          }}>AIM</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', lineHeight:1.2 }}>Global Talent</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)' }}>Marketplace</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding:'10px 16px' }}>
        <div style={{
          background:'rgba(232,93,38,.15)', border:'1px solid rgba(232,93,38,.3)',
          borderRadius:6, padding:'5px 10px', fontSize:11, color:'#E85D26', fontWeight:600
        }}>
          {profile?.role === 'superadmin' ? '🛡️ Super Admin' :
           profile?.role === 'admin' ? '👤 Admin' :
           profile?.role === 'staff' ? '📁 AIM Staff' :
           profile?.role === 'employer' ? '🏢 Employer' : '👤 User'}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 10px' }}>
        {nav.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display:'flex', alignItems:'center', gap:10, width:'100%',
                padding:'9px 12px', borderRadius:8, border:'none', cursor:'pointer',
                background: active ? 'rgba(232,93,38,.2)' : 'transparent',
                color: active ? '#E85D26' : 'rgba(255,255,255,.6)',
                fontSize:13, fontWeight: active ? 700 : 500, textAlign:'left',
                marginBottom:2, transition:'all .15s', fontFamily:'inherit'
              }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User + signout */}
      <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.7)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {profile?.full_name || 'User'}
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,.35)', marginBottom:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {profile?.email}
        </div>
        <button onClick={signOut} style={{
          width:'100%', padding:'7px', borderRadius:7, border:'1px solid rgba(255,255,255,.1)',
          background:'transparent', color:'rgba(255,255,255,.5)', fontSize:12,
          cursor:'pointer', fontFamily:'inherit'
        }}>Sign out</button>
      </div>
    </div>
  )
}
