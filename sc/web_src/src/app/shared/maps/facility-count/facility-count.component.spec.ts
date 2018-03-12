import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityCountComponent } from './facility-count.component';

describe('FacilityCountComponent', () => {
  let component: FacilityCountComponent;
  let fixture: ComponentFixture<FacilityCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacilityCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
