
import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { SolicitarCita } from './pages/solicitar-cita/solicitar-cita';
import { Login } from './pages/admin/login/login';
import { Panel } from './pages/admin/panel/panel';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'solicitar-cita', component: SolicitarCita },
  { path: 'admin/login', component: Login },
  {
    path: 'admin/panel',
    component: Panel,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
