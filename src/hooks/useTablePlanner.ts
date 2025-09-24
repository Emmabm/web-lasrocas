import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Table, GuestGroup } from '../types/types';

const MIN_GUESTS = 8;
const MAX_GUESTS = 11;
const MIN_GUESTS_MAIN = 2;
const MAX_GUESTS_MAIN = 15;

const ORIGIN_X = 150;
const ORIGIN_Y = 120;
const COL_SPACING = 100;
const ROW_SPACING = 90;
const CIRCLE_SIZE = 60;
const RECT_WIDTH = 130;
const RECT_HEIGHT = 60;

const initialTables: Table[] = [
  { id: 'ESCENARIO', position: { x: 365, y: 40 }, shape: 'rectangle', width: 190, height: 60, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: undefined, guests: [] },
  { id: 'DJ', position: { x: 90, y: 480 }, shape: 'square', width: 110, height: 110, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: undefined, guests: [] },
  { id: 'OFICINA', position: { x: 660, y: 480 }, shape: 'rectangle', width: 240, height: 110, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: undefined, guests: [] },
  { id: 'PASARELA', position: { x: 320, y: 510 }, shape: 'rectangle', width: 500, height: 15, isAssignable: false, isMain: false, isUsed: false, numAdults: 0, numChildren: 0, numBabies: 0, descripcion: undefined, guestGroups: [], tableName: undefined, guests: [] },
  ...[
    [-1, 1], [-1, 0], [0.2, 0], [0.2, 1], [0, 2], [0.7, 3], [1.2, 3.8], [2.3, 3.8],
    [1.8, 2.5], [1.5, 1.1], [2.2, 0], [3, 1], [3.3, 2], [3, 2.8], [3.5, 3.8],
    [4.7, 3], [4.7, 2], [4.7, 1], [4.7, 0], [5.6, 0], [5.6, 1], [5.6, 2], [5.6, 3]
  ].map(([x, y], i): Table => ({
    id: i === 10 ? 'Principal' : `M${i + 1 - (i >= 11 ? 1 : 0)}`,
    position: { x: x * COL_SPACING + ORIGIN_X, y: y * ROW_SPACING + ORIGIN_Y },
    shape: i === 10 ? 'rectangle' : 'circle',
    width: i === 10 ? RECT_WIDTH : CIRCLE_SIZE,
    height: i === 10 ? RECT_HEIGHT : CIRCLE_SIZE,
    isAssignable: true,
    isMain: i === 10,
    isUsed: false,
    tableName: i === 10 ? 'Principal' : undefined,
    tablecloth: 'white',
    napkinColor: 'white',
    centerpiece: 'none',
    numAdults: 0,
    numChildren: 0,
    numBabies: 0,
    descripcion: undefined,
    guestGroups: [],
    guests: [],
  })),
];

