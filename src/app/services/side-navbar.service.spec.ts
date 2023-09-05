import { TestBed } from '@angular/core/testing';

import { SideNavbarService } from './side-navbar.service';

describe('SideNavbarService', () => {
  let service: SideNavbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideNavbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
