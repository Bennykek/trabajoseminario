
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Cita, CitasService } from '../../../services/citas.service';

@Component({
  selector: 'app-panel',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.scss'
})
export class Panel implements OnInit {
  citas: Cita[] = [];
  filtro: 'todas' | Cita['estado'] = 'todas';
  cargando = true;
  actualizandoId: number | null = null;
  error = '';

  constructor(
    private servicio: CitasService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando = true;
    this.cd.detectChanges();

    try {
      this.citas = await this.servicio.listar();
      this.error = '';
    } catch (e) {
      this.error = 'No se pudieron cargar las citas.';
      console.error(e);
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
    }
  }

  get citasFiltradas() {
    return this.filtro === 'todas'
      ? this.citas
      : this.citas.filter(c => c.estado === this.filtro);
  }

  contar(estado: Cita['estado']) {
    return this.citas.filter(c => c.estado === estado).length;
  }

  async cambiarEstado(cita: Cita, estado: Cita['estado']) {
    const anterior = cita.estado;
    this.actualizandoId = cita.id;
    this.error = '';

    cita.estado = estado;
    this.cd.detectChanges();

    try {
      await this.servicio.actualizarEstado(cita.id, estado);
      this.citas = await this.servicio.listar();
    } catch (e) {
      cita.estado = anterior;
      this.error = 'No se pudo guardar el estado. Verifica los permisos de Supabase.';
      console.error(e);
    } finally {
      this.actualizandoId = null;
      this.cd.detectChanges();
    }
  }

  async guardarProgramacion(cita: Cita) {
    if (!cita.fecha_cita || !cita.hora_cita) {
      this.error = 'Selecciona una fecha y una hora.';
      return;
    }

    const anterior = cita.estado;
    this.actualizandoId = cita.id;
    this.error = '';

    cita.estado = 'aceptada';
    this.cd.detectChanges();

    try {
      await this.servicio.programar(
        cita.id, cita.fecha_cita, cita.hora_cita
      );
      this.citas = await this.servicio.listar();
    } catch (e) {
      cita.estado = anterior;
      this.error = 'No se pudo programar la cita. Verifica los permisos de Supabase.';
      console.error(e);
    } finally {
      this.actualizandoId = null;
      this.cd.detectChanges();
    }
  }

  async cerrarSesion() {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/admin/login');
  }
}
