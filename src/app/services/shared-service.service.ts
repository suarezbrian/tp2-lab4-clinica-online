import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedServiceService {

  constructor() { }
  
  private _estadoCompartido: BehaviorSubject<{ estaLogeado: boolean, usuarioLogeado: any }> = new BehaviorSubject<{ estaLogeado: boolean, usuarioLogeado: any }>({
    estaLogeado: false,
    usuarioLogeado: null
  });

  estadoCompartido$ = this._estadoCompartido.asObservable();

  get estadoCompartido() {
    return this._estadoCompartido.getValue();
  }

  set estadoCompartido(valor: { estaLogeado: boolean, usuarioLogeado: any }) {
    this._estadoCompartido.next(valor);
  }

  set estaLogeado(valor: boolean) {
    const estadoActual = this.estadoCompartido;
    this._estadoCompartido.next({ ...estadoActual, estaLogeado: valor });
  }

  get estaLogeado(): boolean {
    return this.estadoCompartido.estaLogeado;
  }

  set usuarioLogeado(valor: any) {
    const estadoActual = this.estadoCompartido;
    this._estadoCompartido.next({ ...estadoActual, usuarioLogeado: valor });
  }

  get usuarioLogeado(): any {
    return this.estadoCompartido.usuarioLogeado;
  }

  private _mostrarHistoriaClinica: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  mostrarHistoriaClinica$ = this._mostrarHistoriaClinica.asObservable();

  get mostrarHistoriaClinica(): boolean {
    return this._mostrarHistoriaClinica.getValue();
  }

  set mostrarHistoriaClinica(valor: boolean) {
    this._mostrarHistoriaClinica.next(valor);
  }

  private cargarTurnosSubject = new BehaviorSubject<boolean>(false);
  cargarTurnos$ = this.cargarTurnosSubject.asObservable();

  triggerCargarTurnos() {
    this.cargarTurnosSubject.next(true);
  }

}
