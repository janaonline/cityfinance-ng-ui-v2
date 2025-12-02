import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { AfsService } from '../afs.service';
import { IState } from '../../../core/models/state/state';
import { IULB } from '../../../core/models/ulb';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface City {
  _id: string;
  name: string;
  stateId: string;
  populationCategory: string;
}

interface YearOption {
  name: string;
}

interface DocumentTypeItem {
  key: string;
  name: string;
}

interface FiltersConfig {
  years: YearOption[];
  documentTypes: DocumentTypeItem[];
}

export interface FilterValues {
  stateId: string[];
  // stateName: string | '';
  populationCategory: string | '';
  ulbId: string[];
  yearId: string | '';
  docType: string | '';
  auditType: 'audited' | 'unAudited' | '';
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
  // ---------- Inputs (data from parent) ----------
  // @Input() states: State[] = [];
  // @Input() cities: City[] = [];

  states: IState[] = [];

  cities: City[] = [];

  filteredCities: City[] = [];
  statePopFilteredCities: City[] = [];

  filters: FiltersConfig = {
    years: [],
    documentTypes: []
  };

  populationCategories: string[] = [];

  years = [
    { _id: '63735a4bd44534713673bfbf', value: '2017-18' },
    { _id: '63735a5bd44534713673c1ca', value: '2018-19' },
    { _id: '607697074dff55e6c0be33ba', value: '2019-20' },
    { _id: '606aadac4dff55e6c075c507', value: '2020-21' },
    { _id: '606aaf854dff55e6c075d219', value: '2021-22' },
    { _id: '606aafb14dff55e6c075d3ae', value: '2022-23' },
    { _id: '606aafc14dff55e6c075d3ec', value: '2023-24' },
    { _id: '606aafcf4dff55e6c075d424', value: '2024-25' },
    { _id: '606aafda4dff55e6c075d48f', value: '2025-26' },
    { _id: '67d7d136d3d038946a5239e9', value: '2026-27' },
  ]

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

  // selectedYear: string | '' = '';
  // selectedDocType: string | '' = '';

  // audited status; default to 'audited' if you like
  isAudited: 'audited' | 'unAudited' | '' = 'audited';

  // reactive form
  filterForm: FormGroup;
  toggleAllStateSelected: boolean = false;

