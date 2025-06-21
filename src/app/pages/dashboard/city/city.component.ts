import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, signal } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapComponent } from '../../../shared/components/map/map.component';
import { CitySearchComponent } from '../../../shared/components/shared-ui/city-search.component';
import { StateSearchComponent } from '../../../shared/components/shared-ui/state-search.component';
import { ExploresectionTable, States, Ulbs } from '../../home/dashboard-map-section/interfaces';
import { InfoCardsComponent } from '../shared/components/info-cards.component';
import { GridViewComponent } from '../../../shared/components/shared-ui/grid-view.component';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [
    CommonModule,
    StateSearchComponent,
    CitySearchComponent,
    MapComponent,
    MatTooltipModule,
    InfoCardsComponent,
    GridViewComponent,
  ],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
})
export class CityComponent implements OnInit, AfterViewInit {
  // Reactive Signals for state and city
  selectedStateIdSignal = signal<string>('');
  selectedCityNameSignal = signal<string>('');

  stateName: string = '';
  stateCode: string = 'AP';

  ulbId: string = '';

  exploreData: ExploresectionTable[] = [
    {
      sequence: 1,
      value: '26,932',
      label: 'Population',
      info: '',
      src: '',
    },
    {
      sequence: 2,
      value: '90.76 Sq km',
      label: 'Area',
      info: '',
      src: '',
    },
    {
      sequence: 3,
      value: '296.74/ Sq km',
      label: 'Population Density',
      info: '',
      src: '',
    },
    {
      sequence: 4,
      value: 20,
      label: 'Wards',
      info: '',
      src: '',
    },
    {
      sequence: 5,
      value: 1,
      label: 'Years of financial data',
      info: '',
      src: '',
    },
    {
      sequence: 6,
      value: 'No',
      label: 'Part of UA',
      info: '',
      src: '',
    },
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('CityComponent initialized');
    // this.setStateId('');
    // this.setCityName('Greater Visakhapatnam Municipal Corporation');
  }

  ngAfterViewInit(): void {
    // Example: set default values after a delay (commented out)
    setTimeout(() => {
      this.setStateId('5dcf9d7216a06aed41c748dd');
      this.setCityName('Greater Visakhapatnam Municipal Corporation');
    }, 2000);
    console.log('after view in it');
  }

  // ----- Search Section -----
  // Callback: From child when state is selected
  onStateSelected = (stateObj: States): void => {
    this.stateName = stateObj.name;
    this.stateCode = stateObj.code;
    console.log('Value of state sent by child to parent', stateObj);
    this.setCityName('');
    this.setStateId(stateObj._id);
  };

  // Callback: From child when ULB/city is selected
  onUlbSelected = (ulbObj: Ulbs): void => {
    this.ulbId = ulbObj._id;
    console.log('Value of ULB sent by child to parent:', ulbObj);
    this.setCityName(ulbObj.name);
  };

  // Helper: Set state ID signal
  setStateId(stateId: string): void {
    this.selectedStateIdSignal.set(stateId);
  }

  // Helper: Set city/ULB name signal
  setCityName(ulbName: string): void {
    this.selectedCityNameSignal.set(ulbName);
  }

  // ----- Map Section -----
  public selectedStateCodeChange($event: string): void {
    console.log('stateCodeChange from map', $event);
  }
  public selectedCityIdChange($event: string): void {
    this.ulbId = '5fa2465c072dab780a6f0f4c';
    console.log('ulbIdChange from map', this.ulbId, $event);
  }
}
