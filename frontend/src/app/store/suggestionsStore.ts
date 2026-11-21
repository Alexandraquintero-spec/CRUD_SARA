// Almacén simple de sugerencias compartido entre vistas de usuario y admin
// En producción esto sería una base de datos / API

export interface Suggestion {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "aprendiz" | "instructor";
  category: "menu" | "servicio" | "instalaciones" | "horario" | "otro";
  title: string;
  description: string;
  date: string;
  status: "nueva" | "revisada" | "implementada";
  adminResponse?: string;
}

// Datos demo que arrancan en el store
const store: Suggestion[] = [
  {
    id: "sug-001",
    authorId: "2891234",
    authorName: "Aprendiz - Ficha 2891234",
    authorRole: "aprendiz",
    category: "menu",
    title: "Opciones vegetarianas",
    description: "Sería genial tener al menos una opción vegetariana por día en el menú.",
    date: "2024-04-16",
    status: "revisada",
    adminResponse: "¡Gracias! Lo tendremos en cuenta para el próximo mes.",
  },
  {
    id: "sug-002",
    authorId: "inst-01",
    authorName: "Instructor Gastronomía",
    authorRole: "instructor",
    category: "horario",
    title: "Ampliar horario de reservas",
    description: "Muchos instructores tenemos clases a las 7 AM. Sería ideal ampliar hasta las 10 AM.",
    date: "2024-04-17",
    status: "nueva",
  },
  {
    id: "sug-003",
    authorId: "2891250",
    authorName: "Aprendiz - Ficha 2891250",
    authorRole: "aprendiz",
    category: "servicio",
    title: "Música ambiental",
    description: "El restaurante se sentiría más agradable con música suave de fondo.",
    date: "2024-04-18",
    status: "implementada",
    adminResponse: "¡Excelente idea! Ya tenemos una playlist activa los viernes.",
  },
];

export const suggestionsStore = {
  getAll: () => [...store],
  add: (s: Suggestion) => store.unshift(s),
  updateStatus: (id: string, status: Suggestion["status"], adminResponse?: string) => {
    const idx = store.findIndex((s) => s.id === id);
    if (idx !== -1) {
      store[idx] = { ...store[idx], status, adminResponse: adminResponse ?? store[idx].adminResponse };
    }
  },
  getByAuthor: (authorId: string) => store.filter((s) => s.authorId === authorId),
};
