import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticatorService } from '../../services/authenticator.service';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCheckboxModule, CommonModule, MatInputModule, MatButtonModule,MatCardModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  formLogin: FormGroup;
  isPacChecked = false;
  isEspeChecked = false;
  isAdmChecked = false;

  constructor(private login: FormBuilder,  private auth: AuthenticatorService){
    this.formLogin = this.login.group({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)])
    });
  }

  entrar() {
    if (this.formLogin.valid) {
      this.auth.entrar(this.formLogin.get('email')?.value, this.formLogin.get('password')?.value);
     } else {
       this.marcarCamposFaltantes();
     }
  }

  private marcarCamposFaltantes() {
    Object.values(this.formLogin.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  onCheckboxChange(event: MatCheckboxChange, tipo: string) {
    if (event.checked) {
      switch(tipo) {
        case 'espe':
          this.formLogin.patchValue({
            email: 'suarezbrianalan@gmail.com',
            password: '1122334455'
          });
          this.isPacChecked = false;
          this.isAdmChecked = false;
          break;
        case 'pac':
          this.formLogin.patchValue({
            email: 'smurft.jimmy@gmail.com',
            password: '1122334455'
          });
          this.isEspeChecked = false;
          this.isAdmChecked = false;
          break;
        case 'adm':
          this.formLogin.patchValue({
            email: 'brian44330@gmail.com',
            password: '1122334455'
          });
          this.isPacChecked = false;
          this.isEspeChecked = false;
          break;
      }
    } else {
      this.formLogin.reset();
    }

    this.actualizarEstadoCheck(tipo, event.checked);
  }

  private actualizarEstadoCheck(tipo: string, isChecked: boolean) {
    switch(tipo) {
      case 'espe':
        this.isEspeChecked = isChecked;
        break;
      case 'pac':
        this.isPacChecked = isChecked;
        break;
      case 'adm':
        this.isAdmChecked = isChecked;
        break;
    }
  }

}
