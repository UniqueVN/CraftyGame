var ProjectileFactory = Class(
{
	Spawn : function(world, definition, x, y)
	{
		var entity = Crafty.e("2D, DOM, Body, Movable, Projectile, " + definition.Sprite)
			.attr(
			{
				TileWidth:1,
				TileHeight:1,
				MovementSpeed : 0.3,
				IsDirectionalProjectile : true,
				SpriteVerticalOffset : (definition.VerticalOffset || 0),
				ProjectileAnimations : (definition.Animations || {}),
				Damage : (definition.Damage || 1),
				DamageRadius : (definition.DamageRadius || 0),
				Fuse : (definition.Fuse || 0)
			})
			.Appear(world, x, y);

		return entity;
	}
});

var PickupTypes = [ 'dark', 'fire', 'light' ];

var Pickups =
{
	Spawn : function(world, x, y)
	{
		var name = Crafty.math.randomElementOfArray(PickupTypes);
		var sprite = "coin_" + name;

		var entity = Crafty.e("2D, DOM, Body, Pickup, SpriteAnimation, " + sprite)
			.attr(
			{
				TileWidth:1,
				TileHeight:1,
				PickupName:name
			})
			.Appear(world, x, y);

		var row = Math.round(entity.__coord[1] / entity.h);

		entity.animate('Spin', 0, row, 7);
		entity.animate('Spin', 32, -1);
	}
};