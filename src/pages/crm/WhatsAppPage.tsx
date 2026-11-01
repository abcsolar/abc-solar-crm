import { useState, useRef, useEffect } from 'react';
import {
  Search, Send, Check, CheckCheck, MessageCircle, StickyNote,
  MapPin, Zap, FileText, Phone, Plus, ChevronDown, Settings,
} from 'lucide-react';
import { useStore, sendMessage, markConversationRead } from '@/store';
import { formatTime, relativeTime, waLink, formatINR } from '@/utils';
import { Card, Badge } from '@/components/ui';
import type { CRMPageProps } from '@/types/crm';
import type { Conversation } from '@/types';

const TEMPLATES = [
  { label: 'Welcome', text: 'Namaste! Welcome to ABC Solar. We are excited to help you with your solar journey. How can we assist you today?' },
  { label: 'Quotation Sent', text: 'Dear Customer, we have sent your quotation via email. Please review and let us know if you have any questions. Valid for 30 days.' },
  { label: 'Site Visit Reminder', text: 'Reminder: Your site survey is scheduled for tomorrow. Our technician will visit at the agreed time. Please ensure roof access is available.' },
  { label: 'Follow Up', text: 'Following up on our previous conversation. Have you had a chance to review the proposal? Happy to answer any questions.' },
];

export function WhatsAppPage({ onNavigate: _onNavigate }: CRMPageProps) {
  const store = useStore();
  const { conversations } = store;
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeId);

  useEffect(() => {
    if (activeId) markConversationRead(activeId);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  const filteredConvs = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.customerPhone.includes(search)
  );

  function handleSend() {
    if (!inputText.trim() || !activeId) return;
    sendMessage(activeId, inputText.trim(), 'agent');
    setInputText('');
  }

  function handleTemplate(text: string) {
    if (!activeId) return;
    sendMessage(activeId, text, 'agent', false);
    setShowTemplates(false);
  }

  function handleNote() {
    if (!inputText.trim() || !activeId) return;
    sendMessage(activeId, inputText.trim(), 'agent', true);
    setInputText('');
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-0px)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-display font-extrabold text-2xl text-slate-900">WhatsApp Team Inbox</h1>
        <p className="text-sm text-slate-500 mt-0.5">Shared inbox for all customer conversations</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 min-h-0">
        {/* Left: Conversation list */}
        <Card className="flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-9 py-2 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full text-left p-3 border-b border-slate-100 transition-colors ${activeId === conv.id ? 'bg-forest-50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                      {conv.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-slate-900 truncate">{conv.customerName}</p>
                      <span className="text-xs text-slate-400 shrink-0 ml-1">{relativeTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-1 shrink-0 bg-forest-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Center: Chat */}
        {activeConv ? (
          <Card className="flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {activeConv.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{activeConv.customerName}</p>
                  <p className="text-xs text-slate-500">{activeConv.online ? 'Online' : 'Last seen recently'} • {activeConv.district}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowNotes(!showNotes)} className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:bg-slate-100'}`} title="Internal Notes">
                  <StickyNote size={18} />
                </button>
                <a href={waLink(activeConv.customerPhone)} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-400 hover:bg-slate-100" title="Open in WhatsApp">
                  <Phone size={18} />
                </a>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
              {activeConv.messages.map(msg => {
                if (msg.agentNote) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs text-amber-700 max-w-md">
                        <span className="font-semibold">Internal Note: </span>{msg.text}
                      </div>
                    </div>
                  );
                }
                const isAgent = msg.sender === 'agent';
                return (
                  <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${isAgent ? 'bg-forest-600 text-white' : 'bg-white border border-slate-200 text-slate-800'}`}>
                      <p>{msg.text}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 text-xs ${isAgent ? 'text-forest-200' : 'text-slate-400'}`}>
                        {formatTime(msg.timestamp)}
                        {isAgent && (msg.status === 'read' ? <CheckCheck size={12} /> : msg.status === 'delivered' ? <CheckCheck size={12} className="opacity-50" /> : <Check size={12} className="opacity-50" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-slate-200">
              {showTemplates && (
                <div className="mb-2 p-2 bg-slate-50 rounded-lg space-y-1">
                  {TEMPLATES.map(t => (
                    <button key={t.label} onClick={() => handleTemplate(t.text)} className="block w-full text-left px-3 py-2 rounded-md hover:bg-white text-sm text-slate-600 transition-colors">
                      <span className="font-semibold text-forest-700">{t.label}:</span> {t.text.slice(0, 60)}...
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTemplates(!showTemplates)} className={`p-2 rounded-lg transition-colors ${showTemplates ? 'bg-forest-50 text-forest-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                  <MessageCircle size={20} />
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !showNotes) handleSend(); }}
                  placeholder={showNotes ? 'Type internal note...' : 'Type a message...'}
                  className="input-field flex-1"
                />
                {showNotes ? (
                  <button onClick={handleNote} className="btn-secondary px-3"><StickyNote size={18} /></button>
                ) : (
                  <button onClick={handleSend} className="btn-primary px-3"><Send size={18} /></button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center justify-center text-slate-400">
            <div className="text-center"><MessageCircle size={48} className="mx-auto mb-3 opacity-30" /><p>Select a conversation</p></div>
          </Card>
        )}

        {/* Right: Customer dossier */}
        {activeConv && (
          <Card className="p-4 overflow-y-auto">
            <h4 className="font-display font-bold text-sm text-slate-900 mb-3">Customer Dossier</h4>
            <div className="space-y-3">
              <div className="text-center pb-3 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-solar-400 to-solar-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">
                  {activeConv.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <p className="font-semibold text-slate-900">{activeConv.customerName}</p>
                <p className="text-xs text-slate-500">{activeConv.customerPhone}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><MapPin size={14} className="text-slate-400" /> {activeConv.district}</div>
                <div className="flex items-center gap-2 text-slate-600"><Zap size={14} className="text-solar-500" /> Capacity: <span className="font-semibold">{activeConv.leadId}</span></div>
              </div>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <button className="btn-outline w-full text-sm"><FileText size={14} /> View Quotation</button>
                <a href={waLink(activeConv.customerPhone)} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full text-sm"><MessageCircle size={14} /> Open in WhatsApp</a>
                <a href={`tel:${activeConv.customerPhone}`} className="btn-ghost w-full text-sm"><Phone size={14} /> Call Customer</a>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Assigned Agent</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700">{activeConv.assignedAgent.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm text-slate-600">{activeConv.assignedAgent}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
