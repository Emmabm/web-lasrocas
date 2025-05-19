// src/types/types.ts
export interface Position {
  x: number;
  y: number;
}

export interface Table {
  id: string;
  position: Position;
  isUsed: boolean;
  guests: string[];
  shape: 'circle' | 'square' | 'rectangle';
  isAssignable: boolean;
  width?: number;
  height?: number;
}