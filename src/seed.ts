import type {
  Lead, Quotation, Survey, Conversation, ChatMessage,
  Project, ServiceTicket, WhatsAppConfig, AICallingConfig, AICallLog,
} from '@/types';
import { uid, getDiscomForDistrict, calculateSolar } from '@/utils';
import { DEMO_USERS } from '@/data';

export const CRM_USERS = DEMO_USERS;

export const SEED_LEADS: Lead[] = [
  {
    id: 'L-001', name: 'Suresh Pandey', phone: '9876543210', district: 'Lucknow',
    discom: 'MVVNL', monthlyBill: 8500, roofArea: 1200, roofType: 'RCC_FLAT',
    recommendedKw: 5, source: 'WEBSITE', status: 'NEW', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-09-02', createdAt: '2026-09-02T08:30:00Z',
    notes: 'Wants 5kW system for 3BHK house. Very interested in subsidy.', dealValue: 275000,
  },
  {
    id: 'L-002', name: 'Mohammad Aslam', phone: '9988776655', district: 'Varanasi',
    discom: 'PVVNL', monthlyBill: 12000, roofArea: 2000, roofType: 'RCC_FLAT',
    recommendedKw: 7.5, source: 'CALCULATOR', status: 'CONTACTED', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-09-02', createdAt: '2026-08-30T10:00:00Z',
    notes: 'Called twice, wants net metering details. Has 2000 sqft roof.', dealValue: 412000,
  },
  {
    id: 'L-003', name: 'Rakesh Mishra', phone: '97000112233', district: 'Ayodhya',
    discom: 'MVVNL', monthlyBill: 4500, roofArea: 800, roofType: 'RCC_FLAT',
    recommendedKw: 3, source: 'REFERRAL', status: 'SITE_VISIT_SCHEDULED', priority: 'WARM',
    assignedTo: 'Priya Singh', followUpDate: '2026-09-03', createdAt: '2026-08-28T14:00:00Z',
    notes: 'Site visit scheduled for 5th Sep. Referred by L-001.', dealValue: 165000,
  },
  {
    id: 'L-004', name: 'Anjali Tiwari', phone: '95544332211', district: 'Kanpur Nagar',
    discom: 'DVVNL', monthlyBill: 6500, roofArea: 1000, roofType: 'METAL_SHED',
    recommendedKw: 4, source: 'WHATSAPP', status: 'SURVEY_DONE', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-09-02', createdAt: '2026-08-25T09:15:00Z',
    notes: 'Survey complete. Metal shed roof, 4kW recommended. Ready for quote.', dealValue: 220000,
  },
  {
    id: 'L-005', name: 'Dinesh Sharma', phone: '9415009988', district: 'Gorakhpur',
    discom: 'PVVNL', monthlyBill: 15000, roofArea: 2500, roofType: 'RCC_FLAT',
    recommendedKw: 10, source: 'WEBSITE', status: 'QUOTATION_SENT', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-09-02', createdAt: '2026-08-20T11:00:00Z',
    notes: 'Quotation sent. Negotiating on price. Wants 10kW for big house.', dealValue: 550000,
  },
  {
    id: 'L-006', name: 'Kavita Nishad', phone: '9330114455', district: 'Sultanpur',
    discom: 'MVVNL', monthlyBill: 3200, roofArea: 600, roofType: 'RCC_FLAT',
    recommendedKw: 2, source: 'WALK-IN', status: 'NEGOTIATION', priority: 'WARM',
    assignedTo: 'Amit Kumar', followUpDate: '2026-09-04', createdAt: '2026-08-18T13:00:00Z',
    notes: 'Wants 2kW. Budget conscious. Offered 5% discount.', dealValue: 110000,
  },
  {
    id: 'L-007', name: 'Pradeep Agrawal', phone: '9870011223', district: 'Meerut',
    discom: 'PuVVNL', monthlyBill: 22000, roofArea: 5000, roofType: 'RCC_FLAT',
    recommendedKw: 15, source: 'REFERRAL', status: 'WON', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-09-10', createdAt: '2026-08-10T10:00:00Z',
    notes: 'Won! 15kW commercial installation. Project in progress.', dealValue: 825000,
  },
  {
    id: 'L-008', name: 'Ramesh Yadav', phone: '9412003344', district: 'Prayagraj',
    discom: 'PVVNL', monthlyBill: 5000, roofArea: 900, roofType: 'TIN_SHED',
    recommendedKw: 3, source: 'WEBSITE', status: 'LOST', priority: 'COLD',
    assignedTo: 'Amit Kumar', followUpDate: '2026-08-30', createdAt: '2026-08-15T15:00:00Z',
    notes: 'Went with competitor due to lower price. May revisit next year.', dealValue: 165000,
  },
  {
    id: 'L-009', name: 'Faisal Khan', phone: '9800112233', district: 'Bareilly',
    discom: 'PuVVNL', monthlyBill: 9000, roofArea: 1500, roofType: 'RCC_FLAT',
    recommendedKw: 5.5, source: 'CALCULATOR', status: 'CONTACTED', priority: 'WARM',
    assignedTo: 'Priya Singh', followUpDate: '2026-09-03', createdAt: '2026-09-01T09:00:00Z',
    notes: 'Used calculator. Interested in 5kW. Follow up tomorrow.', dealValue: 302000,
  },
  {
    id: 'L-010', name: 'Vinod Gupta', phone: '9650114488', district: 'Kanpur Nagar',
    discom: 'KESCo', monthlyBill: 18000, roofArea: 3000, roofType: 'RCC_FLAT',
    recommendedKw: 12, source: 'WEBSITE', status: 'NEW', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-09-02', createdAt: '2026-09-02T07:00:00Z',
    notes: 'New lead from website. Large commercial interest. 12kW.', dealValue: 660000,
  },
  {
    id: 'L-011', name: 'Ramesh Chandra Verma (Deva Cold Storage & Chilling Center)', phone: '9415128899', district: 'Barabanki',
    discom: 'MVVNL', monthlyBill: 95000, roofArea: 6500, roofType: 'METAL_SHED',
    recommendedKw: 60, source: 'HARVEY_AI', status: 'NEW', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-11-03', createdAt: '2026-11-02T11:45:00Z',
    notes: 'Harvey AI Scout: 60kW on-grid solar plant proposal. 6,500 sq ft RCC/Tin roof verified. High daylight refrigeration load matching MVVNL tariff.', dealValue: 3300000,
    email: 'verma.coldstorage@gmail.com', whatsapp: '+919415128899',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-012', name: 'Manoj Kumar Jaiswal (Kashi Silk & Handloom Processing Unit)', phone: '9838012233', district: 'Varanasi',
    discom: 'PuVVNL', monthlyBill: 58000, roofArea: 3800, roofType: 'RCC_FLAT',
    recommendedKw: 35, source: 'HARVEY_AI', status: 'CONTACTED', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-11-03', createdAt: '2026-11-02T11:30:00Z',
    notes: 'Harvey AI Scout: 35kW rooftop solar plant for powerloom operations. PuVVNL net metering feasible. Expected payback ~3.2 years.', dealValue: 1925000,
    email: 'kashisilk.up@gmail.com', whatsapp: '+919838012233',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-013', name: 'Rajeshwar Tripathi (Ganga Valley Agro Cold Storage Pvt Ltd)', phone: '9415201144', district: 'Varanasi',
    discom: 'PuVVNL', monthlyBill: 145000, roofArea: 8500, roofType: 'METAL_SHED',
    recommendedKw: 80, source: 'HARVEY_AI', status: 'SITE_VISIT_SCHEDULED', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-11-04', createdAt: '2026-11-02T11:15:00Z',
    notes: 'Harvey AI Scout: 80kW turnkey rooftop solar plant with Loom Solar bifacial tier-1 panels. Purvanchal DISCOM (PuVVNL) 11kV connection verified.', dealValue: 4400000,
    email: 'gangavalley.agro@gmail.com', whatsapp: '+919415201144',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-014', name: 'Mohd Irfan Khan (Awadh Agro & Rice Mill Pvt Ltd)', phone: '9450123987', district: 'Barabanki',
    discom: 'MVVNL', monthlyBill: 65000, roofArea: 4500, roofType: 'TIN_SHED',
    recommendedKw: 40, source: 'HARVEY_AI', status: 'SURVEY_DONE', priority: 'HOT',
    assignedTo: 'Mohd Saad', followUpDate: '2026-11-03', createdAt: '2026-11-02T12:00:00Z',
    notes: 'Harvey AI Autonomous Scout Lead (Industrial / Rice Mill). Deva Road Agro hub. Tin shed rooftop ~4,500 sq ft. Current MVVNL 63kVA sanctioned load. Dual outreach active.', dealValue: 2200000,
    email: 'director@awadhagro.in', whatsapp: '+919450123987',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-015', name: 'Ashok Kumar Agarwal (Shree Ram Rice & Agro Foods Pvt Ltd)', phone: '9839044551', district: 'Sitapur',
    discom: 'MVVNL', monthlyBill: 72000, roofArea: 4200, roofType: 'METAL_SHED',
    recommendedKw: 40, source: 'HARVEY_AI', status: 'QUOTATION_SENT', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-11-03', createdAt: '2026-11-02T10:50:00Z',
    notes: 'Harvey AI Scout: 40kW industrial shed solar system. 40% accelerated depreciation pitch accepted. Net-metering feasibility confirmed with MVVNL DISCOM.', dealValue: 2200000,
    email: 'shreeram.foods@gmail.com', whatsapp: '+919839044551',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-016', name: 'Dr. Sunil Kumar Dwivedi (Awadh Nursing Home & Maternity Clinic)', phone: '9450332211', district: 'Ayodhya',
    discom: 'MVVNL', monthlyBill: 48000, roofArea: 2800, roofType: 'RCC_FLAT',
    recommendedKw: 25, source: 'HARVEY_AI', status: 'NEGOTIATION', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-11-05', createdAt: '2026-11-02T10:30:00Z',
    notes: 'Harvey AI Scout: 25kW rooftop solar plant for 24x7 medical clinic backup. Shadow-free RCC roof 2,800 sq ft. Site visit survey requested.', dealValue: 1375000,
    email: 'awadhclinic.ayodhya@gmail.com', whatsapp: '+919450332211',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-017', name: 'Vikas Singh (Mata Prasad Highway Fuel Station)', phone: '9935123477', district: 'Gorakhpur',
    discom: 'PuVVNL', monthlyBill: 32000, roofArea: 1800, roofType: 'METAL_SHED',
    recommendedKw: 15, source: 'HARVEY_AI', status: 'NEW', priority: 'WARM',
    assignedTo: 'Priya Singh', followUpDate: '2026-11-06', createdAt: '2026-11-02T10:15:00Z',
    notes: 'Harvey AI Scout: 15kW solar canopy installation over fueling station. PuVVNL net metering requested with Loom Solar mono-perc panels.', dealValue: 825000,
    email: 'highwayfuel.gkp@gmail.com', whatsapp: '+919935123477',
    outreachChannels: ['Email', 'WhatsApp'], whatsappStatus: 'Sent', emailStatus: 'Delivered',
  },
  {
    id: 'L-018', name: 'Dr. Alok Verma', phone: '9839012345', district: 'Sitapur',
    discom: 'MVVNL', monthlyBill: 6800, roofArea: 1100, roofType: 'RCC_FLAT',
    recommendedKw: 5, source: 'META_LEAD_ADS', status: 'CONTACTED', priority: 'HOT',
    assignedTo: 'Amit Kumar', followUpDate: '2026-11-03', createdAt: '2026-11-02T09:45:00Z',
    notes: 'Meta Ad Lead. Form: FB_LEAD_FORM_UP_SUBSIDY_2026, Campaign: UP Surya Ghar District Campaign. Interested in 5kW residential on-grid with central subsidy.', dealValue: 275000,
    email: 'alokverma.md@gmail.com', whatsapp: '+919839012345',
  },
  {
    id: 'L-019', name: 'Awadh Cold Storage Pvt Ltd (Commercial Hub)', phone: '9415088776', district: 'Barabanki',
    discom: 'MVVNL', monthlyBill: 82000, roofArea: 5500, roofType: 'METAL_SHED',
    recommendedKw: 50, source: 'INDIAMART', status: 'SITE_VISIT_SCHEDULED', priority: 'HOT',
    assignedTo: 'Mohd Saad', followUpDate: '2026-11-04', createdAt: '2026-11-02T09:15:00Z',
    notes: 'IndiaMART Inbound B2B Lead: 50kW Commercial Solar Rooftop Plant Requirement. Industrial area Deva Road with net metering.', dealValue: 2750000,
    email: 'ops@awadhcold.in', whatsapp: '+919415088776',
  },
  {
    id: 'L-020', name: 'Inbound Caller (4332 - Surya Ghar Subsidy)', phone: '9125044332', district: 'Barabanki',
    discom: 'MVVNL', monthlyBill: 4200, roofArea: 750, roofType: 'RCC_FLAT',
    recommendedKw: 3, source: 'CALL_IVR', status: 'NEW', priority: 'HOT',
    assignedTo: 'Priya Singh', followUpDate: '2026-11-03', createdAt: '2026-11-02T08:30:00Z',
    notes: 'IVR Telephony Inbound Lead. Duration: 52s. Keypress Option: 1 - Residential Subsidy Inquiry. Requested callback for site measurement.', dealValue: 165000,
    whatsapp: '+919125044332',
  },
];

