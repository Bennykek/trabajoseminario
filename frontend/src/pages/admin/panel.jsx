
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './panel.scss';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function solicitudApi(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    throw new Error(`Error del servidor (${respuesta.status}).`);
  }

  if (respuesta.status === 204) return null;

  const texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

function fechaLegible(fecha) {
  if (!fecha) return 'Sin programar';

  // Evita desplazar la fecha cuando el backend envía YYYY-MM-DD.
  const soloFecha = String(fecha).match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (soloFecha) {
    return `${soloFecha[3]}/${soloFecha[2]}/${soloFecha[1]}`;
  }

  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? String(fecha)
    : valor.toLocaleDateString('es-PE');
}

function fechaHoraSolicitud(fecha) {
  if (!fecha) return '—';

  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime())
    ? String(fecha)
    : valor.toLocaleString('es-PE', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function estadoLegible(estado = '') {
  return estado.charAt(0).toUpperCase() + estado.slice(1);
}

export default function Panel() {
  const navigate = useNavigate();

  const [citas, setCitas] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [error, setError] = useState('');
  const [errorProgramacion, setErrorProgramacion] = useState(false);

  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [citaAEliminar, setCitaAEliminar] = useState(null);

  const cargar = useCallback(async (mostrarCarga = false) => {
    if (mostrarCarga) setCargando(true);

    try {
      const datos = await solicitudApi('/citas');
      const lista = Array.isArray(datos) ? datos : datos?.citas;

      if (!Array.isArray(lista)) {
        throw new Error('La respuesta del servidor no contiene una lista de citas.');
      }

      setCitas(lista);
      setError('');
    } catch (e) {
      setError(e.message || 'No se pudieron cargar las citas.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(true);
  }, [cargar]);

  const citasFiltradas =
    filtro === 'todas'
      ? citas
      : citas.filter((cita) => cita.estado === filtro);

  function contar(estado) {
    return citas.filter((cita) => cita.estado === estado).length;
  }

  function abrirAcciones(cita) {
    setCitaSeleccionada({
      ...cita,
      fecha_cita: cita.fecha_cita
        ? String(cita.fecha_cita).slice(0, 10)
        : '',
      hora_cita: cita.hora_cita
        ? String(cita.hora_cita).slice(0, 5)
        : '',
    });

    setError('');
    setErrorProgramacion(false);
    setMostrarConfirmacion(false);
    setMostrarAcciones(true);
  }

  function cerrarAcciones() {
    if (actualizandoId !== null) return;

    setMostrarAcciones(false);
    setCitaSeleccionada(null);
    setErrorProgramacion(false);
    setError('');
  }

  async function cambiarEstado(cita, estado) {
    if (actualizandoId !== null) return;

    setActualizandoId(cita.id);
    setError('');

    try {
      await solicitudApi(`/citas/${cita.id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado }),
      });

      setMostrarAcciones(false);
      setCitaSeleccionada(null);
      setErrorProgramacion(false);
      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo actualizar el estado.');
    } finally {
      setActualizandoId(null);
    }
  }

  async function guardarProgramacion() {
    const cita = citaSeleccionada;

    if (!cita || actualizandoId !== null) return;

    if (!cita.fecha_cita || !cita.hora_cita) {
      setErrorProgramacion(true);
      return;
    }

    setErrorProgramacion(false);
    setActualizandoId(cita.id);
    setError('');

    try {
      await solicitudApi(`/citas/${cita.id}/programar`, {
        method: 'PATCH',
        body: JSON.stringify({
          fecha_cita: cita.fecha_cita,
          hora_cita: cita.hora_cita,
        }),
      });

      setMostrarAcciones(false);
      setCitaSeleccionada(null);
      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo programar la cita.');
    } finally {
      setActualizandoId(null);
    }
  }

  function confirmarEliminacion(cita) {
    setCitaAEliminar(cita);
    setMostrarAcciones(false);
    setMostrarConfirmacion(true);
  }

  function cancelarEliminacion() {
    if (actualizandoId !== null) return;

    setMostrarConfirmacion(false);
    setCitaAEliminar(null);

    if (citaSeleccionada) setMostrarAcciones(true);
  }

  async function eliminarCita() {
    if (!citaAEliminar || actualizandoId !== null) return;

    setActualizandoId(citaAEliminar.id);
    setError('');

    try {
      await solicitudApi(`/citas/${citaAEliminar.id}`, {
        method: 'DELETE',
      });

      setMostrarConfirmacion(false);
      setMostrarAcciones(false);
      setCitaAEliminar(null);
      setCitaSeleccionada(null);
      await cargar();
    } catch (e) {
      setError(e.message || 'No se pudo eliminar la cita.');
      setMostrarConfirmacion(false);
    } finally {
      setActualizandoId(null);
    }
  }

  function cerrarSesion() {
    // La invalidación real de la sesión debe realizarla el sistema de autenticación.
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="panel-admin">
      <header className="barra">
        <Link to="/" className="logo" aria-label="Volver al inicio">
          <img src="/logo.webp" alt="Vet Ayacucho" />
        </Link>

        <button className="salir" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <main className="panel-contenido">
        <section className="encabezado">
          <span className="etiqueta">ADMINISTRACIÓN</span>
          <h1>Solicitudes de citas</h1>
          <p>Gestiona las solicitudes y programa las citas.</p>
        </section>

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
            <button className="reintentar" onClick={() => cargar(true)}>
              Reintentar
            </button>
          </div>
        )}

        <section className="resumen" aria-label="Resumen de solicitudes">
          {[
            { valor: 'todas', titulo: 'Total', cantidad: citas.length },
            { valor: 'pendiente', titulo: 'Pendientes', cantidad: contar('pendiente') },
            { valor: 'aceptada', titulo: 'Aceptadas', cantidad: contar('aceptada') },
            { valor: 'rechazada', titulo: 'Rechazadas', cantidad: contar('rechazada') },
          ].map((tarjeta) => (
            <button
              key={tarjeta.valor}
              className={`tarjeta ${filtro === tarjeta.valor ? 'seleccionada' : ''}`}
              onClick={() => setFiltro(tarjeta.valor)}
              aria-pressed={filtro === tarjeta.valor}
            >
              {tarjeta.titulo}
              <strong>{tarjeta.cantidad}</strong>
            </button>
          ))}
        </section>

        <section className="listado">
          <div className="listado-titulo">
            <h2>Solicitudes ({citasFiltradas.length})</h2>
            <button
              className="actualizar-listado"
              onClick={() => cargar(true)}
              disabled={cargando}
            >
              {cargando ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>

          {cargando ? (
            <p className="estado-listado">Cargando solicitudes...</p>
          ) : citasFiltradas.length === 0 ? (
            <p className="estado-listado">No hay solicitudes.</p>
          ) : (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Solicitud</th>
                    <th>Propietario</th>
                    <th>Celular</th>
                    <th>Mascota</th>
                    <th>Detalles</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Fecha de cita</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {citasFiltradas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{fechaHoraSolicitud(cita.created_at)}</td>
                      <td>{cita.propietario}</td>
                      <td>{cita.celular}</td>
                      <td>{cita.mascota}</td>
                      <td>
                        {cita.tipo}
                        <br />
                        Edad: {cita.edad}
                        <br />
                        Sexo: {cita.sexo}
                      </td>
                      <td className="motivo">{cita.motivo}</td>
                      <td>
                        <span className={`estado ${cita.estado}`}>
                          {estadoLegible(cita.estado)}
                        </span>
                      </td>
                      <td>
                        {cita.estado === 'aceptada' ? (
                          <>
                            {fechaLegible(cita.fecha_cita)}
                            <br />
                            {cita.hora_cita || '—'}
                          </>
                        ) : (
                          'Sin programar'
                        )}
                      </td>
                      <td>
                        <button
                          className="ver-acciones"
                          onClick={() => abrirAcciones(cita)}
                        >
                          Ver acciones
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {mostrarAcciones && citaSeleccionada && (
        <div className="modal-fondo" onMouseDown={cerrarAcciones}>
          <section
            className="modal-acciones"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-acciones"
            onMouseDown={(evento) => evento.stopPropagation()}
          >
            <button
              className="cerrar-modal"
              onClick={cerrarAcciones}
              aria-label="Cerrar"
              disabled={actualizandoId !== null}
            >
              ×
            </button>

            <span className="etiqueta">GESTIÓN DE CITA</span>
            <h2 id="titulo-acciones">Acciones de la solicitud</h2>

            <div className="detalle-cita">
              <div><span>Mascota</span><strong>{citaSeleccionada.mascota}</strong></div>
              <div><span>Propietario</span><strong>{citaSeleccionada.propietario}</strong></div>
              <div><span>Celular</span><strong>{citaSeleccionada.celular}</strong></div>
              <div>
                <span>Estado</span>
                <span className={`estado ${citaSeleccionada.estado}`}>
                  {estadoLegible(citaSeleccionada.estado)}
                </span>
              </div>

              {citaSeleccionada.estado === 'aceptada' && (
                <div>
                  <span>Fecha programada</span>
                  <strong>
                    {fechaLegible(citaSeleccionada.fecha_cita)} — {citaSeleccionada.hora_cita}
                  </strong>
                </div>
              )}
            </div>

            {citaSeleccionada.estado !== 'rechazada' && (
              <div className="programacion">
                <h3>
                  {citaSeleccionada.estado === 'aceptada'
                    ? 'Reprogramar cita'
                    : 'Programar cita'}
                </h3>

                <label htmlFor="fecha">Fecha</label>
                <input
                  id="fecha"
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  value={citaSeleccionada.fecha_cita || ''}
                  onChange={(evento) => {
                    setCitaSeleccionada((anterior) => ({
                      ...anterior,
                      fecha_cita: evento.target.value,
                    }));
                    setErrorProgramacion(false);
                  }}
                  className={errorProgramacion ? 'campo-invalido' : ''}
                />

                <label htmlFor="hora">Hora</label>
                <input
                  id="hora"
                  type="time"
                  value={citaSeleccionada.hora_cita || ''}
                  onChange={(evento) => {
                    setCitaSeleccionada((anterior) => ({
                      ...anterior,
                      hora_cita: evento.target.value,
                    }));
                    setErrorProgramacion(false);
                  }}
                  className={errorProgramacion ? 'campo-invalido' : ''}
                />

                {errorProgramacion && (
                  <p className="aviso-programacion" role="alert">
                    Selecciona una fecha y una hora para continuar.
                  </p>
                )}

                <button
                  className="aceptar"
                  onClick={guardarProgramacion}
                  disabled={actualizandoId !== null}
                >
                  {actualizandoId !== null
                    ? 'Guardando...'
                    : citaSeleccionada.estado === 'aceptada'
                      ? 'Guardar reprogramación'
                      : 'Programar y aceptar'}
                </button>
              </div>
            )}

            <div className="acciones-secundarias">
              {citaSeleccionada.estado === 'pendiente' && (
                <button
                  className="rechazar"
                  onClick={() => cambiarEstado(citaSeleccionada, 'rechazada')}
                  disabled={actualizandoId !== null}
                >
                  Rechazar solicitud
                </button>
              )}

              {citaSeleccionada.estado !== 'pendiente' && (
                <button
                  className="pendiente"
                  onClick={() => cambiarEstado(citaSeleccionada, 'pendiente')}
                  disabled={actualizandoId !== null}
                >
                  Cambiar a pendiente
                </button>
              )}

              <button
                className="eliminar"
                onClick={() => confirmarEliminacion(citaSeleccionada)}
                disabled={actualizandoId !== null}
              >
                Eliminar solicitud
              </button>
            </div>

            {actualizandoId !== null && (
              <p className="mensaje-modal">Guardando cambios...</p>
            )}

            <button
              className="cancelar-modal"
              onClick={cerrarAcciones}
              disabled={actualizandoId !== null}
            >
              Cerrar
            </button>
          </section>
        </div>
      )}

      {mostrarConfirmacion && citaAEliminar && (
        <div className="modal-fondo" onMouseDown={cancelarEliminacion}>
          <section
            className="modal-confirmacion"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-eliminar"
            onMouseDown={(evento) => evento.stopPropagation()}
          >
            <div className="icono-advertencia">!</div>
            <h2 id="titulo-eliminar">¿Eliminar esta cita?</h2>

            <p>
              Se eliminará la solicitud de <strong>{citaAEliminar.mascota}</strong>,
              registrada a nombre de <strong>{citaAEliminar.propietario}</strong>.
            </p>
            <p>Esta acción no se puede deshacer.</p>

            <div className="acciones-modal">
              <button
                className="cancelar-modal"
                onClick={cancelarEliminacion}
                disabled={actualizandoId !== null}
              >
                Cancelar
              </button>
              <button
                className="eliminar-modal"
                onClick={eliminarCita}
                disabled={actualizandoId !== null}
              >
                {actualizandoId !== null ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
