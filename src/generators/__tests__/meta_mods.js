// @flow
import { Item } from '../../containers/';
import {
  Alteration,
  Augment,
  Chaos,
  Exalted,
  MasterBenchOption,
  Regal,
  Scouring,
} from '../';
import { Mod, MasterMod, metaMods as META_MODS } from '../../mods';
import { findByPrimary } from '../../__fixtures__/util';

const baseitemtypes = require('../../__fixtures__/baseitemtypes.json');
const craftingbenchoptions = require('../../__fixtures__/craftingbenchoptions.json');
const meta_datas = require('../../__fixtures__/meta_data.json');
const mods = require('../../__fixtures__/mods.json');

describe('no_*_mods', () => {
  const weapon = Item.build(
    findByPrimary(baseitemtypes, 1025),
    meta_datas,
  ).setRarity('rare');

  const no_attack_mods = MasterMod.build(
    findByPrimary(mods, META_MODS.NO_ATTACK_MODS),
    craftingbenchoptions,
  );

  const no_caster_mods = MasterMod.build(
    findByPrimary(mods, META_MODS.NO_CASTER_MODS),
    craftingbenchoptions,
  );

  const exalted = Exalted.build(mods);

  // pre
  expect(
    exalted
      .modsFor(weapon)
      .find(({ mod }) => mod.props.id === 'SpellAddedFireDamage1'),
  ).toBeDefined();

  // post
  expect(
    exalted
      .modsFor(weapon.addMod(no_caster_mods))
      .find(({ mod }) => mod.props.id === 'SpellAddedFireDamage1'),
  ).toBeUndefined();

  // pre
  expect(
    exalted
      .modsFor(weapon)
      .find(
        ({ mod }) => mod.props.id === 'LocalIncreasedPhysicalDamagePercent3',
      ),
  ).toBeDefined();

  // post
  expect(
    exalted
      .modsFor(weapon.addMod(no_attack_mods))
      .find(
        ({ mod }) => mod.props.id === 'LocalIncreasedPhysicalDamagePercent3',
      ),
  ).toBeUndefined();
});

describe('leo pvp mod', () => {
  it('should exclude mods above required level 28', () => {
    const weapon = Item.build(
      findByPrimary(baseitemtypes, 1025),
      meta_datas,
    ).setRarity('rare');

    const leo_mod = MasterMod.build(
      findByPrimary(mods, META_MODS.LLD_MOD),
      craftingbenchoptions,
    );

    const exalted = Exalted.build(mods);

    expect(weapon.props.item_level).toBeGreaterThan(50);

    expect(
      exalted
        .modsFor(weapon.addMod(leo_mod))
        .every(({ mod }) => mod.requiredLevel() <= 28),
    ).toBe(true);
  });
});

describe('multimod', () => {
  const bench = MasterBenchOption.build(craftingbenchoptions, 1);

  it('should allow more than one crafted mod', () => {
    const craftable_greaves = Item.build(
      findByPrimary(baseitemtypes, 1650),
      meta_datas,
    ).setRarity('rare');

    const craftedLife = MasterMod.build(
      findByPrimary(mods, 5596),
      craftingbenchoptions,
    );
    const craftedArmour = MasterMod.build(
      findByPrimary(mods, 5550),
      craftingbenchoptions,
    );
    const multimod = MasterMod.build(
      findByPrimary(mods, META_MODS.MULTIMOD),
      craftingbenchoptions,
    );

    expect(bench.isModApplicableTo(craftedLife, craftable_greaves)).toEqual({
      above_lld_level: false,
      already_present: false,
      domain_full: false,
      lower_ilvl: false,
      no_multimod: false,
      wrong_domain: false,
      wrong_itemclass: false,
    });

    expect(
      bench.isModApplicableTo(
        craftedArmour,
        craftable_greaves.addMod(craftedLife),
      ),
    ).toEqual({
      above_lld_level: false,
      already_present: false,
      domain_full: false,
      lower_ilvl: false,
      no_multimod: true,
      wrong_domain: false,
      wrong_itemclass: false,
    });

    expect(
      bench.isModApplicableTo(
        craftedArmour,
        craftable_greaves.addMod(multimod).addMod(craftedLife),
      ),
    ).toEqual({
      above_lld_level: false,
      already_present: false,
      domain_full: false,
      lower_ilvl: false,
      no_multimod: false,
      wrong_domain: false,
      wrong_itemclass: false,
    });
  });
});