export const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'Q-001', quoteNumber: 'ABC/2026/001', leadId: 'L-005',
    customerName: 'Dinesh Sharma', customerPhone: '9415009988', customerDistrict: 'Gorakhpur',
    systemKw: 10,
    lineItems: [
      { id: '1', description: 'Solar PV Modules', brand: 'Waaree', specification: '550W Mono PERC, BIS/ALMM Approved', unit: 'Nos', qty: 19, unitPrice: 13500, gstRate: 12 },
      { id: '2', description: 'Grid-Tie Inverter', brand: 'Growatt', specification: '10kW 3-Phase String Inverter', unit: 'Nos', qty: 1, unitPrice: 65000, gstRate: 12 },
      { id: '3', description: 'Mounting Structure', brand: 'ABC Solar', specification: 'GI Hot-Dip Galvanized, RCC Flat', unit: 'kW', qty: 10, unitPrice: 8000, gstRate: 18 },
      { id: '4', description: 'DC & AC Armoured Cables', brand: 'Polycab', specification: '4 sq mm DC + 4 sq mm AC', unit: 'Set', qty: 1, unitPrice: 28000, gstRate: 18 },
      { id: '5', description: 'ACDB & DCDB', brand: 'ABC Solar', specification: 'With SPD, MCB, Fuses', unit: 'Set', qty: 1, unitPrice: 18000, gstRate: 18 },
      { id: '6', description: 'Lightning Arrester & Chemical Earthing', brand: 'OBO Bettermann', specification: 'LA + 2 Chemical Earthing pits', unit: 'Set', qty: 1, unitPrice: 12000, gstRate: 18 },
      { id: '7', description: 'Net-Metering Charges', brand: 'PVVNL', specification: 'Application + Inspection + Meter', unit: 'Lot', qty: 1, unitPrice: 15000, gstRate: 18 },
      { id: '8', description: 'Installation, Testing & Commissioning', brand: 'ABC Solar', specification: 'Civil + Electrical + Sync', unit: 'Lot', qty: 1, unitPrice: 35000, gstRate: 18 },
    ],
    subtotal: 472500, discount: 0, gstType: 'CGST_SGST', gstAmount: 63480,
    grandTotal: 535980, subsidyDeduction: 78000, netInvestment: 457980,
    status: 'SENT', createdAt: '2026-08-22T10:00:00Z', validTill: '2026-09-22',
    notes: '10kW residential rooftop system. PM Surya Ghar subsidy applicable.',
  },
  {
    id: 'Q-002', quoteNumber: 'ABC/2026/002', leadId: 'L-004',
    customerName: 'Anjali Tiwari', customerPhone: '95544332211', customerDistrict: 'Kanpur Nagar',
    systemKw: 4,
    lineItems: [
      { id: '1', description: 'Solar PV Modules', brand: 'Adani', specification: '540W Mono PERC, BIS/ALMM', unit: 'Nos', qty: 8, unitPrice: 13000, gstRate: 12 },
      { id: '2', description: 'Grid-Tie Inverter', brand: 'SolarEdge', specification: '4kW 1-Phase String Inverter', unit: 'Nos', qty: 1, unitPrice: 35000, gstRate: 12 },
      { id: '3', description: 'Mounting Structure', brand: 'ABC Solar', specification: 'GI Galvanized, Metal Shed', unit: 'kW', qty: 4, unitPrice: 9000, gstRate: 18 },
      { id: '4', description: 'DC & AC Armoured Cables', brand: 'Havells', specification: '4 sq mm DC + AC', unit: 'Set', qty: 1, unitPrice: 15000, gstRate: 18 },
      { id: '5', description: 'ACDB & DCDB', brand: 'ABC Solar', specification: 'With SPD, MCB', unit: 'Set', qty: 1, unitPrice: 12000, gstRate: 18 },
      { id: '6', description: 'Lightning Arrester & Earthing', brand: 'OBO', specification: 'LA + Chemical Earthing', unit: 'Set', qty: 1, unitPrice: 10000, gstRate: 18 },
      { id: '7', description: 'Net-Metering Charges', brand: 'DVVNL', specification: 'Application + Meter', unit: 'Lot', qty: 1, unitPrice: 12000, gstRate: 18 },
      { id: '8', description: 'Installation & Commissioning', brand: 'ABC Solar', specification: 'Full Installation', unit: 'Lot', qty: 1, unitPrice: 20000, gstRate: 18 },
    ],
    subtotal: 227000, discount: 0, gstType: 'CGST_SGST', gstAmount: 30420,
    grandTotal: 257420, subsidyDeduction: 48000, netInvestment: 209420,
    status: 'DRAFT', createdAt: '2026-09-01T12:00:00Z', validTill: '2026-10-01',
    notes: '4kW metal shed installation. Subsidy applicable for <3kW slab.',
  },
];

