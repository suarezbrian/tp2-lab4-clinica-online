import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSelectPaciente]',
  standalone: true
})
export class SelectPacienteDirective {

  @Input('appSelectPaciente') paciente: any;
  @Input() pacienteSeleccionado: any;

  constructor(private element: ElementRef, private renderer: Renderer2) {}

  @HostListener('click') onMouseClick() {
    if (this.pacienteSeleccionado === this.paciente) {
      this.pacienteSeleccionado = null;
    } else {
      this.pacienteSeleccionado = this.paciente;
    }
    this.updateStyle();
  }

  ngOnChanges() {
    this.updateStyle();
  }

  private updateStyle() {
    if (this.pacienteSeleccionado === this.paciente) {
      this.renderer.setStyle(this.element.nativeElement, 'border', '3px solid #007bff');
    } else {
      this.renderer.removeStyle(this.element.nativeElement, 'border');
    }
  }
}
