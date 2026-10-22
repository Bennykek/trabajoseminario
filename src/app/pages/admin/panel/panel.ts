
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Cita, CitasService } from '../../../services/citas.service';

@Component({
  selector: 'app-panel',
  standalone: true,
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
  errorProgramacion = false;

  mostrarAcciones = false;
  citaSeleccionada: Cita | null = null;
  mostrarConfirmacion = false;
  citaAEliminar: Cita | null = null;

  constructor(
    private servicio: CitasService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar(true);
  }

  async cargar(mostrarCarga = false): Promise<void> {
    if (mostrarCarga) this.cargando = true;

    try {
      this.citas = await this.servicio.listar();
    } catch (e) {
      this.error = 'No se pudieron cargar las citas.';
      console.error(e);
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
    }
  }

  get citasFiltradas(): Cita[] {
    return this.filtro === 'todas'
      ? this.citas
      : this.citas.filter(c => c.estado === this.filtro);
  }

  contar(estado: Cita['estado']): number {
    return this.citas.filter(c => c.estado === estado).length;
  }

  abrirAcciones(cita: Cita): void {
    this.citaSeleccionada = { ...cita };
    this.error = '';
    this.errorProgramacion = false;
    this.mostrarConfirmacion = false;
    this.mostrarAcciones = true;
  }

  cerrarAcciones(): void {
    if (this.actualizandoId !== null) return;

    this.mostrarAcciones = false;
    this.citaSeleccionada = null;
    this.errorProgramacion = false;
    this.error = '';
  }

  async cambiarEstado(cita: Cita, estado: Cita['estado']): Promise<void> {
    if (this.actualizandoId !== null) return;

    this.actualizandoId = cita.id;
    this.error = '';

    try {
      await this.servicio.actualizarEstado(cita.id, estado);
      this.mostrarAcciones = false;
      this.citaSeleccionada = null;
      this.errorProgramacion = false;
      await this.cargar();
    } catch (e) {
      this.error = 'No se pudo actualizar el estado.';
      console.error(e);
    } finally {
      this.actualizandoId = null;
      this.cd.detectChanges();
    }
  }

  async guardarProgramacion(cita: Cita): Promise<void> {
    if (this.actualizandoId !== null) return;

    if (!cita.fecha_cita || !cita.hora_cita) {
      this.errorProgramacion = true;
      return;
    }

    this.errorProgramacion = false;
    this.actualizandoId = cita.id;
    this.error = '';

    try {
      await this.servicio.programar(cita.id, cita.fecha_cita, cita.hora_cita);
      this.mostrarAcciones = false;
      this.citaSeleccionada = null;
      await this.cargar();
    } catch (e) {
      this.error = 'No se pudo programar la cita.';
      console.error(e);
    } finally {
      this.actualizandoId = null;
      this.cd.detectChanges();
    }
  }

  confirmarEliminacion(cita: Cita): void {
    this.citaAEliminar = cita;
    this.mostrarAcciones = false;
    this.mostrarConfirmacion = true;
  }

  cancelarEliminacion(): void {
    if (this.actualizandoId !== null) return;

    this.mostrarConfirmacion = false;
    this.citaAEliminar = null;

    if (this.citaSeleccionada) this.mostrarAcciones = true;
  }

  async eliminarCita(): Promise<void> {
    if (!this.citaAEliminar || this.actualizandoId !== null) return;

    this.actualizandoId = this.citaAEliminar.id;
    this.error = '';

    try {
      await this.servicio.eliminar(this.citaAEliminar.id);
      this.mostrarConfirmacion = false;
      this.mostrarAcciones = false;
      this.citaAEliminar = null;
      this.citaSeleccionada = null;
      await this.cargar();
    } catch (e) {
      this.error = 'No se pudo eliminar la cita. Verifica los permisos de Supabase.';
      console.error(e);
    } finally {
      this.actualizandoId = null;
      this.cd.detectChanges();
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.cerrarSesion();
    await this.router.navigateByUrl('/admin/login');
  }
}
