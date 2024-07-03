import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { Paciente } from '../../../interfaces/paciente';
import { AuthenticatorService } from '../../../services/authenticator.service';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [RecaptchaModule, RecaptchaFormsModule, 
    MatSelectModule, MatTabsModule, 
    MatCheckboxModule, MatDividerModule, 
    MatTableModule, MatButtonModule, MatIconModule, 
    CommonModule, MatGridListModule, MatInputModule, 
    MatFormFieldModule,  FormsModule, ReactiveFormsModule, 
    CommonModule],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.css'
})
export class RegistroPacienteComponent {

  imagenUno: FormControl = new FormControl('', Validators.required);
  imagenDos: FormControl = new FormControl('', Validators.required);
  formPaciente!: FormGroup;
  checked: boolean = false;

  constructor(private paciente: FormBuilder, private auth: AuthenticatorService){
    this.formPaciente = this.paciente.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]+$')]),
      obraSocial: new FormControl("", [Validators.required, Validators.maxLength(25), Validators.pattern('^[a-zA-Z ]+$')]),
      imagenUno: new FormControl("", [Validators.required]),
      imagenDos: new FormControl("", [Validators.required]),
      recaptchaReactive: new FormControl(null, Validators.required),
    });
  }  

  registrarPaciente(){
    
    if (this.formPaciente.valid) { 
            
        const paciente: Paciente = {
        nombre: this.formPaciente.get('nombre')?.value,
        apellido: this.formPaciente.get('apellido')?.value,
        edad: this.formPaciente.get('edad')?.value,
        dni: this.formPaciente.get('dni')?.value,
        email: this.formPaciente.get('email')?.value,
        fecha_registro: new Date(),
        rol: 3, 
        password: this.formPaciente.get('password')?.value,
        obraSocial: this.formPaciente.get('obraSocial')?.value,
        imagenUno: this.formPaciente.get('imagenUno')?.value,
        imagenDos: this.formPaciente.get('imagenDos')?.value
      };

      this.auth.registro(paciente, 'pac');
      this.formPaciente.reset();
      this.imagenUno.reset();
      this.imagenDos.reset();
    }else{
      Object.values(this.formPaciente.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  handleFileInputChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];  
      this.formPaciente.get(controlName)?.setValue(file);
     
      if (controlName === 'imagenUno') {
        this.imagenUno.setValue(file.name);
      } else if (controlName === 'imagenDos') {
        this.imagenDos.setValue(file.name);
      }
    }
  }

  onCheckboxChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.formPaciente.patchValue({
        nombre: "Paciente",
        email: "paciente@gmail.com",
        password: "1122334455",
        edad: "23",
        apellido: "Beta",
        dni: "70251756",
        obraSocial: "RNG SEC"
      });
    } else {
      this.formPaciente.reset();
      this.imagenUno.reset();
      this.imagenDos.reset();
    }
  }
  

}
