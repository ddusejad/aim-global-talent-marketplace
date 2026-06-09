import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    if (!email) {
      alert('Please enter your email')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://aim-global-talent-marketplace.vercel.app/reset-password'
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Password reset email sent. Please check your inbox.')
  }

  return (
    <div style={{
      minHeight:'100vh',
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      background:'#0f1117'
    }}>
      <div style={{
        background:'white',
        padding:'30px',
        borderRadius:'12px',
        width:'400px'
      }}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width:'100%',
            padding:'10px',
            marginBottom:'10px'
          }}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            width:'100%',
            padding:'12px',
            background:'#EB5D26',
            color:'white',
            border:'none'
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Email'}
        </button>
      </div>
    </div>
  )
}