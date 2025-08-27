import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Table } from '../types/types';

const ORIGIN_X = 150;
const ORIGIN_Y = 120;
const COL_SPACING = 100;
const ROW_SPACING = 90;
const CIRCLE_SIZE = 60;
const RECT_WIDTH = 130;
const RECT_HEIGHT = 60;

const initialTables: Table[] = [
  { id: 'ESCENARIO', position: { x: 355, y: 40 }, shape: 'rectangle', width: 300, height: 60, isAssignable: false, guests: [], isUsed: false, isMain: false },
  { id: 'DJ', position: { x: 90, y: 480 }, shape: 'square', width: 110, height: 110, isAssignable: false, guests: [], isUsed: false, isMain: false },
  { id: 'OFICINA', position: { x: 660, y: 480 }, shape: 'rectangle', width: 240, height: 110, isAssignable: false, guests: [], isUsed: false, isMain: false },
  { id: 'PASARELA', position: { x: 320, y: 510 }, shape: 'rectangle', width: 500, height: 15, isAssignable: false, guests: [], isUsed: false, isMain: false },
  ...[
    [0, 1], [0, 0], [1, 0], [0.9, 1], [0, 2], [0.7, 3], [1.2, 3.8], [2.3, 3.8],
    [1.8, 2.5], [2, 1.2], [2.1, 0], [3.2, 0.2], [3, 1], [3.3, 2], [3, 2.8], [3.5, 3.8],
    [4.7, 3], [4.7, 2], [4.7, 1], [4.7, 0], [5.6, 0], [5.6, 1], [5.6, 2], [5.6, 3]
  ].map(([x, y], i): Table => ({
    id: i === 10 ? 'Principal' : `M${i + 1 - (i >= 11 ? 1 : 0)}`,
    position: { x: x * COL_SPACING + ORIGIN_X, y: y * ROW_SPACING + ORIGIN_Y },
    shape: i === 10 ? 'rectangle' : 'circle',
    width: i === 10 ? RECT_WIDTH : CIRCLE_SIZE,
    height: i === 10 ? RECT_HEIGHT : CIRCLE_SIZE,
    isAssignable: true,
    guests: [],
    isUsed: false,
    isMain: i === 10,
    tableName: i === 10 ? 'Principal' : undefined,
  })),
];
export const tableclothOptions = [
  {
    id: 'white',
    name: 'Blanco',
    mainColor: '#FFFFFF',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'white'
    },
    image: '/img/mesas/blanco.webp'
  },
  {
    id: 'grey',
    name: 'Peltre',
    mainColor: '#808080',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'white'
    },
    image: '/img/mesas/peltre.webp'
  },
  {
    id: 'black',
    name: 'Negro',
    mainColor: '#000000',
    napkins: {
      availableColors: ['white', 'black'],
      defaultColor: 'black'
    },
    image: '/img/mesas/negro.webp'
  },
  {
    id: 'two-tone',
    name: 'Blanco y Negro',
    mainColor: '#FFFFFF',
    secondaryColor: '#000000',
    napkins: {
      availableColors: ['white-black'],
      defaultColor: 'white-black'
    },
    image: '/img/mesas/mixto.webp',
    isTwoTone: true
  }
];

export const centerpieceOptions = [
  { id: 'none', name: 'Ninguno' },
  { id: 'candles', name: 'Centro de mesa del salón' },
  { id: 'modern', name: 'Centro proporcionado por el cliente' }
];

