'use client';
import { useState } from 'react';
import { services } from '@/app/config/services';
import { ServiceModal } from './ServiceModal';

export function Services() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🏥 Servicios UCSS
        </h2>
        <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full font-semibold">
          {services.length} servicios
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service)}
            className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl group-hover:bg-blue-100">
                {service.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">📍 {service.location}</p>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition">›</span>
            </div>
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
