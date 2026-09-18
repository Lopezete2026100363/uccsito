'use client';
import { faculties } from '@/app/config/faculties';

export function Orientation() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Orientación Personalizada</h2>
        <span className="text-xs text-gray-400 font-medium">{faculties.length} facultades</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faculties.map((faculty) => (
          <div
            key={faculty.id}
            className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <BuildingIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{faculty.title}</h3>
                <p className="text-xs text-gray-400 truncate">{faculty.location}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-3">{faculty.description}</p>

            {faculty.specialties && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {faculty.specialties.map((spec) => (
                  <span key={spec} className="text-[11px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                    {spec}
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {faculty.phone && (
                <ContactPill
                  href={`https://wa.me/${faculty.phone.replace(/\s/g, '')}`}
                  icon={<WhatsAppIcon className="w-3.5 h-3.5" />}
                  label="WhatsApp"
                />
              )}
              {faculty.email && (
                <ContactPill
                  href={`mailto:${faculty.email}`}
                  icon={<MailIcon className="w-3.5 h-3.5" />}
                  label="Correo"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPill({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-full py-2 active:scale-95 transition-all duration-150"
    >
      {icon}
      {label}
    </a>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" />
      <path d="M14 21V11a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10" />
      <path d="M2 21h20" />
      <path d="M7 8h1M7 12h1M7 16h1" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-1.5-.7-2.5-1.3-3.5-3-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3Z" />
      <path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.9-1.3A10 10 0 1 0 12 2Z" />
    </svg>
  );
}
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}