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