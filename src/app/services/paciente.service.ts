import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  pacienteCollection: Paciente[] = []; 
  respCollection: any;
  subscription!: Subscription;

  private storage = getStorage();

  private _pacienteCollection: BehaviorSubject<Paciente[] | null> = new BehaviorSubject<Paciente[] | null>(null);
  pacienteCollection$ = this._pacienteCollection.asObservable();

  constructor(
    private firestore: Firestore
  ) { 
    this.obtenerPacienteCollection();   
  }

  obtenerPacienteCollection(): Observable<Paciente[]> {
    let pacienteCollection = collection(this.firestore, 'pacientes');

    const observable = collectionData(pacienteCollection);

    const pacienteSubject = new Subject<Paciente[]>();

    this.subscription = observable.subscribe((respuesta: any) => {
        this.respCollection = respuesta;
       
        for (let i = 0; i < respuesta.length; i++) {
          
          let paciente: Paciente = {
            nombre: this.respCollection[i].nombre,
            apellido: this.respCollection[i].apellido,
            edad: this.respCollection[i].edad,
            dni: this.respCollection[i].dni,
            email: this.respCollection[i].email,
            fecha_registro: new Date(this.respCollection[i].fecha_registro.seconds * 1000),
            rol: this.respCollection[i].rol,
            password: this.respCollection[i].password,
            obraSocial: this.respCollection[i].obraSocial,
            rutaArchivoUno: this.respCollection[i].rutaArchivoUno,
            rutaArchivoDos: this.respCollection[i].rutaArchivoDos
          };

          this.pacienteCollection.push(paciente);
        } 

        this._pacienteCollection.next(this.pacienteCollection);        
        pacienteSubject.next(this.pacienteCollection);
        pacienteSubject.complete(); 
    });   

    return pacienteSubject.asObservable(); 
  }

  async guardarPaciente(pacienteData: Paciente) {
    try {
      let filePathUno = '';
      let filePathDos = '';
      
      if (pacienteData.imagenUno) {
        filePathUno = `pacientes/${pacienteData.imagenUno.name}`;
        const fileRefUno = ref(this.storage, filePathUno);
        await uploadBytesResumable(fileRefUno, pacienteData.imagenUno);
      }

      if (pacienteData.imagenDos) {
        filePathDos = `pacientes/${pacienteData.imagenDos.name}`;
        const fileRefDos = ref(this.storage, filePathDos);
        await uploadBytesResumable(fileRefDos, pacienteData.imagenDos);
      }

      const dataPaciente: Partial<Paciente> = {
        nombre: pacienteData.nombre,
        apellido: pacienteData.apellido,
        edad: pacienteData.edad,
        dni: pacienteData.dni,
        email: pacienteData.email,
        fecha_registro: pacienteData.fecha_registro,
        rol: pacienteData.rol,
        password: pacienteData.password,
        obraSocial: pacienteData.obraSocial,
        rutaArchivoUno: filePathUno, 
        rutaArchivoDos: filePathDos  
      };

      const pacienteCollection = collection(this.firestore, 'pacientes');
      await addDoc(pacienteCollection, dataPaciente);
      
    } catch (error) {
      console.error('Error al guardar los datos del paciente:', error);
      throw error;
    }
  }


  get getUsuarioCollection(): Paciente[] | null  {
    return this._pacienteCollection.getValue();
  }

  set setUsuarioCollection(valor: Paciente[] | null) {
    this._pacienteCollection.next(valor);
  }
}
