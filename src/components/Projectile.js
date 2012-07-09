Crafty.c('Projectile',
{
	MaxFlyDistance : 20,
	_instigator : null,
	_projectileStartLoc : null,

	init: function()
	{
		this.requires("Body");
		this.NotColliding++;
	},

	Launch : function(instigator, dir)
	{
		this._instigator = instigator;
		this.SetMotionDir(dir);
		this._projectileStartLoc = this.GetCenter();
		this.bind("BodyMoved", this._projectileMoved);
	},

	_projectileMoved : function(data)
	{
		var from = data.from;
		var to = data.to;

		var result = this._world.CollisionMap.LineCheck(from, to)
		var hits = result.hits;
		var hitSomething = false;
		for (var i = 0; i < hits.length; i++)
		{
			var hitEntity = hits[i].entity;
			if (hitEntity != this._instigator && !hitEntity.IsFriendly(this._instigator))
			{
				hitSomething = true;

				if (hitEntity.has("Damageable"))
					hitEntity.TakeDamage(5);
			}
		}

		if (hitSomething || Math3D.Distance(this._projectileStartLoc, to) >= this.MaxFlyDistance)
		{
			this.destroy();
		}
	}
});
