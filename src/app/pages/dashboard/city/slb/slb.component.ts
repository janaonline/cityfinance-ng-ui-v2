import { CommonModule } from '@angular/common';
import { Component, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { ButtonObj } from '../../../../core/models/interfaces';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';

@Component({
  selector: 'app-slb',
  standalone: true,
  imports: [CommonModule, TabButtonsComponent, ReactiveFormsModule, NoDataFoundComponent],
  templateUrl: './slb.component.html',
  styleUrl: './slb.component.scss',
})
export class SlbComponent implements OnInit, OnDestroy {
  // Input from parent.
  readonly ulbId = input.required<string>();
  readonly years = input.required<string[]>();

  readonly buttons: ButtonObj[] = [
    { key: 'waterSupply', label: 'Water Supply' },
    { key: 'wasteWaterManagement', label: 'Waste Water Management' },
    { key: 'solidWasteManagement', label: 'Solid Waste Management' },
    { key: 'stormWaterDrainage', label: 'Storm Water Drainage' },
  ];
  currentSelectedButtonKey = signal<string>('');
  myForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    // this.myForm = this.fb.group({ year: [''] });
    this.initializeForm();

    console.log('slb yeas in child: ', this.years());
  }

  private initializeForm(): void {
    this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.subscriptions.push(
      this.myForm.get('year')!.valueChanges.subscribe(() => this.getSlbData()),
    );
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
  }

  get year() {
    return this.myForm.get('year')?.value;
  }

  private getSlbData(): void {
    console.log('Get slb data', this.year);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
