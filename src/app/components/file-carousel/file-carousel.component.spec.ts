import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileCarouselComponent } from './file-carousel.component';

describe('FileCarouselComponent', () => {
  let component: FileCarouselComponent;
  let fixture: ComponentFixture<FileCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileCarouselComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
