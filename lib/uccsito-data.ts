export type Service = {
  id: string;
  name: string;
  description: string;
  location: string;
  email?: string;
  hours?: string;
  extra?: string;
};

export type Faculty = {
  id: string;
  name: string;
  description: string;
  location: string;
  phone?: string;
  email: string;
};

export const services: Service[] = [
  { id: "topico", name: "Tópico", description: "Atención primaria, primeros auxilios y orientación médica.", location: "P1 Piso 1", email: "servicio_medico@ucss.edu.pe", hours: "Lunes a sábado, 7:00 a. m. a 10:30 p. m." },
  { id: "defensoria", name: "Defensoría", description: "Protección de los derechos de la comunidad universitaria.", location: "P1 Piso 4", email: "defensoriauniversitaria@ucss.edu.pe", hours: "Martes y jueves, 10:00 a 11:45." },
  { id: "psicopedagogico", name: "Psicopedagógico", description: "Orientación psicológica, desarrollo personal y apoyo académico.", location: "P1 Piso 4", email: "consultapsicologia_lima@ucss.edu.pe", hours: "Lunes a miércoles, 8:00 a. m. a 5:00 p. m.; jueves y viernes, 8:00 a. m. a 1:00 p. m. virtual; sábado, 8:00 a. m. a 1:00 p. m. virtual." },
  { id: "lactario", name: "Lactario", description: "Espacio privado para extracción y conservación de leche materna.", location: "P1 Piso 1", email: "bienestaruniversitario@ucss.edu.pe", hours: "Consulta el horario institucional con el área correspondiente." },
  { id: "tutoria", name: "Tutoría", description: "Acompañamiento personal y apoyo al rendimiento académico.", location: "P4 Piso 4", email: "tutoria_generales@ucss.edu.pe", hours: "Horario pendiente de confirmación institucional." },
  { id: "daaae", name: "DAAAE", description: "Procedimientos académicos, matrícula, certificados, rectificaciones y consultas estudiantiles.", location: "P4 Piso 1", hours: "Lunes a viernes, 8:30 a. m. a 8:00 p. m.; sábado, 8:30 a. m. a 12:30 p. m." },
  { id: "becas", name: "Becas y Ayudas", description: "Información y orientación sobre apoyos económicos universitarios.", location: "P4 Piso 1", email: "obae@ucss.edu.pe", hours: "Lunes a viernes, 8:30 a. m. a 6:30 p. m.; sábado, 8:30 a. m. a 1:30 p. m." },
  { id: "pastoral", name: "Pastoral", description: "Formación humana, espiritual y actividades para la comunidad.", location: "P4 Taller 304", email: "pastoral@ucss.edu.pe", hours: "Oficina: lunes a viernes, 8:30 a. m. a 5:30 p. m.", extra: "Misas: Capilla P2 Piso 204, lunes a jueves 8:00 a. m.; viernes 5:30 p. m." },
  { id: "biblioteca", name: "Biblioteca Andrés Aziani", description: "Lectura, cubículos grupales, libros físicos y repositorios.", location: "P4 Piso 1", hours: "Lunes a viernes, 9:00 a. m. a 9:00 p. m.; sábado, 9:00 a. m. a 1:00 p. m." },
];

export const faculties: Faculty[] = [
  { id: "salud", name: "Ciencias de la Salud", description: "Enfermería, Nutrición y Psicología.", location: "P1 Piso 3", phone: "940 520 775", email: "tramitesalud@ucss.edu.pe" },
  { id: "ingenieria", name: "Ingeniería", description: "Ingeniería Informática, Industrial, Civil y Ambiental.", location: "P1 Piso 4", phone: "986 747 531", email: "tramitesfi@ucss.edu.pe" },
  { id: "economicas", name: "Ciencias Económicas y Comerciales", description: "Administración, Contabilidad, Economía y áreas empresariales.", location: "P1 Piso 4", phone: "989 569 270", email: "secretaria_fcec@ucss.edu.pe" },
  { id: "derecho", name: "Derecho y Ciencias Políticas", description: "Orientación para estudiantes de Derecho y Ciencias Políticas.", location: "P1 Piso 4", phone: "989 699 166", email: "facdecp@ucss.edu.pe" },
  { id: "agrarias", name: "Ciencias Agrarias y Ambientales", description: "Atención académica de la facultad.", location: "P2 Piso 5", phone: "987 513 071", email: "secretaria_fcaa@ucss.edu.pe" },
  { id: "educacion", name: "Ciencias de la Educación y Humanidades", description: "Atención académica de la facultad.", location: "P3 Piso 5", phone: "989 251 459", email: "secretaria_fcced@ucss.edu.pe" },
  { id: "generales", name: "Departamento de Estudios Generales", description: "Orientación para cursos y procesos de Estudios Generales.", location: "P4 Piso 4", email: "estudiosgenerales@ucss.edu.pe" },
];

export const suggestedQuestions = [
  "¿Cómo funciona el retiro de un curso?",
  "¿Qué pasa si desapruebo una materia?",
  "¿Cómo puedo consultar sobre una beca?",
  "¿Dónde está la biblioteca?",
  "¿Dónde se encuentra Ingeniería?",
  "¿Qué son los exámenes rezagados?",
];

export const academicModules = [
  { id: "reglamento", name: "Reglamento de Estudios", description: "Normas, retiro de cursos, créditos y evaluaciones.", questions: ["¿Qué es la trica?", "¿Qué pasa si desapruebo un curso?", "¿Cómo funciona el retiro de curso?", "¿Qué son los exámenes rezagados?", "¿Cuántos créditos puedo llevar?"] },
  { id: "notas", name: "Notas y Evaluaciones", description: "Consulta criterios y procesos respaldados por los documentos disponibles.", questions: ["¿Cómo se calculan las evaluaciones?", "¿Qué son los exámenes rezagados?", "¿Cómo solicito una revisión de nota?"] },
  { id: "tramites", name: "Trámites Académicos", description: "Encuentra orientación sobre solicitudes y procedimientos.", questions: ["¿Cómo inicio un trámite académico?", "¿Cómo solicito un certificado?", "¿Dónde consulto sobre matrícula?"] },
  { id: "becas", name: "Becas y Ayudas", description: "Accede a orientación institucional sin inventar requisitos ni fechas.", questions: ["¿Qué información hay sobre becas?", "¿Dónde se encuentra Becas y Ayudas?", "¿Con qué oficina debo consultar una beca?"] },
  { id: "faq", name: "Preguntas Frecuentes", description: "Respuestas mediante UCCSito y sus fuentes documentales.", questions: ["¿Dónde está la biblioteca?", "¿Dónde se encuentra Ingeniería?", "¿Qué trámites atiende DAAAE?"] },
];
