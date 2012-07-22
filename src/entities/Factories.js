var ProjectileFactory = Class(
{
	Spawn : function(world, x, y)
	{
		var entity = Crafty.e("2D, DOM, Body, Movable, Projectile, fireball")
			.attr(
			{
				TileWidth:1,
				TileHeight:1,
				MovementSpeed : 0.3,
				IsDirectionalProjectile : true,
				SpriteVerticalOffset : -48,
				ProjectileAnimations :
				{
					Flying : [ 0, 0, 2, 6 ],
					Explosion : [ 3, 0, 18, 64]
				}
			})
			.Appear(world, x, y);

		return entity;
	}
});

var Pickups =
{
	Spawn : function(world, x, y)
	{
		var pickups = [ 'dark', 'fire', 'light' ];
		var name = Crafty.math.randomElementOfArray(pickups);
		var sprite = "coin_" + name;

		var entity = Crafty.e("2D, DOM, Body, Pickup, SpriteAnimation, " + sprite)
			.attr(
			{
				TileWidth:1,
				TileHeight:1
			})
			.Appear(world, x, y);

		var row = Math.round(entity.__coord[1] / entity.h);

		entity.animate('Spin', 0, row, 7);
		entity.animate('Spin', 32, -1);
	}
};