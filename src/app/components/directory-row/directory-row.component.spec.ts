import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryRowComponent } from './directory-row.component';

describe('DirectoryRowComponent', () => {
  let component: DirectoryRowComponent;
  let fixture: ComponentFixture<DirectoryRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectoryRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
