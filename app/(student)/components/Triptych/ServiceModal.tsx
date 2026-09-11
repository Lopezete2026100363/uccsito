'use client';
import { Service } from '@/app/config/services';

interface ServiceModalProps {
  service: Service;
  onClose: () => void;
}

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    alert('Correo copiado: ' + email);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div>
            <div className="text-4xl mb-2">{service.icon}</div>
            <h3 className="font-bold text-lg">{service.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          <p className="text-gray-700 leading-relaxed">{service.description}</p>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {/* Email */}
            {service.email && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  📧 Email
                </p>
                <button
                  onClick={() => copyToClipboard(service.email!)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium break-all text-left block w-full"
                  title="Haz clic para copiar"
                >
                  {service.email}
                </button>
              </div>
            )}

            {/* Location */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                📍 Ubicación
              </p>
              <p className="text-gray-900 font-medium">{service.location}</p>
            </div>

            {/* Schedule */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                🕐 Horario
              </p>
              <p className="text-gray-900">{service.schedule}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
