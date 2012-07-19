Crafty.c('Damageable',
{
	MaxHealth : 100,

	init : function()
	{
		this.requires("Body");
		this.bind("Appeared", function()
		{
			this._health = this.MaxHealth;
		})
	},

	TakeDamage : function(damage)
	{
		if (damage < 0)
			throw ("not allowing negative damage!");

		this._health -= damage;
		if (this._health <= 0)
		{
			this._health = 0;
			this.destroy();
		}
		else
		{
			var center = this.GetCenterReal();
			var damageFloat = Crafty.e("2D, DOM, FloatingText")
				.attr({x : center.x - 16, y : center.y - 40, w : 100, z : 30000})
				.text("- " + damage)
				.textFont({family : 'Arial', size : "20px", weight: 'bold'})
				.StartFloating("#FF0000");
			this.attach(damageFloat);
		}
	}
});

Crafty.c("FloatingText",
{
	_floatingTextColor : "#FFFFFF",
	_floatingTextAlpha : 1.0,

	init : function()
	{
		this.requires('TextEx');
	},

	StartFloating : function(color)
	{
		this._floatingTextColor = color;
		this.textColor(color, 1.0);
		this._floatingTextAlpha = 1.0;
		this.bind("EnterFrame", function()
		{
			this._floatingTextAlpha -= 0.03;
			this.y -= 0.5;
			this.textColor(this._floatingTextColor, this._floatingTextAlpha);
			if (this._floatingTextAlpha <= 0)
				this.destroy();
		});
		return this;
	}
});

Crafty.c('SpawnPoint',
{
	_spawnCoolDown : 0,
	_startingRegion : null,
	_destRegion : null,
	_spawnedCreatures : [],

	init: function()
	{
		this.requires('Body');
		this.bind("EnterFrame", this._updateSpawn);
		this._spawnCoolDown = 250;
	},

	Spawns : function(list)
	{
		this._spawnedCreatures = list;
		return this;
	},

	SetSpawnedDestination : function(start, end)
	{
		this._startingRegion = start;
		this._destRegion = end;
	},

	_updateSpawn : function(e)
	{
		if (--this._spawnCoolDown <= 0)
		{
			this._spawn();
			this._spawnCoolDown = 500;
		}
	},

	_spawn : function()
	{
		if (this._spawnedCreatures.length === 0)
			return;

		var monsters = this._spawnedCreatures;
		var monster = monsters[Crafty.math.randomInt(0, monsters.length - 1)];
		var spawned = new monster().Appear(this._world, this._tileX, this._tileY);
		var entity = spawned.getEntity();
		var x = this._tileX + Crafty.math.randomInt(-2, 2);
		var y = this._tileY + 1;
		entity.NavigateTo(x, y);
		entity.SetDestinationRegion(this._startingRegion, this._destRegion);
	}
});