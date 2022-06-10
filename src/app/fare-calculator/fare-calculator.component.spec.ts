import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareCalculatorComponent } from './fare-calculator.component';

describe('FareCalculatorComponent', () => {
  let component: FareCalculatorComponent;
  let fixture: ComponentFixture<FareCalculatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FareCalculatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FareCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
