import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterGetEstimateComponent } from './after-get-estimate.component';

describe('AfterGetEstimateComponent', () => {
  let component: AfterGetEstimateComponent;
  let fixture: ComponentFixture<AfterGetEstimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AfterGetEstimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AfterGetEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
