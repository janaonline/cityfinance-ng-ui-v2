import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { SideBarModel } from '../../shared/components/side-menu';
import { filterDataHubItem } from './dalgo-menu.util';

const user = (fields: Record<string, unknown>) => fields as unknown as IUserLoggedInDetails;

const menu = (): SideBarModel => ({
  topModel: [
    { label: 'Overview', routerLink: ['/xvifc', 'y1', 'overview'] },
    { label: 'Data Hub', routerLink: ['/xvifc', 'y1', 'data-hub'] },
    {
      label: 'Group only Data Hub',
      items: [{ label: 'Data Hub', routerLink: ['/xvifc', 'y1', 'data-hub'] }],
    },
    {
      label: 'Mixed group',
      items: [
        { label: 'Data Hub', routerLink: ['/xvifc', 'y1', 'data-hub'] },
        { label: 'Other', routerLink: ['/xvifc', 'y1', 'other'] },
      ],
    },
  ],
  bottomModel: [],
});

describe('filterDataHubItem', () => {
  it('keeps the menu untouched for MoHUA and enabled states', () => {
    const original = menu();
    expect(filterDataHubItem(original, user({ role: 'MoHUA' }))).toBe(original);
    expect(filterDataHubItem(original, user({ role: 'STATE', stateName: 'Kerala' }))).toBe(original);
    expect(filterDataHubItem(original, user({ role: 'ULB', name: 'X', stateName: 'Telangana' }))).toBe(original);
  });

  it('removes Data Hub (and groups left empty) for other states', () => {
    const result = filterDataHubItem(menu(), user({ role: 'STATE', stateName: 'Maharashtra' }));
    expect(result.topModel.map((i) => i.label)).toEqual(['Overview', 'Mixed group']);
    expect(result.topModel[1].items?.map((i) => i.label)).toEqual(['Other']);
  });

  it('removes Data Hub when the user is unknown', () => {
    const result = filterDataHubItem(menu(), null);
    expect(result.topModel.some((i) => i.label === 'Data Hub')).toBeFalse();
  });
});