export const useTablePlanner = (eventoId: string) => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selected, setSelected] = useState<Table | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [globalDecoration, setGlobalDecoration] = useState({
    tablecloth: 'white',
    napkinColor: 'white',
    centerpiece: 'none',
  });
  const [saved, setSaved] = useState(false);

  const loadTables = useCallback(async () => {
    if (!eventoId) return;
    const { data, error } = await supabase.from('mesas').select('*').eq('evento_id', eventoId);
    if (error) {
      console.error('Error al cargar mesas:', error.message);
      return;
    }
    setTables(prev => prev.map(t => {
      const dbTable = data.find(dt => dt.table_id === t.id);
      if (!dbTable) return t;
      return {
        ...t,
        guests: dbTable.num_adults || dbTable.num_children || dbTable.descripcion
          ? [
            ...(dbTable.num_adults ? [`• ${dbTable.num_adults} adulto${dbTable.num_adults !== 1 ? 's' : ''}`] : []),
            ...(dbTable.num_children ? [`• ${dbTable.num_children} niño${dbTable.num_children !== 1 ? 's' : ''}`] : []),
            ...(dbTable.descripcion ? [`• Detalles: ${dbTable.descripcion}`] : [])
          ]
          : [],
        numAdults: dbTable.num_adults || 0,
        numChildren: dbTable.num_children || 0,
        descripcion: dbTable.descripcion || undefined,
        tableName: dbTable.table_name || (t.isMain ? 'Principal' : undefined),
        isUsed: dbTable.is_used || false,
      };
    }));
  }, [eventoId]);

  const selectTable = useCallback((id: string) => {
    const t = tables.find(tb => tb.id === id && tb.isAssignable);
    if (!t) return;
    setSelected(t);
    setShowModal(true);
  }, [tables]);

  const updateMesaCompleta = useCallback((
    tableId: string,
    guests: string[],
    descripcion: string,
    numAdults: number,
    numChildren: number,
    tableName?: string
  ) => {
    const total = numAdults + numChildren;
    const isValid = total >= 8 && total <= 11;

    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
            ...t,
            guests: [...guests],
            descripcion: descripcion.trim(),
            numAdults,
            numChildren,
            tableName: tableName?.trim() || (t.isMain ? 'Principal' : t.tableName),
            isUsed: isValid
          }
          : t
      )
    );

    setShowModal(false);
    setSelected(null);
  }, []);


  const updateGlobalDecoration = useCallback((tablecloth: string, napkinColor: string, centerpiece: string) => {
    setGlobalDecoration({ tablecloth, napkinColor, centerpiece });
    setTables(prev =>
      prev.map(t =>
        t.isAssignable
          ? { ...t, tablecloth, napkinColor, centerpiece }
          : t
      )
    );
  }, []);

  const guardarDistribucion = useCallback(async () => {
    if (!eventoId) {
      console.error('No hay evento_id para guardar mesas.');
      return;
    }

    const { error, data } = await supabase.from('mesas').insert(
      tables.map(t => ({
        evento_id: eventoId,
        table_id: t.id,
        table_name: t.tableName,
        num_adults: t.numAdults,
        num_children: t.numChildren,
        descripcion: t.descripcion,
        is_main: t.isMain,
        is_used: t.isUsed
      }))
    );

    if (error) console.error('Error guardando mesas:', error);
    else console.log('Mesas guardadas:', data);
  }, [tables, eventoId]);

  const guardarDecoracion = useCallback(async () => {
    if (!eventoId) {
      console.error('No hay evento_id para guardar decoración.');
      return;
    }

    const { error, data } = await supabase.from('decoracion_evento').insert([
      {
        evento_id: eventoId,
        tablecloth: globalDecoration.tablecloth,
        napkin_color: globalDecoration.napkinColor,
        centerpiece: globalDecoration.centerpiece
      }
    ]);

    if (error) console.error('Error guardando decoración:', error);
    else console.log('Decoración guardada:', data);
  }, [globalDecoration, eventoId]);

  const nextStep = useCallback(() => setCurrentStep(p => p + 1), []);
  const prevStep = useCallback(() => setCurrentStep(p => Math.max(p - 1, 1)), []);

  const warnings = useMemo(() =>
    tables.filter(t => t.isAssignable && t.isUsed && ((t.numAdults ?? 0) + (t.numChildren ?? 0)) < 8),
    [tables]
  );

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return {
    tables,
    selected,
    showModal,
    currentStep,
    globalDecoration,
    saved,
    warnings,
    selectTable,
    updateMesaCompleta,
    updateGlobalDecoration,
    guardarDistribucion,
    guardarDecoracion,
    nextStep,
    prevStep,
    setShowModal,
    setSelected,
    setSaved,
  };
};