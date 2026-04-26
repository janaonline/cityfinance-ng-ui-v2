import { MapUtil } from './mapUtil';

describe('MapUtil', () => {
  it('reads state name and code from a Leaflet click event shape', () => {
    const event = {
      sourceTarget: {
        feature: {
          properties: {
            ST_NM: 'Kerala',
            ST_CODE: '32',
          },
        },
      },
    } as any;

    expect(MapUtil.getStateName(event)).toBe('Kerala');
    expect(MapUtil.getStateCode(event)).toBe('32');
  });

  it('applies fill style only to layers that support setStyle', () => {
    const styledLayer = { setStyle: jasmine.createSpy('setStyle') };

    expect(MapUtil.colorStateLayer({} as any, '#fff')).toBeUndefined();
    MapUtil.colorStateLayer(styledLayer, '#123456');

    expect(styledLayer.setStyle).toHaveBeenCalledOnceWith(
      {
        fillOpacity: 1,
        fillColor: '#123456',
        weight: -1,
      },
      true,
    );
  });

  it('colors every layer in a map-like object', () => {
    const firstLayer = { setStyle: jasmine.createSpy('firstSetStyle') };
    const secondLayer = { setStyle: jasmine.createSpy('secondSetStyle') };
    const map = {
      eachLayer: jasmine.createSpy('eachLayer').and.callFake((callback: any) => {
        callback(firstLayer);
        callback(secondLayer);
        return 'done';
      }),
    };

    expect(MapUtil.colorIndiaMap(map as any, '#abcdef')).toBe('done' as any);
    expect(firstLayer.setStyle).toHaveBeenCalled();
    expect(secondLayer.setStyle).toHaveBeenCalled();
  });

  it('returns custom centroids for states with configured centroid overrides', () => {
    const event = {
      sourceTarget: {
        feature: {
          properties: {
            ST_NM: 'Kerala',
          },
        },
      },
    } as any;

    expect(MapUtil.getStateCentroid(event)).toEqual({ lat: 9.999675, lng: 77.199765 });
  });

  it('returns null when state name is missing', () => {
    const event = {
      sourceTarget: {
        feature: {
          properties: {},
        },
      },
    } as any;

    expect(MapUtil.getStateCentroid(event)).toBeNull();
  });
});
