import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient'; // Ajustá esto si tu cliente está en otro path

type Menu = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  incluye: string[];
  permite_personalizacion: boolean;
  requiere_seleccion_platos: boolean;
  imagen: string;
};

type Plato = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: 'entrada' | 'principal' | 'postre';
  imagen: string;
};

type Acompanamiento = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: 'guarnicion' | 'salsa' | 'bebida';
  imagen: string;
};

type Extra = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: 'comida' | 'bebida';
  imagen: string;
};

export function useCatalogo() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [entradas, setEntradas] = useState<Plato[]>([]);
  const [principales, setPrincipales] = useState<Plato[]>([]);
  const [postres, setPostres] = useState<Plato[]>([]);
  const [guarniciones, setGuarniciones] = useState<Acompanamiento[]>([]);
  const [salsas, setSalsas] = useState<Acompanamiento[]>([]);
  const [bebidas, setBebidas] = useState<Acompanamiento[]>([]);
  const [extrasComida, setExtrasComida] = useState<Extra[]>([]);
  const [extrasBebida, setExtrasBebida] = useState<Extra[]>([]);

  useEffect(() => {
    const fetchCatalogo = async () => {
      const { data: menuData } = await supabase.from('menus').select('*');
      const { data: platoData } = await supabase.from('platos').select('*');
      const { data: acompData } = await supabase.from('acompañamientos').select('*');
      const { data: extraData } = await supabase.from('extras').select('*');

      setMenus(menuData || []);
      setEntradas(platoData?.filter(p => p.categoria === 'entrada') || []);
      setPrincipales(platoData?.filter(p => p.categoria === 'principal') || []);
      setPostres(platoData?.filter(p => p.categoria === 'postre') || []);

      setGuarniciones(acompData?.filter(a => a.categoria === 'guarnicion') || []);
      setSalsas(acompData?.filter(a => a.categoria === 'salsa') || []);
      setBebidas(acompData?.filter(a => a.categoria === 'bebida') || []);

      setExtrasComida(extraData?.filter(e => e.categoria === 'comida') || []);
      setExtrasBebida(extraData?.filter(e => e.categoria === 'bebida') || []);
    };

    fetchCatalogo();
  }, []);

  return {
    menus,
    entradas,
    principales,
    postres,
    guarniciones,
    salsas,
    bebidas,
    extrasComida,
    extrasBebida
  };
}