export const tableclothOptions = [
  { id: 'white', name: 'Blanco', mainColor: '#FFFFFF', napkins: { availableColors: ['white', 'black'], defaultColor: 'white' }, image: '/img/mesas/blanco-servilleta-negra.webp' },
  { id: 'grey', name: 'Peltre', mainColor: '#808080', napkins: { availableColors: ['white', 'black'], defaultColor: 'white' }, image: '/img/mesas/peltre-servilleta-negra.webp' },
  { id: 'black', name: 'Negro', mainColor: '#000000', napkins: { availableColors: ['white', 'black'], defaultColor: 'black' }, image: '/img/mesas/negro-servilleta-blanca.webp' },
  { id: 'two-tone', name: 'Blanco y Negro', mainColor: '#FFFFFF', secondaryColor: '#000000', napkins: { availableColors: ['white-black'], defaultColor: 'white-black' }, image: '/img/mesas/mixto.webp', isTwoTone: true }
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

  const getTableTotals = useCallback(() => {
    return tables.reduce<{ [key: string]: number }>((acc, table) => {
      acc[table.id] = (table.numAdults || 0) + (table.numChildren || 0) + (table.numBabies || 0);
      return acc;
    }, {});
  }, [tables]);

  const loadTables = useCallback(async () => {
    if (!eventoId) return;
    try {
      const { data: tablesData, error: tablesError } = await supabase
        .from('mesas')
        .select('table_id, table_name, is_main, is_used, num_adults, num_children, num_babies, descripcion, guest_groups')
        .eq('evento_id', eventoId);
      if (tablesError) throw new Error(`Error al cargar mesas: ${tablesError.message}`);

      const { data: decoData, error: decoError } = await supabase
        .from('decoracion_evento')
        .select('tablecloth, napkin_color, centerpiece')
        .eq('evento_id', eventoId)
        .single();
      if (decoError && decoError.code !== 'PGRST116') {
        console.warn('No se encontró decoración, usando valores por defecto:', decoError.message);
      }

      setTables(prev => prev.map(t => {
        const dbTable = tablesData?.find(dt => dt.table_id === t.id);
        if (!dbTable) return t;

        const guestGroups: GuestGroup[] = Array.isArray(dbTable.guest_groups) ? dbTable.guest_groups : [];
        const totalAdults = dbTable.num_adults || guestGroups.reduce((sum: number, group: GuestGroup) => sum + (group.numAdults || 0), 0);
        const totalChildren = dbTable.num_children || guestGroups.reduce((sum: number, group: GuestGroup) => sum + (group.numChildren || 0), 0);
        const totalBabies = dbTable.num_babies || guestGroups.reduce((sum: number, group: GuestGroup) => sum + (group.numBabies || 0), 0);

        return {
          ...t,
          tableName: dbTable.table_name || (t.isMain ? 'Principal' : undefined),
          isUsed: dbTable.is_used || false,
          numAdults: totalAdults,
          numChildren: totalChildren,
          numBabies: totalBabies,
          descripcion: dbTable.descripcion || undefined,
          guestGroups,
          tablecloth: decoData?.tablecloth || globalDecoration.tablecloth,
          napkinColor: decoData?.napkin_color || globalDecoration.napkinColor,
          centerpiece: decoData?.centerpiece || globalDecoration.centerpiece,
        };
      }));
    } catch (error: any) {
      console.error('Error al cargar mesas o decoración:', error.message);
      alert('Error al cargar datos. Verifica tu conexión o permisos.');
    }
  }, [eventoId, globalDecoration]);

  const selectTable = useCallback((id: string) => {
    const t = tables.find(tb => tb.id === id && tb.isAssignable);
    if (!t) return;
    setSelected(t);
    setShowModal(true);
  }, [tables]);

  const updateMesaCompleta = useCallback(async (
    tableId: string,
    guestGroups: GuestGroup[],
    numAdults: number,
    numChildren: number,
    numBabies: number,
    tableName?: string
  ) => {
    if (!eventoId) {
      console.error('No hay evento_id para guardar la mesa.');
      alert('Error: No se proporcionó un evento_id.');
      return;
    }

    // Verificar el estado del evento
    const { data: eventData, error: eventError } = await supabase
      .from('eventos')
      .select('estado')
      .eq('id', eventoId)
      .single();

    if (eventError || !eventData) {
      console.error('Error al cargar el evento:', eventError?.message);
      alert('Error al cargar el evento.');
      return;
    }

    if (eventData.estado === 'inactivo') {
      alert('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    const total = numAdults + numChildren + numBabies;
    const isMainTable = tables.find(t => t.id === tableId)?.isMain;
    const minGuests = isMainTable ? MIN_GUESTS_MAIN : MIN_GUESTS;
    const maxGuests = isMainTable ? MAX_GUESTS_MAIN : MAX_GUESTS;

    if (total > 0 && (total < minGuests || total > maxGuests)) {
      alert(`No se puede guardar la mesa ${tableId}. El total de invitados (${total}) debe estar entre ${minGuests} y ${maxGuests}.`);
      return;
    }

    const combinedDescriptions = guestGroups.map(g => g.details).filter(Boolean).join('; ') || undefined;

    // Actualizar estado local
    setTables(prev =>
      prev.map(t =>
        t.id === tableId
          ? {
              ...t,
              numAdults,
              numChildren,
              numBabies,
              descripcion: combinedDescriptions,
              tableName: tableName?.trim() || (t.isMain ? 'Principal' : t.tableName),
              isUsed: total > 0,
              guestGroups,
            }
          : t
      )
    );

    // Guardar en la base de datos
    try {
      const mesaToSave = {
        evento_id: eventoId,
        table_id: tableId,
        table_name: tableName?.trim() || null,
        is_main: tableId === 'Principal',
        is_used: total > 0,
        num_adults: numAdults,
        num_children: numChildren,
        num_babies: numBabies,
        descripcion: combinedDescriptions || null,
        guest_groups: guestGroups || [],
      };

      const { error } = await supabase
        .from('mesas')
        .upsert([mesaToSave], { onConflict: 'evento_id,table_id' });

      if (error) throw new Error(`Error al guardar la mesa ${tableId}: ${error.message}`);

      console.log(`Mesa ${tableId} guardada exitosamente en la DB.`);
      setShowModal(false);
      setSelected(null);
    } catch (error: any) {
      console.error('Error al guardar la mesa individual:', error.message);
      alert(`Error al guardar la mesa ${tableId}: ${error.message}. Verifica tu conexión o permisos.`);
    }
  }, [eventoId, tables]);

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
      alert('Error: No se proporcionó un evento_id.');
      return;
    }

    // Verificar el estado del evento
    const { data: eventData, error: eventError } = await supabase
      .from('eventos')
      .select('estado')
      .eq('id', eventoId)
      .single();

    if (eventError || !eventData) {
      console.error('Error al cargar el evento:', eventError?.message);
      alert('Error al cargar el evento.');
      return;
    }

    if (eventData.estado === 'inactivo') {
      alert('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    const tableTotals = getTableTotals();
    const invalidTables = tables.filter(t => t.isAssignable && t.isUsed && (
      t.isMain
        ? (tableTotals[t.id] < MIN_GUESTS_MAIN || tableTotals[t.id] > MAX_GUESTS_MAIN)
        : (tableTotals[t.id] < MIN_GUESTS || tableTotals[t.id] > MAX_GUESTS)
    ));
    if (invalidTables.length > 0) {
      alert(`No se puede guardar. Las siguientes mesas no cumplen con los límites de personas: ${invalidTables.map(t => t.isMain ? 'Principal' : t.id).join(', ')}`);
      return;
    }

    try {
      const mesasToSave = tables.map(t => ({
        evento_id: eventoId,
        table_id: t.id,
        table_name: t.tableName || null,
        is_main: t.isMain,
        is_used: (t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0) > 0,
        num_adults: t.numAdults || 0,
        num_children: t.numChildren || 0,
        num_babies: t.numBabies || 0,
        descripcion: t.descripcion || null,
        guest_groups: t.guestGroups || [],
      }));

      const { error } = await supabase.from('mesas').upsert(
        mesasToSave,
        { onConflict: 'evento_id,table_id' }
      );
      if (error) throw new Error(`Error al guardar mesas: ${error.message}`);

      console.log('Mesas guardadas:', mesasToSave);
      setSaved(true);
      alert('Distribución de mesas guardada exitosamente.');
    } catch (error: any) {
      console.error('Error guardando mesas:', error.message);
      alert('Error al guardar la distribución de mesas: ' + error.message);
    }
  }, [tables, eventoId, getTableTotals]);

  const guardarDecoracion = useCallback(async () => {
    if (!eventoId) {
      console.error('No hay evento_id para guardar decoración.');
      alert('Error: No se proporcionó un evento_id.');
      return;
    }

    // Verificar el estado del evento
    const { data: eventData, error: eventError } = await supabase
      .from('eventos')
      .select('estado')
      .eq('id', eventoId)
      .single();

    if (eventError || !eventData) {
      console.error('Error al cargar el evento:', eventError?.message);
      alert('Error al cargar el evento.');
      return;
    }

    if (eventData.estado === 'inactivo') {
      alert('El evento está inactivo. No podés realizar modificaciones.');
      return;
    }

    try {
      const { error } = await supabase.from('decoracion_evento').upsert(
        {
          evento_id: eventoId,
          tablecloth: globalDecoration.tablecloth,
          napkin_color: globalDecoration.napkinColor,
          centerpiece: globalDecoration.centerpiece
        },
        { onConflict: 'evento_id' }
      );
      if (error) throw new Error(`Error al guardar decoración: ${error.message}`);
      console.log('Decoración global guardada:', globalDecoration);
    } catch (error: any) {
      console.error('Error guardando decoración:', error.message);
      alert('Error al guardar la decoración: ' + error.message);
    }
  }, [globalDecoration, eventoId]);

  const nextStep = useCallback(() => setCurrentStep(p => p + 1), []);
  const prevStep = useCallback(() => setCurrentStep(p => Math.max(p - 1, 1)), []);

  const warnings = useMemo(() =>
    tables.filter(t => t.isAssignable && t.isUsed && (
      t.isMain
        ? ((t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0) < MIN_GUESTS_MAIN || (t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0) > MAX_GUESTS_MAIN)
        : ((t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0) < MIN_GUESTS || (t.numAdults || 0) + (t.numChildren || 0) + (t.numBabies || 0) > MAX_GUESTS)
    )),
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
    getTableTotals,
  };
};