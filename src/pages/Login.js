import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)', fontFamily:'system-ui, sans-serif'
    }}>
      <div style={{ width:'100%', maxWidth:420, padding:20 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{
            width:56, height:56, borderRadius:14, background:'#E85D26',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, fontWeight:800, color:'#fff', margin:'0 auto 14px'
          }}>AIM</div>
          <h1 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:0 }}>Global Talent Marketplace</h1>
          <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, margin:'6px 0 0' }}>Ampersand International Mobility</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background:'#fff', borderRadius:16, padding:28
        }}>
          <h2 style={{ fontSize:17, fontWeight:700, marginBottom:20, color:'#1a1a1a' }}>Sign in to your account</h2>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com"
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width:'100%', padding:'10px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }} />
          </div>
          {error && (
            <div style={{ background:'#FCEBEB', color:'#A32D2D', padding:'8px 12px', borderRadius:7, fontSize:12, marginBottom:14 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{
              width:'100%', padding:'11px', background:'#E85D26', color:'#fff',
              border:'none', borderRadius:8, fontSize:14, fontWeight:700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily:'inherit'
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{ textAlign:'center', fontSize:11, color:'#aaa' }}>
            Access is invite-only. Contact your AIM administrator.
            <div style={{ textAlign:'center', marginTop:12 }}>
  <a
    href="/forgot-password">
    style={{
      color:'#EB5D26',
      textDecoration:'none',
      fontSize:'13px',
      fontWeight:'600'
    }}
  >
    Forgot Password?
  </a>
</div>
        </form>
      </div>
    </div>
  )
}
