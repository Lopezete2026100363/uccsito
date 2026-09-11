/**
 * DATOS OFICIALES DE SERVICIOS UCSS
 * ===================================
 * Basados en los datos institucionales proporcionados
 * Se pueden actualizar fácilmente desde aquí
 */

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  email?: string;
  location: string;
  schedule: string;
}

export const services: Service[] = [
  {
    id: 'topico',
    icon: '🏥',
    title: 'Tópico',
    description: 'Atención primaria de salud, primeros auxilios y orientación médica para la comunidad universitaria.',
    email: 'servicio_medico@ucss.edu.pe',
    location: 'P1, Piso 1',
    schedule: 'Lunes a sábado, 7:00 a.m. a 10:30 p.m.',
  },
  {
    id: 'defensoria',
    icon: '⚖️',
    title: 'Defensoría',
    description: 'Tutela y protección de los derechos de los miembros de la comunidad universitaria.',
    email: 'defensoriauniversitaria@ucss.edu.pe',
    location: 'P1, Piso 4',
    schedule: 'Martes y jueves, 10:00 a 11:45',
  },
  {
    id: 'psicopedagogico',
    icon: '🧠',
    title: 'Psicopedagógico',
    description: 'Orientación psicológica, desarrollo personal y apoyo académico integral.',
    email: 'consultapsicologia_lima@ucss.edu.pe',
    location: 'P1, Piso 4',
    schedule: 'Lunes a miércoles 8:00 a.m. a 5:00 p.m.; jueves y viernes 8:00 a.m. a 1:00 p.m. virtual; sábado 8:00 a.m. a 1:00 p.m. virtual',
  },
  {
    id: 'lactario',
    icon: '👶',
    title: 'Lactario',
    description: 'Espacio privado para la extracción y conservación de la leche materna.',
    email: 'bienestaruniversitario@ucss.edu.pe',
    location: 'P1, Piso 1',
    schedule: 'Consulte horario institucional',
  },
  {
    id: 'tutoria',
    icon: '👨‍🏫',
    title: 'Tutoría',
    description: 'Acompañamiento personal y apoyo en el rendimiento académico continuo.',
    email: 'tutoria_generales@ucss.edu.pe',
    location: 'P4, Piso 4',
    schedule: 'Consulte horario institucional',
  },
  {
    id: 'daaae',
    icon: '📋',
    title: 'DAAAE',
    description: 'Asuntos académicos: matrícula, certificados, rectificaciones y consultas estudiantiles.',
    email: '',
    location: 'P4, Piso 1',
    schedule: 'Lunes a viernes 8:30 a.m. a 8:00 p.m.; sábado 8:30 a.m. a 12:30 p.m.',
  },
  {
    id: 'becas',
    icon: '🎓',
    title: 'Becas y Ayudas',
    description: 'Información y gestión de apoyos económicos y ayudas universitarias.',
    email: 'obae@ucss.edu.pe',
    location: 'P4, Piso 1',
    schedule: 'Lunes a viernes 8:30 a.m. a 6:30 p.m.; sábado 8:30 a.m. a 1:30 p.m.',
  },
  {
    id: 'pastoral',
    icon: '✝️',
    title: 'Pastoral',
    description: 'Formación humana, espiritual y actividades de proyección social.',
    email: 'pastoral@ucss.edu.pe',
    location: 'P4, Taller 304 (Misas en Capilla: P2, Piso 204)',
    schedule: 'Oficina: lunes a viernes 8:30 a.m. a 5:30 p.m. | Misas: lunes a jueves 8:00 a.m.; viernes 5:30 p.m.',
  },
  {
    id: 'biblioteca',
    icon: '📚',
    title: 'Biblioteca Andrés Aziani',
    description: 'Préstamo de libros físicos, salas de estudio, cubículos grupales y repositorio digital.',
    email: '',
    location: 'P4, Piso 1',
    schedule: 'Lunes a viernes 9:00 a.m. a 9:00 p.m.; sábado 9:00 a.m. a 1:00 p.m.',
  },
];
