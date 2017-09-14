// @flow
import type { ModProps } from '../data/schema';

import { Mod } from '../mods/';
import { type Flags, anySet } from '../Flags';
import Currency, {
  type ApplicableFlag as CurrencyApplicableFlag,
  type ApplicableFlags as CurrencyApplicableFlags
} from './Currency';

/**
 * TODO
 */
export default class Talisman extends Currency {
  static modFilter(mod: ModProps): boolean {
    // talisman wildcard
    return [Mod.TYPE.ENCHANTMENT].indexOf(mod.generation_type) !== -1;
  }

  static build(mods: ModProps[]): Talisman {
    return super.build(mods, Talisman.modFilter, Talisman);
  }
}
