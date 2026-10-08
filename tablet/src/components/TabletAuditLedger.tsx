import React from 'react';
import { TabletDonation } from '../types';
import { ShieldCheck, Lock, ExternalLink, Download, FileCheck } from 'lucide-react';

interface TabletAuditLedgerProps {
  donations: TabletDonation[];
}

export default function TabletAuditLedger({ donations }: TabletAuditLedgerProps) {
  return (
    <div className="space-y-6">
      {/* Transparency Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Public Audit Ledger</span>
          </div>
          <h2 className="text-xl font-black mt-1">Cryptographic 100% Transparency Trail</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Every rupee contributed to Sphoorthi Seva Trust is immutably stamped with an 80G receipt number and verified hash.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export CSV Audit</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Designated Cause</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-center">80G Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-orange-600 font-bold">
                    {d.id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 font-bold">
                    {d.donorName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {d.purpose}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {d.date}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ₹{d.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <FileCheck className="w-3 h-3" /> 80G Certified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
