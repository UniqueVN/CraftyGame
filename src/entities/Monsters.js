var Slime = Creature.extend(
{
	Sprites : ['slime'],
	Speed : 0.05,
	SoulPoints : 10,
	WalkAnimationFrames: 3,
	WalkAnimationRows : [0, 3, 2, 1]
});

var Ghost = Creature.extend(
{
	Sprites : ['ghost'],
	Speed : 0.05,
	SoulPoints : 20,
	WalkAnimationFrames: 3,
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot }
	}
});

var SkeletonArcher = Creature.extend(
{
	Sprites : ['skeletonArcher'],
	Speed : 0.08,
	SoulPoints : 15,
	WalkAnimationFrames: 9,
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot, PlayAnim : true }
	},
	ActionAnimations:
	{
		"Shoot" : [ 4, 13, 2 ]
	}

});

var Lich = Creature.extend(
{
	Sprites : ['lich'],
	Speed : 0.3,
	SoulPoints : 500,
	AIProfile : { Goals : [ Goal_Boss ]	},
	WalkAnimationFrames: 9,
	WalkAnimationSpeed : 1,
	Abilities:
	{
		"Primary" :
		{
			Type : Ability_Spell,
			PlayAnim : true,
			Spell :
			{
				Pattern : SpellPatterns.Arc,
				Projectile : FireBall,
				Arc : 90,
				Total : 6,
				RandomAngle : 90
			}
		}
	},
	ActionAnimations:
	{
		"Shoot" : [ 4, 7, 2 ]
	}

});

var Pumpkin = Creature.extend(
{
	Sprites : ['pumpkin'],
	Speed : 0.07,
	SoulPoints : 15,
	WalkAnimationFrames: 3,
	// WalkAnimationRows : [0, 3, 2, 1]
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot }
	}
});

var ManEaterFlower = Creature.extend(
{
	Sprites : ['manEaterFlower'],
	Speed : 0.05,
	SoulPoints : 25,
	WalkAnimationFrames: 3,
	WalkAnimationRows : [0, 3, 2, 1],
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot }
	}
})

var Dummy = Creature.extend(
{
	Sprites : ['dummy'],
	Speed : 0.07,
	SoulPoints : 35,
	WalkAnimationFrames: 8,
	WalkAnimationRows : [0, 0, 0, 0],
	Abilities:
	{
		"Primary" : { Type : Ability_Melee, PlayAnim : false }
	}
});
