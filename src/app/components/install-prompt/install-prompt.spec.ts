import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallPrompt } from './install-prompt';

describe('InstallPrompt', () => {
  let component: InstallPrompt;
  let fixture: ComponentFixture<InstallPrompt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallPrompt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallPrompt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
