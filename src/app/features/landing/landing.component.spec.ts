import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LandingComponent } from './landing.component';
import { AuthService } from '../../core/services/auth.service';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  async function createComponent(): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, HttpClientTestingModule],
      // AuthService is a plain @Injectable (app.config.ts provides it), not providedIn: 'root' —
      // an isolated component test needs it listed explicitly or DI can't construct it.
      providers: [provideRouter([]), AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  it('should create', async () => {
    await createComponent();
    expect(component).toBeTruthy();
  });

  it('shows only the "coming soon" cards when no role is known', async () => {
    await createComponent();

    expect(component['cards']().map((c) => c.title)).toEqual([
      'Announcements',
      'XV-FC Data Review',
      'Discussion Board',
      'Public Disclosure',
    ]);
  });

  it('shows XVI-FC and XV-FC Grants, but not Municipal Data Hub, for a ULB outside the pilot states', async () => {
    localStorage.setItem('userData', JSON.stringify({ role: 'ULB', name: 'Test ULB', stateName: 'Bihar' }));
    await createComponent();

    const titles = component['cards']().map((c) => c.title);
    expect(titles).toContain('XVI-FC Grants');
    expect(titles).toContain('XV-FC Grants');
    expect(titles).not.toContain('Municipal Data Hub');
  });

  it('shows Municipal Data Hub for MoHUA regardless of state', async () => {
    localStorage.setItem('userData', JSON.stringify({ role: 'MoHUA', name: 'Test MoHUA' }));
    await createComponent();

    expect(component['cards']().map((c) => c.title)).toContain('Municipal Data Hub');
  });

  it('shows Municipal Data Hub for a ULB in a pilot state', async () => {
    localStorage.setItem(
      'userData',
      JSON.stringify({ role: 'ULB', name: 'Test ULB', stateName: 'Kerala' }),
    );
    await createComponent();

    expect(component['cards']().map((c) => c.title)).toContain('Municipal Data Hub');
  });
});
