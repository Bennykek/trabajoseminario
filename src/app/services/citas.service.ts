
import { Injectable } from '@angular/core';
import { supabase } from './supabase';

export interface NuevaCita {
  propietario: string;
  celular: string;
  mascota: string;
  edad: string;
  tipo: string;
  sexo: string;
  motivo: string;
}

export interface Cita extends NuevaCita {
  id: number;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  fecha_cita: string | null;
  hora_cita: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class CitasService {
  async crear(cita: NuevaCita): Promise<void> {
    const { error } = await supabase.from('citas').insert(cita);
    if (error) throw error;
  }

  async listar(): Promise<Cita[]> {
    const { data, error } = await supabase
      .from('citas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Cita[];
  }

  async actualizarEstado(id: number, estado: Cita['estado']) {
    const { error } = await supabase
      .from('citas')
      .update({ estado })
      .eq('id', id);

    if (error) throw error;
  }

  async programar(id: number, fecha: string, hora: string) {
    const { error } = await supabase
      .from('citas')
      .update({
        fecha_cita: fecha,
        hora_cita: hora,
        estado: 'aceptada'
      })
      .eq('id', id);

    if (error) throw error;
  }
}
