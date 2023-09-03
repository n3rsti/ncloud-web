import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextMenuFieldComponent } from './context-menu-field.component';

describe('ContextMenuFieldComponent', () => {
  let component: ContextMenuFieldComponent;
  let fixture: ComponentFixture<ContextMenuFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextMenuFieldComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContextMenuFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
