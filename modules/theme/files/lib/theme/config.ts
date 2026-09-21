import { bloomPack } from '@/lib/theme/packs/bloom';
import { brandedPack } from '@/lib/theme/packs/branded';
import { citrusPack } from '@/lib/theme/packs/citrus';
import { contrastPack } from '@/lib/theme/packs/contrast';
import { flarePack } from '@/lib/theme/packs/flare';
import { grovePack } from '@/lib/theme/packs/grove';
import { hearthPack } from '@/lib/theme/packs/hearth';
import { inkPack } from '@/lib/theme/packs/ink';
import { neutralPack } from '@/lib/theme/packs/neutral';
import { oceanPack } from '@/lib/theme/packs/ocean';
import { paperPack } from '@/lib/theme/packs/paper';
import { violetPack } from '@/lib/theme/packs/violet';
import type { ThemePack } from '@/lib/theme/tokens';

export const themePacks: Record<string, ThemePack> = {
  neutral: neutralPack,
  contrast: contrastPack,
  branded: brandedPack,
  ocean: oceanPack,
  ink: inkPack,
  hearth: hearthPack,
  bloom: bloomPack,
  flare: flarePack,
  paper: paperPack,
  grove: grovePack,
  violet: violetPack,
  citrus: citrusPack,
  // radiance:theme-packs:start
  // radiance:theme-packs:end
};

/** Palette used by this app. Change it with `radiance add theme --option pack=<id> --force`. */
export const ACTIVE_PACK = '{{radiance.themePack}}';

export function getActivePack(): ThemePack {
  return themePacks[ACTIVE_PACK] ?? neutralPack;
}
