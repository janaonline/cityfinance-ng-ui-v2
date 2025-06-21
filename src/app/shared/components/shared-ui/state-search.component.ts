import { AsyncPipe } from '@angular/common';
import { Component, effect, input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { CommonService } from '../../../core/services/common.service';
import { States } from '../../../pages/home/dashboard-map-section/interfaces';

@Component({
  selector: 'app-state-search',
  imports: [MatAutocompleteModule, ReactiveFormsModule, AsyncPipe],
  template: ` <form [formGroup]="myForm" class="d-flex gap-2">
    <input
      type="text"
      placeholder="Search for State"
      matInput
      formControlName="stateName"
      id="stateName"
      [matAutocomplete]="auto"
      class="input-box-style"
      [class.custom-readonly-input]="isStateReadonly()"
    />
    <mat-autocomplete #auto="matAutocomplete">
      @for (option of filteredStates | async; track $index) {
        <mat-option [value]="option?.name" (onSelectionChange)="onStateSelection(option)">
          <span>{{ option?.name }}</span>
        </mat-option>
      }
      @if (noDataFound) {
        <mat-option class="text-muted" disabled>No results found for your search.</mat-option>
      }
    </mat-autocomplete>
  </form>`,
  styles: [],
})
export class StateSearchComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {}

  // Inputs as signals
  selectState = input<(state: States) => void>();
  stateId = input<string>();
  isStateReadonly = input<boolean>(false);

  private destroy$ = new Subject<void>();
  public myForm: FormGroup = this.fb.group({
    stateName: [{ value: '', disabled: false }],
  });

  public noDataFound: boolean = true;
  public stateList!: States[];
  public filteredStates: Observable<States[]> = of([]);

  ngOnInit(): void {
    this.fetchStateList();
  }

  // Effect to manage formControl - disabled state
  readonly manageReadonlyStateEffect = effect(() => {
    if (this.isStateReadonly()) this.stateNameControl.disable();
    else this.stateNameControl.enable();
  });

  get stateNameControl(): FormControl {
    return this.myForm.get('stateName') as FormControl;
  }

  // Get states list.
  private fetchStateList() {
    this._commonService
      .fetchStateList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: States[]) => {
          this.stateList = res;

          this.filteredStates = this.stateNameControl.valueChanges.pipe(
            takeUntil(this.destroy$),
            startWith(''),
            debounceTime(300),
            distinctUntilChanged(),
            map((value) => {
              const result = this._filterStates(value || '');
              this.noDataFound = result.length === 0;
              return result;
            }),
          );
        },
      });
  }

  // Helper: To filter states.
  private _filterStates(value: string): States[] {
    const filterValue = value?.toLowerCase();
    return !filterValue
      ? this.stateList
      : this.stateList?.filter((option) => option.name?.toLowerCase().includes(filterValue));
  }

  // Action when state is selected from drop down.
  public onStateSelection(state: States): void {
    // Update parent.
    const callback = this.selectState();
    if (callback) callback(state);

    console.log('state clicked; ', state);
  }

  // Update State From Id Effect
  readonly updateStateFromIdEffect = effect(() => {
    console.log('Value of state sent by parent to child: ', this.stateId());
    const id = this.stateId();
    if (id && this.stateList?.length) {
      const matched = this.stateList.find((state) => state._id === id);
      if (matched) {
        this.myForm.patchValue({ stateName: matched.name });
      }
    }
  });

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
