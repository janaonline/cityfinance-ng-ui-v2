import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { USER_TYPE } from '../../core/models/user/userType';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  credentials = {
    identifier: '',
    password: '',
  };

  isSubmitting = false;
  errorMessage = '';
  infoMessage = this.route.snapshot.queryParamMap.get('message') || '';

  submitLogin() {
    if (this.isSubmitting) {
      return;
    }

    if (!this.credentials.identifier.trim() || !this.credentials.password.trim()) {
      this.errorMessage = 'Email or census code and password are required.';
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isSubmitting = true;

    const identifier = this.credentials.identifier.trim();
    const loginPayload = this.buildLoginPayload(identifier);

    this.authService
      .login(loginPayload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response: any) => {
          const currentUser =
            this.authService.extractUser(response) || this.authService.getCurrentUserSnapshot();

          void this.navigateAfterLogin(currentUser);
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to sign in. Please try again.';
          this.authService.badCredentials.next(true);
        },
      });
  }

  private buildLoginPayload(identifier: string) {
    const payload: { password: string; email: string; type: string } = {
      password: this.credentials.password,
      email: this.credentials.identifier.trim(),
      type: "15thFC"
    };

    return payload;
  }

  private async navigateAfterLogin(currentUser: IUserLoggedInDetails | null) {
    const postLoginNavigation = sessionStorage.getItem('postLoginNavigation');
    if (postLoginNavigation) {
      sessionStorage.removeItem('postLoginNavigation');
      await this.router.navigateByUrl(postLoginNavigation);
      return;
    }

    if (currentUser?.role === USER_TYPE.ULB) {
      await this.router.navigate(['/xvifc-form']);
      return;
    }

    if ([USER_TYPE.XVIFC, USER_TYPE.XVIFC_STATE].includes(currentUser?.role as USER_TYPE)) {
      await this.router.navigate(['/admin']);
      return;
    }

    await this.router.navigate(['/cfr']);
  }
}
