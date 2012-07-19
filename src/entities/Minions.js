Minion = Creature.extend({
	Faction : Factions.Monk
});

PlatinumWorrior = Minion.extend(
{
	Sprites : ['armorWhite'],
	Speed : 0.08,
	WalkAnimationFrames: 9,
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot }
	}
});

Highlander = Minion.extend(
{
	Sprites : ['swordsman'],
	Speed : 0.08,
	WalkAnimationFrames: 9,
	Abilities:
	{
		"Primary" : { Type : Ability_Melee, PlayAnim : true }
	},
	ActionAnimations:
	{
		"Melee" : [ 4, 6 ]
	}
});