export const SEED_SURVEYS: Survey[] = [
  {
    id: 'S-001', leadId: 'L-003', customerName: 'Rakesh Mishra', customerPhone: '97000112233',
    siteAddress: '12 Civil Lines, Ayodhya, UP 224123', district: 'Ayodhya',
    technician: 'Vikas Yadav', scheduledDate: '2026-09-05', status: 'SCHEDULED',
    roofType: 'RCC_FLAT', usableArea: 0, shadowObstructions: '', sanctionedLoad: 0,
    connectionPhase: 'SINGLE', meterNumber: '', inverterLocation: '', cableDistance: 0,
    recommendedKw: 3, notes: 'Scheduled for 5th Sep morning.',
  },
  {
    id: 'S-002', leadId: 'L-004', customerName: 'Anjali Tiwari', customerPhone: '95544332211',
    siteAddress: '45 Swaroop Nagar, Kanpur, UP 208002', district: 'Kanpur Nagar',
    technician: 'Vikas Yadav', scheduledDate: '2026-08-28', status: 'COMPLETED',
    roofType: 'METAL_SHED', usableArea: 1000, shadowObstructions: 'Water tank on south side - minor',
    sanctionedLoad: 5, connectionPhase: 'THREE', meterNumber: 'KESCo-889234',
    inverterLocation: 'Near main DB on ground floor', cableDistance: 25,
    recommendedKw: 4, notes: 'Metal shed in good condition. 4kW recommended. South-facing.',
    completedAt: '2026-08-28T15:00:00Z',
  },
];

