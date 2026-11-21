import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "./types";

export interface Transaction {
  id: string;
  type: "almuerzo" | "tienda";
  userId: string;
  userName: string;
  userRole: string;
  amount: number;
  date: string;
  time: string;
  details: string;
  status: "completado" | "pendiente" | "cancelado";
}

export interface RegisteredUser extends User {
  email?: string;
  registrationDate: string;
}

export interface VisitorEntry {
  id: string;
  name: string;
  documentType: "CC" | "TI";
  documentNumber: string;
  enteredAt: string;
}

interface GlobalDataContextType {
  registeredUsers: RegisteredUser[];
  transactions: Transaction[];
  addUser: (user: RegisteredUser) => void;
  addUsers: (users: RegisteredUser[]) => void;
  setBeneficiary: (userId: string, beneficiary: boolean) => void;
  visitors: VisitorEntry[];
  addVisitor: (visitor: VisitorEntry) => void;
  updateUserRole: (userId: string, newRole: "aprendiz" | "instructor" | "admin") => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  getTransactionsByType: (type: "almuerzo" | "tienda") => Transaction[];
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

// Usuarios de demo iniciales
const DEMO_USERS: RegisteredUser[] = [
  {
    id: "user-001",
    name: "Carlos Méndez",
    role: "aprendiz",
    ficha: "2845673",
    documentType: "CC",
    documentNumber: "1098765432",
    beneficiary: true,
    registrationDate: "2024-01-15",
    email: "carlos.mendez@example.com",
  },
  {
    id: "user-002",
    name: "María González",
    role: "aprendiz",
    ficha: "2845673",
    documentType: "TI",
    documentNumber: "1012345678",
    registrationDate: "2024-01-20",
    email: "maria.gonzalez@example.com",
  },
  {
    id: "user-003",
    name: "Ana Rodríguez",
    role: "aprendiz",
    ficha: "2845674",
    registrationDate: "2024-02-05",
    email: "ana.rodriguez@example.com",
  },
  {
    id: "user-004",
    name: "Juan Pérez",
    role: null,
    registrationDate: "2024-03-10",
    email: "juan.perez@example.com",
  },
  {
    id: "user-005",
    name: "Laura Martínez",
    role: null,
    registrationDate: "2024-03-15",
    email: "laura.martinez@example.com",
  },
  {
    id: "user-006",
    name: "Pedro Sánchez",
    role: null,
    registrationDate: "2024-04-01",
    email: "pedro.sanchez@example.com",
  },
];

// Transacciones de demo iniciales
const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "trx-001",
    type: "almuerzo",
    userId: "user-001",
    userName: "Carlos Méndez",
    userRole: "aprendiz",
    amount: 5000,
    date: "2024-04-20",
    time: "07:45",
    details: "Crema de ahuyama · Pollo al horno · Arroz con lentejas · Fruta",
    status: "completado",
  },
  {
    id: "trx-002",
    type: "almuerzo",
    userId: "user-002",
    userName: "María González",
    userRole: "aprendiz",
    amount: 5000,
    date: "2024-04-20",
    time: "08:12",
    details: "Crema de ahuyama · Pollo al horno · Arroz con lentejas · Fruta",
    status: "completado",
  },
  {
    id: "trx-003",
    type: "tienda",
    userId: "user-001",
    userName: "Carlos Méndez",
    userRole: "aprendiz",
    amount: 15000,
    date: "2024-04-19",
    time: "10:30",
    details: "Café 500g",
    status: "completado",
  },
  {
    id: "trx-004",
    type: "tienda",
    userId: "user-003",
    userName: "Ana Rodríguez",
    userRole: "aprendiz",
    amount: 3000,
    date: "2024-04-18",
    time: "14:15",
    details: "Lechuga 2kg",
    status: "completado",
  },
  {
    id: "trx-005",
    type: "almuerzo",
    userId: "user-003",
    userName: "Ana Rodríguez",
    userRole: "aprendiz",
    amount: 5000,
    date: "2024-04-19",
    time: "07:58",
    details: "Ajiaco · Carne asada · Plátano · Postre",
    status: "completado",
  },
];

export function GlobalDataProvider({ children }: { children: ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(DEMO_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);

  const addVisitor = (visitor: VisitorEntry) => setVisitors((prev) => [visitor, ...prev]);

  const setBeneficiary = (userId: string, beneficiary: boolean) => {
    setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, beneficiary } : u)));
  };

  const addUser = (user: RegisteredUser) => {
    setRegisteredUsers((prev) => [...prev, user]);
  };

  const addUsers = (users: RegisteredUser[]) => {
    setRegisteredUsers((prev) => {
      const existingEmails = new Set(prev.map((user) => user.email?.toLowerCase()).filter(Boolean));
      const uniqueUsers = users.filter(
        (user) => !user.email || !existingEmails.has(user.email.toLowerCase())
      );
      return [...prev, ...uniqueUsers];
    });
  };

  const updateUserRole = (
    userId: string,
    newRole: "aprendiz" | "instructor" | "admin"
  ) => {
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const getTransactionsByUser = (userId: string) => {
    return transactions.filter((t) => t.userId === userId);
  };

  const getTransactionsByType = (type: "almuerzo" | "tienda") => {
    return transactions.filter((t) => t.type === type);
  };

  return (
    <GlobalDataContext.Provider
      value={{
        registeredUsers,
        transactions,
        addUser,
        addUsers,
        setBeneficiary,
        visitors,
        addVisitor,
        updateUserRole,
        addTransaction,
        getTransactionsByUser,
        getTransactionsByType,
      }}
    >
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error("useGlobalData debe usarse dentro de GlobalDataProvider");
  }
  return context;
}
