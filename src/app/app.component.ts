import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { AuthenticatorService } from './services/authenticator.service';
import { CommonModule } from '@angular/common';
import { SharedServiceService } from './services/shared-service.service';
import { SpinnerComponent } from './componentes/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tp-lab4-clinica-online';
  isLoading = true;
  constructor(private auth: AuthenticatorService, private shared: SharedServiceService){}

  async ngOnInit(){
    await this.auth.verificarEstadoAuth(); 
    this.isLoading = false;
  }

}
