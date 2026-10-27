
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../../services/auth';
import './login.scss';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  async function manejarInicioSesion(evento) {
    evento.preventDefault();

    if (cargando) return;

    setCargando(true);
    setError('');

    try {
      await iniciarSesion(correo, contrasena);
      navigate('/admin/panel', { replace: true });
    } catch (e) {
      console.error('Error de inicio de sesión:', e);
      setError('Correo o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="login-logo" aria-label="Volver al inicio">
          <img src="/logo.webp" alt="Logo de Vet Ayacucho" />
        </Link>

        <h1>Acceso administrativo</h1>

        <p className="login-descripcion">
          Inicia sesión para revisar las solicitudes de citas.
        </p>

        <form onSubmit={manejarInicioSesion}>
          <label htmlFor="correo">Correo electrónico</label>

          <input
            id="correo"
            name="correo"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="username"
            placeholder="admin@ejemplo.com"
          />

          <label htmlFor="contrasena">Contraseña</label>

          <input
            id="contrasena"
            name="contrasena"
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <Link to="/" className="login-volver">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
