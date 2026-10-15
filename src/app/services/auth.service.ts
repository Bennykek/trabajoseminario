
import { Injectable } from '@angular/core';
import { supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  async iniciarSesion(correo: string, contrasena: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }

  async estaAutenticado(): Promise<boolean> {
    const { data, error } = await supabase.auth.getSession();

    return !error && !!data.session;
  }
}
