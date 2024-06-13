import { Component } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import {MatGridListModule} from '@angular/material/grid-list';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import {MatTabsModule} from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { RegistroPacienteComponent } from '../registro/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../registro/registro-especialista/registro-especialista.component';
import { RegistroAdministradorComponent } from '../registro-administrador/registro-administrador.component';

@Component({
  selector: 'app-panel-administrador',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  standalone: true,
  imports: [RegistroAdministradorComponent,RegistroEspecialistaComponent,RegistroPacienteComponent, MatSelectModule, MatTabsModule, MatCheckboxModule, MatDividerModule, MatTableModule, MatButtonModule, MatIconModule, CommonModule, MatGridListModule, MatInputModule, MatFormFieldModule,  FormsModule, ReactiveFormsModule],
  templateUrl: './panel-administrador.component.html',
  styleUrl: './panel-administrador.component.css'
})
export class PanelAdministradorComponent {
  displayedColumns: string[] = ['nombre', 'apellido', 'dni', 'edad', 'email', 'especialidad', 'fecha_registro', 'password', 'rol', 'rutaArchivoUno', 'rutaArchivoDos', 'obraSocial', 'validarEstado'];
  dataSource: any[] = [];
  selectedUser: any;
  esEspecialista: boolean = false;
  especialistaSeleccionado: any;
  esAdministrador: boolean = false;


  displayedColumnsEspecialista: string[] = ['nombre', 'apellido', 'dni', 'email', 'especialidad', 'validarEstado'];
  dataSourceValidar: any[] = [];
  selection = new SelectionModel<any>(true, []);
  formEdit!: FormGroup;

    // Crear la tabla de especialidad en la bd.
    especialidades = [
      {value: 'A', viewValue: 'A'},
      {value: 'B', viewValue: 'B'},
      {value: 'C', viewValue: 'C'},
      {value: 'otra', viewValue: 'Otra Especialidad'}
    ];

  constructor(private datosUsuario: UsuarioService, private fb: FormBuilder){
    this.formEdit = this.fb.group({
      nombre: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(5)]),
      edad: new FormControl("", [Validators.required, Validators.min(1)]),
      apellido: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl("", [Validators.required, Validators.minLength(8), Validators.pattern('^[0-9]+$')]),
      especialidad: new FormControl("", [Validators.required]),
      otraEspecialidad: new FormControl("", [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z]+$')]),
      obraSocial: new FormControl("", [Validators.required, Validators.maxLength(25), Validators.pattern('^[a-zA-Z ]+$')]),
      rol: new FormControl("", [Validators.required, Validators.min(1), Validators.max(1)]),
    });
  }

  async ngOnInit(){
    this.datosUsuario.obtenerCollection('usuarios').subscribe({
      next: (data: any[]) => {   
        this.dataSource = data.map((element) => ({
          ...element,
          fecha_registro: (element.fecha_registro as Timestamp).toDate()
        }));
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    });

    this.actualizarTablaEspecialista();

  }

  handleClick(clickedRow: any) {
    
    console.log('Clicked on:', clickedRow.rol);

    if(clickedRow.rol == 2){
      this.esEspecialista = true;
      this.esAdministrador = false;

    }else if(clickedRow.rol == 3){
      this.esEspecialista = false;
      this.esAdministrador = false;
    }else if(clickedRow.rol == 1){
      this.esAdministrador = true;
    }else{
      this.esAdministrador = false;
    }

    this.selectedUser = clickedRow;
  }

  async habilitarEspecialista(){

    this.especialistaSeleccionado.validarEstado = true;
    await this.datosUsuario.actualizarColeccion('usuarios', 'email', this.especialistaSeleccionado.email, this.especialistaSeleccionado);
    this.actualizarTablaEspecialista();
    this.especialistaSeleccionado = null;

  }

  seleccionarEspecialista(clickedRow: any){
    this.especialistaSeleccionado = clickedRow;
  }

  async actualizarDatos() {

  if (this.formEdit.valid) 
  {             
    await this.datosUsuario.actualizarColeccion('usuarios', 'email', this.selectedUser.email,this.selectedUser);
    this.selectedUser = null; 

  }else{
    Object.values(this.formEdit.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  }

  actualizarTablaEspecialista(){

    this.datosUsuario.buscarVariosDatosPorCampo('usuarios', 'validarEstado', false)
    .then((usuarios: any[]) => {
      this.dataSourceValidar = usuarios.map((element) => ({
        ...element,
        fecha_registro: (element.fecha_registro as Timestamp).toDate()
      }));
    })
    .catch((error) => {
      console.error('Error al buscar usuarios:', error);
    });
  }

  volverASeleccion() {
    this.formEdit.get('especialidad')?.setValue('');
  } 

  
}


