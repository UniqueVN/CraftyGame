Crafty.c('Hero',
{
	Pickups : null,
	Spells : null,
	ActiveSpells : null,

	init: function()
	{
		this.requires('Pawn');
		this.bind("EnterFrame", this._updateHero);
		this.bind("Appeared", this._heroAppeared);
		this.bind("Remove", this._heroDied);
		this.bind("BodyMoved", this._heroMoved);

		this.Pickups = {};
		this.Spells = {};
		this.ActiveSpells = [];

		this.IncreasePickup('soul', 600);

		return this;
	},

	_heroAppeared : function()
	{
		var oldPlayer = this._world.Player;
		if (oldPlayer != null)
		{
			if (!oldPlayer.IsDestroyed)
				throw ("cannot have two living players in the world!");

			this.Pickups = oldPlayer.Pickups;
			this._checkActivateSpells();
		}
		this._world.Player = this;
		Crafty.trigger("HeroReborn", { hero : this });
	},

	AddSpell : function(name, costs, icon)
	{
		this.Spells[name] = { costs : costs, active : false, icon : icon };
	},

	GetSpellIcon : function(name)
	{
		return this.Spells[name].icon;
	},

	IsSpellActive : function(name)
	{
		return this.Spells[name].active;
	},

	CastSpell : function(index)
	{
		if (index < 0 || index >= this.ActiveSpells.length)
			return;

		var spell = this.ActiveSpells[index];

		var hit = this._toTileSpace(Crafty.mousePos.x, Crafty.mousePos.y);
		var center = this.GetCenter();
		var dir = Math3D.Direction(center, hit);
		this.UseSlot(spell, {dir : dir});

		var data = this.Spells[spell];
		for (var name in data.costs)
		{
			this.Pickups[name] -= data.costs[name];
		}

		this._checkDeactivateSpells();
	},

	_updateHero : function()
	{
		var result = this._world.PickupMap.RadiusCheck(this.GetCenter(), 3);
		var hits = result.hits;

		for (var i = 0; i < hits.length; i++)
		{
			var pickup = hits[i].entity;
			pickup.PickedUpBy(this);
		}
	},

	ReceivedPickup : function(pickup)
	{
		var name = pickup.PickupName;
		this.IncreasePickup(name, 1);
	},

	IncreasePickup : function(pickupName, amount)
	{
		if (this.Pickups[pickupName])
		{
			this.Pickups[pickupName] += amount;
		}
		else
		{
			this.Pickups[pickupName] = amount;
		}
		this._checkActivateSpells();
	},

	_checkActivateSpells : function()
	{
		var changed = false;
		for (var name in this.Spells)
		{
			var data = this.Spells[name];
			if (!data.active)
			{
				if (this._canAfford(data.costs))
				{
					data.active = true;
					this.ActiveSpells.push(name);
					changed = true;
				}
			}
		}

		if (changed)
			this.trigger("SpellChanged");
	},

	_checkDeactivateSpells : function()
	{
		var changed = false;
		for (var i = this.ActiveSpells.length-1; i >= 0; i--)
		{
			var spell = this.ActiveSpells[i];
			var data = this.Spells[spell];
			if (!this._canAfford(data.costs))
			{
				data.active = false;
				this.ActiveSpells.splice(i, 1);
				changed = true;
			}
		}

		if (changed)
			this.trigger("SpellChanged");
	},

	_canAfford : function(costs)
	{
		for (var name in costs)
		{
			var count = this.Pickups[name] || 0;
			if (count < costs[name])
				return false;
		}
		return true;
	},

	_heroDied : function()
	{
		var playerSpawnPoint = this._world.GetPlayerSpawnPoint();
		var x0 = (playerSpawnPoint.x + 0.5) * this._world.TileSize - Crafty.viewport.width / 2,
			y0 = (playerSpawnPoint.y + 0.5) * this._world.TileSize - Crafty.viewport.height / 2;
		Crafty.viewport.scrollTo(-x0, -y0);

		Crafty.trigger("HeroDied", { hero : this });
	},

	_heroMoved : function(e)
	{
		var from = e.from;
		var to = e.to;

		var hit = this._world.TerrainMap.LineCheck(from, to, this.GetRadius());
		if (hit != null)
		{
			var dir = Math3D.Delta(from, to);
			var realDir = Math3D.Delta(from, hit.location);
			var off = Math3D.Delta(realDir, dir);
			var loc = hit.location;
			var shiftX = Math3D.Add(loc, { x : off.x, y : 0 });
			var shiftY = Math3D.Add(loc, { x : 0, y : off.y });
			if (Math.abs(off.x) > Math.abs(off.y))
			{
				if (this._world.TerrainMap.LineCheck(loc, shiftX, this.GetRadius()) === null)
					loc = shiftX;
				else if (off.y != 0 && this._world.TerrainMap.LineCheck(loc, shiftY, this.GetRadius()) === null)
					loc = shiftY;
			}
			else
			{
				if (this._world.TerrainMap.LineCheck(loc, shiftY, this.GetRadius()) === null)
					loc = shiftY;
				else if (off.x != 0 && this._world.TerrainMap.LineCheck(loc, shiftX, this.GetRadius()) === null)
					loc = shiftX;
			}

			this._tileX = loc.x - (this.TileWidth - 1) / 2.0;
			this._tileY = loc.y - (this.TileHeight - 1) / 2.0;
		}
	}
});
