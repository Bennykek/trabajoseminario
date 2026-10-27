
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './solicitar-cita.scss';

const citaInicial = {
  propietario: '',
  celular: '',
  mascota: '',
  edad: '',
  tipo: '',
  sexo: '',
  motivo: '',
};

export default function SolicitarCita() {
  const [cita, setCita] = useState(citaInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setCita((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (error) setError('');
  }

  async function enviar(evento) {
    evento.preventDefault();

    if (enviando || enviado) return;

    setEnviando(true);
    setError('');

    try {
      // Ajusta esta URL a la ruta real de tu backend.
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const respuesta = await fetch(`${apiUrl}/citas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cita),
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo registrar la solicitud.');
      }

      setEnviado(true);
    } catch (e) {
      console.error('Error al enviar la cita:', e);
      setError(
        'No se pudo enviar la solicitud. Verifica tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="solicitar-pagina">
      <header className="cita-header">
        <Link to="/" className="cita-logo" aria-label="Volver al inicio">
          <img src="/logo.webp" alt="Logo de Vet Ayacucho" />
        </Link>

        <Link to="/" className="cita-volver">
          ← Volver al inicio
        </Link>
      </header>

      <main className="cita-main">
        {!enviado ? (
          <form className="cita-formulario" onSubmit={enviar}>
            <h1>Solicitar una cita</h1>

            <p className="cita-descripcion">
              Completa los datos para solicitar atención para tu mascota.
            </p>

            <h2>Datos del propietario</h2>

            <label htmlFor="propietario">Nombre y apellidos</label>
            <input
              id="propietario"
              name="propietario"
              value={cita.propietario}
              onChange={actualizarCampo}
              required
              maxLength={120}
              autoComplete="name"
            />

            <label htmlFor="celular">Número de celular</label>
            <input
              id="celular"
              name="celular"
              type="tel"
              value={cita.celular}
              onChange={actualizarCampo}
              placeholder="Ej. 987654321"
              maxLength={9}
              minLength={9}
              pattern="[0-9]{9}"
              inputMode="numeric"
              autoComplete="tel"
              title="Ingresa un número de celular de 9 dígitos."
              required
            />

            <h2>Datos de la mascota</h2>

            <label htmlFor="mascota">Nombre de la mascota</label>
            <input
              id="mascota"
              name="mascota"
              value={cita.mascota}
              onChange={actualizarCampo}
              required
              maxLength={100}
            />

            <label htmlFor="edad">Edad</label>
            <input
              id="edad"
              name="edad"
              value={cita.edad}
              onChange={actualizarCampo}
              placeholder="Ej. 2 años"
              maxLength={30}
              required
            />

            <label htmlFor="tipo">Tipo de mascota</label>
            <input
              id="tipo"
              name="tipo"
              value={cita.tipo}
              onChange={actualizarCampo}
              placeholder="Ej. Perro - Labrador"
              maxLength={100}
              required
            />

            <small>Especificar raza si es posible.</small>

            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={cita.sexo}
              onChange={actualizarCampo}
              required
            >
              <option value="" disabled>
                Selecciona una opción
              </option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
              <option value="No sé">No lo sé</option>
            </select>

            <h2>Motivo de consulta</h2>

            <label htmlFor="motivo">Describe el motivo de la cita</label>
            <textarea
              id="motivo"
              name="motivo"
              value={cita.motivo}
              onChange={actualizarCampo}
              required
              maxLength={1000}
              rows={4}
              placeholder="Cuéntanos qué necesita tu mascota"
            />

            <p className="cita-aviso">
              La solicitud quedará pendiente hasta que la veterinaria la revise.
            </p>

            {error && (
              <p className="cita-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar solicitud →'}
            </button>
          </form>
        ) : (
          <section className="cita-confirmacion" role="status">
            <div className="cita-confirmacion-texto">
              <span className="cita-check">✓</span>

              <h1>¡Gracias por solicitar una cita!</h1>

              <p>
                Nos pondremos en contacto con usted para coordinar la atención
                de su mascota.
              </p>

              <Link className="cita-btn-inicio" to="/">
                Volver al inicio →
              </Link>
            </div>

            <img
              src="/graciasporcita.webp"
              alt="Gracias por confiar en nuestra veterinaria"
              loading="lazy"
            />
          </section>
        )}
      </main>
    </div>
  );
}
