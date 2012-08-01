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
		"Primary" : { Type : Ability_Shoot, Projectile: IceBolt }
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
		"Primary" : { Type : Ability_Shoot, PlayAnim : true, Projectile: Arrow }
	},
	ActionAnimations:
	{
		"Shoot" : [ 4, 13, 2 ]
	}

});

var Lich = Creature.extend(
{
	Sprites : ['lich'],
	Speed : 0.25,
	Health : 2000,
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
		"Primary" : { Type : Ability_Shoot, Projectile: IceBolt }
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
		"Primary" : { Type : Ability_Shoot, Projectile: IceBolt }
	}
})

var Dummy = Creature.extend(
{
	Sprites : ['dummy'],
	Speed : 0.3,
	Health : 3000,
	SoulPoints : 500,
	AIProfile : { Goals : [ Goal_Boss ]	},
	WalkAnimationFrames: 8,
	WalkAnimationSpeed: 10,
	WalkAnimationRows : [0, 0, 0, 0],
	Abilities:
	{
		"Primary" : { Type : Ability_Melee, PlayAnim : true, Range : 0, Span : 2, Damage : 30 }
	},
	ActionAnimations:
	{
		"Melee" : [ 0, 8, 2, 0 ]
	}
});
