'use client';
import { useState, useEffect } from 'react';

export default function DashboardUCSS() {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState<'chat' | 'ubicacion' | 'servicios' | 'orientacion' | 'clima'>('chat');
  const [openTriptico, setOpenTriptico] = useState(true);
  const [openApis, setOpenApis] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Estados del Chatbot
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Hola, soy UCSSito, tu Asistente Virtual para el curso de Modelos y Simulación. Puedes hacerme consultas sobre el syllabus, actividades de las semanas 1 a 5 y trámites académicos.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Datos para "Servicios UCSS"
  const serviciosData = [
    { id: 'topico', icon: '🏥', title: 'Servicio de Tópico', desc: 'Atención primaria de salud, primeros auxilios y orientación médica para toda la comunidad universitaria.', email: 'servicio_medico@ucss.edu.pe', location: 'P1, Piso 1', hours: 'Lunes a Sábado: 7:00 am. a 10:30 pm.' },
    { id: 'psico', icon: '🧠', title: 'Servicio Psicopedagógico', desc: 'Orientación psicológica, desarrollo personal y apoyo académico integral.', email: 'psicopedagogico@ucss.edu.pe', location: 'P1, Piso 4', hours: 'Lunes a Viernes: 8:00 am. a 6:00 pm.' },
    { id: 'defensoria', icon: '⚖️', title: 'Defensoría Universitaria', desc: 'Tutela y protección de los derechos de los miembros de la comunidad universitaria.', email: 'defensoria@ucss.edu.pe', location: 'P1, Piso 4', hours: 'Lunes a Viernes: 8:00 am. a 5:00 pm.' },
    { id: 'lactario', icon: '👶', title: 'Lactario', desc: 'Espacio privado para la extracción y conservación de la leche materna.', email: 'bienestar@ucss.edu.pe', location: 'P1, Piso 1', hours: 'Lunes a Sábado: 8:00 am. a 8:00 pm.' },
    { id: 'tutoria', icon: '👨‍🏫', title: 'Tutoría Universitaria', desc: 'Acompañamiento personal y rendimiento académico continuo.', email: 'tutoria@ucss.edu.pe', location: 'P4, Piso 4', hours: 'Lunes a Viernes: 9:00 am. a 6:00 pm.' },
    { id: 'daaae', icon: '📋', title: 'Asuntos Académicos (DAAAE)', desc: 'Gestión de trámites académicos, registros y convalidaciones.', email: 'daaae@ucss.edu.pe', location: 'P4, Piso 1', hours: 'Lunes a Viernes: 8:00 am. a 7:00 pm.' },
    { id: 'becas', icon: '💳', title: 'Becas y Ayudas Económicas', desc: 'Información y trámites de apoyos económicos universitarios.', email: 'becas@ucss.edu.pe', location: 'P4, Piso 1', hours: 'Lunes a Viernes: 8:00 am. a 5:00 pm.' },
    { id: 'pastoral', icon: '✝️', title: 'Pastoral Universitaria', desc: 'Formación humana, espiritual y actividades de proyección social.', email: 'pastoral@ucss.edu.pe', location: 'P4 - Taller 304 (Misas en Capilla: P2, Piso 204)', hours: 'Lunes a Viernes' },
    { id: 'biblioteca', icon: '📚', title: 'Biblioteca "Andrés Aziani"', desc: 'Préstamo de libros físicas, salas de estudio y repositorio digital.', email: 'biblioteca@ucss.edu.pe', location: 'P4, Piso 1', hours: 'Lunes a Sábado: 7:30 am. a 9:00 pm.' },
  ];

  // Datos para "Orientación Personalizada"
  const facultadesData = [
    { title: 'Facultad de Ciencias de la Salud', location: 'P1, Piso 3', phone: '940 520 775' },
    { title: 'Facultad de Ingeniería', location: 'P1, Piso 4', phone: '986 747 531' },
    { title: 'Facultad de Ciencias Económicas y Comerciales', location: 'P1, Piso 4', phone: '989 569 270' },
    { title: 'Facultad de Derecho y Ciencias Políticas', location: 'P1, Piso 4', phone: '989 699 166' },
    { title: 'Facultad de Ciencias Agrarias y Ambientales', location: 'P2, Piso 5', phone: '987 513 071' },
    { title: 'Facultad de Ciencias de la Educación y Humanidades', location: 'P3, Piso 5', phone: '989 251 459' },
    { title: 'Dpto. de Estudios Generales', location: 'P4, Piso 4', phone: 'Atención Directa' },
  ];

  // Envío de preguntas al backend Gemini/Supabase
  const handleSend = async () => {
    if (!question.trim()) return;
    const userMsg = question;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || 'No pude obtener respuesta.' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Ocurrió un error al consultar el servidor.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* 🟢 BARRA LATERAL (SIDEBAR) DE IDÉNTICO DISEÑO */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-400">CHAT</span>
            <span className="text-2xl font-black text-white">UCSS</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Gestiona tus acciones y actividades</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* SECCIÓN PRINCIPAL */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">Principal</p>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              🤖 Chatbot UCSS
            </button>

            {/* TRÍPTICO UCSS DESPLEGABLE */}
            <div className="mt-2">
              <button
                onClick={() => setOpenTriptico(!openTriptico)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg font-medium"
              >
                <span className="flex items-center gap-3">📖 Tríptico UCSS</span>
                <span>{openTriptico ? '▲' : '▼'}</span>
              </button>

              {openTriptico && (
                <div className="ml-4 pl-3 border-l border-slate-700 mt-1 space-y-1">
                  <button
                    onClick={() => setActiveTab('ubicacion')}
                    className={`w-full text-left py-2 px-2 text-sm rounded-md ${
                      activeTab === 'ubicacion' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📍 Ubicación
                  </button>
                  <button
                    onClick={() => setActiveTab('servicios')}
                    className={`w-full text-left py-2 px-2 text-sm rounded-md ${
                      activeTab === 'servicios' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏥 Servicios
                  </button>
                  <button
                    onClick={() => setActiveTab('orientacion')}
                    className={`w-full text-left py-2 px-2 text-sm rounded-md ${
                      activeTab === 'orientacion' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎓 Orientación Personalizada
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MÓDULOS EXTERNOS */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">Módulos Externos</p>
            <button
              onClick={() => setOpenApis(!openApis)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg font-medium"
            >
              <span className="flex items-center gap-3">🌐 APIs Públicas</span>
              <span>{openApis ? '▲' : '▼'}</span>
            </button>

            {openApis && (
              <div className="ml-4 pl-3 border-l border-slate-700 mt-1 space-y-1">
                <button
                  onClick={() => setActiveTab('clima')}
                  className={`w-full text-left py-2 px-2 text-sm rounded-md ${
                    activeTab === 'clima' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌤️ Clima Meteorológico
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* 🔵 ÁREA PRINCIPAL CON HEADER SUPERIOR */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SUPERIOR */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            APP DEL CURSO DE MODELOS Y SIMULACIÓN
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-900 font-semibold">Universidad Católica Sedes Sapientiae</span>
            <span className="bg-blue-900 text-white font-bold text-xs px-2 py-1 rounded">UCSS</span>
          </div>
        </header>

        {/* CONTENIDO SEGÚN PESTAÑA SELECCIONADA */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {/* 1. CHATBOT */}
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-blue-900 text-white flex justify-between items-center">
                <span className="font-bold">Chatbot UCSS</span>
                <button
                  onClick={() =>
                    setMessages([
                      {
                        role: 'assistant',
                        content: 'Hola, soy UCSSito. Puedes hacerme tus consultas sobre el syllabus.',
                      },
                    ])
                  }
                  className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded text-white"
                >
                  🔄 Reiniciar
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-slate-800 rounded-bl-none border'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && <p className="text-sm text-gray-500 italic">UCSSito está pensando...</p>}
              </div>

              <div className="p-4 border-t flex gap-2 bg-white">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu consulta sobre el reglamento o syllabus..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* 2. UBICACIÓN UCSS */}
          {activeTab === 'ubicacion' && (
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                📍 Ubicación UCSS
              </h2>
              <div className="border rounded-lg overflow-hidden flex justify-center bg-gray-100 p-4">
                {/* Imagen del mapa oficial UCSS */}
                <img
                  src="https://www.ucss.edu.pe/images/mapa-poblado-ucss.jpg"
                  alt="Mapa Campus UCSS"
                  className="max-h-[600px] object-contain rounded"
                  onError={(e) => {
                    // Imagen fallback si no carga la URL directa
                    (e.target as HTMLImageElement).src =
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-M8v77bT6i1iO9M6uO9g8kS1k0X9_J517g&s';
                  }}
                />
              </div>
            </div>
          )}

          {/* 3. SERVICIOS UCSS */}
          {activeTab === 'servicios' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">🏥 Servicios UCSS</h2>
                <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-semibold">
                  Gonzales Prada • 9 Servicios
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviciosData.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className="bg-white border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
                        {s.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600">
                          {s.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">📍 {s.location}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 group-hover:translate-x-1 transition font-bold">›</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. ORIENTACIÓN PERSONALIZADA */}
          {activeTab === 'orientacion' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">🎓 Atención y Orientación Personalizada</h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                  Facultades UCSS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultadesData.map((f, idx) => (
                  <div key={idx} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        🏛️
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">{f.title}</h3>
                        <div className="flex gap-4 mt-1">
                          <p className="text-xs text-slate-500">📍 {f.location}</p>
                          <p className="text-xs text-blue-600 font-bold">📞 {f.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. API DE CLIMA */}
          {activeTab === 'clima' && (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-slate-800 mb-2">🌤️ API de Clima Meteorológico</h2>
              <p className="text-xs text-slate-500 mb-6">Consulta del tiempo en tiempo real por ciudad</p>

              <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-5xl font-black">22.3°C</span>
                    <h3 className="text-lg font-medium mt-2">Cielo Despejado</h3>
                    <p className="text-xs text-blue-200 mt-1">📍 Lima, PE</p>
                  </div>
                  <span className="text-6xl">☀️</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-blue-500/50 text-center">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                    <p className="text-xs text-blue-200">Sensación Térmica</p>
                    <p className="font-bold text-sm mt-1">22.6°C</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                    <p className="text-xs text-blue-200">Humedad</p>
                    <p className="font-bold text-sm mt-1">76%</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur">
                    <p className="text-xs text-blue-200">Viento</p>
                    <p className="font-bold text-sm mt-1">17.4 km/h</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 🪟 VENTANA EMERGENTE (MODAL) PARA DETALLE DE SERVICIOS */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Atención Médica / Servicio</p>
                <h3 className="font-bold text-base">{selectedService.title}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-white hover:bg-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <p className="text-slate-600 leading-relaxed">{selectedService.desc}</p>

              <div className="bg-slate-50 p-3 rounded-lg border space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Correo electrónico de contacto:</span>
                  <span className="font-semibold text-blue-600">{selectedService.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ubicación del campus:</span>
                  <span className="font-semibold text-slate-800">{selectedService.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Horario de Atención:</span>
                  <span className="font-semibold text-green-700">🟢 {selectedService.hours}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-800 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}