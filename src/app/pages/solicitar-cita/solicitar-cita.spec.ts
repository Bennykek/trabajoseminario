import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitarCita } from './solicitar-cita';

describe('SolicitarCita', () => {
  let component: SolicitarCita;
  let fixture: ComponentFixture<SolicitarCita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarCita],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitarCita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
