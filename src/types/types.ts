export interface Position {
  x: number;
  y: number;
}

export interface Guest {
  id: string;
  name: string;
  tableId?: string;
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
  guests: string[];
  isUsed: boolean;
  isMain?: boolean; // Agregado
  numAdults?: number;
  numChildren?: number;
  descripcion?: string;
  tablecloth?: string;
  napkinColor?: string;
  centerpiece?: string;
  tableName?: string; // Mantenido opcional
}