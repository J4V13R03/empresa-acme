import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAdd } from './modal-add';

describe('ModalAdd', () => {
  let component: ModalAdd;
  let fixture: ComponentFixture<ModalAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
