import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHover]',
  standalone: true
})
export class HoverDirective {

  constructor(private element: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.setScale(1.1);
    this.setBoxShadow('0 4px 8px rgba(0, 0, 0, 0.2)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.setScale(1.0);
    this.setBoxShadow('none');
  }

  private setScale(scale: number) {
    this.renderer.setStyle(this.element.nativeElement, 'transform', `scale(${scale})`);
  }

  private setBoxShadow(shadow: string) {
    this.renderer.setStyle(this.element.nativeElement, 'box-shadow', shadow);
  }

}
