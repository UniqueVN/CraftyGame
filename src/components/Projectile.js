Crafty.c('Projectile',
{
	MaxFlyDistance : 20,
	IsDirectionalProjectile : false,
	Fuse : 0,
	DamageRadius : 0,
	Damage : 1,
	ProjectileAnimations : null,
	Size : 0,

	_instigator : null,
	_projectileStartLoc : null,
	_currentFuse : 0,

	init: function()
	{
		this.requires("Movable")
	},

	_initProjectile : function(instigator)
	{
		this._instigator = instigator;

		if (this.ProjectileAnimations != null)
		{
			this.requires('SpriteAnimation')
			for (var name in this.ProjectileAnimations)
			{
				var data = this.ProjectileAnimations[name];
				this.animate(name, data[0], data[1], data[2]);
			}
		}
	},

	Launch : function(instigator, dir)
	{
		this._initProjectile(instigator);

		if (this.IsDirectionalProjectile)
		{
			this.origin("center");
			var theta = Math.acos(dir.x) * 180.0 / Math.PI;
			if (dir.y < 0)
				theta = - theta;

			//console.log("theta ", theta);
			this.rotation = theta;
		}

		this.SetMotionDir(dir);
		this._projectileStartLoc = this.GetCenter();
		this.bind("BodyMoved", this._projectileMoved);
		this._playProjectileAnim('Flying', -1);
	},

	Detonate : function(instigator, dir)
	{
		this._initProjectile(instigator);
		this._explode(dir);
		this._igniteFuse();
	},

	_projectileMoved : function(data)
	{
		var from = data.from;
		var to = data.to;

		var result = this._world.CollisionMap.LineCheck(from, to, this.Size)
		var hits = result.hits;
		var hitEntities = [];
		for (var i = 0; i < hits.length; i++)
		{
			var hitEntity = hits[i].entity;
			if (hitEntity != this._instigator && !hitEntity.IsFriendly(this._instigator))
			{
				hitEntities.push(hitEntity);
			}
		}

		if (hitEntities.length <= 0)
		{
			var hit = this._world.TerrainMap.LineCheck(from, to, this.Size);
			if (hit != null)
			{
				var entity = hit.cell.entity;
				if (entity.has('Building') && !entity.IsFriendly(this._instigator))
					hitEntities.push(entity);
			}
		}

		if (hitEntities.length > 0 && this.DamageRadius <= 0)
		{
			for (var i = 0; i < hitEntities.length; i++)
			{
				if (hitEntities[i].has("Damageable"))
					hitEntities[i].TakeDamage(this.Damage);
			}
		}

		if (hitEntities.length > 0 || Math3D.Distance(this._projectileStartLoc, to) >= this.MaxFlyDistance)
		{
			this.StopMotion();
			this.rotation = 0;
			this._explode();
			if (this.DamageRadius > 0)
			this._igniteFuse();
		}
	},

	_igniteFuse : function()
	{
		if (this.Fuse > 0)
		{
			this._currentFuse = this.Fuse;
			this.bind("EnterFrame", this._updateFuse);
		}
		else
		{
			this._damageRadius();
		}
	},

	_updateFuse : function()
	{
		if (--this._currentFuse <= 0)
		{
			this._damageRadius();
			this.unbind("EnterFrame", this._updateFuse);
		}
	},

	_damageRadius : function()
	{
		if (this.DamageRadius <= 0)
			throw ("Projectile damage radius fail! radius set to 0");

		var result = this._world.CollisionMap.RadiusCheck(this.GetCenter(), this.DamageRadius);
		var hits = result.hits;
		for (var i = 0; i < hits.length; i++)
		{
			var hit = hits[i].entity;
			if (hit != this._instigator && !hit.IsFriendly(this._instigator) && hit.has("Damageable"))
			{
				hit.TakeDamage(this.Damage);
			}
		}
	},

	_explode : function(dir)
	{
		var animName = "Explosion";
		if (dir)
		{
			var fullName = animName + "_" + DirectionToString(dir);
			if (this.ProjectileAnimations[fullName])
				animName = fullName;
		}

		this._playProjectileAnim(animName, 0, this.destroy);
	},

	_playProjectileAnim : function(name, repeat, callback)
	{
		if (this.ProjectileAnimations != null)
		{
			var data = this.ProjectileAnimations[name];
			if (data)
			{
				this.stop().animate(name, data[3], repeat);
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

		if (repeat >= 0)
			callback.call(this);
	}
});
