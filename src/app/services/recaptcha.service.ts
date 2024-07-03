import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  
  private apiUrl = 'http://0.0.0.0:5000/api/v1/verificar/';
  private claveSecreta = '6Lcg2AYqAAAAAB2Sb9ckMqzzu3H21R2z6Iqi6h_u'; 

  constructor(private http: HttpClient) {}

  verificarToken(token: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<any>(`${this.apiUrl}${token}/`, httpOptions).pipe(
      catchError((error) => {
        console.error('Error en la verificación del token reCAPTCHA:', error);
        return throwError(error);
      })
    );
  }

}
