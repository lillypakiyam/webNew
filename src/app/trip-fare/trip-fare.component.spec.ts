import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripFareComponent } from './trip-fare.component';

describe('TripFareComponent', () => {
  let component: TripFareComponent;
  let fixture: ComponentFixture<TripFareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TripFareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripFareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