const seedMessages: ChatMessage[] = [
  { id: 'm1', conversationId: 'C-001', sender: 'customer', text: 'Namaste, I saw your website. I want solar for my house in Lucknow.', timestamp: '2026-09-02T07:30:00Z', status: 'read' },
  { id: 'm2', conversationId: 'C-001', sender: 'agent', text: 'Namaste! Welcome to ABC Solar. We would be happy to help. What is your monthly electricity bill approximately?', timestamp: '2026-09-02T07:32:00Z', status: 'read' },
  { id: 'm3', conversationId: 'C-001', sender: 'customer', text: 'Around ₹8500 per month. I have a 3BHK house.', timestamp: '2026-09-02T07:33:00Z', status: 'read' },
  { id: 'm4', conversationId: 'C-001', sender: 'agent', text: 'Based on your bill, we recommend a 5kW system. Annual savings ~₹49,000. With PM Surya Ghar subsidy, your investment would be around ₹2.2 lakhs. Shall I schedule a free site survey?', timestamp: '2026-09-02T07:35:00Z', status: 'read' },
  { id: 'm5', conversationId: 'C-001', sender: 'customer', text: 'That sounds good. What about warranty?', timestamp: '2026-09-02T07:36:00Z', status: 'read' },
  { id: 'm6', conversationId: 'C-001', sender: 'agent', text: 'We provide 25-year performance warranty on panels, 5-10 year warranty on inverters, and 2-year comprehensive warranty on installation. All Tier-1 BIS/ALMM approved modules.', timestamp: '2026-09-02T07:38:00Z', status: 'read' },
  { id: 'm7', conversationId: 'C-001', sender: 'customer', text: 'Great! Can you send me a quotation?', timestamp: '2026-09-02T08:25:00Z', status: 'delivered' },

  { id: 'm8', conversationId: 'C-002', sender: 'customer', text: 'Hi, I used your calculator. 7.5kW system for my house in Varanasi.', timestamp: '2026-09-01T10:00:00Z', status: 'read' },
  { id: 'm9', conversationId: 'C-002', sender: 'agent', text: 'Hello Mr. Aslam! Thank you for using our calculator. A 7.5kW system would generate approximately 12,300 units annually. Would you like a site survey before we send the quotation?', timestamp: '2026-09-01T10:05:00Z', status: 'read' },
  { id: 'm10', conversationId: 'C-002', sender: 'customer', text: 'Yes, please arrange a survey. My roof is RCC flat, about 2000 sqft.', timestamp: '2026-09-01T10:07:00Z', status: 'read' },
  { id: 'm11', conversationId: 'C-002', sender: 'agent', text: 'Perfect! I have noted the details. Our technician Vikas will visit your site this week. I will confirm the date by tomorrow.', timestamp: '2026-09-01T10:10:00Z', status: 'read' },
  { id: 'm12', conversationId: 'C-002', sender: 'customer', text: 'Thank you. Looking forward.', timestamp: '2026-09-01T10:11:00Z', status: 'read' },

  { id: 'm13', conversationId: 'C-003', sender: 'customer', text: 'The quotation you sent looks good. Can you give some discount?', timestamp: '2026-08-27T14:00:00Z', status: 'read' },
  { id: 'm14', conversationId: 'C-003', sender: 'agent', text: 'Mr. Sharma, thank you for reviewing. We can offer a 3% discount on the total if you confirm within this week. Also, we handle all net-metering paperwork with PVVNL at no extra cost.', timestamp: '2026-08-27T14:15:00Z', status: 'read' },
  { id: 'm15', conversationId: 'C-003', sender: 'customer', text: 'Okay, let me discuss with family and confirm by tomorrow.', timestamp: '2026-08-27T14:20:00Z', status: 'read' },
  { id: 'm16', conversationId: 'C-003', sender: 'customer', text: 'We are ready to proceed. What are the next steps?', timestamp: '2026-09-02T06:00:00Z', status: 'delivered' },
];

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'C-001', leadId: 'L-001', customerName: 'Suresh Pandey', customerPhone: '9876543210',
    district: 'Lucknow', unreadCount: 1, lastMessage: 'Great! Can you send me a quotation?',
    lastMessageTime: '2026-09-02T08:25:00Z', online: true, assignedAgent: 'Priya Singh',
    messages: seedMessages.filter(m => m.conversationId === 'C-001'),
  },
  {
    id: 'C-002', leadId: 'L-002', customerName: 'Mohammad Aslam', customerPhone: '9988776655',
    district: 'Varanasi', unreadCount: 0, lastMessage: 'Thank you. Looking forward.',
    lastMessageTime: '2026-09-01T10:11:00Z', online: false, assignedAgent: 'Amit Kumar',
    messages: seedMessages.filter(m => m.conversationId === 'C-002'),
  },
  {
    id: 'C-003', leadId: 'L-005', customerName: 'Dinesh Sharma', customerPhone: '9415009988',
    district: 'Gorakhpur', unreadCount: 1, lastMessage: 'We are ready to proceed. What are the next steps?',
    lastMessageTime: '2026-09-02T06:00:00Z', online: true, assignedAgent: 'Priya Singh',
    messages: seedMessages.filter(m => m.conversationId === 'C-003'),
  },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'P-001', leadId: 'L-007', quotationId: 'Q-003', customerName: 'Pradeep Agrawal',
    customerPhone: '9870011223', district: 'Meerut', systemKw: 15, projectValue: 825000,
    currentStage: 'STRUCTURE_MOUNTING', startDate: '2026-08-25', expectedHandover: '2026-09-20',
    stages: [
      { stage: 'ORDER_CONFIRMED', label: 'Order Confirmed', completed: true, completedAt: '2026-08-25' },
      { stage: 'DETAILED_DESIGN', label: 'Detailed Design', completed: true, completedAt: '2026-08-27' },
      { stage: 'MATERIAL_PROCUREMENT', label: 'Material Procurement', completed: true, completedAt: '2026-08-30' },
      { stage: 'STRUCTURE_MOUNTING', label: 'Structure Mounting', completed: false },
      { stage: 'PANEL_INVERTER_WIRING', label: 'Panel & Inverter Wiring', completed: false },
      { stage: 'DISCOM_NET_METERING', label: 'Discom Net-Metering', completed: false },
      { stage: 'TESTING_SYNC', label: 'Testing & Synchronization', completed: false },
      { stage: 'HANDOVER', label: 'Handover', completed: false },
    ],
  },
];

