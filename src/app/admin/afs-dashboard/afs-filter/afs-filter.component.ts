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

interface City {
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
    MatListModule
  ],
  templateUrl: './afs-filter.component.html',
  styleUrl: './afs-filter.component.scss'
})
export class AfsFilterComponent implements OnInit {
  // ---------- Inputs (data from parent) ----------
  // @Input() states: State[] = [];
  // @Input() cities: City[] = [];

  states: IState[] = [
    { _id: 'assam', name: 'Assam' },
    { _id: 'karnataka', name: 'Karnataka' }
  ];

  cities: City[] = [
    { name: 'Guwahati', stateId: 'assam', populationCategory: '1 Million - 4 Million' },
    { name: 'Silchar', stateId: 'assam', populationCategory: '100 Thousand - 500 Thousand' },
    { name: 'Bengaluru', stateId: 'karnataka', populationCategory: '4 Million+' }
  ];

  @Input() filters: FiltersConfig = {
    years: [],
    documentTypes: []
  };

  // If you want, you can also accept this from parent instead of hardcoding
  populationCategories: string[] = [
    'All Populations',
    '4 Million+',
    '1 Million - 4 Million',
    '500 Thousand - 1 Million',
    '100 Thousand - 500 Thousand',
    '< 100 Thousand',
    'All ULBs'
  ];

  years = [
    { key: '63735a4bd44534713673bfbf', value: '2017-18' },
    { key: '63735a5bd44534713673c1ca', value: '2018-19' },
    { key: '607697074dff55e6c0be33ba', value: '2019-20' },
    { key: '606aadac4dff55e6c075c507', value: '2020-21' },
    { key: '606aaf854dff55e6c075d219', value: '2021-22' },
    { key: '606aafb14dff55e6c075d3ae', value: '2022-23' },
    { key: '606aafc14dff55e6c075d3ec', value: '2023-24' },
    { key: '606aafcf4dff55e6c075d424', value: '2024-25' },
    { key: '606aafda4dff55e6c075d48f', value: '2025-26' },
    { key: '67d7d136d3d038946a5239e9', value: '2026-27' },
  ]

  // ---------- Outputs (emit applied filters to parent) ----------
  @Output() filtersChanged = new EventEmitter<FilterValues>();

  filtersConfig = {
    years: [
      { key: '606aadac4dff55e6c075c507', value: '2020-21' },
    ],
    documentTypes: [

    ]
  };

  // ---------- UI state ----------
  stateSearchText = '';
  citySearchText = '';

  // original code used this; kept for compatibility even though
  // the Material autocomplete doesn’t really need it
  stateDropdownOpen = false;

  selectedState: string[] = [];
  selectedPopulation: string = 'all';
  selectedCities: string[] = [];

  selectedYear: string | '' = '';
  selectedDocType: string | '' = 'bal_sheet_schedules';

  // audited status; default to 'audited' if you like
  isAudited: 'audited' | 'unAudited' | '' = 'audited';

  // reactive form
  filterForm: FormGroup;
  toggleAllStateSelected: boolean = false;

  // for display
  // filteredCities: City[] = [];

  constructor(private afsService: AfsService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      stateId: [[] as string[]],                // mat-select multi (State objects)
      populationCategory: [''],
      citySearch: [''],
      ulbId: [[] as string[]],              // mat-selection-list values
      yearId: [''],
      docType: [''],
      auditType: ['audited' as 'audited' | 'unAudited' | '']
    });

    // // update filtered cities when these change
    this.filterForm.get('stateId')!.valueChanges.subscribe((value) => this.updateOnStateChange(value));
    // this.filterForm.get('populationCategory')!.valueChanges.subscribe(() => this.updateFilteredCities());
    // this.filterForm.get('citySearch')!.valueChanges.subscribe(() => this.updateFilteredCities());
  }

  updateOnStateChange(selectedStateId: string[]): void {
    // console.log('State changed to:', value);
    // Clear city selection when state changes
    if (selectedStateId.length === this.states.length) {

    }
    this.selectedCities = [];
    this.citySearchText = '';
    // this.updateFilteredCities();
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
  // // Clear all selections
  // clearStates(): void {
  //   this.filterForm.patchValue({ stateId: [] });
  //   // emit filters if needed
  // }

  // selectStateStatus(): boolean {
  //   if (this.toggleAllStateSelected) {
  //     this.filterForm.patchValue({ stateId: [] });
  //     this.selectedStates = [];
  //   } else {
  //     this.selectAllStates();
  //   }
  //   return this.toggleAllStateSelected = !this.toggleAllStateSelected;
  // }




  // Filtered states based on text box
  get filteredStates(): IState[] {
    return this.states;
  }

  // Filtered cities based on selected state, population category, and city search
  get filteredCities(): City[] {
    return this.cities
    // .filter((c) =>
    //   this.selectedState ? c.stateId === this.selectedState : true
    // )
    // .filter((c) =>
    //   this.selectedPopulation && this.selectedPopulation !== 'All ULBs'
    //     ? c.populationCategory === this.selectedPopulation
    //     : true
    // )
    // .filter((c) => {
    //   const search = this.citySearchText.trim().toLowerCase();
    //   if (!search) return true;
    //   return c.name.toLowerCase().includes(search);
    // });
  }

  loadFilters() {
    this.afsService.getFilters().subscribe({
      next: (res) => {
        if (res.success) {
          this.states = res.filters.states;
          this.populationCategories = res.filters.populationCategories;
          // this.allCities = res.filters.cities; // Store full list
          this.cities = res.filters.cities;     // Default: show all
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

  selectState(state: IState): void {
    this.selectedState.push(state._id);
    this.stateSearchText = state?.name ?? '';
    this.stateDropdownOpen = false;

    // Reset city selection when state changes
    this.selectedCities = [];
    this.citySearchText = '';
  }

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

  // onDocTypeChange(docTypeKey: string): void {
  //   this.selectedDocType = docTypeKey;

  //   // Optional: reset audit status when doc type changes
  //   if (this.selectedDocType === '16th_fc') {
  //     this.isAudited = '';
  //   } else if (!this.isAudited) {
  //     this.isAudited = 'audited';
  //   }
  // }

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
