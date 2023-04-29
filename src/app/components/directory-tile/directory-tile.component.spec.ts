import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryTileComponent } from './directory-tile.component';

describe('DirectoryTileComponent', () => {
  let component: DirectoryTileComponent;
  let fixture: ComponentFixture<DirectoryTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectoryTileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
