import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from "@angular/material/form-field";
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';
import { AuthenticatorService } from '../../services/authenticator.service';
import { Especialista } from '../../interfaces/especialista';
import { Paciente } from '../../interfaces/paciente';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [MatDividerModule, MatCheckboxModule, MatTabsModule, MatIconModule, MatSelectModule, MatButtonModule, MatInputModule, MatFormFieldModule,  FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  hide = true;
  formPaciente!: FormGroup;
  formEspecialista!: FormGroup;
  imagenUno: FormControl = new FormControl('', Validators.required);
  imagenDos: FormControl = new FormControl('', Validators.required);
  otraEspecialidad: FormControl = new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(15)]);

  checked: boolean = false;


  // Crear la tabla de especialidad en la bd.
  especialidades = [
    {value: 'A', viewValue: 'A'},
    {value: 'B', viewValue: 'B'},
    {value: 'C', viewValue: 'C'},
    {value: 'otra', viewValue: 'Otra Especialidad'}
  ];

  errorMessage = '';

  constructor( private paciente: FormBuilder, private especialista: FormBuilder, private auth: AuthenticatorService) {
    this.formPaciente = this.paciente.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("",[Validators.required, Validators.minLength(8)]),
      obraSocial: new FormControl("", [Validators.required, Validators.maxLength(25), Validators.pattern('^[a-zA-Z ]+$')]),
      imagenUno: new FormControl("", [Validators.required]),
      imagenDos: new FormControl("", [Validators.required])
    });
    this.formEspecialista = this.especialista.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("",[Validators.required, Validators.minLength(8)]),
      especialidad: new FormControl("", [Validators.required]),
      imagenUno: new FormControl("", [Validators.required]),
    });
  }
  
  clickEvent(event: MouseEvent) {
    this.hide = !this.hide;
    event.stopPropagation();
  }

  handleFileInputChange(event: Event, controlName: string, tipo: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if(tipo == 'espe'){
        this.formEspecialista.get(controlName)?.setValue(file);
      }else if(tipo == 'pac'){    
        this.formPaciente.get(controlName)?.setValue(file);
      }

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
        nombre: "Brian",
        email: "brian@gmail.com",
        password: "1122334455",
        edad: "26",
        apellido: "Suarez",
        dni: "70251756",
        obraSocial: "RNG SEC"
      });

      this.formEspecialista.patchValue({
        nombre: "Brian",
        email: "brian@gmail.com",
        password: "1122334455",
        edad: "26",
        apellido: "Suarez",
        dni: "70251756",
        especialidad: "A"
      });
    } else {
      this.formPaciente.reset();
      this.formEspecialista.reset();
      this.imagenUno.reset();
      this.imagenDos.reset();
    }
  }

  volverASeleccion() {
    this.formEspecialista.get('especialidad')?.setValue('');
  } 
   
  registrarse(tipo: string){

    switch(tipo){
      case "pac":
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

          this.auth.registro(paciente, tipo);

        }else{
          Object.values(this.formPaciente.controls).forEach(control => {
            control.markAsTouched();
          });
        }
        break;
      case "espe":

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
            especialidad: this.formEspecialista.get('especialidad')?.value, 
            imagenUno: this.formEspecialista.get('imagenUno')?.value
          }
          
          this.auth.registro(especialista, tipo);
        }else{
          Object.values(this.formEspecialista.controls).forEach(control => {
            control.markAsTouched();
          });
        }
        break;
      }
  }

  
}
