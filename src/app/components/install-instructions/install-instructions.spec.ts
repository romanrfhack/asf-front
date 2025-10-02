import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallInstructions } from './install-instructions';

describe('InstallInstructions', () => {
  let component: InstallInstructions;
  let fixture: ComponentFixture<InstallInstructions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallInstructions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallInstructions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
