export type RepeatingSection<T> = {
    containerSelector: string;
    items: T[];
}

export type Roll20NpcSheet = {
    attr_character_name: string;
    attr_npc_type: string;
    attr_level: string;
    attr_alignment: string;
    attr_size: string;
    attr_traits: string | null;
    attr_perception: string;
    attr_senses: string | null;
    attr_languages: string | null;
    attr_npc_short_description: string | null;
    attr_acrobatics: string | null;
    attr_arcana: string | null;
    attr_athletics: string | null;
    attr_crafting: string | null;
    attr_deception: string | null;
    attr_diplomacy: string | null;
    attr_intimidation: string | null;
    attr_medicine: string | null;
    attr_nature: string | null;
    attr_occultism: string | null;
    attr_performance: string | null;
    attr_religion: string | null;
    attr_society: string | null;
    attr_stealth: string | null;
    attr_survival: string | null;
    attr_thievery: string | null;
    attr_acrobatics_notes: string | null;
    attr_arcana_notes: string | null;
    attr_athletics_notes: string | null;
    attr_crafting_notes: string | null;
    attr_deception_notes: string | null;
    attr_diplomacy_notes: string | null;
    attr_intimidation_notes: string | null;
    attr_medicine_notes: string | null;
    attr_nature_notes: string | null;
    attr_occultism_notes: string | null;
    attr_performance_notes: string | null;
    attr_religion_notes: string | null;
    attr_society_notes: string | null;
    attr_stealth_notes: string | null;
    attr_survival_notes: string | null;
    attr_thievery_notes: string | null;

    repeating_lore: RepeatingSection<Lore> | null;

    attr_strength_modifier: string;
    attr_dexterity_modifier: string;
    attr_constitution_modifier: string;
    attr_intelligence_modifier: string;
    attr_wisdom_modifier: string;
    attr_charisma_modifier: string;
    attr_armor_class: string;
    textarea_attr_armor_class_notes: string | null;
    attr_saving_throws_fortitude: string;
    attr_saving_throws_reflex: string;
    attr_saving_throws_will: string;
    textarea_attr_saving_throws_notes: string | null;
    attr_hit_points_max: string;
    textarea_attr_hit_points_notes: string | null;
    attr_hit_points: string;
    attr_immunities: string | null;
    attr_weaknesses: string | null;
    attr_resistances: string | null;
    attr_speed: string;
    attr_speed_notes: string | null;

    repeating_items_worn: RepeatingSection<ItemWorn> | null;

    repeating_interaction_abilities: RepeatingSection<InteractionAbility> | null;

    repeating_free_actions_reactions: RepeatingSection<FreeActionReaction> | null;

    repeating_melee_strikes: RepeatingSection<MeleeStrike> | null;

    repeating_ranged_strikes: RepeatingSection<RangedStrike> | null;

    repeating_actions_activities: RepeatingSection<ActionActivity> | null;
}

export type Lore = {
    attr_lore_name: string;
    attr_lore: string;
    attr_lore_notes: string;
}

export type ItemWorn = {
    attr_worn_item: string;
    attr_worn_misc: string;
    textarea_attr_description: string;
}

export type InteractionAbility = {
    attr_name: string;
    attr_rep_traits: string;
    textarea_attr_description: string;
}

export type FreeActionReaction = {
    attr_name: string;
    checkbox_free_action_attr_free_action: string; //(checkbox value = 'free action')
    checkbox_reaction_attr_reaction: string;
    attr_rep_traits: string;
    attr_source: string;
    attr_trigger: string;
    textarea_attr_description: string;
}

export type MeleeStrike = {
    attr_weapon: string;
    attr_weapon_strike: string;
    attr_weapon_traits: string;
    checkbox_1_attr_weapon_agile: string;
    attr_weapon_strike_damage: string;
    attr_weapon_strike_damage_type: string;
    attr_weapon_strike_damage_additional: string;
    attr_weapon_notes: string;
}

export type RangedStrike = {
    attr_weapon: string;
    attr_weapon_strike: string;
    attr_weapon_traits: string;
    checkbox_1_attr_weapon_agile: string;
    attr_weapon_strike_damage: string;
    attr_weapon_strike_damage_type: string;
    attr_weapon_strike_damage_additional: string;
    attr_weapon_range: string;
    attr_weapon_notes: string;
}

export type ActionActivity = {
    attr_name: string;
    attr_actions: string;
    attr_rep_traits: string;
    attr_source: string;
    textarea_attr_description: string;
}




