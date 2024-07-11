import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import { UsuarioService } from '../../services/usuario.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { fadeAnimation, salidaAnimation } from '../../animations.component';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatDividerModule, SpinnerComponent, CommonModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css',
  animations: [fadeAnimation, salidaAnimation]

})
export class BienvenidaComponent {

  isLoading = true;
  imagenes: string[] = [
    "iconos/bienvenida/primeraImagen.png",
    "iconos/bienvenida/segundaImagen.png",
    "iconos/bienvenida/terceraImagen.png",
    "iconos/bienvenida/cuartaImagen.png",
    "iconos/bienvenida/quintaImagen.png"
  ];

  constructor(private usuarioService: UsuarioService){                                                         
  }


  async ngOnInit() {
    await this.loadImages(this.imagenes);
    this.isLoading = false; 
  }

  private async loadImages(imageUrls: string[]) {
    await Promise.all(imageUrls.map(async (imageUrl, index) => {
      let storedImage = localStorage.getItem(imageUrl);

      if (!storedImage) {
        storedImage = await this.usuarioService.obtenerImagen(imageUrl);
        localStorage.setItem(imageUrl, storedImage);
      }

      this.imagenes[index] = storedImage;
    }));
  }

}
