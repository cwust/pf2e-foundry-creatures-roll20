import { Injectable } from '@angular/core';
import { ActionActivity, FreeActionReaction, InteractionAbility, ItemWorn, Lore, MeleeStrike, RangedStrike, RepeatingSection, Roll20NpcSheet } from './types';

@Injectable({
  providedIn: 'root'
})
export class FoundryToRoll20Service {

  constructor() { }

  convertFoundrySheetToRoll20(from: any): Roll20NpcSheet {
    return {
      attr_character_name: from.name,
      attr_npc_type: from.system.details.creatureType,
      attr_level: from.system.details.level.value,
      attr_alignment: from.system.details.alignment.value,
      attr_size: from.system.traits.size.value,
      attr_traits: this.join(from.system.traits.value),
      attr_perception: from.system.attributes.perception.value,
      attr_senses: this.join(from.system.traits.senses, (s: any) => s.value),
      attr_languages: this.join(from.system.traits.languages.value),
      attr_npc_short_description: this.parseDescription(from.system.details.publicNotes),
      attr_acrobatics: this.extractSkill(from, 'acrobatics'),
      attr_arcana: this.extractSkill(from, 'arcana'),
      attr_athletics: this.extractSkill(from, 'athletics'),
      attr_crafting: this.extractSkill(from, 'crafting'),
      attr_deception: this.extractSkill(from, 'deception'),
      attr_diplomacy: this.extractSkill(from, 'diplomacy'),
      attr_intimidation: this.extractSkill(from, 'intimidation'),
      attr_medicine: this.extractSkill(from, 'medicine'),
      attr_nature: this.extractSkill(from, 'nature'),
      attr_occultism: this.extractSkill(from, 'occultism'),
      attr_performance: this.extractSkill(from, 'performance'),
      attr_religion: this.extractSkill(from, 'religion'),
      attr_society: this.extractSkill(from, 'society'),
      attr_stealth: this.extractSkill(from, 'stealth'),
      attr_survival: this.extractSkill(from, 'survival'),
      attr_thievery: this.extractSkill(from, 'thievery'),
      attr_acrobatics_notes: null,
      attr_arcana_notes: null,
      attr_athletics_notes: null,
      attr_crafting_notes: null,
      attr_deception_notes: null,
      attr_diplomacy_notes: null,
      attr_intimidation_notes: null,
      attr_medicine_notes: null,
      attr_nature_notes: null,
      attr_occultism_notes: null,
      attr_performance_notes: null,
      attr_religion_notes: null,
      attr_society_notes: null,
      attr_stealth_notes: null,
      attr_survival_notes: null,
      attr_thievery_notes: null,
      repeating_lore: this.extractLores(from),
      attr_strength_modifier: this.modifierText(from.system.abilities.str.mod),
      attr_dexterity_modifier: this.modifierText(from.system.abilities.dex.mod),
      attr_constitution_modifier: this.modifierText(from.system.abilities.con.mod),
      attr_intelligence_modifier: this.modifierText(from.system.abilities.int.mod),
      attr_wisdom_modifier: this.modifierText(from.system.abilities.wis.mod),
      attr_charisma_modifier: this.modifierText(from.system.abilities.cha.mod),
      attr_armor_class: from.system.attributes.ac.value,
      textarea_attr_armor_class_notes: null,
      attr_saving_throws_fortitude: from.system.saves.fortitude.value,
      attr_saving_throws_reflex: from.system.saves.reflex.value,
      attr_saving_throws_will: from.system.saves.will.value,
      textarea_attr_saving_throws_notes: from.system.attributes.allSaves.value,
      attr_hit_points_max: from.system.attributes.hp.max,
      textarea_attr_hit_points_notes: null,
      attr_hit_points: from.system.attributes.hp.max,
      attr_immunities: this.join(from.system.attributes.immunities, (val: any) => val.type),
      attr_weaknesses: this.join(from.system.attributes.weaknesses, (val: any) => this.weaknessResistanceText(val)),
      attr_resistances: this.join(from.system.attributes.resistances, (val: any) => this.weaknessResistanceText(val)),
      attr_speed: from.system.attributes.speed.value,
      attr_speed_notes: this.join(from.system.attributes.speed.otherSpeeds, (os: any) => `${os.type} ${os.value}`),
      repeating_items_worn: this.extractItemsWorn(from),
      repeating_interaction_abilities: this.extractInteractionAbilities(from),
      repeating_free_actions_reactions: this.extractFreeActionsReactions(from),
      repeating_melee_strikes: this.extractMeleeStrikes(from),
      repeating_ranged_strikes: this.extractRangedStrikes(from),
      repeating_actions_activities: this.extractActionsActivities(from)

    }
  }

