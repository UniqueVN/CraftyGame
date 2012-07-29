Crafty.c('Hero',
{
	Pickups : null,
	Spells : null,
	ActiveSpells : null,

	init: function()
	{
		this.requires('Pawn');
		this.bind("EnterFrame", this._updateHero);

		this.Pickups = {};
		this.Spells = {};
		this.ActiveSpells = [];

		return this;
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
	}
});
