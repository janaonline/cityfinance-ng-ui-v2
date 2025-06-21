import { CommonModule } from '@angular/common';
import { Component, effect, Input, input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import {
  debounceTime,
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { Ulbs } from '../../../pages/home/dashboard-map-section/interfaces';

@Component({
  selector: 'app-city-search',
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatOptionModule],
  template: ` <form [formGroup]="myForm" class="d-flex gap-2">
    <input
      type="text"
      class="input-box-style"
      placeholder="Search for ULBs"
      matInput
      formControlName="ulbName"
      id="ulbName"
      [matAutocomplete]="auto"
    />
    <mat-autocomplete autoActiveFirstOption #auto="matAutocomplete">
      @if (filteredUlbs) {
        @for (option of filteredUlbs | async; track $index) {
          <mat-option [value]="option?.name" (onSelectionChange)="onCitySelection(option)">
            <small>{{ option?.name }}</small>
          </mat-option>
        }
        @if (noDataFound) {
          <mat-option class="text-muted" disabled>No results found for your search.</mat-option>
        }
      }
    </mat-autocomplete>
  </form>`,
  styleUrls: [],
})
export class CitySearchComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {}

  selectCity = input<(city: Ulbs) => void>();
  cityName = input<string>('');
  stateId = input<string>('');
  isCityReadonly = input<boolean>(false);

  private destroy$ = new Subject<void>();
  public myForm: FormGroup = this.fb.group({ ulbName: [''], disabled: false });
  public noDataFound: boolean = true;
  public filteredUlbs!: Observable<Ulbs[]>;

  ngOnInit(): void {
    this.searchUlb();
  }

  readonly manageReadonlyUlbEffect = effect(() => {
    if (this.isCityReadonly()) this.ulbNameControl.disable();
    else this.ulbNameControl.enable();
  });

  // Effect to manage formControl - disabled ulb
  get ulbNameControl(): FormControl {
    return this.myForm.get('ulbName') as FormControl;
  }

  // Search ULBs.
  private searchUlb(): void {
    this.ulbNameControl?.valueChanges
      ?.pipe(
        takeUntil(this.destroy$),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) => {
          if (!value) {
            this.noDataFound = false;
            return of([]);
          }
          console.log('call ulb api:', value, this.stateId());
          return this._commonService.postGlobalSearchData(value, 'ulb', this.stateId());
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.filteredUlbs = of(res?.['data']);
          this.noDataFound = res?.['data']?.length === 0;
        },
        error: (error) => console.error('Error in fetching ulbs: ', error),
      });
  }

  // Get ulb data.
  public onCitySelection(cityObj: Ulbs): void {
    console.log('city clicked; ', cityObj);
    const callback = this.selectCity();
    if (callback) callback(cityObj);
  }

  // update ulb from name effect,
  readonly updateUlbFromNameEffect = effect(() => {
    this.myForm.patchValue({ ulbName: this.cityName() });
    console.log('Value of ULB sent by parent to child: ', this.stateId(), this.cityName());
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