export const SEED_TICKETS: ServiceTicket[] = [
  {
    id: 'T-001', ticketNumber: 'AMC/2026/001', projectId: 'P-001',
    customerName: 'Pradeep Agrawal', customerPhone: '9870011223', district: 'Meerut',
    category: 'PHYSICAL_CLEANING', priority: 'NORMAL', status: 'OPEN',
    description: 'Customer requested panel cleaning after construction dust buildup.',
    technician: 'Vikas Yadav', createdAt: '2026-09-01T09:00:00Z',
  },
];

export const SEED_WHATSAPP_CONFIG: WhatsAppConfig = {
  wabaId: '123456789012345',
  phoneNumberId: '987654321098765',
  accessToken: 'EAAG••••••••••••••••••••••••••••••••••••',
  webhookVerifyToken: 'abcsolar_verify_2026',
  connected: false,
};

export const SEED_AI_CALLING_CONFIG: AICallingConfig = {
  provider: 'bland_ai',
  apiKey: 'sk-bland-prod-9a72••••••••3821',
  accountSid: 'bland-org-up-sol-75',
  callerId: '+919450942418',
  persona: 'Priya (ABC Solar Technical Sales Advisor)',
  voiceGender: 'female',
  language: 'Hindi / Hinglish (Conversational)',
  autoCallOnNewLead: true,
  enabled: true,
};

