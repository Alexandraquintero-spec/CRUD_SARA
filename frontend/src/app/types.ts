export type UserRole = "aprendiz" | "instructor" | "admin" | null;
export type DocumentType = "CC" | "TI";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  ficha?: string;
  beneficiary?: boolean;
  documentType?: DocumentType;
  documentNumber?: string;
}
