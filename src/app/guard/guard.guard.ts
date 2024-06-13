import { CanActivateFn, Router } from '@angular/router';
import { SharedServiceService } from '../services/shared-service.service';
import { AlertsService } from '../services/alerts.service';
import { inject } from '@angular/core';
import { from, map, switchMap, take, tap } from 'rxjs';
import { AuthenticatorService } from '../services/authenticator.service';

export const authGuard: CanActivateFn = (route, state) => {
  const sharedService = inject(SharedServiceService);
  const router = inject(Router);
  const alertService = inject(AlertsService);
  const verificarAuth = inject(AuthenticatorService);

  const rolesPermitidos: number[] = route.data['rolesPermitidos'];

  return from(verificarAuth.verificarEstadoAuth()).pipe(
    switchMap(() => sharedService.estadoCompartido$.pipe(
      take(1),
      map(({ estaLogeado, usuarioLogeado }) => ({
        estaLogeado,
        rol: usuarioLogeado?.rol
      })),
      tap(({ estaLogeado, rol }) => {
        if (!estaLogeado) {
          router.navigate(['/bienvenida']);
          alertService.mostrarAlerta(false, 'Por favor inicia sesión', 2000);
        } else if (!rolesPermitidos.includes(rol)) {
          router.navigate(['/bienvenida']);
          alertService.mostrarAlerta(false, 'Permiso denegado.', 2000);
        }
      }),
      map(({ estaLogeado, rol }) => estaLogeado && rolesPermitidos.includes(rol))
    ))
  ); 
  
};

