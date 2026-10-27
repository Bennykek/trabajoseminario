
import { supabase } from './supabase';

export async function iniciarSesion(correo, contrasena) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo.trim(),
    password: contrasena,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function obtenerSesion() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function estaAutenticado() {
  const sesion = await obtenerSesion();
  return Boolean(sesion);
}
