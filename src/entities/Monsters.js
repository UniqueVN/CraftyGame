var Slime = Creature.extend(
{
	Sprites : ['slime'],
	Speed : 0.05,
	WalkAnimationFrames: 3,
	WalkAnimationRows : [0, 3, 2, 1]
});

var Ghost = Creature.extend(
{
	Sprites : ['ghost'],
	Speed : 0.05,
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
	WalkAnimationFrames: 9,
	Abilities:
	{
		"Primary" : { Type : Ability_Shoot, PlayAnim : true }
	},
	ActionAnimations:
	{
		"Shoot" : [ 4, 13 ]
	}

});

var Pumpkin = Creature.extend(
{
	Sprites : ['pumpkin'],
	Speed : 0.07,
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
	WalkAnimationFrames: 8,
	WalkAnimationRows : [0, 0, 0, 0],
	Abilities:
	{
		"Primary" : { Type : Ability_Melee, PlayAnim : false }
	}
});
