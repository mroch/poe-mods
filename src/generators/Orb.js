// @flow
import type { Container } from '../containers/Container';
import type { ModProps } from '../schema';
import { Mod } from '../mods';
import { type Flags, anySet } from '../util/Flags';
import { choose } from '../util/rng';

import Generator, { type GeneratorDetails } from './Generator';

const filterNone = () => true;

export type SpawnableFlag = 'no_matching_tags' | 'spawnweight_zero';
export type SpawnableFlags = Flags<SpawnableFlag>;

/**
 * @abstract
 */
export default class Orb<M: Mod, C: Container<*>> extends Generator<M, C> {
  static build(
    mods: ModProps[],
    filter: ModProps => boolean = filterNone,
    OrbClass: Class<$Subtype<Orb<*, *>>>, // eslint-disable-line no-undef
    // eslint-disable-next-line no-undef
  ): $Subtype<Orb<*, *>> {
    const rollable_mods = mods
      .filter(props => props.spawn_weights.length > 0 && filter(props))
      .map(props => new Mod(props));

    return new OrbClass(rollable_mods);
  }

  chooseMod(container: C): ?M {
    const details = this.modsFor(container);
    const detail = choose(details, other => {
      if (other.spawnweight == null) {
        throw new Error('optional spawnweight not allowed when choosing');
      }

      return other.spawnweight;
    });

    if (detail != null) {
      return detail.mod;
    } else {
      return undefined;
    }
  }

  /**
   * adds a mod from chooseMod ignoring if it's applicable
   * @param {Item} item 
   */
  rollMod(container: C): C {
    const mod = this.chooseMod(container);
    if (mod != null) {
      return container.addMod(mod);
    } else {
      return container;
    }
  }

  isModSpawnableOn(mod: M, container: C): SpawnableFlags {
    const spawnable_flags: SpawnableFlags = {
      no_matching_tags: false,
      spawnweight_zero: false,
    };
    const spawnweight = mod.spawnweightPropsFor(container);

    if (spawnweight == null) {
      // at first glance this shouldn't be happening
      // since every mod seems to have a spawnweight for the default
      // tag which every equipment seems to have
      spawnable_flags.no_matching_tags = true;
    } else if (spawnweight.value <= 0) {
      spawnable_flags.spawnweight_zero = true;
    }

    return spawnable_flags;
  }

  modsFor(container: C, whitelist: string[] = []): GeneratorDetails<M>[] {
    return this.getAvailableMods()
      .map((mod: M) => {
        const applicable_flags = this.isModApplicableTo(mod, container);
        const spawnable_flags = this.isModSpawnableOn(mod, container);
        const spawnweight = mod.spawnweightFor(container);

        const is_applicable = !anySet(applicable_flags, whitelist);

        const is_spawnable = !anySet(spawnable_flags, whitelist);

        const is_rollable = is_applicable && is_spawnable;

        if (is_rollable) {
          return {
            mod,
            applicable: applicable_flags,
            spawnable: spawnable_flags,
            spawnweight,
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);
  }
}
