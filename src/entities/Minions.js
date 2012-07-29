var Minion = Creature.extend({
	Faction : Factions.Monk
});

var Minions =
{
	Highlander :
	{
		Cost : 100,
		SummonTime : 1200,
		StatueSprite : 'statue_highlander',
		Definition : Minion.extend(
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
		})
	},

	PlatinumWarrior :
	{
		Cost : 250,
		SummonTime : 2000,
		StatueSprite : 'statue_platinumWarrior',
		Definition : Minion.extend(
		{
			Sprites : ['armorWhite'],
			Speed : 0.08,
			WalkAnimationFrames: 9,
			Abilities:
			{
				"Primary" : { Type : Ability_Shoot }
			}
		})
	}
};
