
Crafty.c('DimensionGate',
{
	TotalStatues : 3,

	_availableMinions : null,
	_statues : null,

	init: function()
	{
		this._statues = [];

		this.requires("Body");
		this.bind("Appeared", this._setupGate);
		this.bind("HeroDied", this._respawnHero);
		return this;
	},

	_setupGate : function()
	{
		this._availableMinions = [];

		for (var name in Minions)
		{
			if (name === "Player")
				continue;

			this._availableMinions.push(name);
		}

		for (var i = 0; i < this.TotalStatues; i++)
			this._placeRandomStatue(i);
	},

	_placeRandomStatue : function(index)
	{
		var randMinion = Crafty.math.randomElementOfArray(this._availableMinions);
		this._placeStatue(randMinion, index);
	},

	_placeStatue : function(summon, index)
	{
		var tile = this.GetTile();
		var start = { x : tile.x - Math.floor(this.TotalStatues/2), y : tile.y + 1 };
		var data = Minions[summon];
		var statue = Crafty.e("2D, Canvas, Mouse, Draggable, Body, Summoner, " + data.StatueSprite)
			.attr({z:2, Summon : summon})
			.Appear(this._world, start.x + index, start.y);

		this._statues[index] = statue;
		var gate = this;
		statue.bind("BeginSummon", function() { gate._replenishStatue(index); } );
	},

	_respawnHero : function()
	{
		var mid = Math.floor(this.TotalStatues / 2);
		this._statues[mid].destroy();
		this._placeStatue("Player", mid);
	},

	_replenishStatue : function(removed)
	{
		var rest = [];
		for (var i = 0; i < this.TotalStatues; i++)
		{
			if (i === removed)
				continue;
			rest.push(i);
		}

		var draw = Crafty.math.randomElementOfArray(rest);
		this._statues[draw].destroy();

		this._placeRandomStatue(removed);
		this._placeRandomStatue(draw);
	}
});

Crafty.c('Summoner',
{
	Summon : null,

	_gateTile : null,
	_summoningImage : null,
	_progress : 0,
	_totalProgress : 0,
	_originalHeight : 0,
	_summoningCircle : null,

	init: function()
	{
		this.requires("Body, Draggable");
		this.bind("StartDrag", this._startDrag);
		this.bind("StopDrag", this._stopDrag);
		this.bind("Dragging", this._dragging);
		return this;
	},

	_beginSummoning : function(circle)
	{
		if (this.Summon === null)
			throw ("Summoner has nothing to summon!");

		this._summoningCircle = circle;

		var data = Minions[this.Summon];

		var sprite = data.StatueSprite + "_summon";
		this._summoningImage = Crafty.e("2D, Canvas, " + sprite).attr({ x : this.x, y : this.y, z : this.z - 1});

		this._originalHeight = this.h;
		this._totalProgress = data.SummonTime || 100;
		this._progress = 0;

		this.bind("EnterFrame", this._updateSummoning);
		this.trigger("BeginSummon");
	},

	_updateSummoning : function()
	{
		if (++this._progress >= this._totalProgress)
		{
			this._progress = 0;

			var data = Minions[this.Summon];
			var tile = this.GetTile();
			var summoned = new data.Definition().Appear(this._world, tile.x, tile.y).getEntity();

			if (summoned.has('AI'))
			{
				summoned.NavigateTo(tile.x, tile.y+1);
				summoned.SetDestinationRegion(this._summoningCircle.Base, this._summoningCircle.Infested);
			}
			else
			{
				this._summoningImage.destroy();
				this.destroy();
				return;
			}
		}

		if (Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }))
		{
			var h = Math.floor((1 - this._progress / this._totalProgress) * this._originalHeight);
			this.crop(0, 0, this.w, h);
			//this.h = h;
		}
	},

	_startDrag : function()
	{
		this._gateTile = this.GetTile();
	},

	_stopDrag : function()
	{
		var souls = this._world.Player.Pickups['soul'] || -1;
		var data = Minions[this.Summon];

		if (souls >= data.Cost)
		{
			var center = this.GetCenter();
			var base = this._world.TempleRegion;
			for (var i = 0; i < base.SummoningCircles.length; i++)
			{
				var circle = base.SummoningCircles[i];
				if (circle.IsInside(center.x, center.y) && !this._world.TerrainMap.IsCellBlocked(center.x, center.y))
				{
					this._world.Player.Pickups['soul'] -= data.Cost;
					this.unbind("MouseDown", this._ondown);
					this._beginSummoning(circle);
					return;
				}
			}
		}

		this._setCenter(this._gateTile.x, this._gateTile.y);
		this._updateSpritePos(true);
	},

	_dragging : function()
	{
		var corner = this.GetTileAtSpritePos(this.x, this.y);
		var x = Math.round(corner.x);
		var y = Math.round(corner.y);
		this._setCorner(x, y);
		this._updateSpritePos(true);
	}
});
