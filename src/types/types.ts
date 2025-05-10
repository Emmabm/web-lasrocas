export interface Table {
  id: string;
  position: {
    x: number;
    y: number;
  };
  isUsed: boolean;
  guests: string[];
  shape: 'circle' | 'square';
}