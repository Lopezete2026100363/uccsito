'use client';
import { useState, useEffect } from 'react';
import { Service } from '@/app/config/services';

interface ServiceModalProps {
  service: Service;
  onClose: () => void;
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
  };

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(onClose, 550);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start">
          <div>
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-3">
              {service.icon}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{service.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 text-sm">
          <p className="text-gray-600 leading-relaxed">{service.description}</p>

          <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl">
            {service.email && (
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <button
                  onClick={() => copyToClipboard(service.email!)}
                  className="relative text-blue-600 hover:text-blue-700 text-sm font-medium break-all text-left block w-full"
                  title="Haz clic para copiar"
                >
                  {copied ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 animate-in fade-in slide-in-from-left-1 duration-150">
                      <CheckIcon className="w-4 h-4" />
                      Copiado
                    </span>
                  ) : (
                    service.email
                  )}
                </button>
              </div>
            )}

            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Ubicación</p>
              <p className="text-gray-800 font-medium">{service.location}</p>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Horario</p>
              <p className="text-gray-800">{service.schedule}</p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              confirmed
                ? 'bg-emerald-500 text-white scale-[0.97]'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.97]'
            }`}
          >
            {confirmed ? (
              <>
                <CheckIcon className="w-4 h-4 animate-in zoom-in duration-200" />
                ¡Listo!
              </>
            ) : (
              'Entendido'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}