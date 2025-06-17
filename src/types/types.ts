// src/types/types.ts
export interface Position {
  x: number;
  y: number;
}

export interface Guest {
  id: string;
  name: string;
  tableId?: string;
  // otros campos relevantes
}

export interface TableclothOption {
  id: string;
  name: string;
  mainColor: string;
  secondaryColor?: string;
  napkins: {
    availableColors: string[];
    defaultColor: string;
  };
  image: string;
  isTwoTone?: boolean;
}

export interface Table {
  id: string;
  position: Position;
  shape: 'circle' | 'square' | 'rectangle';
  width: number;
  height: number;
  isAssignable: boolean;
  guests: string[]; // IDs de los invitados
  isUsed: boolean;
  tablecloth?: string;
  napkinColor?: string;
  centerpiece?: string;
  tableName?: string;
  numAdults?: number;
  numChildren?: number;
  details?: string;
}