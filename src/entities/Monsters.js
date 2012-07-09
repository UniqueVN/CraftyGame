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