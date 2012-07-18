Slime = Creature.extend(
{
	Sprites : ['slime'],
	Speed : 0.05,
	WalkAnimationFrames: 3,
	WalkAnimationRows : [0, 3, 2, 1]
})

Ghost = Creature.extend(
{
	Sprites : ['ghost'],
	Speed : 0.05,
	WalkAnimationFrames: 3
})

SkeletonArcher = Creature.extend(
{
	Sprites : ['skeletonArcher'],
	Speed : 0.08,
	WalkAnimationFrames: 9,
	PlayShootAnim : true,
	ActionAnimations:
	{
		"Shoot" : [ 4, 13 ]
	}

})