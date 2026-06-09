import React, { useState } from 'react'
import { TRADES, COUNTRIES } from '../lib/constants'
import { Button, Card, SectionHeader, Tabs } from '../components/UI'

export default function Settings() {
  const [tab, setTab] = useState('platform')
  const [trades, setTrades] = useState([...TRADES])
  const [countries, setCountries] = useState([...COUNTRIES])
  const [newTrade, setNewTrade] = useState('')
  const [newCountry, setNewCountry] = useState('')
  const [saved, setSaved] = useState(false)
  const [platformName, setPlatformName] = useState('AIM Global Talent Marketplace')
  const [orgName, setOrgName] = useState('Ampersand International Mobility')

  function addTrade() { if (newTrade.trim() && !trades.includes(newTrade.trim())) { setTrades(p=>[...p,newTrade.trim()]); setNewTrade('') } }
  function removeTrade(t) { setTrades(p=>p.filter(x=>x!==t)) }
  function addCountry() { if (newCountry.trim() && !countries.includes(newCountry.trim())) { setCountries(p=>[...p,newCountry.trim()]); setNewCountry('') } }
  function removeCountry(c) { setCountries(p=>p.filter(x=>x!==c)) }

  function saveMock() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div>
      <SectionHeader title="Platform Settings" />
      <Tabs active={tab} onChange={setTab} tabs={[{key:'platform',label:'Platform'},{key:'trades',label:'Trades'},{key:'countries',label:'Countries'},{key:'about',label:'About'}]} />

      {tab === 'platform' && (
        <Card style={{ maxWidth:600 }}>
          <div style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', color:'#888', letterSpacing:.4, marginBottom:16 }}>General Settings</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>Platform Name</label>
              <input value={platformName} onChange={e=>setPlatformName(e.target.value)}
                style={{ width:'100%', padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#555', marginBottom:5 }}>Organisation Name</label>
              <input value={orgName} onChange={e=>setOrgName(e.target.value)}
                style={{ width:'100%', padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
            </div>
            <div style={{ background:'#fafafa', borderRadius:8, padding:'12px 14px' }}>
              <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Beneficiary ID Prefix</div>
              <div style={{ fontSize:13, color:'#666' }}>AIM-<span style={{ color:'#aaa' }}>XXXXXX</span> (auto-generated)</div>
            </div>
            <Button variant="primary" style={{ alignSelf:'flex-start' }} onClick={saveMock}>
              {saved ? '✓ Saved!' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      )}

      {tab === 'trades' && (
        <Card>
          <div style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', color:'#888', letterSpacing:.4, marginBottom:12 }}>
            Manage Trades ({trades.length})
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <input value={newTrade} onChange={e=>setNewTrade(e.target.value)} placeholder="Add new trade..."
              onKeyDown={e => e.key==='Enter' && addTrade()}
              style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', flex:1, outline:'none' }} />
            <Button variant="primary" onClick={addTrade}>Add Trade</Button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {trades.map(t => (
              <div key={t} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#fafafa', border:'1px solid #e8e8e8', borderRadius:20, fontSize:12 }}>
                {t}
                <button onClick={() => removeTrade(t)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:16, lineHeight:1, padding:0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <Button variant="primary" onClick={saveMock}>{saved ? '✓ Saved!' : 'Save Trades'}</Button>
          </div>
        </Card>
      )}

      {tab === 'countries' && (
        <Card>
          <div style={{ fontSize:13, fontWeight:700, textTransform:'uppercase', color:'#888', letterSpacing:.4, marginBottom:12 }}>
            Manage Target Countries ({countries.length})
          </div>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <input value={newCountry} onChange={e=>setNewCountry(e.target.value)} placeholder="Add new country..."
              onKeyDown={e => e.key==='Enter' && addCountry()}
              style={{ padding:'8px 12px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, fontFamily:'inherit', flex:1, outline:'none' }} />
            <Button variant="primary" onClick={addCountry}>Add Country</Button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {countries.map(c => (
              <div key={c} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', background:'#fafafa', border:'1px solid #e8e8e8', borderRadius:20, fontSize:12 }}>
                {c}
                <button onClick={() => removeCountry(c)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', fontSize:16, lineHeight:1, padding:0 }}>×</button>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16 }}>
            <Button variant="primary" onClick={saveMock}>{saved ? '✓ Saved!' : 'Save Countries'}</Button>
          </div>
        </Card>
      )}

      {tab === 'about' && (
        <Card style={{ maxWidth:600 }}>
          <div style={{ textAlign:'center', padding:'2rem 0' }}>
            <div style={{ width:60, height:60, borderRadius:14, background:'#E85D26', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff', margin:'0 auto 16px' }}>AIM</div>
            <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 8px' }}>AIM Global Talent Marketplace</h2>
            <p style={{ color:'#888', fontSize:13, margin:'0 0 4px' }}>Ampersand International Mobility</p>
            <p style={{ color:'#aaa', fontSize:12 }}>Version 1.0.0 · Built for AIM</p>
            <div style={{ marginTop:24, padding:'16px', background:'#fafafa', borderRadius:10, fontSize:12, color:'#666', textAlign:'left' }}>
              <div style={{ fontWeight:700, marginBottom:8 }}>Platform capabilities</div>
              <div>✅ Beneficiary registration & profiling</div>
              <div>✅ Employer onboarding & access control</div>
              <div>✅ Demand management</div>
              <div>✅ Shortlist & mapping with admin approval</div>
              <div>✅ Role-based access (Super Admin, Admin, Staff, Employer)</div>
              <div>✅ Supabase-powered real-time database</div>
              <div>✅ Fully customisable fields & modules</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