  constructor(private afsService: AfsService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      stateId: [[] as string[]],                // mat-select multi (State objects)
      populationCategory: [''],
      citySearch: [''],
      ulbId: [[] as string[]],              // mat-selection-list values
      yearId: [''],
      docType: ['bal_sheet_schedules'],
      auditType: ['audited']
    });

    // // update filtered cities when these change
    this.filterForm.get('stateId')!.valueChanges.subscribe((value) => this.updateOnStateChange(value));

    this.filterForm.get('populationCategory')!.valueChanges.subscribe(() => this.updateOnPopulationChange());

    this.filterForm.get('citySearch')!.valueChanges.subscribe((text) => {
      const search = (text || '').toLowerCase().trim();

      this.filteredCities = this.statePopFilteredCities
        // .filter(c =>
        //   this.filterForm.get('stateId')!.value.length === 0 ||
        //   this.filterForm.get('stateId')!.value.includes(c.stateId)
        // )
        .filter(c =>
          !search ? true : c.name.toLowerCase().includes(search)
        )
        .slice(0, 100); // limit to 100 if you want
    });
    // this.filterForm.get('citySearch')!.valueChanges.subscribe(() => this.updateFilteredCities());
  }

  updateOnStateChange(selectedStateId: string[]): void {
    // console.log('State changed to:', value);
    // Clear city selection when state changes
    if (selectedStateId.length === this.states.length) {
      // this.filterForm.patchValue({ stateId: [] });
    }
    this.statePopFilteredCities = this.cities.filter(c => {
      // console.log('Filtering cities for state:', selectedStateId, 'City stateId:', c.stateId);
      return selectedStateId.length === 0 || selectedStateId.includes(c.stateId);
    }
    ); //.slice(0, 100);
    // console.log('Filtered cities after state change:', this.filteredCities);
    this.filterForm.patchValue({ ulbId: [], citySearch: '', populationCategory: '' });
    // this.selectedCities = [];
  }

  updateOnPopulationChange(): void {
    const selectedPopulation = this.filterForm.get('populationCategory')!.value;
    const selectedStateIds = this.filterForm.get('stateId')!.value;
    this.statePopFilteredCities = this.cities.filter(c =>
      (selectedPopulation === '' || selectedPopulation === 'All' || c.populationCategory === selectedPopulation) &&
      (selectedStateIds.length === 0 || selectedStateIds.includes(c.stateId))
    );
    this.filterForm.patchValue({ ulbId: [], citySearch: '' });
    // this.selectedCities = [];
  }

  ngOnInit(): void {
    this.loadFilters();
  }

  // compareWith so Angular can match objects by _id
  // compareStates = (a: State | null, b: State | null): boolean =>
  //   !!a && !!b && a._id === b._id;

  // Select all currently visible states
  selectAllStates(selectAll: boolean): void {
    const selected = selectAll ? this.filteredStates.map(s => s._id) : [];
    this.filterForm.patchValue({ stateId: selected });
  }

  // Filtered states based on text box
  get filteredStates(): IState[] {
    return this.states;
  }

  /** Handy getter */
  get selectedCityIds(): string[] {
    return this.filterForm.get('ulbId')!.value;
  }

  isSelected(city: City): boolean {
    return this.selectedCityIds.includes(city._id);
  }

  toggleCity(city: City): void {
    const current = this.selectedCityIds;
    if (this.isSelected(city)) {
      this.filterForm.get('ulbId')!.setValue(
        current.filter(id => id !== city._id)
      );
    } else {
      this.filterForm.get('ulbId')!.setValue([...current, city._id]);
    }
  }

  clearCities(): void {
    this.filterForm.patchValue({ ulbId: [], citySearch: '' });
    this.filteredCities = this.cities.slice(0, 100);
  }

  loadFilters() {
    this.afsService.getFilters().subscribe({
      next: (res) => {
        if (res.success) {
          this.states = res.filters.states;
          this.populationCategories = res.filters.populationCategories;
          // this.allCities = res.filters.cities; // Store full list
          this.cities = res.filters.cities;     // Default: show all
          // this.filteredCities = this.cities.slice(0, 100);
          this.filters.years = res.filters.years;
          this.filters.documentTypes = res.filters.documentTypes[0]?.items;

        }
      },
      error: (err) => {
        console.error('Failed to load filters:', err);
      }
    });
  }
  // ---------- Handlers ----------

  // selectState(state: IState): void {
  //   this.selectedState.push(state._id);
  //   this.stateSearchText = state?.name ?? '';
  //   this.stateDropdownOpen = false;

  //   // Reset city selection when state changes
  //   this.selectedCities = [];
  //   this.citySearchText = '';
  // }

  onPopulationOrStateChange(): void {
    // Clear city selection when population category or state changes
    this.selectedCities = [];
  }

  toggleCitySelection(city: City, checked: boolean = false): void {
    const cityName = city.name;
    if (checked) {
      if (!this.selectedCities.includes(cityName)) {
        this.selectedCities.push(cityName);
      }
    } else {
      this.selectedCities = this.selectedCities.filter(
        (c) => c !== cityName
      );
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      stateId: [] as string[],
      populationCategory: '',
      citySearch: '',
      ulbId: [] as string[],
      yearId: '',
      docType: '',
      auditType: 'audited'
    });
    // this.filtersChanged.emit(this.filterForm.value);
  }

  applyFilters(): void {
    this.filtersChanged.emit(this.filterForm.value);
  }


}
