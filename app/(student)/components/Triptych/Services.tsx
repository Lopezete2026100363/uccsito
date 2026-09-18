'use client';
import { useState } from 'react';
import { services } from '@/app/config/services';
import { ServiceModal } from './ServiceModal';

export function Services() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Servicios UCSS</h2>
        <span className="text-xs text-gray-400 font-medium">
          {services.length} servicios
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-left hover:bg-blue-50/60 hover:border-blue-200 active:scale-[0.98] transition-all duration-150"
          >
            <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-lg">
              {service.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{service.title}</p>
              <p className="text-xs text-gray-400 truncate">{service.location}</p>
            </div>
            <ChevronIcon className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        ))}
      </div>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}