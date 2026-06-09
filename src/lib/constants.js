export const TRADES = [
  'Nurse','Caregiver','Welder','Electrician','Plumber','Carpenter','Mason','Painter',
  'Mechanic','Fitter','Turner','CNC Operator','HVAC Technician','Civil Engineer',
  'Structural Engineer','IT Technician','Driver','Chef/Cook','F&B Staff',
  'Hotel & Hospitality','Security Guard','Warehouse Staff','Forklift Operator','Other'
]

export const COUNTRIES = [
  'Germany','Saudi Arabia','UAE','Japan','Finland','Italy','Netherlands',
  'Greece','Poland','Singapore','Russia','Canada','Australia','UK','France',
  'Switzerland','Austria','Belgium','Spain','Portugal','Other'
]

export const LANGUAGE_LEVELS = ['A1','A2','B1','B2','C1','C2','None']

export const BENEFICIARY_STATUSES = {
  registered: { label: 'Registered', color: '#E6F1FB', text: '#185FA5' },
  in_training: { label: 'In Training', color: '#FAEEDA', text: '#854F0B' },
  docs_pending: { label: 'Docs Pending', color: '#FAEEDA', text: '#854F0B' },
  deployment_ready: { label: 'Deployment Ready', color: '#EAF3DE', text: '#3B6D11' },
  deployed: { label: 'Deployed', color: '#EEEDFE', text: '#3C3489' },
  on_hold: { label: 'On Hold', color: '#FCEBEB', text: '#A32D2D' },
}

export const DOC_STATUSES = {
  pending: { label: 'Pending', color: '#FAEEDA', text: '#854F0B' },
  uploaded: { label: 'Uploaded', color: '#E6F1FB', text: '#185FA5' },
  verified: { label: 'Verified', color: '#EAF3DE', text: '#3B6D11' },
  expired: { label: 'Expired', color: '#FCEBEB', text: '#A32D2D' },
}

export const DEMAND_STATUSES = {
  open: { label: 'Open', color: '#E6F1FB', text: '#185FA5' },
  in_progress: { label: 'In Progress', color: '#FAEEDA', text: '#854F0B' },
  fulfilled: { label: 'Fulfilled', color: '#EAF3DE', text: '#3B6D11' },
  closed: { label: 'Closed', color: '#F1EFE8', text: '#5F5E5A' },
}

export const SHORTLIST_STATUSES = {
  interested: { label: 'Interested', color: '#FAEEDA', text: '#854F0B' },
  approved: { label: 'Approved', color: '#EAF3DE', text: '#3B6D11' },
  rejected: { label: 'Rejected', color: '#FCEBEB', text: '#A32D2D' },
  on_hold: { label: 'On Hold', color: '#F1EFE8', text: '#5F5E5A' },
}

export const ROLES = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  staff: 'AIM Staff',
  employer: 'Employer',
  beneficiary: 'Beneficiary',
}
