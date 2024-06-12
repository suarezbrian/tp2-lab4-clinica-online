import { Routes } from '@angular/router';

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
    }


];
