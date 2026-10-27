
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
    setCita((anterior) => ({ ...anterior, [name]: value }));
    if (error) setError('');
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando || enviado) return;

    setEnviando(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const respuesta = await fetch(`${apiUrl}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <main className="cita-main">
        {!enviado ? (
          <div className="cita-formulario-con-gato">
            <img
              className="gato-formulario"
              src="/gatoasomandose.webp"
              alt=""
              aria-hidden="true"
            />

            <form className="cita-formulario" onSubmit={enviar}>
              <div className="cita-cabecera-formulario">
                <img
                  className="cita-logo"
                  src="/logo.webp"
                  alt="Logo de Vet Ayacucho"
                />

                <p className="cita-etiqueta">VET AYACUCHO</p>
                <h1>Solicitar una cita</h1>
                <p className="cita-descripcion">
                  Completa los datos y coordinaremos la atención de tu mascota.
                </p>
              </div>

              <section className="cita-seccion">
                <h2>
                  <span>01</span>
                  Datos del propietario
                </h2>

                <div className="cita-grid">
                  <div className="cita-campo">
                    <label htmlFor="propietario">Nombre y apellidos</label>
                    <input
                      id="propietario"
                      name="propietario"
                      value={cita.propietario}
                      onChange={actualizarCampo}
                      autoComplete="name"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="cita-campo">
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
                  </div>
                </div>
              </section>

              <section className="cita-seccion">
                <h2>
                  <span>02</span>
                  Datos de la mascota
                </h2>

                <div className="cita-grid">
                  <div className="cita-campo">
                    <label htmlFor="mascota">Nombre de la mascota</label>
                    <input
                      id="mascota"
                      name="mascota"
                      value={cita.mascota}
                      onChange={actualizarCampo}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="cita-campo">
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
                  </div>

                  <div className="cita-campo">
                    <label htmlFor="tipo">Tipo de mascota y raza</label>
                    <input
                      id="tipo"
                      name="tipo"
                      value={cita.tipo}
                      onChange={actualizarCampo}
                      placeholder="Ej. Perro - Labrador"
                      maxLength={100}
                      required
                    />
                    <small>Especifica la raza si la conoces.</small>
                  </div>

                  <div className="cita-campo">
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
                  </div>
                </div>
              </section>

              <section className="cita-seccion">
                <h2>
                  <span>03</span>
                  Motivo de consulta
                </h2>

                <div className="cita-campo">
                  <label htmlFor="motivo">¿Qué necesita tu mascota?</label>
                  <textarea
                    id="motivo"
                    name="motivo"
                    value={cita.motivo}
                    onChange={actualizarCampo}
                    maxLength={1000}
                    rows={3}
                    placeholder="Describe brevemente el motivo de la cita..."
                    required
                  />
                </div>
              </section>

              <p className="cita-aviso">
                <span>ℹ</span>
                Tu solicitud quedará pendiente hasta que la veterinaria la revise.
              </p>

              {error && (
                <p className="cita-error" role="alert">
                  {error}
                </p>
              )}

              <button className="cita-boton-enviar" type="submit" disabled={enviando}>
                {enviando ? 'Enviando solicitud...' : 'Enviar solicitud'}
                {!enviando && <span>→</span>}
              </button>

              <Link className="cita-boton-regresar" to="/">
                <span>←</span>
                Volver al inicio
              </Link>

              <p className="cita-pie">Cuidamos de quienes hacen especial tu vida.</p>
            </form>
          </div>
        ) : (
          <section className="cita-confirmacion" role="status">
            <img
              className="cita-logo-confirmacion"
              src="/logo.webp"
              alt="Vet Ayacucho"
            />

            <span className="cita-check">✓</span>
            <h1>¡Gracias por solicitar una cita!</h1>
            <p>
              Nos pondremos en contacto contigo para coordinar la atención de
              tu mascota.
            </p>

            <img
              className="cita-imagen-gracias"
              src="/graciasporcita.webp"
              alt="Gracias por confiar en nuestra veterinaria"
            />

            <Link className="cita-boton-regresar" to="/">
              <span>←</span>
              Volver al inicio
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
