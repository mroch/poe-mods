// @flow
import { AbstractMethod } from '../exceptions';
import type { Taggable } from '../interfaces';
import type { TagProps } from '../schema';
import type { Mod } from '../mods';

export type Builder<T: Mod> = {
  mods: T[],
};

export default class Container<T: Mod, B: Builder<T>> implements Taggable {
  +mods: T[];

  static withBuilder(builder: B): Container<T, B> {
    return new Container(builder.mods);
  }

  constructor(mods: T[]) {
    (this: any).mods = mods;
  }

  builder(): B {
    const builder: $Shape<B> = { mods: this.mods };

    return builder;
  }

  // batch mutations
  withMutations(mutate: B => B): this {
    const builder = mutate(this.builder());

    return this.constructor.withBuilder(builder);
  }

  /**
   *  adds a new non-existing mod
   */
  addMod(mod: T): this {
    if (!this.hasMod(mod)) {
      return this.withMutations(builder => {
        return {
          ...builder,
          mods: builder.mods.concat(mod),
        };
      });
    } else {
      return this;
    }
  }

  /**
   * truncates mods
   */
  removeAllMods(): this {
    return this.withMutations(builder => {
      return {
        ...builder,
        mods: [],
      };
    });
  }

  /**
   * removes an existing mod
   */
  removeMod(other: T): this {
    if (this.hasMod(other)) {
      return this.withMutations(builder => {
        return {
          ...builder,
          mods: this.mods.filter(
            mod => mod.props.primary !== other.props.primary,
          ),
        };
      });
    } else {
      return this;
    }
  }

  indexOfModWithPrimary(primary: number): number {
    return this.mods.findIndex(mod => mod.props.primary === primary);
  }

  indexOfMod(mod: T): number {
    return this.indexOfModWithPrimary(mod.props.primary);
  }

  hasMod(mod: T): boolean {
    return this.indexOfMod(mod) !== -1;
  }

  /**
   * tags of the mods in the container
   */
  getTags(): TagProps[] {
    return this.mods
      .reduce((tags, mod) => {
        return tags.concat(mod.props.tags);
      }, [])
      .filter(
        // unique by id
        (tag, i, tags) => tags.findIndex(other => other.id === tag.id) === i,
      );
  }

  asArray(): T[] {
    return this.mods;
  }

  /**
   * @param {number} mod_type generation type
   */
  numberOfModsOfType(mod_type: number): number {
    return this.mods.filter(mod => mod.props.generation_type === mod_type)
      .length;
  }

  /**
   * checks if theres more place for a mod with their generationtype
   */
  hasRoomFor(mod: T): boolean {
    return (
      this.numberOfModsOfType(mod.props.generation_type) <
      this.maxModsOfType(mod)
    );
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  maxModsOfType(mod: T): number {
    throw new AbstractMethod('maxModsOfType');
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  inDomainOf(mod_domain: number): boolean {
    throw new AbstractMethod('inDomainOf');
  }

  /**
   * @abstract
   */
  level(): number {
    throw new AbstractMethod('level');
  }
}
