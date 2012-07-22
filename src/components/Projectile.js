Crafty.c('Projectile',
{
	MaxFlyDistance : 20,
	IsDirectionalProjectile : false,
	_instigator : null,
	_projectileStartLoc : null,
	ProjectileAnimations : null,

	init: function()
	{
		this.requires("Movable")
	},

	Launch : function(instigator, dir)
	{
		if (this.IsDirectionalProjectile)
		{
			this.origin("center");
			var theta = Math.acos(dir.x) * 180.0 / Math.PI;
			if (dir.y < 0)
				theta = - theta;

			//console.log("theta ", theta);
			this.rotation = theta;
		}

		if (this.ProjectileAnimations != null)
		{
			this.requires('SpriteAnimation')
			for (var name in this.ProjectileAnimations)
			{
				var data = this.ProjectileAnimations[name];
				this.animate(name, data[0], data[1], data[2]);
			}
		}


		this._instigator = instigator;
		this.SetMotionDir(dir);
		this._projectileStartLoc = this.GetCenter();
		this.bind("BodyMoved", this._projectileMoved);
		this._playProjectileAnim('Flying', -1);
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
			this.StopMotion();
			this.rotation = 0;
			this._detonate();
		}
	},

	_detonate : function()
	{
		this._playProjectileAnim('Explosion', 0, this.destroy);
	},

	_playProjectileAnim : function(name, repeat, callback)
	{
		if (this.ProjectileAnimations != null)
		{
			var data = this.ProjectileAnimations[name];
			if (data)
			{
				this.animate(name, data[3], repeat);
				if (repeat >= 0)
				{
					this.bind("AnimationEnd", function()
					{
						this.unbind("AnimationEnd");
						callback.call(this);
					});
				}
				return;
			}
		}

		callback.call(this);
	}
});
