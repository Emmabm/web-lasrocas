export interface Position {
  x: number;
  y: number;
}

// Se elimina la interfaz `Guest` ya que no se usa con la nueva lógica.

export interface GuestGroup {
  id?: string; // Nuevo: para identificar cada grupo de forma única en el frontend
  name: string;
  numAdults: number;
  numChildren: number;
  numBabies: number;
  details: string;
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
  isMain?: boolean;
  numAdults?: number;
  numChildren?: number;
  numBabies?: number; // Nuevo: para almacenar el total de bebés
  descripcion?: string;
  tablecloth?: string;
  napkinColor?: string;
  centerpiece?: string;
  tableName?: string;
  guestGroups?: GuestGroup[]; // ¡Nuevo y crucial para la nueva lógica!
}