// @flow
import { createTables } from '../../__fixtures__/util';
import { Alteration, Augment, Chaos, Exalted, Regal, Scouring } from '../';
import { metaMods as META_MODS } from '../../mods';

const { craftingbenchoptions: options, items, mods } = createTables();

describe('no_*_mods', () => {
  const weapon = items.fromPrimary(1025).setRarity('rare');

  const no_attack_mods = mods.fromPrimary(META_MODS.NO_ATTACK_MODS);
  const no_caster_mods = mods.fromPrimary(META_MODS.NO_CASTER_MODS);

  const exalted = Exalted.build(mods.all());

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
    const weapon = items.fromPrimary(1025).setRarity('rare');

    const leo_mod = mods.fromPrimary(META_MODS.LLD_MOD);

    const exalted = Exalted.build(mods.all());

    expect(weapon.props.item_level).toBeGreaterThan(50);

    expect(
      exalted
        .modsFor(weapon.addMod(leo_mod))
        .every(({ mod }) => mod.requiredLevel() <= 28),
    ).toBe(true);
  });
});

describe('multimod', () => {
  const bench = options.fromPrimary(1);

  it('should allow more than one crafted mod', () => {
    const craftable_greaves = items.fromPrimary(1650).setRarity('rare');

    const craftedLife = mods.fromPrimary(5596);
    const craftedArmour = mods.fromPrimary(5550);
    const multimod = mods.fromPrimary(META_MODS.MULTIMOD);

    expect(bench.isModApplicableTo(craftedLife, craftable_greaves)).toEqual({
      above_lld_level: false,
      already_present: false,
      domain_full: false,
      lower_ilvl: false,
      no_multimod: false,
      wrong_domain: false,
    });
    expect(bench.applicableTo(craftable_greaves)).toEqual({
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
    });
    expect(bench.applicableTo(craftable_greaves.addMod(craftedLife))).toEqual({
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
    });
    expect(
      bench.applicableTo(
        craftable_greaves.addMod(multimod).addMod(craftedLife),
      ),
    ).toEqual({ wrong_itemclass: false });
  });
});

// see http://i.imgur.com/sNpdDBS.jpg
describe('lock_*', () => {
  const ipd = mods.fromPrimary(793);
  const flatphys = mods.fromPrimary(938);
  const ias = mods.fromPrimary(1904);
  const crit = mods.fromPrimary(2170);

  const weapon = items.fromPrimary(1025);

  const locked_prefixes = mods.fromPrimary(META_MODS.LOCKED_PREFIXES);

  const locked_suffixes = mods.fromPrimary(META_MODS.LOCKED_SUFFIXES);

  describe('with alteration', () => {
    const alteration = Alteration.build(mods.all());
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
    const augment = Augment.build(mods.all());
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
    const chaos = Chaos.build(mods.all());
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
    const exalted = Exalted.build(mods.all());
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
    const regal = Regal.build(mods.all());
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
