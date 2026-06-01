import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalHeatMapComponent } from './national-heat-map.component';
import { IStateULBCovered } from '../../../../core/models/stateUlbConvered';
import { ULBWithMapData } from '../../../../core/models/ulbsForMapResponse';

describe('NationalHeatMapComponent', () => {
  let component: NationalHeatMapComponent;
  let fixture: ComponentFixture<NationalHeatMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule,  NationalHeatMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NationalHeatMapComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('merges states with their matching ULBs by state id', () => {
    const states = [
      { _id: 's1', name: 'State One', code: 'S1' },
      { _id: 's2', name: 'State Two', code: 'S2' },
    ] as IStateULBCovered[];
    const ulbs = [
      { _id: 'u1', name: 'City A', state: 's1' },
      { _id: 'u2', name: 'City B', state: 's1' },
      { _id: 'u3', name: 'City C', state: 's2' },
    ] as unknown as ULBWithMapData[];

    const merged = component.CombineStateAndULBData(states, ulbs);

    expect(Object.keys(merged)).toEqual(['s1', 's2']);
    expect(merged['s1'].ulbs.map((ulb) => ulb.name)).toEqual(['City A', 'City B']);
    expect(merged['s2'].ulbs.map((ulb) => ulb.name)).toEqual(['City C']);
  });

  it('filters merged state data by state and ULB search text', () => {
    component.stateAndULBDataMerged = {
      s1: {
        _id: 's1',
        name: 'State One',
        code: 'S1',
        ulbs: [
          { _id: 'u1', name: 'Alpha City', state: 's1' },
          { _id: 'u2', name: 'Beta Town', state: 's1' },
        ],
      },
      s2: {
        _id: 's2',
        name: 'State Two',
        code: 'S2',
        ulbs: [{ _id: 'u3', name: 'Gamma City', state: 's2' }],
      },
    } as any;

    const byName = component.filterMergedStateDataBy({ stateId: 's1', ulbName: 'city' });
    const byState = component.filterMergedStateDataBy({ stateId: 's1' });
    const none = component.filterMergedStateDataBy({ ulbName: 'missing' });

    expect(Object.keys(byName || {})).toEqual(['s1']);
    expect(byName?.['s1'].ulbs.map((ulb: any) => ulb.name)).toEqual(['Alpha City']);
    expect(byState?.['s1'].ulbs.map((ulb: any) => ulb.name)).toEqual(['Alpha City', 'Beta Town']);
    expect(none).toBeNull();
  });

  it('filters ULB lists case-insensitively and keeps all rows for blank search text', () => {
    const ulbs = [
      { _id: 'u1', name: 'Alpha City' },
      { _id: 'u2', name: 'Beta Town' },
    ] as ULBWithMapData[];

    expect(component.filteredULBBy({ ulbName: 'ALPHA' }, ulbs).map((ulb) => ulb._id)).toEqual([
      'u1',
    ]);
    expect(component.filteredULBBy({ ulbName: '   ' }, ulbs)).toEqual(ulbs);
  });

  it('stores state and ULB data from API responses and prepares filtered dropdown data', () => {
    const stateResponse = {
      data: [
        { _id: 's1', name: 'State One', code: 'S1' },
        { _id: 's2', name: 'State Two', code: 'S2' },
      ],
    } as any;
    const ulbResponse = {
      data: [
        { _id: 'u1', name: 'Alpha City', state: 's1' },
        { _id: 'u2', name: 'Beta Town', state: 's2' },
      ],
    } as any;
    spyOn(component, 'loadMapGeoJson').and.returnValue(Promise.reject('skip map rendering'));

    expect(component.onGettingStateULBCoveredSuccess(stateResponse)).toBe(stateResponse);
    expect(component.onGettingULBWithPopulationSuccess(ulbResponse)).toBe(ulbResponse);

    expect(component.stateData).toEqual(stateResponse.data);
    expect(component.allULBSList).toEqual(ulbResponse.data);
    expect(component.stateAndULBDataMerged['s1'].ulbs[0]._id).toBe('u1');
    expect(component.filteredULBStateAndULBDataMerged?.['s2'].ulbs[0]._id).toBe('u2');
  });

  it('finds the state for a selected ULB and returns false when the ULB is unknown', () => {
    component.stateData = [
      { _id: 's1', name: 'State One', code: 'S1' },
    ] as IStateULBCovered[];
    component.ulbsOfSelectedState = [
      { _id: 'u1', name: 'Alpha City', state: 's1' },
    ] as unknown as ULBWithMapData[];

    expect(component.getStateOfULB('u1')).toEqual(component.stateData[0]);
    expect(component.getStateOfULB('missing')).toBeFalse();
  });

  it('selects a ULB by id when the ULB has valid coordinates', () => {
    const marker = jasmine.createSpyObj('marker', ['setIcon', 'getElement']);
    marker.getElement.and.returnValue({ style: {} });
    component.ulbsOfSelectedState = [
      { _id: 'u1', name: 'Alpha City', location: { lat: '12.9', lng: '77.5' } },
    ] as any;
    spyOn(component, 'getDistrictMarkerOfULB').and.returnValue(marker);

    const selected = component.selectULBById('u1');

    expect(selected).toBeUndefined();
    expect(component.currentULBClicked?._id).toBe('u1');
    expect(component.ulbsSelected.value).toEqual(['u1']);
    expect(marker.setIcon).toHaveBeenCalledWith(component.yellowIcon);
  });

  it('warns and returns false when selecting an unknown or geolocation-less ULB', () => {
    spyOn(component, 'showSnacbarMessage');
    component.ulbsOfSelectedState = [
      { _id: 'u1', name: 'Alpha City', location: { lat: '0.0', lng: '77.5' } },
    ] as any;

    expect(component.selectULBById('missing')).toBeFalse();
    expect(component.selectULBById('u1')).toBeFalse();
    expect(component.showSnacbarMessage).toHaveBeenCalledWith(
      'Alpha City does not contain a valid geo-location.',
    );
  });

  it('creates a state level map from selected state data and emits the state', () => {
    const emittedStates: any[] = [];
    component.stateSelected.subscribe((state) => emittedStates.push(state));
    component.stateAndULBDataMerged = {
      s1: {
        _id: 's1',
        name: 'State One',
        code: 'S1',
        ulbs: [{ _id: 'u1', name: 'Alpha City', state: 's1', location: { lat: '12', lng: '77' } }],
      },
    } as any;
    component.DistrictsJSONForMapCreation = {
      type: 'FeatureCollection',
      features: [{ properties: { ST_NM: 'State One' } }],
    } as any;
    localStorage.setItem(
      'ulbList',
      JSON.stringify({
        data: {
          S1: {
            ulbs: [
              { _id: 'u1', name: 'Alpha City', state: 's1', location: { lat: '12', lng: '77' } },
            ],
          },
        },
      }),
    );
    spyOn(component, 'createDistrictMap');

    expect(component.createStateLevelMap('State One')).toBeTrue();

    expect(component.currentStateInView?.name).toBe('State One');
    expect(component.ulbListForAutoCompletion.map((ulb) => ulb.name)).toEqual(['Alpha City']);
    expect(component.createDistrictMap).toHaveBeenCalled();
    expect(emittedStates[0].name).toBe('State One');
  });

  it('returns false and warns when a state level map cannot be created', () => {
    component.stateAndULBDataMerged = {
      s1: { _id: 's1', name: 'State One', code: 'S1', ulbs: [] },
    } as any;
    component.DistrictsJSONForMapCreation = { type: 'FeatureCollection', features: [] } as any;
    localStorage.setItem('ulbList', JSON.stringify({ data: { S1: { ulbs: [] } } }));
    spyOn(component, 'showSnacbarMessage');

    expect(component.createStateLevelMap('Missing')).toBeFalse();
    expect(component.createStateLevelMap('State One')).toBeFalse();
    expect(component.showSnacbarMessage).toHaveBeenCalledWith(
      'State One does not contains any ULB.',
    );
  });

  it('resets dropdown, selected state, selected ULB, and map mode state', () => {
    const stateEvents: any[] = [];
    component.stateSelected.subscribe((state) => stateEvents.push(state));
    component.stateAndULBDataMerged = {
      s1: { _id: 's1', name: 'State One', ulbs: [{ _id: 'u1' }] },
    } as any;
    component.allULBSList = [{ _id: 'u1' }] as any;
    component.ulbsOfSelectedState = [];
    component.currentStateInView = { _id: 's1', name: 'State One' } as any;
    component.currentULBClicked = { _id: 'u1' } as any;
    component.isMapOnMiniMapMode = true;

    component.resetULBsSelected();
    component.resetulbsOfSelectedState();
    component.resetULBForAutoCompletion();
    component.resetDropdownListToNationalLevel();
    component.resetCurrentSelectState();
    component.resetCurrentULBClicked();

    expect(component.ulbsSelected.value).toEqual([]);
    expect(component.ulbsOfSelectedState).toEqual(component.allULBSList);
    expect(component.ulbListForAutoCompletion).toEqual(component.allULBSList);
    expect(component.filteredULBStateAndULBDataMerged?.['s1']).toBeTruthy();
    expect(component.currentStateInView).toBeNull();
    expect(component.currentULBClicked).toBeNull();
    expect(stateEvents).toEqual([undefined]);
  });

  it('toggles DOM mini-map classes and legend visibility', () => {
    const map = document.createElement('div');
    map.id = `mapidd${component.randomNumber}`;
    const legend = document.createElement('div');
    legend.id = 'legendContainer';
    document.body.append(map, legend);

    expect(component.convertDomToMiniMap(map.id)).toBeTrue();
    expect(map.classList.contains('miniMap')).toBeTrue();
    expect(component.convertDomToMiniMap(map.id)).toBeFalse();
    expect(component.convertMiniMapToOriginal(map.id)).toBeTrue();
    expect(map.classList.contains('miniMap')).toBeFalse();

    component.hideMapLegends();
    expect(legend.style.visibility).toBe('hidden');
    component.showMapLegends();
    expect(legend.style.visibility).toBe('visible');

    map.remove();
    legend.remove();
  });

  it('calculates map colors, centroids, and style objects', () => {
    expect(component.getColorBasedOnPercentage(90)).toBe('#12A6DD');
    expect(component.getColorBasedOnPercentage(70)).toBe('#4A6CCB');
    expect(component.getColorBasedOnPercentage(40)).toBe('#FCDA4A');
    expect(component.getColorBasedOnPercentage(10)).toBe('#A6B9B4');
    expect(component.getColorBasedOnPercentage(0)).toBe('#E5E5E5');
    expect(component.getCentroid([[10, 20], [20, 40]])).toEqual([15, 30]);
    expect(component.stateColorStyle({})).toEqual(
      jasmine.objectContaining({ fillColor: '#E5E5E5', color: '#fff' }),
    );
    expect(component.newDashboardstateColorStyle({})).toEqual(
      jasmine.objectContaining({ fillColor: '#3e5db1', stroke: false }),
    );
  });
});
