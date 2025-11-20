export interface Collaborator {
  id: string;
  numericId?: number;
  colaborador: string;
  coletorPadrao: string;
  createdAt?: string;
}

export interface Collector {
  code: string;
}

export interface DeleteItem {
  type: 'collaborator' | 'collector';
  id: string;
}

declare global {
  interface Window {
    jspdf: any;
  }
}

export {};