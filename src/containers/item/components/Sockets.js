// @flow
import type { Component } from '../Component';
import type Item from '../Item';

export interface Sockets {
  max(): number,
}

export type Builder = number;

export default class ItemSockets implements Sockets, Component<Item, Builder> {
  amount: number;
  parent: Item;

  constructor(item: Item, builder: Builder) {
    this.parent = item;
    this.amount = builder;
  }

  builder() {
    return this.amount;
  }

  // TODO: what about Corroded Blades or other similar 1x4 Items. Confirm
  // that they also only can have max 4 sockets like Rods or act like small_Staff
  max(): number {
    const by_stats = this._maxOverride();

    // tags take priority
    if (by_stats != null) {
      return by_stats;
    } else {
      return Math.min(
        this._maxByDimensions(),
        this._maxByLevel(),
        this._maxByMetaData(),
      );
    }
  }

  any(): boolean {
    return this.amount > 0;
  }

  _maxByMetaData(): number {
    const { meta_data } = this.parent;

    if (meta_data.isA('AbstractShield')) {
      return 3;
    } else if (meta_data.isA('AbstractArmour')) {
      return 6;
    } else if (meta_data.isA('AbstractOneHandWeapon')) {
      return 3;
    } else if (meta_data.isA('AbstractFishingRod')) {
      return 4;
    } else if (meta_data.isA('AbstractTwoHandWeapon')) {
      return 6;
    } else if (meta_data.isA('Equipment')) {
      return 0;
    } else {
      throw new Error(
        `Can't determine sockes from meta data for ${meta_data.clazz}`,
      );
    }
  }

  _maxByLevel(): number {
    const { props } = this.parent;

    if (props.item_level <= 1) {
      return 2;
    } else if (props.item_level <= 2) {
      return 3;
    } else if (props.item_level <= 25) {
      return 4;
    } else if (props.item_level <= 35) {
      return 5;
    } else {
      return 6;
    }
  }

  _maxByDimensions(): number {
    const { width, height } = this.parent.baseitem;

    return width * height;
  }

  _maxOverride(): ?number {
    const stats = this.parent.stats();
    const tags = this.parent.getTags();

    if (stats.local_has_X_sockets != null) {
      return stats.local_has_X_sockets.values.max;
    } else if (tags.find(({ id }) => id === 'small_staff') !== undefined) {
      return 3;
    }

    return undefined;
  }
}
