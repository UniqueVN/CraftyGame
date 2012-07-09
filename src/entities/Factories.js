var ProjectileFactory = Class(
{
	Spawn : function(world, x, y)
	{
		var entity = Crafty.e("2D, DOM, Body, Projectile, RedBullet")
			.attr(
			{
				TileWidth:1,
				TileHeight:1,
				IsStatic:false,
				MovementSpeed : 0.3
			})
			.Appear(world, x, y);

		return entity;
	}
});