var SpellPatterns =
{
	Line : 0,
	Area : 1
};

Crafty.c('Spell',
{
	Pattern : SpellPatterns.Line,
	Projectile : null,
	Radius : 0,
	Total : 1,

	_center : { x : 0, y : 0 },
	_direction : { x : 1, y : 0 },
	_instigator : null,
	_world : null,

	init: function()
	{
	},

	Activate : function(instigator, center, dir)
	{
		this._instigator = instigator;
		this._world = instigator.GetWorld();
		this._center = center;
		this._direction = dir;

		this._count = 0;
		this._delay = 0;

		if (this.Projectile === null)
			throw ("Spell projectile not specified!");

		switch (this.Pattern)
		{
			case SpellPatterns.Line:
				this._dist = 2;
				break;
		}

		this.bind("EnterFrame", this._updateSpell);
	},

	_updateSpell : function()
	{
		switch (this.Pattern)
		{
			case SpellPatterns.Line:
				this._updateSpell_Line();
				break;
			case SpellPatterns.Area:
				this._updateSpell_Area();
				break;
		}
	},

	_updateSpell_Line : function()
	{
		if (this._delay <= 0)
		{
			var hit = Math3D.Add(this._center, Math3D.Scale(this._direction, this._dist));
			var projectile = this._world.SpawnProjectile(this.Projectile, hit.x, hit.y);
			projectile.Detonate(this._instigator, this._direction);

			if (++this._count >= this.Total)
			{
				this.destroy();
				return;
			}

			this._delay = 16;
			this._dist += 4;
		}
		else
		{
			this._delay--;
		}
	},

	_updateSpell_Area : function()
	{
		if (this._delay <= 0)
		{
			var angle = Math.random() * Math.PI * 2.0;
			var dist = Math.random() * this.Radius;
			var x = Math.cos(angle) * dist + this._center.x;
			var y = Math.sin(angle) * dist + this._center.y;

			var projectile = this._world.SpawnProjectile(this.Projectile, x, y);
			projectile.Detonate(this._instigator);

			if (++this._count >= this.Total)
			{
				this.destroy();
				return;
			}

			this._delay = 2;
		}
		else
		{
			this._delay--;
		}
	}
});
