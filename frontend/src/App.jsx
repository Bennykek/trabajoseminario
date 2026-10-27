
import { Routes, Route, Link } from 'react-router-dom';

import Inicio from './pages/inicio.jsx';
import SolicitarCita from './pages/solicitar-cita.jsx';
import Login from './pages/admin/login.jsx';
import Panel from './pages/admin/panel.jsx';
import RutaProtegida from './components/rutaprotegida.jsx';

function Pendiente({ titulo }) {
  return (
    <main className="pagina-pendiente">
      <h1>{titulo}</h1>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/solicitar-cita" element={<SolicitarCita />} />
      <Route path="/admin/login" element={<Login />} />

      <Route
        path="/admin/panel"
        element={
          <RutaProtegida>
            <Panel />
          </RutaProtegida>
        }
      />

      <Route
        path="*"
        element={<Pendiente titulo="Página no encontrada" />}
      />
    </Routes>
  );
}
