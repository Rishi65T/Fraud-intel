import React, { useState } from 'react';
import { InvestigationCase } from '../../types/fraud';
import { 
  SearchCode, 
  Plus, 
  Send, 
  ExternalLink
} from 'lucide-react';

interface InvestigationWorkspaceViewProps {
  cases: InvestigationCase[];
  onSelectEntity: (entityId: string) => void;
  onUpdateCase: (id: string, updates: Partial<InvestigationCase>) => void;
  onCreateNewCase: () => void;
}

export const InvestigationWorkspaceView: React.FC<InvestigationWorkspaceViewProps> = ({
  cases,
  onSelectEntity,
  onUpdateCase,
  onCreateNewCase
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [newNote, setNewNote] = useState('');

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !activeCase) return;

    const noteObj = {
      id: `note-${Date.now()}`,
      author: 'Aryan Mehra',
      timestamp: new Date().toISOString().substring(11, 16) + ' IST',
      content: newNote.trim()
    };

    onUpdateCase(activeCase.id, {
      notes: [...(activeCase.notes || []), noteObj]
    });
    setNewNote('');
  };

  const handleStatusChange = (newStatus: 'In Review' | 'Escalated' | 'Resolved' | 'Closed') => {
    if (!activeCase) return;
    onUpdateCase(activeCase.id, { status: newStatus });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2937]">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <SearchCode className="w-5 h-5 text-[#38BDF8]" />
            <span>Investigation Workspace & FIU-IND Case Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end Indian financial crime case tracking, chain of custody, and Section 102 CrPC regulatory packaging
          </p>
        </div>

        <button
          onClick={onCreateNewCase}
          className="px-4 py-2 rounded-xl bg-[#38BDF8] hover:bg-[#0284C7] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Case Details Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Cases List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
            <span>Active Cases ({cases.length})</span>
            <span>Priority</span>
          </div>

          <div className="space-y-2">
            {cases.map(c => {
              const isSelected = c.id === selectedCaseId;
              const isCrit = c.priority === 'Critical';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#151E2C] border-[#38BDF8] shadow-[0_0_16px_rgba(56,189,248,0.2)]'
                      : 'bg-[#0E131C] border-[#1F2937] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      isCrit
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    }`}>
                      {c.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-medium text-slate-200 line-clamp-1">{c.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[#1F2937]">
                    <span>Score: <strong className="text-rose-400 font-mono">{c.riskScore.toFixed(2)}</strong></span>
                    <span className="font-mono text-slate-300">{c.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Deep Dive */}
        {activeCase ? (
          <div className="lg:col-span-8 bg-[#0E131C] rounded-xl border border-[#1F2937] p-6 space-y-5">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#1F2937]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeCase.title}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Risk {activeCase.riskScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Assigned: <strong className="text-slate-200">{activeCase.assignedAnalyst}</strong></span>
                  <span>·</span>
                  <span>Created: {activeCase.createdDate}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 bg-[#121824] p-1 rounded-lg border border-[#1F2937] text-xs">
                {(['In Review', 'Escalated', 'Resolved', 'Closed'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      activeCase.status === st
                        ? 'bg-[#38BDF8] text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Case Summary */}
            <div className="bg-[#121824] p-4 rounded-xl border border-[#1F2937] space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Executive Forensic Case Summary
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {activeCase.summary}
              </p>
            </div>

            {/* Key Findings */}
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Forensic Key Findings
              </span>
              <div className="space-y-1.5">
                {activeCase.keyFindings.map((finding, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#151E2C] border border-[#1F2937] text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0 mt-1.5" />
                    <span>{finding}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Entities Chips */}
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                Linked Evidence Entities
              </span>
              <div className="flex flex-wrap gap-2">
                {activeCase.evidenceEntities.map(id => (
                  <button
                    key={id}
                    onClick={() => onSelectEntity(id)}
                    className="px-3 py-1.5 rounded-lg bg-[#121824] hover:bg-[#151E2C] border border-[#1F2937] hover:border-[#38BDF8] text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition-all"
                  >
                    <span>{id}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Case Timeline & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#1F2937]">
              
              {/* Timeline */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Investigation Timeline
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeCase.timeline.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#121824] border border-[#1F2937] text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-mono text-cyan-400">{item.time}</span>
                        <span className="text-[10px]">{item.user}</span>
                      </div>
                      <div className="text-slate-200">{item.event}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Analyst Notes & Actions
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {activeCase.notes.map(n => (
                    <div key={n.id} className="p-2.5 rounded-lg bg-[#151E2C] border border-[#1F2937] text-[11px]">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-slate-200">{n.author}</span>
                        <span className="text-[10px] font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-300">{n.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add note input */}
                <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add case note (e.g. Section 102 notice served)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-[#121824] border border-[#1F2937] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-[#38BDF8] text-slate-950 font-bold hover:bg-[#0284C7] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};
