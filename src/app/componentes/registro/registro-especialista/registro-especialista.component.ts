import { Component } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { Especialista } from '../../../interfaces/especialista';
import { AuthenticatorService } from '../../../services/authenticator.service';
import { EspecialidadService } from '../../../services/especialidad.service';
import { UsuarioService } from '../../../services/usuario.service';
import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  imports: [RecaptchaFormsModule ,RecaptchaModule ,MatSelectModule, MatTabsModule, MatCheckboxModule, MatDividerModule, MatTableModule, MatButtonModule, MatIconModule, CommonModule, MatGridListModule, MatInputModule, MatFormFieldModule,  FormsModule, ReactiveFormsModule],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})
export class RegistroEspecialistaComponent {

  formEspecialista!: FormGroup;
  imagenUno: FormControl = new FormControl('', Validators.required);
  checked: boolean = false;

  especialidades: any;

  constructor(private especialista: FormBuilder, private auth: AuthenticatorService, private datos: UsuarioService, private especialidad: EspecialidadService){
    this.formEspecialista = this.especialista.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]+$')]),
      especialidades: new FormControl([], Validators.required),
      otraEspecialidad: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      imagenUno: new FormControl("", [Validators.required]),
      recaptchaReactive: new FormControl(null, Validators.required)
    });
  }

  ngOnInit() {
    this.datos.obtenerCollection('especialidad').subscribe({
      next: (data: any[]) => {
        this.especialidades = data;
      },
      error: (error) => {
        console.error('Error al obtener especialidades:', error);
      }
    });
  }

  registrarEspecialista() {
    if (this.formEspecialista.get('otraEspecialidad')?.value !== "") {
      // this.especialidad.guardarEspecialidad(this.formEspecialista.get('otraEspecialidad')?.value);
    } else {
      this.formEspecialista.patchValue({ otraEspecialidad: 'No seleccionado' });
    }

    if (this.formEspecialista.valid) {
      const especialista: Especialista = {
        nombre: this.formEspecialista.get('nombre')?.value,
        apellido: this.formEspecialista.get('apellido')?.value,
        edad: this.formEspecialista.get('edad')?.value,
        dni: this.formEspecialista.get('dni')?.value,
        email: this.formEspecialista.get('email')?.value,
        fecha_registro: new Date(),
        rol: 2,
        password: this.formEspecialista.get('password')?.value,
        especialidades: this.formEspecialista.get('especialidades')?.value,
        imagenUno: this.formEspecialista.get('imagenUno')?.value
      }

      this.auth.registro(especialista, 'espe');
      this.formEspecialista.reset();
      this.imagenUno.reset();
    } else {
      Object.values(this.formEspecialista.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  handleFileInputChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.formEspecialista.get(controlName)?.setValue(file);
      this.imagenUno.setValue(file.name);
    }
  }

  onCheckboxChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.formEspecialista.patchValue({
        nombre: "Especialista",
        email: "especialista@gmail.com",
        password: "1122334455",
        edad: "24",
        apellido: "Charli",
        dni: "30251756",
      });
    } else {
      this.formEspecialista.reset();
      this.imagenUno.reset();
    }
  }

  volverASeleccion() {
    this.formEspecialista.get('especialidades')?.setValue([]);
  }

}
