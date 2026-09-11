'use client';
import { faculties } from '@/app/config/faculties';

export function Orientation() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🎓 Orientación Personalizada
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-full font-semibold">
          {faculties.length} facultades
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculties.map((faculty) => (
          <div
            key={faculty.id}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-lg group-hover:bg-blue-700">
                🏛️
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">{faculty.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{faculty.description}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span>📍</span>
                    <span className="font-semibold">{faculty.location}</span>
                  </div>
                  {faculty.phone && (
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <span>📞</span>
                      <a
                        href={`https://wa.me/${faculty.phone.replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {faculty.phone}
                      </a>
                    </div>
                  )}
                  {faculty.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span>📧</span>
                      <a
                        href={`mailto:${faculty.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {faculty.email}
                      </a>
                    </div>
                  )}
                </div>

                {faculty.specialties && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Programas:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {faculty.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
