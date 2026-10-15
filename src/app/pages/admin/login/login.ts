
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  correo = '';
  contrasena = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async iniciarSesion() {
    if (this.cargando) return;

    this.cargando = true;
    this.error = '';

    try {
      await this.authService.iniciarSesion(
        this.correo.trim(),
        this.contrasena
      );

      await this.router.navigateByUrl('/admin/panel');
    } catch {
      this.error = 'Correo o contraseña incorrectos.';
    } finally {
      this.cargando = false;
    }
  }
}
