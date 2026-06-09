import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleReset = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Password updated successfully')
    navigate('/login')
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
        <h2>Create New Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{width:'100%',padding:'10px',marginBottom:'10px'}}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e)=>setConfirmPassword(e.target.value)}
          style={{width:'100%',padding:'10px',marginBottom:'10px'}}
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
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}