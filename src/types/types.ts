// src/types/types.ts
export interface Position {
  x: number;
  y: number;
}

export type Table = {
  id: string;
  position: { x: number; y: number };
  shape: 'circle' | 'square' | 'rectangle';
  width: number;
  height: number;
  isAssignable: boolean;
  guests: string[];
  isUsed: boolean;
  tableclothColor?: string;
  centerpiece?: string;
};