export const SEED_CALL_LOGS: AICallLog[] = [
  {
    id: 'CALL-2026-001',
    leadId: 'L-001',
    customerName: 'Suresh Pandey',
    customerPhone: '9876543210',
    district: 'Lucknow',
    provider: 'bland_ai',
    status: 'COMPLETED',
    durationSeconds: 105,
    startedAt: '2026-09-02T08:35:00Z',
    completedAt: '2026-09-02T08:36:45Z',
    summary: 'Customer confirmed interest in 5kW system for 3BHK house. Verified ₹8,500 monthly bill and ~1,200 sqft RCC Flat roof. Confirmed site survey for tomorrow at 11:00 AM.',
    surveyConfirmed: true,
    confirmedDate: '2026-09-03',
    confirmedKw: 5,
    confirmedRoofType: 'RCC_FLAT',
    sentiment: 'POSITIVE',
    transcript: [
      { speaker: 'ai', text: 'नमस्ते सुरेश जी! मैं ABC Solar (Avadh Boring Company) से Priya बोल रही हूँ। आपने हमारी वेबसाइट पर PM Surya Ghar सोलर सब्सिडी के लिए रिक्वेस्ट भेजी थी?', timeOffsetSeconds: 0 },
      { speaker: 'customer', text: 'हाँ नमस्ते प्रिया जी, मैंने ही फॉर्म भरा था। मुझे छत पर सोलर लगवाना है क्योंकि बिजली का बिल बहुत ज्यादा आ रहा है।', timeOffsetSeconds: 8 },
      { speaker: 'ai', text: 'बिल्कुल सुरेश जी! उत्तर प्रदेश में PM सूर्य घर योजना के तहत ₹78,000 सेंट्रल सब्सिडी और ₹30,000 UPNEDA राज्य सब्सिडी मिल रही है। आपका महीने का बिल लगभग ₹8,500 है, सही है?', timeOffsetSeconds: 22 },
      { speaker: 'customer', text: 'जी हाँ, गर्मियों में 8,500 से 9,000 के बीच आता है।', timeOffsetSeconds: 38 },
      { speaker: 'ai', text: 'तो आपके लिए 5 kW का ऑन-ग्रिड सोलर प्लांट सबसे उपयुक्त रहेगा। क्या आपके पास लगभग 500 से 600 sqft की पक्की RCC छत उपलब्ध है?', timeOffsetSeconds: 46 },
      { speaker: 'customer', text: 'हाँ, छत पूरी पक्की RCC है और लगभग 1200 sqft एरिया खाली है, कोई छाया भी नहीं आती।', timeOffsetSeconds: 61 },
      { speaker: 'ai', text: 'अरे वाह, यह तो सोलर के लिए बहुत अच्छी साइट है! क्या हमारे UPNEDA सर्टिफाइड इंजीनियर कल 11:00 AM आपके घर आकर फ्री साइट सर्वे और स्ट्रक्चर मेजरमेंट कर सकते हैं?', timeOffsetSeconds: 74 },
      { speaker: 'customer', text: 'हाँ बिल्कुल, कल सुबह 11 बजे मैं घर पर ही रहूँगा। आप इंजीनियर को भेज दीजिए।', timeOffsetSeconds: 89 },
      { speaker: 'ai', text: 'बहुत धन्यवाद सुरेश जी! आपका फ्री साइट सर्वे कल सुबह 11 बजे के लिए बुक कर दिया गया है। हमारे इंजीनियर आने से पहले आपको कॉल करेंगे। आपका दिन शुभ हो!', timeOffsetSeconds: 96 },
    ],
  },
  {
    id: 'CALL-2026-002',
    leadId: 'L-002',
    customerName: 'Mohammad Aslam',
    customerPhone: '9988776655',
    district: 'Varanasi',
    provider: 'exotel',
    status: 'COMPLETED',
    durationSeconds: 82,
    startedAt: '2026-08-30T10:15:00Z',
    completedAt: '2026-08-30T10:16:22Z',
    summary: 'Customer verified 7.5kW requirement for commercial/residential mix. 2,000 sqft roof available. Requested detailed net-metering quote via WhatsApp.',
    surveyConfirmed: false,
    confirmedDate: undefined,
    confirmedKw: 7.5,
    confirmedRoofType: 'RCC_FLAT',
    sentiment: 'POSITIVE',
    transcript: [
      { speaker: 'ai', text: 'आदाब असलम जी! ABC Solar से AI सेल्स असिस्टेंट बात कर रही हूँ। आपने हमारे सोलर कैलकुलेटर पर 7.5 kW सिस्टम कैलकुलेट किया था।', timeOffsetSeconds: 0 },
      { speaker: 'customer', text: 'हाँ जी, मुझे नेट मीटरिंग और 7.5 kW की सब्सिडी के बारे में जानना था।', timeOffsetSeconds: 10 },
      { speaker: 'ai', text: 'जरूर असलम जी! 7.5 kW पर आपको ₹78,000 सेंट्रल सब्सिडी और PVVNL डिस्कॉम से नेट मीटरिंग की पूरी सुविधा मिलेगी। क्या आप पहले वॉट्सऐप पर कोटेशन देखना चाहेंगे?', timeOffsetSeconds: 22 },
      { speaker: 'customer', text: 'हाँ, मुझे पहले वॉट्सऐप पर पूरा प्रपोजल भेज दीजिए, फिर सर्वे करवा लेंगे।', timeOffsetSeconds: 48 },
      { speaker: 'ai', text: 'बिल्कुल! हमने आपके नंबर पर पूरा ब्रेकअप भेज दिया है। हमारे सीनियर एग्जीक्यूटिव अमित कुमार जी आपसे जल्द बात करेंगे। शुक्रिया!', timeOffsetSeconds: 62 },
    ],
  },
];

export function createLeadFromForm(data: {
  name: string; phone: string; district: string; monthlyBill: number;
  roofArea?: number; roofType?: string; source: 'WEBSITE' | 'CALCULATOR';
}): Lead {
  const calc = calculateSolar(data.monthlyBill, data.roofArea, data.roofType);
  return {
    id: uid('L'),
    name: data.name,
    phone: data.phone,
    district: data.district,
    discom: getDiscomForDistrict(data.district),
    monthlyBill: data.monthlyBill,
    roofArea: data.roofArea,
    roofType: data.roofType as any,
    recommendedKw: calc.recommendedKw,
    source: data.source,
    status: 'NEW',
    priority: data.monthlyBill > 10000 ? 'HOT' : data.monthlyBill > 5000 ? 'WARM' : 'COLD',
    assignedTo: 'Priya Singh',
    followUpDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    notes: `Lead from ${data.source}. Monthly bill ₹${data.monthlyBill}. Recommended ${calc.recommendedKw}kW.`,
    dealValue: Math.round(calc.recommendedKw * 55000),
  };
}
