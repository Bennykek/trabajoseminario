
import { Link } from 'react-router-dom';
import './inicio.scss';

const whatsapp = 'https://wa.me/51999999999';

const servicios = [
  ['consulta.webp', 'Consulta veterinaria', 'Evaluación general y orientación para su cuidado.'],
  ['vacuna.webp', 'Vacunación', 'Atención preventiva según sus necesidades.'],
  ['control.webp', 'Control preventivo', 'Seguimiento de su salud y bienestar.'],
];

const testimonios = [
  {
    imagen: 'perrotestimonio1.webp',
    nombre: 'Carlos Mendoza',
    mascota: 'Max, su perro',
    texto: 'La atención fue excelente. Revisaron a Max con mucho cuidado y me explicaron cómo ayudarlo a mantenerse saludable.',
    lado: 'imagen-izquierda',
  },
  {
    imagen: 'gatotestimonio2.webp',
    nombre: 'María Fernández',
    mascota: 'Luna, su gata',
    texto: 'Me gustó mucho el trato amable y la paciencia que tuvieron con Luna. La consulta fue clara y me sentí tranquila.',
    lado: 'imagen-derecha',
  },
  {
    imagen: 'lorotestimonio3.webp',
    nombre: 'Andrea Quispe',
    mascota: 'Paco, su loro',
    texto: 'Recibimos buenas recomendaciones para el cuidado de Paco. La experiencia fue agradable y aprendí más sobre sus necesidades.',
    lado: 'imagen-izquierda',
  },
];

export default function Inicio() {
  return (
    <>
      <header className="encabezado">
        <Link to="/" className="logo" aria-label="Inicio">
          <img src="/logo.webp" alt="Vet Ayacucho" />
        </Link>
        <nav>
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#precios">Precios</a>
          <a href="#testimonios">Testimonios</a>
          <a href="#contacto">Contáctenos</a>
        </nav>
        <Link className="btn" to="/solicitar-cita">Hacer cita</Link>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div>
            <h1>Cuidamos de tus mascotas <span>como si fueran nuestras</span></h1>
            <p>Cuidamos la salud y el bienestar de tus compañeros de vida.</p>
            <div className="botones">
              <Link className="btn" to="/solicitar-cita">Hacer cita →</Link>
              <a className="btn whatsapp" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
          </div>
          <div className="mascota">
            <img src="/perroinicio.webp" alt="Perro de la veterinaria" />
          </div>
        </section>

        <section className="seccion" id="servicios">
          <span className="etiqueta">CUIDADO PROFESIONAL</span>
          <h2>Nuestros servicios</h2>
          <p>Atención para cuidar a tu mascota en cada etapa de su vida.</p>
          <div className="grid">
            {servicios.map(([imagen, titulo, descripcion]) => (
              <article key={titulo}>
                <div className="servicio-imagen">
                  <img src={`/${imagen}`} alt={titulo} loading="lazy" />
                </div>
                <h3>{titulo}</h3>
                <p>{descripcion}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="seccion alterno" id="precios">
          <span className="etiqueta">PRECIOS</span>
          <h2>Precios de nuestros servicios</h2>
          <p>Consulta los precios disponibles directamente con la veterinaria.</p>
          <a className="btn" href={whatsapp} target="_blank" rel="noreferrer">Consultar precios</a>
        </section>

        <section className="seccion testimonios" id="testimonios">
          <span className="etiqueta">TESTIMONIOS</span>
          <h2>Historias de nuestros compañeros</h2>
          <p>El cuidado y el bienestar de cada mascota son nuestra prioridad.</p>

          <div className="testimonios-lista">
            {testimonios.map((t) => (
              <article className={`testimonio ${t.lado}`} key={t.nombre}>
                <div className="testimonio-imagen">
                  <img src={`/${t.imagen}`} alt={t.mascota} loading="lazy" />
                </div>
                <div className="testimonio-tarjeta">
                  <span className="comillas" aria-hidden="true">“</span>
                  <p>{t.texto}</p>
                  <h3>{t.nombre}</h3>
                  <span className="mascota-nombre">{t.mascota}</span>
                  <div className="estrellas" aria-label="5 de 5 estrellas">★★★★★</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer" id="contacto">
        <div className="footer-contenido">
          <div className="footer-info">
            <img className="logo-blanco" src="/logoblanco.webp" alt="Vet Ayacucho" />
            <h2>Estamos para ayudarte</h2>
            <p>Cuidado y bienestar animal.</p>
            <p>⌖ Jr. Quinua N.º 178, Cercado, Ayacucho</p>
            <p>☎ 965 939 522</p>
            <div className="footer-botones">
              <Link className="btn claro" to="/solicitar-cita">Solicitar una cita</Link>
              <a className="btn whatsapp" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <a
              className="como-llegar"
              href="https://www.google.com/maps/dir//Cl%C3%ADnica+Veterinaria+San+Mart%C3%ADn+De+Porres,+Jr.+Quinua+N%C2%B0+178+-+Cercado,+Ayacucho/"
              target="_blank"
              rel="noreferrer"
            >
              Cómo llegar con Google Maps ↗
            </a>
          </div>
          <div className="mapa">
            <iframe
              title="Mapa de ubicación en Ayacucho"
              src="https://maps.google.com/maps?q=Jr.%20Quinua%20178%2C%20Ayacucho&t=&z=16&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="footer-inferior">
          <div className="redes">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
              <img src="/facebooklogo.webp" alt="" loading="lazy" />
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noreferrer" aria-label="TikTok">
              <img src="/tiktoklogo.webp" alt="" loading="lazy" />
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <img src="/instagramlogo.webp" alt="" loading="lazy" />
            </a>
          </div>
          <Link className="acceso-personal" to="/admin/login">♙ Acceso del personal</Link>
          <small>© {new Date().getFullYear()} Vet Ayacucho · Cuidado y bienestar animal</small>
        </div>
      </footer>
    </>
  );
}
