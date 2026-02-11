import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { AFS_PAGINATION_KEY } from '../afs-table/afs-table.component';
import { AfsService, FilterValues } from '../afs.service';
export const DEFAULT_YEAR = '606aadac4dff55e6c075c507'; // 2020-21
export const DEFAULT_DOC_TYPE = 'bal_sheet_schedules';
export const DEFAULT_AUDIT_STATUS = 'audited';
export const DEFAULT_DIGITIZATION_STATUS = '';
export const AFS_FILTER_KEY = 'afsFilter';

interface YearOption {
  _id: string;
  year: string;
}

interface KeyNameItem {
  key: string;
  name: string;
}


interface FiltersConfig {
  years: YearOption[];
  documentTypes: KeyNameItem[];
  ulbs?: IULB[];
  states: IState[];
  auditTypes?: KeyNameItem[];
  populationCategories?: string[];
  digitizationStatuses?: KeyNameItem[];
}

@Component({
  selector: 'app-afs-filter',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './afs-filter.component.html',
  styleUrl: './afs-filter.component.scss'
})
export class AfsFilterComponent implements OnInit {
  states: IState[] = [];

  cities: IULB[] = [];

  filteredCities: IULB[] = [];
  filteredStates: IState[] = [];
  statePopFilteredCities: IULB[] = [];

  filters: FiltersConfig = {
    states: [],
    years: [],
    documentTypes: [],
    populationCategories: []
  };

  // ---------- Outputs (emit applied filters to parent) ----------
  @Output() filtersChanged = new EventEmitter<FilterValues>();

  // ---------- UI state ----------
  stateSearchText = '';
  citySearchText = '';

  // original code used this; kept for compatibility even though
  // the Material autocomplete doesn’t really need it
  // stateDropdownOpen = false;

  // selectedState: string[] = [];
  // selectedPopulation: string = 'all';
  selectedCities: string[] = [];

  // reactive form
  filterForm: FormGroup;
  toggleAllStateSelected: boolean = false;