// see http://i.imgur.com/sNpdDBS.jpg
describe('lock_*', () => {
  const ipd = new Mod(findByPrimary(mods, 793));
  const flatphys = new Mod(findByPrimary(mods, 938));
  const ias = new Mod(findByPrimary(mods, 1904));
  const crit = new Mod(findByPrimary(mods, 2170));

  const weapon = Item.build(findByPrimary(baseitemtypes, 1025), meta_datas);

  const locked_prefixes = MasterMod.build(
    findByPrimary(mods, META_MODS.LOCKED_PREFIXES),
    craftingbenchoptions,
  );

  const locked_suffixes = MasterMod.build(
    findByPrimary(mods, META_MODS.LOCKED_SUFFIXES),
    craftingbenchoptions,
  );

  describe('with alteration', () => {
    const alteration = Alteration.build(mods);
    const craftable = weapon.setRarity('magic');

    it('should not change prefixes', () => {
      const pre = craftable.addMod(ipd).addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(2);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = alteration.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods.length).toBeGreaterThanOrEqual(1);
        expect(post.mods).toContain(ipd);
        expect(post.mods).not.toContain(locked_prefixes);
      }
    });

    it('should not change suffixes', () => {
      const pre = craftable.addMod(ias).addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(2);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = alteration.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods.length).toBeGreaterThanOrEqual(1);
        expect(post.mods).toContain(ias);
        expect(post.mods).not.toContain(locked_prefixes);
      }
    });
  });

  describe('with augment', () => {
    const augment = Augment.build(mods);
    const craftable = weapon.setRarity('magic');

    it('should be able to add prefixes', () => {
      const pre = craftable.addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = augment.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_prefixes);
      }
    });

    it('should be able to add suffixes', () => {
      const pre = craftable.addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = augment.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_suffixes);
      }
    });
  });

  describe('with chaos', () => {
    const chaos = Chaos.build(mods);
    const craftable = weapon
      .setRarity('rare')
      .addMod(ipd)
      .addMod(flatphys)
      .addMod(ias)
      .addMod(crit);

    it('should not change prefixes', () => {
      const pre = craftable.addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(5);
      expect(pre.getPrefixes()).toHaveLength(2);
      expect(pre.getSuffixes()).toHaveLength(3);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = chaos.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.getPrefixes()).toHaveLength(2);
        expect(post.mods).toContain(ipd);
        expect(post.mods).toContain(flatphys);
        expect(post.mods).not.toContain(locked_prefixes);
        expect(post.getSuffixes().length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should not change suffixes', () => {
      const pre = craftable.addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(5);
      expect(pre.getPrefixes()).toHaveLength(3);
      expect(pre.getSuffixes()).toHaveLength(2);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = chaos.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.getSuffixes()).toHaveLength(2);
        expect(post.mods).toContain(ias);
        expect(post.mods).toContain(crit);
        expect(post.mods).not.toContain(locked_suffixes);
        expect(post.getPrefixes().length).toBeGreaterThanOrEqual(2);
      }
    });

    it('should stay the same with both', () => {
      const pre = weapon
        .setRarity('rare')
        .addMod(ias)
        .addMod(locked_prefixes)
        .addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(3);

      const post = chaos.applyTo(pre);

      expect(post.mods).toHaveLength(3);
      expect(post.mods).toContain(ias);
      expect(post.mods).toContain(locked_prefixes);
      expect(post.mods).toContain(locked_suffixes);
    });
  });

  describe('with exalted', () => {
    const exalted = Exalted.build(mods);
    const craftable = weapon.setRarity('rare');

    it('should be able to add prefixes', () => {
      const pre = craftable.addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = exalted.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_prefixes);
      }
    });

    it('should be able to add suffixes', () => {
      const pre = craftable.addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = exalted.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_suffixes);
      }
    });
  });

  describe('with regal', () => {
    const regal = Regal.build(mods);
    const craftable = weapon.setRarity('magic');

    it('should be able to add prefixes', () => {
      const pre = craftable.addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = regal.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_prefixes);
      }
    });

    it('should be able to add suffixes', () => {
      const pre = craftable.addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = regal.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.mods).toHaveLength(2);
        expect(post.mods).toContain(locked_suffixes);
      }
    });
  });

  describe('with scour', () => {
    const scouring = new Scouring();
    const craftable = weapon
      .setRarity('rare')
      .addMod(flatphys)
      .addMod(ias);

    it('should not change prefixes', () => {
      const pre = craftable.addMod(locked_prefixes);

      expect(pre.mods).toHaveLength(3);
      expect(pre.getPrefixes()).toHaveLength(1);
      expect(pre.getSuffixes()).toHaveLength(2);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = scouring.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.getPrefixes()).toHaveLength(1);
        expect(post.getSuffixes()).toHaveLength(0);
        expect(post.mods).toContain(flatphys);
        expect(post.props.rarity).toBe('rare');
      }
    });

    it('should not change suffixes', () => {
      const pre = craftable.addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(3);
      expect(pre.getPrefixes()).toHaveLength(2);
      expect(pre.getSuffixes()).toHaveLength(1);

      // random testing
      for (let tries = 1; tries <= 10; tries += 1) {
        const post = scouring.applyTo(pre);

        expect(post).not.toBe(pre);
        expect(post.getPrefixes()).toHaveLength(0);
        expect(post.getSuffixes()).toHaveLength(1);
        expect(post.mods).toContain(ias);
        expect(post.props.rarity).toBe('rare');
      }
    });

    it('should stay the same with both', () => {
      const pre = weapon
        .setRarity('rare')
        .addMod(ias)
        .addMod(locked_prefixes)
        .addMod(locked_suffixes);

      expect(pre.mods).toHaveLength(3);

      const post = scouring.applyTo(pre);

      expect(post.mods).toHaveLength(3);
      expect(post.mods).toContain(ias);
      expect(post.mods).toContain(locked_prefixes);
      expect(post.mods).toContain(locked_suffixes);
    });
  });
});