  private extractSkill(from: any, skillName: string): string | null {
    const loreItem = from.items.filter((item: any) => item.name.toLowerCase() == skillName.toLowerCase() && item.type == 'lore');

    if (!loreItem || !loreItem.length) {
      return null;
    } else {
      if (loreItem.length > 1) {
        console.warn('Found more than one lore item for skill ' + skillName);
      }
      return this.modifierText(loreItem[0].system.mod.value);
    }
  }

  private extractLores(from: any): RepeatingSection<Lore> | null {
    return null;
  }

  private extractItemsWorn(from: any): RepeatingSection<ItemWorn> | null {
    const items = from.items.filter((it: any) => it.type == 'weapon' || it.type == 'consumable');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-items',
      items: items.map((it: any) => ({
        attr_worn_item: it.name,
        textarea_attr_worn_misc: this.parseDescription(it.system.description.value),
        textarea_attr_description: null
      }))
    };
  }

  private extractInteractionAbilities(from: any): RepeatingSection<InteractionAbility> | null {
    const items = from.items.filter((it: any) => it.type == 'action' && it.system.actionCategory.value == 'interaction');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-interaction-abilities',
      items: items.map((it: any) => ({
        attr_name: it.name,
        attr_rep_traits: this.join(it.system.traits.value),
        textarea_attr_description: this.parseDescription(it.system.description.value)
      }))
    };
  }

  private extractFreeActionsReactions(from: any): RepeatingSection<FreeActionReaction> | null {
    const items = from.items.filter((it: any) => it.type == 'action' && it.system.actionCategory.value == 'defensive');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-free-actions-reactions',
      items: items.map((it: any) => ({
        attr_name: it.name,
        checkbox_free_action_attr_free_action: it.system.actionType == 'free' ? 'free action' : null,
        checkbox_reaction_attr_reaction: it.system.actionType == 'reaction' ? 'reaction' : null,
        attr_rep_traits: this.join(it.system.rules.length ? it.system.rules[0].traits : []),
        attr_source: null,
        attr_trigger: null, //TODO: it's in the middle of the description of the text
        textarea_attr_description: this.parseDescription(it.system.description.value),
      }))
    };
  }

  private extractMeleeStrikes(from: any): RepeatingSection<MeleeStrike> | null {
    const items = from.items.filter((it: any) => it.type == 'melee' && it.system.weaponType.value == 'melee');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-melee-strikes',
      items: items.map((it: any) => ({
        attr_weapon: it.name,
        attr_weapon_strike: it.system.bonus.value,
        attr_weapon_traits: this.join(it.system.traits.value),
        checkbox_1_attr_weapon_agile: ((it.system.traits.value || []).indexOf('agile') >= 0) ? '1' : null,
        attr_weapon_strike_damage: this.getDamageRoll(it).damage,
        attr_weapon_strike_damage_type: this.getDamageRoll(it).damageType,
        attr_weapon_strike_damage_additional: null, //TODO
        attr_weapon_notes: null, //TODO
      }))
    };
  }

  private extractRangedStrikes(from: any): RepeatingSection<RangedStrike> | null {
    const items = from.items.filter((it: any) => it.type == 'melee' && it.system.weaponType.value == 'ranged');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-ranged-strikes',
      items: items.map((it: any) => ({
        attr_weapon: it.name,
        attr_weapon_strike: it.system.bonus.value,
        attr_weapon_traits: this.join(it.system.traits.value),
        checkbox_1_attr_weapon_agile: ((it.system.traits.value || []).indexOf('agile') >= 0) ? '1' : null,
        attr_weapon_strike_damage: this.getDamageRoll(it).damage,
        attr_weapon_strike_damage_type: this.getDamageRoll(it).damageType,
        attr_weapon_strike_damage_additional: null, //TODO
        attr_weapon_range: null, //TODO
        attr_weapon_notes: null, //TODO
      }))
    };
  }

  private extractActionsActivities(from: any): RepeatingSection<ActionActivity> | null {
    const items = from.items.filter((it: any) => it.type == 'action' && it.system.actionCategory.value == 'offensive');

    if (!items || !items.length) {
      return null;
    }

    return {
      containerSelector: 'div.npc-actions-and-activies',
      items: items.map((it: any) => ({
        attr_name: it.name,
        attr_actions: this.getActions(it),
        attr_rep_traits: this.join(it.system.traits.value),
        attr_source: null,
        textarea_attr_description: this.parseDescription(it.system.description.value),
      }))
    };
  }

  private join<T, E extends (inp: T) => string>(arr: T[] | T, extractor?: E): string | null {
    if (!arr) {
      return null;
    }

    if (!Array.isArray(arr)) {
      arr = [arr];
    }

    if (!arr.length) {
      return null;
    }

    let arrStr : string[];
    if (extractor) {
      arrStr = arr.map(it => extractor(it));
    } else {
      arrStr = arr as string[];
    }

    return arrStr.map((str: string) => str.replaceAll('-', ' ')).join(', ');
  }

  private weaknessResistanceText(val: { type: string, value: number, exceptions?: string[] }): string {
    const except = val.exceptions ? '(except ' + val.exceptions.join(', ') + ')' : '';
    return `${val.type} ${val.value} ${except}`;
  }

  private getDamageRoll(item: any): { damage: string, damageType: string } {
    const keys = Object.keys(item.system.damageRolls);
    return item.system.damageRolls[keys[0]];
  }

  private getActions(item: any): string | null {
    if (item.system.actionCategory.value == 'reaction') {
      return 'Reaction';
    } else if (item.system.actionCategory.value == 'free') {
      return 'Free Action';
    } else if (item.system.actions.value) {
      return `${item.system.actions.value} Actions`;
    } else {
      return null;
    }
  }

  private modifierText(mod: any) {
    if (mod !== 0 && !mod) {
      return mod;
    }
    if (typeof mod != 'number') {
      mod = Number(mod);
    }

    if (mod <= 0) {
      return mod.toString();
    } else {
      return '+' + mod;
    }
  }

  private parseDescription(description: string): string {
    if (!description || !description.replaceAll) {
      return description;
    }

    return description
      .replaceAll(/<p>|<\/p>|<hr \/>|<strong>|<ul>|<\/ul>|<\/li>|<em>|<\/em>/g, '')
      .replaceAll('</strong>', ':')
      .replaceAll('<li>', '- ')
      .replaceAll(/@Check\[type:(.*)\|(dc:\d+).*\]/g, '$1 saving throw, $2')
      .replaceAll(/@\w*\[.*\]\{(.*)\}/g, '"$1"')
      .replaceAll(/\[\[\/\w+\s*[^\[\]]*(?:\[[^\]]*\])?\]\]\{([^\}]*)\}/g, "$1")
      .replaceAll(/\[\[\/r\s*([^\[\]]*)(?:\[([^\]]*)\])?\]\]/g, "$1 $2")
      .replaceAll(/@\w*\[.*\]/g, '')
  }
}
