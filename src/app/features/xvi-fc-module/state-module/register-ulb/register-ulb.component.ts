import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register-ulb',
  imports: [MatButtonModule],
  templateUrl: './register-ulb.component.html',
  styleUrl: './register-ulb.component.scss',
})
export class RegisterUlbComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly yearId = this.route.snapshot.paramMap.get('yearId');

  goBack(): void {
    if (!this.yearId) return;
    this.router.navigate(['/xvifc', this.yearId, 'overview']);
  }
}
