export const UP_DISTRICTS: string[] = [
  'Barabanki', 'Lakhimpur Kheri', 'Sitapur', 'Lucknow', 'Ayodhya',
  'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha',
  'Azamgarh', 'Badaun', 'Bahraich', 'Ballia', 'Balrampur', 'Banda',
  'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun',
  'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah',
  'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad',
  'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi',
  'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat',
  'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar',
  'Lalitpur', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura',
  'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit',
  'Pratapgarh', 'Prayagraj', 'Rae Bareli', 'Rampur', 'Saharanpur',
  'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shrawasti',
  'Siddharthnagar', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi',
];

export const DISCOMS = [
  { name: 'MVVNL', label: 'Madhyanchal Vidyut Vitran Nigam', areas: 'Lucknow, Ayodhya, Sultanpur, Barabanki' },
  { name: 'PVVNL', label: 'Purvanchal Vidyut Vitran Nigam', areas: 'Varanasi, Gorakhpur, Azamgarh' },
  { name: 'DVVNL', label: 'Dakshinanchal Vidyut Vitran Nigam', areas: 'Kanpur, Agra, Aligarh' },
  { name: 'PuVVNL', label: 'Paschimanchal Vidyut Vitran Nigam', areas: 'Meerut, Ghaziabad, Saharanpur' },
  { name: 'KESCo', label: 'Kanpur Electricity Supply Company', areas: 'Kanpur City' },
] as const;

export const ROOF_TYPES = [
  { value: 'RCC_FLAT', label: 'RCC Flat Roof', icon: 'Square' },
  { value: 'METAL_SHED', label: 'Metal Shed', icon: 'Warehouse' },
  { value: 'TIN_SHED', label: 'Tin Shed', icon: 'Warehouse' },
  { value: 'ELEVATED', label: 'Elevated Structure', icon: 'Layers' },
] as const;

