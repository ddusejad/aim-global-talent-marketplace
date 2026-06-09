import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Beneficiaries from './pages/Beneficiaries'
import Employers from './pages/Employers'
import Demands from './pages/Demands'
import Shortlists from './pages/Shortlists'
import Users from './pages/Users'
import Settings from './pages/Settings'
import { EmployerBrowse, EmployerShortlist, EmployerDemands } from './pages/EmployerPortal'

function Layout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f7f7f7', fontFamily:'system-ui, -apple-system, sans-serif' }}>
      <Sidebar />
      <main style={{ flex:1, padding:'28px 32px', overflow:'auto' }}>
        {children}
      </main>
    </div>
  )
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1117' }}>
      <div style={{ color:'#E85D26', fontSize:24, fontWeight:700 }}>AIM</div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && !requiredRole.includes(profile?.role)) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#0f1117' }}>
      <div style={{ color:'#E85D26', fontSize:28, fontWeight:800 }}>AIM</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

      {/* Admin/Staff routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/beneficiaries" element={<ProtectedRoute requiredRole={['superadmin','admin','staff']}><Layout><Beneficiaries /></Layout></ProtectedRoute>} />
      <Route path="/employers" element={<ProtectedRoute requiredRole={['superadmin','admin']}><Layout><Employers /></Layout></ProtectedRoute>} />
      <Route path="/demands" element={<ProtectedRoute requiredRole={['superadmin','admin','staff']}><Layout><Demands /></Layout></ProtectedRoute>} />
      <Route path="/shortlists" element={<ProtectedRoute requiredRole={['superadmin','admin','staff']}><Layout><Shortlists /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute requiredRole={['superadmin','admin']}><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute requiredRole={['superadmin','admin']}><Layout><Settings /></Layout></ProtectedRoute>} />

      {/* Employer routes */}
      <Route path="/employer/browse" element={<ProtectedRoute requiredRole={['employer']}><Layout><EmployerBrowse /></Layout></ProtectedRoute>} />
      <Route path="/employer/shortlist" element={<ProtectedRoute requiredRole={['employer']}><Layout><EmployerShortlist /></Layout></ProtectedRoute>} />
      <Route path="/employer/demands" element={<ProtectedRoute requiredRole={['employer']}><Layout><EmployerDemands /></Layout></ProtectedRoute>} />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
