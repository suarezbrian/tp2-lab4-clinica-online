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
import { Administrador } from '../../interfaces/administrador';
import { AuthenticatorService } from '../../services/authenticator.service';

@Component({
  selector: 'app-registro-administrador',
  standalone: true,
  imports: [MatSelectModule, MatTabsModule, MatCheckboxModule, MatDividerModule, MatTableModule, MatButtonModule, MatIconModule, CommonModule, MatGridListModule, MatInputModule, MatFormFieldModule,  FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registro-administrador.component.html',
  styleUrl: './registro-administrador.component.css'
})
export class RegistroAdministradorComponent {

  imagenUno: FormControl = new FormControl('', Validators.required);
  formAdministrador!: FormGroup;
  checked: boolean = false;

  constructor(private administrador: FormBuilder, private auth: AuthenticatorService){
    this.formAdministrador = this.administrador.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]+$')]),
      imagenUno: new FormControl("", [Validators.required])
    });
  }

  handleFileInputChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];      
      this.formAdministrador.get(controlName)?.setValue(file);     
      this.imagenUno.setValue(file.name); 
    }
  }

  registrarAdministrador(){
    if (this.formAdministrador.valid) { 
            
      const administrador: Administrador = {
        nombre: this.formAdministrador.get('nombre')?.value,
        apellido: this.formAdministrador.get('apellido')?.value,
        edad: this.formAdministrador.get('edad')?.value,
        dni: this.formAdministrador.get('dni')?.value,
        email: this.formAdministrador.get('email')?.value,
        fecha_registro: new Date(),
        rol: 1, 
        password: this.formAdministrador.get('password')?.value,
        imagenUno: this.formAdministrador.get('imagenUno')?.value,
      }
      this.auth.registro(administrador, 'adm');
      this.formAdministrador.reset();
      this.imagenUno.reset();

    }else{
      Object.values(this.formAdministrador.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
  

  onCheckboxChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.formAdministrador.patchValue({
        nombre: "Adminitrador",
        email: "brian44330@gmail.com",
        password: "1122334455",
        edad: "20",
        apellido: "Alfa",
        dni: "50251756",
      });
    } else {
      this.formAdministrador.reset();
      this.imagenUno.reset();
    }
  }
  

}
