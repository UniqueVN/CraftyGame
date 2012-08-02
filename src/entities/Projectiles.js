FireBall =
{
	Sprite : 'fireball',
	Animations :
	{
		Flying : [ 0, 0, 2, 6 ],
		Explosion : [ 3, 0, 18, 64]
	},
	Damage : 20,
	Size : 0.25,

	VerticalOffset : -48
};

IonSplit =
{
	Sprite : 'laser',

	Animations :
	{
		//Flying : [ 0, 1, 3, 8 ]
		Explosion : [ 1, 0, 17, 34]
	},
	Damage : 20,

	VerticalOffset : 16
};

MagicMissle =
{
	Sprite : 'magicMissle',
	Animations :
	{
		//Flying : [ 0, 0, 2, 6 ],
		Explosion : [ 1, 0, 8, 32]
	},
	Damage : 20,

	VerticalOffset : -20
};

IceBolt =
{
	Sprite : 'icebolt',
	Animations :
	{
		Flying : [ 0, 0, 2, 6 ],
		Explosion : [ 3, 0, 10, 24]
	},
	Damage : 20,

	VerticalOffset : -20
};

Arrow =
{
	Sprite : 'arrow',
	Animations :
	{
		//Flying : [ 0, 0, 2, 6 ],
		//Explosion : [ 1, 0, 8, 32]
	},
	Damage : 15,

	VerticalOffset : 0
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

	Damage : 90,
	DamageRadius : 2,
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

	Damage : 70,
	DamageRadius : 1.5,
	Fuse : 24,

	VerticalOffset : 0
};