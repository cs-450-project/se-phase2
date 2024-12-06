import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageCostComponent } from './package-cost.component';

describe('PackageCostComponent', () => {
  let component: PackageCostComponent;
  let fixture: ComponentFixture<PackageCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
