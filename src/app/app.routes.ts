import { Routes } from '@angular/router';
import { authGuard } from './guard/guard.guard';

export enum Rol {
    Administrador = 1,
    Especialista = 2,
    Paciente = 3
}

export const routes: Routes = [


    {
        path: '',
        redirectTo: '/bienvenida',
        pathMatch: 'full'
    },
    {
        path: 'bienvenida',
        loadComponent:()=> import('./componentes/bienvenida/bienvenida.component').then(c => c.BienvenidaComponent)
    },
    {
        path: 'registro',
        loadComponent:()=> import('./componentes/registro/registro.component').then(c => c.RegistroComponent)
    },
    {
        path: 'login',
        loadComponent:()=> import('./componentes/login/login.component').then(c => c.LoginComponent)
    },
    {
        path: 'panel-administrador',
        loadComponent:()=> import('./componentes/panel-administrador/panel-administrador.component').then(c => c.PanelAdministradorComponent),
        canActivate: [authGuard],
        data: { rolesPermitidos: [Rol.Administrador] }
    },
    {
        path: 'mis-turnos',
        loadComponent:()=> import('./componentes/turno/turno.component').then(c => c.TurnoComponent),
        canActivate: [authGuard],
        data: { rolesPermitidos: [Rol.Paciente,Rol.Administrador,Rol.Especialista] }
    },
    {
        path: 'solicitar-turnos',
        loadComponent:()=> import('./componentes/turno/solicitar-turno/solicitar-turno.component').then(c => c.SolicitarTurnoComponent),
        canActivate: [authGuard],
        data: { rolesPermitidos: [Rol.Paciente,Rol.Administrador] }
    },
    {
        path: 'mi-perfil',
        loadComponent:()=> import('./componentes/perfil/perfil.component').then(c => c.PerfilComponent),
        canActivate: [authGuard],
        data: { rolesPermitidos: [Rol.Paciente,Rol.Administrador, Rol.Especialista] }
    }


];
