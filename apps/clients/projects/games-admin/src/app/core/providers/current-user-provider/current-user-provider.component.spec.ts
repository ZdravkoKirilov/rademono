import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserProviderComponent } from './current-user-provider.component';

describe('CurrentUserProviderComponent', () => {
  let component: CurrentUserProviderComponent;
  let fixture: ComponentFixture<CurrentUserProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentUserProviderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentUserProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
