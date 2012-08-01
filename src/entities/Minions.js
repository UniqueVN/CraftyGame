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

	Dragoon :
	{
		Cost : 600,
		SummonTime : 3000,
		StatueSprite : 'statue_dragoon',
		Definition : Minion.extend(
		{
			Sprites : ['dragoon'],
			Speed : 0.15,
			Health : 600,
			WalkAnimationFrames: 9,
			WalkAnimationSpeed :18,
			Abilities:
			{
				"Primary" : { Type : Ability_Melee, PlayAnim : true, Range : 2, Span : 2, Damage : 30 }
			},
			ActionAnimations:
			{
				"Melee" : [ 4, 8, 4 ]
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
				"Primary" : { Type : Ability_Shoot, PlayAnim:true, Projectile:IonSplit }
			},
			ActionAnimations:
			{
				"Shoot" : [ 4, 9, 2 ]
			}
		})
	},

	Player :
	{
		Cost : 0,
		SummonTime : 800,
		StatueSprite : 'statue_player',
		Definition: Player
	}
};
