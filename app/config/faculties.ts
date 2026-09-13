export interface Faculty {
  id: string;
  title: string;
  description: string;
  location: string;
  phone?: string;
  email?: string;
  specialties?: string[];
}

export const faculties: Faculty[] = [
  {
    id: 'ingenieria',
    title: 'Facultad de Ingeniería',
    description: 'Formación en carreras de ingeniería con enfoque tecnológico e innovador.',
    location: 'Pabellón 2, Piso 3',
    phone: '51987654321',
    email: 'ingenieria@ucss.edu.pe',
    specialties: ['Ing. de Sistemas', 'Ing. Civil', 'Ing. Industrial'],
  },
  {
    id: 'ciencias-empresariales',
    title: 'Facultad de Ciencias Empresariales',
    description: 'Programas orientados a la gestión, administración y negocios.',
    location: 'Pabellón 1, Piso 2',
    phone: '51987654322',
    email: 'empresariales@ucss.edu.pe',
    specialties: ['Administración', 'Contabilidad', 'Economía'],
  },
  {
    id: 'derecho',
    title: 'Facultad de Derecho y Ciencia Política',
    description: 'Formación jurídica con enfoque en ética y responsabilidad social.',
    location: 'Pabellón 3, Piso 1',
    phone: '51987654323',
    email: 'derecho@ucss.edu.pe',
    specialties: ['Derecho', 'Ciencia Política'],
  },
  {
    id: 'ciencias-salud',
    title: 'Facultad de Ciencias de la Salud',
    description: 'Carreras enfocadas en el cuidado y bienestar de las personas.',
    location: 'Pabellón 4, Piso 2',
    phone: '51987654324',
    email: 'salud@ucss.edu.pe',
    specialties: ['Enfermería', 'Nutrición', 'Psicología'],
  },
  {
    id: 'educacion',
    title: 'Facultad de Educación',
    description: 'Formación de docentes comprometidos con la comunidad educativa.',
    location: 'Pabellón 2, Piso 1',
    phone: '51987654325',
    email: 'educacion@ucss.edu.pe',
    specialties: ['Educación Inicial', 'Educación Primaria'],
  },
];
