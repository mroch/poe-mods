// @flow
import { type TagProps } from '../schema';

import meta_datas from './meta_data';

export type MetaDataProps = {
  extends: string,
  inheritance: string[],
  tags: TagProps[],
  // generic fascades
  [string]: {
    [string]: string[],
  },
  // specific fascade
  AttributeRequirements?: {
    dexterity_requirement: string[],
    intelligence_requirement: string[],
    strength_requirement: string[],
  },
  Base?: {
    tag?: string[],
    x_size?: string[],
    y_size?: string[],
  },
  Quality?: {
    max_quality: string[],
  },
  Sockets?: {
    socket_info: string[],
  },
  Usable?: {
    action: string[],
    use_type: string[],
  },
  Weapon?: {
    accuracy_rating?: string[],
    critical_chance?: string[],
    minimum_attack_distance?: string[],
    maximum_attack_distance?: string[],
    minimum_damage?: string[],
    maximum_damage?: string[],
    weapon_speed?: string[],
    weapon_class?: string[],
  },
};

export type MetaDataMap = {
  [string]: MetaDataProps,
};

/**
 * class Metadata
 * 
 * representation of a .ot file in METADATA 
 */
export default class MetaData {
  static build(clazz: string): ?MetaData {
    if (meta_datas[clazz] != null) {
      return new MetaData(clazz, meta_datas[clazz]);
    } else {
      return null;
    }
  }

  clazz: string;
  props: MetaDataProps;

  constructor(clazz: string, props: MetaDataProps) {
    this.clazz = clazz;
    this.props = props;
  }

  isA(other: string): boolean {
    return other === this.clazz || this.props.inheritance.indexOf(other) !== -1;
  }
}
