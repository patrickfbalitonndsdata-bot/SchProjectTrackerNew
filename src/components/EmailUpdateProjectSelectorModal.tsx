import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckSquare,
  Square,
  Mail,
  FileText,
  Search,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface ExtractedProjectCandidate {
  id: string;
  projectNumber: string;
  study?: string;
  sourceFile?: string;
  sourceSnippet?: string;
  version?: string;
  jobType?: string;
  latestReceivedDate?: string;
  latestReceivedTime?: string;
}

interface EmailUpdateProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: ExtractedProjectCandidate[];
  onConfirmSelection: (selected: ExtractedProjectCandidate[]) => void;
  fileName?: string;
}

export const EmailUpdateProjectSelectorModal: React.FC<EmailUpdateProjectSelectorModalProps> = ({
  isOpen,
  onClose,
  candidates,
  onConfirmSelection,
  fileName,
}) => {
  const { season } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Deduplicate candidates by projectNumber (trim + lower)
  const uniqueCandidates = useMemo(() => {
    const seen = new Set<string>();
    const list: ExtractedProjectCandidate[] = [];
    for (const c of candidates) {
      const trimmed = (c.projectNumber || '').trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ ...c, projectNumber: trimmed });
      }
    }
    return list;
  }, [candidates]);

  // When modal opens or candidates change, select all by default so user can review and unselect
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(uniqueCandidates.map((c) => c.id)));
      setSearchQuery('');
    }
  }, [isOpen, uniqueCandidates]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return uniqueCandidates;
    return uniqueCandidates.filter(
      (c) =>
        c.projectNumber.toLowerCase().includes(q) ||
        (c.study && c.study.toLowerCase().includes(q)) ||
        (c.sourceFile && c.sourceFile.toLowerCase().includes(q))
    );
  }, [uniqueCandidates, searchQuery]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(uniqueCandidates.map((c) => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const selectedList = uniqueCandidates.filter((c) => selectedIds.has(c.id));
    onConfirmSelection(selectedList);
    onClose();
  };

  const selectedCount = selectedIds.size;
  const totalCount = uniqueCandidates.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-update-selector-title"
    >
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all animate-in zoom-in-95 duration-150 ${
          season === 'halloween'
            ? 'bg-[#120626] border-purple-500/40 text-white'
            : season === 'christmas' || season === 'christmas_eve'
            ? 'bg-[#06241a] border-emerald-500/40 text-white'
            : season === 'new_year'
            ? 'bg-[#091329] border-amber-400/40 text-white'
            : 'bg-white dark:bg-[#0B1736] border-slate-200 dark:border-[#1C3565] text-slate-900 dark:text-white'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-[#1C3565] flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-[#081229]/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="email-update-selector-title"
                  className="text-base font-bold text-slate-900 dark:text-white font-display"
                >
                  Select Project Numbers for Email Update
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-blue-50 dark:bg-amber-400/20 text-blue-700 dark:text-amber-300 border border-blue-200 dark:border-amber-400/40">
                  Email Update Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Extracted from{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {fileName || 'Outlook File'}
                </strong>
                . Select the Project Numbers to add to the form; unselected ones will be disregarded.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#102046] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="px-4 sm:px-5 py-2.5 bg-blue-50/80 dark:bg-[#102046]/60 border-b border-blue-100 dark:border-[#1C3565] flex items-center gap-2 text-xs text-blue-900 dark:text-amber-200">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-amber-400 shrink-0" />
          <span className="leading-snug text-[11px] sm:text-xs">
            For each selected Project Number, the latest record from Google Sheets (Study Type, Version, and Received Date/Time) will be fetched automatically.
          </span>
        </div>

        {/* Controls Bar: Search & Select All / Deselect All */}
        <div className="p-3 sm:px-5 border-b border-slate-200/70 dark:border-[#1C3565] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/30 dark:bg-[#081229]/30">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter project numbers..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0B1736] border border-slate-200 dark:border-[#1C3565] rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
              <strong className="text-blue-600 dark:text-amber-400">{selectedCount}</strong> / {totalCount} selected
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-[#1C3565]" />
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-amber-300 hover:bg-blue-50 dark:hover:bg-[#102046] rounded-md transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#102046] rounded-md transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Projects Candidates List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2 min-h-[160px] max-h-[380px]">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              {uniqueCandidates.length === 0 ? (
                <>No project numbers detected in this file.</>
              ) : (
                <>No project numbers match &quot;{searchQuery}&quot;.</>
              )}
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const isSelected = selectedIds.has(candidate.id);
              return (
                <div
                  key={candidate.id}
                  onClick={() => handleToggle(candidate.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-[#102046]/80 border-blue-400 dark:border-amber-400/70 shadow-xs'
                      : 'bg-white dark:bg-[#0B1736] border-slate-200 dark:border-[#1C3565] hover:border-slate-300 dark:hover:border-slate-600 opacity-65 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-blue-600 dark:text-amber-400 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                          {candidate.projectNumber}
                        </span>
                        {candidate.study && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-slate-100 dark:bg-[#081229] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1C3565]">
                            Study: {candidate.study}
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40">
                            Will Add
                          </span>
                        )}
                        {!isSelected && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Disregarded
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          Source: {candidate.sourceFile || 'Outlook File'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[11px] font-semibold ${
                        isSelected
                          ? 'text-blue-700 dark:text-amber-300'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Disregard'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:px-5 border-t border-slate-200 dark:border-[#1C3565] flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#081229]/70">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#102046] transition-colors cursor-pointer"
          >
            Cancel / Disregard All
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              season === 'halloween'
                ? 'bg-orange-600 hover:bg-orange-500 text-slate-950 font-extrabold shadow-orange-500/30'
                : season === 'christmas' || season === 'christmas_eve'
                ? 'bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-red-500/30'
                : season === 'new_year'
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold shadow-amber-500/30'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-extrabold shadow-blue-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              Add {selectedCount} {selectedCount === 1 ? 'Project' : 'Projects'} to Form
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