  constructor(private afsService: AfsService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      stateId: [[] as string[]],
      populationCategory: [''],
      stateSearch: [''],
      citySearch: [''],
      ulbId: [[] as string[]],
      yearId: [DEFAULT_YEAR],
      docType: [DEFAULT_DOC_TYPE],
      auditType: [DEFAULT_AUDIT_STATUS],
      digitizationStatus: [DEFAULT_DIGITIZATION_STATUS],
      page: [1],
      limit: [10],
    });

    // update filtered cities when these change
    this.filterForm.get('stateId')!.valueChanges.subscribe((value) => this.updateOnStateChange(value));

    this.filterForm.get('populationCategory')!.valueChanges.subscribe(() => this.updateOnPopulationChange());
    // on state search
    this.filterForm.get('stateSearch')!.valueChanges.subscribe((text) => {
      const search = (text || '').toLowerCase().trim();

      this.filteredStates = this.states
        .filter(c =>
          !search ? true : c.name.toLowerCase().includes(search)
        );
    });
    // on city search
    this.filterForm.get('citySearch')!.valueChanges.subscribe((text) => {
      const search = (text || '').toLowerCase().trim();
      this.filteredCities = this.statePopFilteredCities
        .filter(c =>
          !search ? true : c.name.toLowerCase().includes(search)
        )
        .slice(0, 100); // limit to 100 if you want
    });

  }

  ngOnInit(): void {
    // If available in localstorage use that.
    const filterFormFromLocalStroage = localStorage.getItem(AFS_FILTER_KEY);
    if (filterFormFromLocalStroage) {
      this.filterForm.patchValue(JSON.parse(filterFormFromLocalStroage));
      this.filtersChanged.emit(this.filterForm.value);
    }

    this.loadFilters();
  }

  loadFilters() {
    this.afsService.getFilters().subscribe({
      next: (res) => {
        const resData: any = res.data;
        this.filters = res.data;
        if (resData) {
          this.filteredStates = this.states = resData.states;
          // this.populationCategories = resData.populationCategories;
          // this.allCities = res.filters.cities; // Store full list
          this.cities = resData.ulbs;     // Default: show all
          // this.filteredCities = this.cities.slice(0, 100);
          // this.filters.years = resData.years;
          // this.filters.documentTypes = resData.documentTypes;

        }
      },
      error: (err) => {
        console.error('Failed to load filters:', err);
      }
    });
  }

  updateOnStateChange(selectedStateId: string[]): void {
    // Clear city selection when state changes
    if (selectedStateId.length === this.states.length) {
      // this.filterForm.patchValue({ stateId: [] });
    }
    this.statePopFilteredCities = this.cities.filter(c => {
      // console.log('Filtering cities for state:', selectedStateId, 'City stateId:', c.stateId);
      return selectedStateId.length === 0 || selectedStateId.includes(c.state);
    }
    ); //.slice(0, 100);
    this.filterForm.patchValue({ ulbId: [], citySearch: '', populationCategory: '' });
  }

  updateOnPopulationChange(): void {
    const selectedPopulation = this.filterForm.get('populationCategory')!.value;
    const selectedStateIds = this.filterForm.get('stateId')!.value;

    // this.afsService.getUlbs({ stateIds: selectedStateIds, populationCategory: selectedPopulation }).subscribe({
    //   next: (res) => {
    //     if (res.data.length >= 0) {
    //       this.filteredCities = this.statePopFilteredCities = res.data;
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error loading ULBS by population and states:', err);
    //   }
    // });
    this.statePopFilteredCities = this.cities.filter(c =>
      (selectedPopulation === '' || selectedPopulation === 'All' || this.checkPopulationCategory(selectedPopulation, c.population)) &&
      (selectedStateIds.length === 0 || selectedStateIds.includes(c.state))
    );
    this.filterForm.patchValue({ ulbId: [], citySearch: '' });
  }

  checkPopulationCategory(selectedPopulation: string, cityPopulation: number): boolean {
    if (selectedPopulation === 'All' || selectedPopulation === '') {
      return true;
    } else if (selectedPopulation === '<100K') {
      return cityPopulation < 100000;
    } else if (selectedPopulation === '100K-500K') {
      return cityPopulation >= 100000 && cityPopulation < 500000;
    } else if (selectedPopulation === '500K-1M') {
      return cityPopulation >= 500000 && cityPopulation < 1000000;
    } else if (selectedPopulation === '1M-4M') {
      return cityPopulation >= 1000000 && cityPopulation < 4000000;
    } else if (selectedPopulation === '4M+') {
      return cityPopulation >= 4000000;
    }
    return false;
  }

  clearInput(key: string) {
    this.filterForm.patchValue({ [key]: '' });
  }

  // Select all currently visible states
  selectAllStates(selectAll: boolean): void {
    const selected = selectAll ? this.filteredStates.map(s => s._id) : [];
    this.filterForm.patchValue({ stateId: selected });
  }

  // Select all currently visible cities
  selectAllCities(selectAll: boolean): void {
    const selected = selectAll ? this.filteredCities.map(s => s._id) : [];
    // this.filterForm.patchValue({ stateId: selected });
    this.filterForm.patchValue({ ulbId: selected, citySearch: '' });
  }

  /** Handy getter */
  get selectedCityIds(): string[] {
    return this.filterForm.get('ulbId')!.value;
  }
  get selectedStateIds(): string[] {
    return this.filterForm.get('stateId')!.value;
  }

  isSelected(city: IULB): boolean {
    return this.selectedCityIds.includes(city._id);
  }

  toggleCity(city: IULB): void {
    const current = this.selectedCityIds;
    if (this.isSelected(city)) {
      this.filterForm.get('ulbId')!.setValue(
        current.filter(id => id !== city._id)
      );
    } else {
      this.filterForm.get('ulbId')!.setValue([...current, city._id]);
    }
  }

  isStateSelected(state: IState): boolean {
    return this.selectedStateIds.includes(state._id);
  }

  toggleState(state: IState): void {
    const current = this.selectedStateIds;
    if (this.isStateSelected(state)) {
      this.filterForm.get('stateId')!.setValue(
        current.filter(id => id !== state._id)
      );
    } else {
      this.filterForm.get('stateId')!.setValue([...current, state._id]);
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      stateId: [] as string[],
      populationCategory: '',
      stateSearch: '',
      citySearch: '',
      ulbId: [] as string[],
      yearId: DEFAULT_YEAR,
      docType: DEFAULT_DOC_TYPE,
      auditType: DEFAULT_AUDIT_STATUS,
      pageIndex: 0,
      page: 1,
      limit: 10,
      digitizationStatus: DEFAULT_DIGITIZATION_STATUS
    });
    this.filtersChanged.emit(this.filterForm.value);
    localStorage.removeItem(AFS_FILTER_KEY)
    localStorage.removeItem(AFS_PAGINATION_KEY);
  }

  applyFilters(): void {
    this.filtersChanged.emit(this.filterForm.value);
    localStorage.setItem(AFS_FILTER_KEY, JSON.stringify(this.filterForm.value))
  }


}
