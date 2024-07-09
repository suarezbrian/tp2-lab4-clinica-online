import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteEspComponent } from './paciente-esp.component';

describe('PacienteEspComponent', () => {
  let component: PacienteEspComponent;
  let fixture: ComponentFixture<PacienteEspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteEspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacienteEspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