export const LEAD_STATUSES: { value: string; label: string; color: string; dotColor: string }[] = [
  { value: 'NEW', label: 'New Lead', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500' },
  { value: 'SITE_VISIT_SCHEDULED', label: 'Site Visit Scheduled', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', dotColor: 'bg-cyan-500' },
  { value: 'SURVEY_DONE', label: 'Survey Done', color: 'bg-teal-50 text-teal-700 border-teal-200', dotColor: 'bg-teal-500' },
  { value: 'QUOTATION_SENT', label: 'Quotation Sent', color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500' },
  { value: 'WON', label: 'Won / Project', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotColor: 'bg-emerald-500' },
  { value: 'LOST', label: 'Lost', color: 'bg-rose-50 text-rose-700 border-rose-200', dotColor: 'bg-rose-500' },
];

export const PIPELINE_STAGES = [
  'NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SURVEY_DONE',
  'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST',
] as const;

export const PROJECT_STAGES = [
  { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed' },
  { stage: 'DETAILED_DESIGN', label: 'Detailed Design' },
  { stage: 'MATERIAL_PROCUREMENT', label: 'Material Procurement' },
  { stage: 'STRUCTURE_MOUNTING', label: 'Structure Mounting' },
  { stage: 'PANEL_INVERTER_WIRING', label: 'Panel & Inverter Wiring' },
  { stage: 'DISCOM_NET_METERING', label: 'Discom Net-Metering' },
  { stage: 'TESTING_SYNC', label: 'Testing & Synchronization' },
  { stage: 'HANDOVER', label: 'Handover' },
] as const;

export const TICKET_CATEGORIES = [
  { value: 'INVERTER_ERROR', label: 'Inverter Error' },
  { value: 'GENERATION_DROP', label: 'Generation Drop' },
  { value: 'PHYSICAL_CLEANING', label: 'Physical Cleaning' },
  { value: 'GRID_ISSUE', label: 'Grid Issue' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const COMPANY = {
  name: 'ABC SOLAR',
  legalName: 'M/S AVADH BORING COMPANY',
  legalEntityType: 'Proprietorship',
  proprietor: 'Abdul Qari',
  tagline: 'Powering a Brighter Tomorrow',
  gstin: '09AABPQ3096M1Z5',
  pan: 'AABPQ3096M',
  email: 'abc.solar7575@gmail.com',
  emailSecondary: 'abdulqari1@gmail.com',
  phone: '9278442418',
  phoneSecondary: '9278442418',
  whatsapp: '919278442418',
  address: 'AN-25, Lauta Bagh, Azad Nagar, Nawabganj, Barabanki, Uttar Pradesh - 225001, India',
  vendorCode: 'BBK2508133242',
  bank: {
    name: 'Canara Bank',
    accountName: 'Avadh Boring Company',
    accountNumber: '120034396413',
    ifsc: 'CNRB0018631',
    branch: 'Barabanki, Uttar Pradesh - 225001',
    accountType: 'Current Account',
  },
  certifications: {
    upnedaVendorCode: 'BBK2508133242',
    upnedaProgram: 'PM Surya Ghar Yojna / Grid-Connected Solar Rooftop Programme Phase-II',
    upnedaPbg: '₹2.5 Lakh Performance Bank Guarantee',
    loomSolarCertNo: '24483/UP/08/2028',
    loomSolarValidTill: '31st August 2028',
  },
  serviceAreas: ['Barabanki', 'Sitapur', 'Lakhimpur Kheri', 'Lucknow', 'Ayodhya'],
};

export const SERVICE_DETAILS = [
  {
    id: 'residential',
    title: 'Residential Rooftop Solar',
    icon: 'Home',
    short: '1 kW to 10 kW systems with net-metering & space requirements',
    description: 'Complete turnkey residential rooftop solar installation from 1 kW to 10 kW capacity. We handle everything from site survey and design to DISCOM net-metering approval and commissioning.',
    specs: [
      { label: 'System Range', value: '1 kW to 10 kW' },
      { label: 'Roof Area Needed', value: '~100 sq ft per kW (RCC), ~120 sq ft (Elevated)' },
      { label: 'Panel Type', value: 'Mono PERC 540W-550W, BIS/ALMM approved' },
      { label: 'Inverter', value: 'String inverter (1φ for <5kW, 3φ for ≥5kW)' },
      { label: 'Net Metering', value: 'Included — MVVNL, PVVNL, DVVNL, PuVVNL' },
      { label: 'Warranty', value: '25 yr panel, 5-10 yr inverter, 2 yr comprehensive' },
    ],
    features: [
      'Free site survey & shadow analysis',
      'PM Surya Ghar + UPNEDA subsidy assistance',
      'GI hot-dip galvanized mounting structure',
      'DC/AC armoured cabling (Polycab/Havells)',
      'Lightning arrester & chemical earthing',
      'Remote generation monitoring app',
    ],
  },
  {
    id: 'commercial',
    title: 'Commercial & Industrial Solar',
    icon: 'Factory',
    short: '10 kW to 500 kW+, CAPEX/OPEX, accelerated depreciation',
    description: 'Large-scale commercial and industrial solar installations from 10 kW to 500 kW+. We offer both CAPEX and OPEX models with accelerated depreciation benefits under Section 32 of the Income Tax Act.',
    specs: [
      { label: 'System Range', value: '10 kW to 500 kW+' },
      { label: 'Roof / Ground Mount', value: 'RCC, metal sheet, ground mount, carport' },
      { label: 'Business Models', value: 'CAPEX (outright purchase) or OPEX (RESCO/PPA)' },
      { label: 'Tax Benefit', value: '40% accelerated depreciation (Section 32)' },
      { label: 'Payback', value: '3-5 years typical for C&I' },
      { label: 'Net Metering', value: 'Group net metering / virtual net metering' },
    ],
    features: [
      'Open access & group net metering support',
      'Remote monitoring with SCADA integration',
      'Power quality & harmonics compliance (IEEE 519)',
      'Structural design certified by structural engineer',
      'PPA & RESCO model facilitation',
      'Green building certification support',
    ],
  },
  {
    id: 'upneda',
    title: 'UPNEDA Liaison',
    icon: 'Landmark',
    short: 'End-to-end documentation with MVVNL, PVVNL, DVVNL, PuVVNL',
    description: 'Complete UPNEDA liaison services covering all documentation and approvals across all four Uttar Pradesh DISCOMs. We handle the entire bureaucratic process so you don\'t have to.',
    specs: [
      { label: 'DISCOMs Covered', value: 'MVVNL, PVVNL, DVVNL, PuVVNL' },
      { label: 'Documentation', value: 'Application, drawings, single line diagram' },
      { label: 'Inspection', value: 'DISCOM inspection coordination' },
      { label: 'Timeline', value: '30-45 days typical approval' },
      { label: 'Vendor Code', value: 'BBK2508133242 (Avadh Boring Company)' },
      { label: 'Compliance', value: 'UPERC regulations & UPNEDA guidelines' },
    ],
    features: [
      'New connection & capacity enhancement applications',
      'Net metering application & agreement execution',
      'DISCOM inspection scheduling & escorting',
      'Electrical safety & standards compliance',
      'Subsidy disbursement follow-up',
      'Renewable Energy Certificate (REC) guidance',
    ],
  },
  {
    id: 'subsidy',
    title: 'PM Surya Ghar Subsidy',
    icon: 'Wallet',
    short: 'Application filing, DISCOM inspection assistance',
    description: 'End-to-end PM Surya Ghar subsidy assistance. We help you register on the national portal, file your application, and coordinate DISCOM inspection so your subsidy is credited directly to your bank account.',
    specs: [
      { label: 'Central Subsidy (1 kW)', value: '₹30,000' },
      { label: 'Central Subsidy (2 kW)', value: '₹60,000' },
      { label: 'Central Subsidy (3 kW+)', value: '₹78,000 (capped)' },
      { label: 'UPNEDA State (1 kW)', value: '₹15,000' },
      { label: 'UPNEDA State (2 kW+)', value: '₹30,000 (capped)' },
      { label: 'Total Combined (3 kW+)', value: '₹1,08,000' },
    ],
    features: [
      'National portal registration (pmsuryaghar.gov.in)',
      'Document preparation & upload',
      'Application tracking & follow-up',
      'DISCOM inspection coordination',
      'Subsidy disbursement monitoring',
      'Rejection/rectification handling',
    ],
  },
  {
    id: 'netmetering',
    title: 'Net Metering',
    icon: 'Zap',
    short: 'Bi-directional meter installation workflow & DISCOM approvals',
    description: 'Complete net metering service including bi-directional meter installation, DISCOM approvals, and synchronization. We ensure your excess solar generation is properly exported to the grid.',
    specs: [
      { label: 'Meter Type', value: 'Bi-directional (import/export)' },
      { label: 'DISCOM Approval', value: 'MVVNL, PVVNL, DVVNL, PuVVNL, KESCo' },
      { label: 'Application', value: 'Submitted to respective DISCOM' },
      { label: 'Inspection', value: 'DISCOM engineer site visit' },
      { label: 'Meter Installation', value: 'By DISCOM authorized personnel' },
      { label: 'Synchronization', value: 'Anti-islanding protection tested' },
    ],
    features: [
      'Net metering application preparation',
      'Single line diagram (SLD) submission',
      'Anti-islanding & protection relay testing',
      'Import-export agreement execution',
      'Meter sealing & commissioning',
      'Generation tracking & billing setup',
    ],
  },
  {
    id: 'amc',
    title: 'AMC & Maintenance',
    icon: 'Wrench',
    short: 'Periodic module cleaning, inverter health check, generation audit',
    description: 'Annual Maintenance Contract (AMC) services to keep your solar system performing at peak efficiency. Regular cleaning, health checks, and generation audits ensure maximum ROI.',
    specs: [
      { label: 'Module Cleaning', value: 'Quarterly (4x per year)' },
      { label: 'Inverter Health Check', value: 'Bi-annual (2x per year)' },
      { label: 'Generation Audit', value: 'Monthly remote + annual on-site' },
      { label: 'Thermography', value: 'Annual IR scan for hotspots' },
      { label: 'Response Time', value: '24-48 hours for service calls' },
      { label: 'Coverage', value: 'Panels, inverter, structure, wiring' },
    ],
    features: [
      'Scheduled module cleaning (soft brush + RO water)',
      'Inverter firmware updates & error log analysis',
      'DC/AC cable & connector inspection',
      'Structure integrity & fastener torque check',
      'Generation vs. benchmark comparison report',
      'Priority service ticket support',
    ],
  },
];

export const DEMO_USERS = [
  { id: 'u1', name: 'Abdul Qari', role: 'Super Admin' as const, initials: 'AQ', email: 'abc.solar7575@gmail.com', password: 'admin123', phone: '9278442418', active: true, createdAt: '2026-01-01', allowedPages: ['dashboard', 'leads', 'pipeline', 'quotations', 'surveys', 'whatsapp', 'projects', 'settings'] },
  { id: 'u2', name: 'Mohd Saad', role: 'Sales Manager' as const, initials: 'MS', email: 'saad@abcsolar.in', password: 'sales123', phone: '9278442419', active: true, createdAt: '2026-02-01', allowedPages: ['dashboard', 'leads', 'pipeline', 'quotations', 'whatsapp'] },
  { id: 'u3', name: 'Mohd Ayan', role: 'Site Engineer' as const, initials: 'MA', email: 'ayan@abcsolar.in', password: 'site123', phone: '9278442420', active: true, createdAt: '2026-02-15', allowedPages: ['dashboard', 'surveys', 'projects'] },
  { id: 'u4', name: 'Sneha Gupta', role: 'Accountant' as const, initials: 'SG', email: 'accounts@abcsolar.in', password: 'acct123', phone: '9278442421', active: true, createdAt: '2026-03-01', allowedPages: ['dashboard', 'quotations', 'projects'] },
];

export const ROLE_ALLOWED_PAGES: Record<string, string[]> = {
  'Super Admin': ['dashboard', 'leads', 'pipeline', 'quotations', 'surveys', 'whatsapp', 'projects', 'settings'],
  'Sales Manager': ['dashboard', 'leads', 'pipeline', 'quotations', 'whatsapp'],
  'Site Engineer': ['dashboard', 'surveys', 'projects'],
  'Accountant': ['dashboard', 'quotations', 'projects'],
};
