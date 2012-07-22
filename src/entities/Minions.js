var Minion = Creature.extend({
	Faction : Factions.Monk
});

var PlatinumWarrior = Minion.extend(
{
	Sprites : ['armorWhite'],
	Speed : 0.08,
	WalkAnimationFrames: 9,
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot }
	}
});

var Highlander = Minion.extend(
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
		"Melee" : [ 4, 6, 3 ]
	}
});