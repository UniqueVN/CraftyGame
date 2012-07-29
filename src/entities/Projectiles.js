FireBall =
{
	Sprite : 'fireball',
	Animations :
	{
		Flying : [ 0, 0, 2, 6 ],
		Explosion : [ 3, 0, 18, 64]
	},
	Damage : 20,

	VerticalOffset : -48
};

FlamingHound =
{
	Sprite : 'flamingHound',
	Animations :
	{
		Explosion_up : [ 0, 0, 15, 32],
		Explosion_left : [ 0, 1, 15, 32],
		Explosion_down : [ 0, 2, 15, 32],
		Explosion_right : [ 0, 3, 15, 32]
	},

	Damage : 30,
	DamageRadius : 1.5,
	Fuse : 16,

	VerticalOffset : 0
};

Lightning =
{
	Sprite : 'lightning',
	Animations :
	{
		Explosion : [ 0, 0, 15, 48]
	},

	Damage : 20,
	DamageRadius : 1,
	Fuse : 24,

	VerticalOffset : 0
};