import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CitasService, NuevaCita } from '../../services/citas.service';

@Component({
  selector: 'app-solicitar-cita',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './solicitar-cita.html',
  styleUrl: './solicitar-cita.scss'
})
export class SolicitarCita {
  enviando = false;
  enviado = false;
  error = '';

  cita: NuevaCita = {
    propietario: '',
    celular: '',
    mascota: '',
    edad: '',
    tipo: '',
    sexo: '',
    motivo: ''
  };

  constructor(
    private citasService: CitasService,
    private cdr: ChangeDetectorRef
  ) {}

  async enviar() {
    if (this.enviando || this.enviado) return;

    this.enviando = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      await this.citasService.crear(this.cita);
      this.enviado = true;
    } catch (e) {
      this.error = 'No se pudo enviar la solicitud. Inténtalo nuevamente.';
      console.error(e);
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }
}