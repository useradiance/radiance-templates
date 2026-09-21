import { markersById, regionFromCoords } from '@/lib/maps';

describe('maps helpers', () => {
  it('builds a region from coordinates', () => {
    expect(regionFromCoords(1, 2, 0.1)).toEqual({
      latitude: 1,
      longitude: 2,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
  });

  it('indexes markers by id', () => {
    const map = markersById([
      { id: 'a', latitude: 0, longitude: 0 },
      { id: 'b', latitude: 1, longitude: 1 },
    ]);
    expect(map.a.id).toBe('a');
    expect(map.b.latitude).toBe(1);
  });
});
