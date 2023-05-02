import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailsRowComponent } from './file-details-row.component';

describe('FileDetailsRowComponent', () => {
  let component: FileDetailsRowComponent;
  let fixture: ComponentFixture<FileDetailsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileDetailsRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileDetailsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
