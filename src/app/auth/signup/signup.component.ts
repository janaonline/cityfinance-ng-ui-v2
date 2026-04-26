import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type LoginType = '16thFC' | '15thFC';

interface StateOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly isLoadingStates = signal(false);
  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);

  readonly typeKey = signal<LoginType | null>(null);
  readonly states = signal<StateOption[]>([]);

  readonly signupForm = this.fb.nonNullable.group({
    stateId: ['', [Validators.required]],
    ulbName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    contactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  });

  ngOnInit(): void {
    const type = this.route.snapshot.queryParamMap.get('type');

    this.typeKey.set(type === '16thFC' || type === '15thFC' ? type : '16thFC');
    this.loadStates();
  }

  loadStates(): void {
    this.isLoadingStates.set(true);

    // TODO: Replace with your real API
    // Example:
    // this.http.get<StateOption[]>('http://localhost:3001/api/v2/states').subscribe(...)

    setTimeout(() => {
      this.states.set([
        { id: '1', name: 'Andhra Pradesh' },
        { id: '2', name: 'Karnataka' },
        { id: '3', name: 'Tamil Nadu' },
        { id: '4', name: 'Kerala' },
        { id: '5', name: 'Maharashtra' },
      ]);
      this.isLoadingStates.set(false);
    }, 700);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const payload = this.signupForm.getRawValue();

    // TODO: Replace with your real API
    // Example:
    // this.http.post('http://localhost:3001/api/v2/xvi-fc/signup-request', payload).subscribe(...)

    setTimeout(() => {
      console.log('ULB signup payload', payload);
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      this.signupForm.disable();
    }, 1000);
  }

  onBackToLogin(): void {
    const type = this.typeKey();

    this.router.navigate(['/login'], {
      queryParams: type ? { type } : {},
    });
  }
}
