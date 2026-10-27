
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function RutaProtegida({ children }) {
  const [estado, setEstado] = useState('comprobando');

  useEffect(() => {
    let activo = true;

    async function verificar() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!activo) return;

        setEstado(!error && session?.access_token ? 'autenticado' : 'no-autenticado');
      } catch {
        if (activo) {
          setEstado('no-autenticado');
        }
      }
    }

    verificar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (activo) {
        setEstado(session?.access_token ? 'autenticado' : 'no-autenticado');
      }
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  if (estado === 'comprobando') {
    return <p>Verificando acceso...</p>;
  }

  if (estado === 'no-autenticado') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
