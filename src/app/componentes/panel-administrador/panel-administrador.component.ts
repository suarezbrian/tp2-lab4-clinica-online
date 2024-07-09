import { Component } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButton, MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import {MatGridListModule} from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  imports: [RegistroAdministradorComponent,RegistroEspecialistaComponent,
    RegistroPacienteComponent, MatSelectModule, MatTabsModule, 
    MatCheckboxModule, MatDividerModule, MatTableModule, MatButtonModule, 
    MatIconModule, CommonModule, MatGridListModule, MatInputModule, MatFormFieldModule,  FormsModule, ReactiveFormsModule, MatButton ],
  templateUrl: './panel-administrador.component.html',
  styleUrl: './panel-administrador.component.css'
})
export class PanelAdministradorComponent {
  administradoresDisplayedColumns: string[] = ['nombre', 'apellido', 'dni', 'edad', 'email', 'fecha_registro', 'password', 'rol', 'rutaArchivoUno'];
  especialistasDisplayedColumns: string[] = ['nombre', 'apellido', 'dni', 'edad', 'email', 'especialidad', 'fecha_registro', 'password', 'rol', 'rutaArchivoUno', 'validarEstado'];
  pacientesDisplayedColumns: string[] = ['nombre', 'apellido', 'dni', 'edad', 'email', 'fecha_registro', 'password', 'rol', 'rutaArchivoUno', 'rutaArchivoDos', 'obraSocial'];
  displayedColumns: string[] = ['nombre', 'apellido', 'dni', 'edad', 'email', 'especialidad', 'fecha_registro', 'password', 'rol', 'rutaArchivoUno', 'rutaArchivoDos', 'obraSocial', 'validarEstado'];

  dataSource: any[] = [];
  selectedUser: any;
  esEspecialista: boolean = false;
  especialistaSeleccionado: any;
  esAdministrador: boolean = false;
  administradores: any[] =[];
  especialistas: any[]=[];
  pacientes: any[]=[];

  dataSourceValidar: any[] = [];
  selection = new SelectionModel<any>(true, []);

  constructor(private datosUsuario: UsuarioService){

  }

  async ngOnInit(){
    this.datosUsuario.obtenerCollection('usuarios').subscribe({
      next: (data: any[]) => {   
        const filterAdministrador = data.filter(element => element.rol === 1);
        const filterEspecialista = data.filter(element => element.rol === 2);
        const filterPaciente = data.filter(element => element.rol === 3);
        this.dataSource = data.map((element) => ({
          ...element,
          fecha_registro: (element.fecha_registro as Timestamp).toDate()
        }));
        this.administradores = filterAdministrador.map((element) => ({
          ...element,
          fecha_registro: (element.fecha_registro as Timestamp).toDate()
        }));
        this.especialistas = filterEspecialista.map((element) => ({
          ...element,
          fecha_registro: (element.fecha_registro as Timestamp).toDate()
        }));
        this.pacientes = filterPaciente.map((element) => ({
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

  async habilitarEstado(element: any) {
    element.validarEstado = true;
    await this.datosUsuario.actualizarColeccion('usuarios', 'email', element.email, element);
    this.actualizarTablaEspecialista();
    element = null;
  }  
}


