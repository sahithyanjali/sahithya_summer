import React from 'react';
import { SevaCertificate } from '../types';
import { Award, ShieldCheck, Download, Printer, QrCode, CheckCircle2 } from 'lucide-react';

interface VolunteerCertificateViewProps {
  certificate: SevaCertificate;
}

export default function VolunteerCertificateView({ certificate }: VolunteerCertificateViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Cryptographic Certificate of Seva</h2>
          <p className="text-xs text-slate-400">
            Digitally certified volunteer recognition valid for educational credit and corporate CSR portfolios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="bg-amber-50/95 text-slate-900 rounded-3xl p-8 sm:p-12 border-8 border-amber-500/30 shadow-2xl relative overflow-hidden">
        {/* Decorative corner flourishes */}
        <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-600" />
        <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-600" />
        <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-600" />
        <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-600" />

        {/* Certificate Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Award className="w-9 h-9" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-orange-700 block mt-2">
            Sphoorthi Seva Trust
          </span>
          <span className="text-[10px] text-slate-600 font-mono block">
            {certificate.trustRegNo} • Section 12A & 80G Certified
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight pt-2">
            Certificate of Exemplary Seva
          </h1>
          <p className="text-xs text-slate-600 italic">This is proudly and gratefully presented to</p>
        </div>

        {/* Recipient Name */}
        <div className="text-center my-6 py-2 border-b-2 border-amber-400/80 max-w-md mx-auto">
          <span className="text-2xl sm:text-3xl font-serif font-bold text-orange-900 tracking-wide">
            {certificate.recipientName}
          </span>
          <span className="block text-[11px] font-mono text-slate-500 mt-1 font-bold">
            Volunteer ID: {certificate.volunteerId}
          </span>
        </div>

        {/* Citation Body */}
        <div className="text-center max-w-xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
          <p>
            In profound appreciation for completing <strong className="text-slate-900 font-black">{certificate.serviceHours} Certified Hours</strong> of dedicated humanitarian service, demonstrating unwavering compassion, leadership, and selflessness in community relief operations.
          </p>

          <div className="bg-white/80 rounded-xl p-3 border border-amber-200/80 text-left text-xs space-y-1.5 shadow-2xs">
            <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider text-orange-800">
              Verified Major Contributions:
            </span>
            {certificate.initiatives.map((init, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{init}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Signatures & Hash */}
        <div className="mt-10 pt-6 border-t border-amber-300/80 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* QR Code Verification */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg border border-amber-300">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 block">Digital Verification Hash</span>
              <span className="text-[8px] font-mono text-slate-700 font-bold block break-all max-w-[140px]">
                {certificate.verifiedHash}
              </span>
            </div>
          </div>

          {/* Certificate Metadata */}
          <div className="text-center text-[10px] text-slate-600 space-y-0.5">
            <div>Serial No: <strong className="font-mono text-slate-800">{certificate.certificateId}</strong></div>
            <div>Date of Issue: <strong>{certificate.issuedOn}</strong></div>
            <div className="text-emerald-700 font-bold flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Immutably Verified
            </div>
          </div>

          {/* Signatory */}
          <div className="text-center sm:text-right">
            <div className="font-serif italic text-base text-slate-900 font-bold">
              Managing Trustee
            </div>
            <div className="text-[10px] text-slate-600 font-medium">
              {certificate.signatureAuthority}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
