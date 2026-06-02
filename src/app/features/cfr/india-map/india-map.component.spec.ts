import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapUtil } from '../../../core/util/map/mapUtil';
import { IndiaMapComponent } from './india-map.component';

describe('IndiaMapComponent', () => {
  let component: IndiaMapComponent;
  let fixture: ComponentFixture<IndiaMapComponent>;

  beforeEach(async () => {
    spyOn(IndiaMapComponent.prototype, 'ngAfterViewInit').and.stub();
    spyOn(IndiaMapComponent.prototype as any, 'createLegends').and.stub();
    spyOn(MapUtil, 'createDefaultNationalMap').and.returnValue({
      map: {
        eachLayer: () => undefined,
        off: () => undefined,
        remove: () => undefined,
      },
      stateLayers: {
        eachLayer: () => undefined,
      },
    } as any);

    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule,  IndiaMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndiaMapComponent);
    component = fixture.componentInstance;
    component.stateData = [];
    component.queryParams = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
