import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailsRowComponent } from './item-details-row.component';

describe('ItemDetailsRowComponent', () => {
  let component: ItemDetailsRowComponent;
  let fixture: ComponentFixture<ItemDetailsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemDetailsRowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemDetailsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
