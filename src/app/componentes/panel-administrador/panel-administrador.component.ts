import { Component, ElementRef, ViewChild } from '@angular/core';
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


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
  @ViewChild('content') content!: ElementRef;

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


  generarExcel(): void {

    const administradoresData = this.administradores.map(usuario => ({
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      DNI: usuario.dni,
      Edad: usuario.edad,
      Email: usuario.email,
      Fecha_Registro: usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : '',
      Password: usuario.password,
      Rol: this.obtenerRol(usuario.rol),
      Ruta_Archivo_Uno: usuario.rutaArchivoUno || '',
    }));
  
    const especialistasData = this.especialistas.map(usuario => ({
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      DNI: usuario.dni,
      Edad: usuario.edad,
      Email: usuario.email,
      Especialidad: usuario.especialidades || '(N/A)',
      Fecha_Registro: usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : '',
      Password: usuario.password,
      Rol: this.obtenerRol(usuario.rol),
      Ruta_Archivo_Uno: usuario.rutaArchivoUno || '',
      Validar_Estado: usuario.validarEstado ? 'Si' : 'No',
    }));
  
    const pacientesData = this.pacientes.map(usuario => ({
      Nombre: usuario.nombre,
      Apellido: usuario.apellido,
      DNI: usuario.dni,
      Edad: usuario.edad,
      Email: usuario.email,
      Fecha_Registro: usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString() : '',
      Password: usuario.password,
      Rol: this.obtenerRol(usuario.rol),
      Ruta_Archivo_Uno: usuario.rutaArchivoUno || '',
      Ruta_Archivo_Dos: usuario.rutaArchivoDos || '(N/A)',
      Obra_Social: usuario.obraSocial || '(N/A)',
    }));
  
    const administradoresSheet = XLSX.utils.json_to_sheet(administradoresData);
    const especialistasSheet = XLSX.utils.json_to_sheet(especialistasData);
    const pacientesSheet = XLSX.utils.json_to_sheet(pacientesData);
  
    const workbook = {
      Sheets: {
        'Administradores': administradoresSheet,
        'Especialistas': especialistasSheet,
        'Pacientes': pacientesSheet
      },
      SheetNames: ['Administradores', 'Especialistas', 'Pacientes']
    };  
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });  
    this.guardarExcel(excelBuffer, 'usuarios');
  }

  guardarExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName + '_' + new Date().getTime() + '.xlsx');
  }

  obtenerRol(rol: number): string {
    switch (rol) {
      case 1: return 'Administrador';
      case 2: return 'Especialista';
      case 3: return 'Paciente';
      default: return '(N/A)';
    }
  }
  async ngOnInit(){
    this.datosUsuario.obtenerCollection('usuarios').subscribe({
      next: (data: any[]) => {   
        const filterAdministrador = data.filter(element => element.rol === 1);
        const filterEspecialista = data.filter(element => element.rol === 2);
        const filterPaciente = data.filter(element => element.rol === 3);
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


