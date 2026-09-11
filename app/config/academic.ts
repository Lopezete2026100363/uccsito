/**
 * CENTRO ACADÉMICO - MÓDULOS Y PREGUNTAS FRECUENTES
 * ====================================================
 * Organiza contenido académico y preguntas frecuentes conectadas con el RAG
 */

export interface AcademicModule {
  id: string;
  icon: string;
  title: string;
  description: string;
  suggestedQuestions: string[];
}

export interface FAQ {
  id: string;
  question: string;
  category: string;
  relatedModule?: string;
}

export const academicModules: AcademicModule[] = [
  {
    id: 'reglamento',
    icon: '📚',
    title: 'Reglamento de Estudios',
    description: 'Normas y disposiciones para el desempeño académico estudiantil.',
    suggestedQuestions: [
      '¿Cómo funciona la trica?',
      '¿Qué pasa si desapruebo una materia?',
      '¿Cómo funciona el retiro de curso?',
      '¿Qué son los exámenes rezagados?',
      '¿Cuántos créditos puedo llevar?',
    ],
  },
  {
    id: 'notas',
    icon: '📝',
    title: 'Notas y Evaluaciones',
    description: 'Consulta sobre calificaciones, promedios y evaluaciones.',
    suggestedQuestions: [
      '¿Cómo consulto mis notas?',
      '¿Cómo se calcula el promedio?',
      '¿Qué es la evaluación continua?',
      '¿Puedo revisar mi examen?',
    ],
  },
  {
    id: 'tramites',
    icon: '📄',
    title: 'Trámites Académicos',
    description: 'Procesos administrativos: matrículas, certificados, cambios de horario.',
    suggestedQuestions: [
      '¿Cómo me matriculo?',
      '¿Cómo solicito un certificado?',
      '¿Cómo cambio de horario?',
      '¿Qué requiero para convalidar cursos?',
    ],
  },
  {
    id: 'becas',
    icon: '🎓',
    title: 'Becas y Ayudas',
    description: 'Información sobre apoyo económico y becas disponibles.',
    suggestedQuestions: [
      '¿Cómo solicito una beca?',
      '¿Qué tipos de becas existen?',
      '¿Cuál es el monto de las becas?',
      '¿Cuáles son los requisitos?',
    ],
  },
  {
    id: 'faq',
    icon: '❓',
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a dudas comunes de estudiantes.',
    suggestedQuestions: [
      '¿Dónde está la biblioteca?',
      '¿Qué servicios ofrece la universidad?',
      '¿Cómo contacto a docentes?',
      '¿Dónde está cada facultad?',
    ],
  },
];

export const faqs: FAQ[] = [
  {
    id: 'faq_1',
    question: '¿Cómo funciona la trica?',
    category: 'Reglamento',
    relatedModule: 'reglamento',
  },
  {
    id: 'faq_2',
    question: '¿Qué pasa si desapruebo una materia?',
    category: 'Reglamento',
    relatedModule: 'reglamento',
  },
  {
    id: 'faq_3',
    question: '¿Cómo funciona el retiro de curso?',
    category: 'Trámites',
    relatedModule: 'tramites',
  },
  {
    id: 'faq_4',
    question: '¿Qué son los exámenes rezagados?',
    category: 'Evaluación',
    relatedModule: 'notas',
  },
  {
    id: 'faq_5',
    question: '¿Dónde está la biblioteca?',
    category: 'Infraestructura',
  },
  {
    id: 'faq_6',
    question: '¿Cómo contacto a un docente?',
    category: 'Contacto',
  },
  {
    id: 'faq_7',
    question: '¿Dónde está cada facultad?',
    category: 'Ubicación',
  },
  {
    id: 'faq_8',
    question: '¿Cómo solicito un certificado académico?',
    category: 'Trámites',
    relatedModule: 'tramites',
  },
];
