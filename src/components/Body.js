Crafty.c('Body',
{

	TileWidth : 1,
	TileHeight : 1,
	IsStatic : true,
	MovementSpeed : 0.1,

	_world : null,
	_tileX : 0,
	_tileY : 0,
	_moveTo : null,
	_needUpdateSprite : false,

	init: function()
	{
		var entity = this;
		this.requires("2D");
		return this;
	},

	Appear: function(world, x, y)
	{
		if (!this.has("Sprite"))
			throw new Error("Must have Sprite for body!");

		this._world = world;
		this._tileX = x;
		this._tileY = y;


		if (this.IsStatic)
			this._initStaticBody();
		else
			this._initDynamicBody();

		this._updateSpritePos(true);
		this.trigger("Change");
		this.trigger("Appeared");
	},

	_initStaticBody : function()
	{
		this._world.AddStaticEntity(this);
	},

	_initDynamicBody : function()
	{
		this.bind("EnterFrame", this._update);
	},

	_update : function()
	{
		if (this._moveTo != null)
		{
			var center = this.GetCenter();
			var delta = {};
			delta.X = this._moveTo.X - center.X;
			delta.Y = this._moveTo.Y - center.Y;
			var dist = Math.sqrt(delta.X * delta.X + delta.Y * delta.Y);
			if (dist <= this.MovementSpeed)
			{
				this.SetCenter(this._moveTo.X, this._moveTo.Y);
				this.StopMoving();
				this.trigger("MoveFinished");
			}
			else
			{
				var x = center.X + delta.X / dist * this.MovementSpeed;
				var y = center.Y + delta.Y / dist * this.MovementSpeed;
				this.SetCenter(x, y);
			}
		}

		if (this._needUpdateSprite)
		{
			if (this._updateSpritePos(false))
				this._needUpdateSprite = false;
		}
	},

	_updateSpritePos : function(forceUpdate)
	{
		var pos = this.GetSpritePosAtTile(this._tileX, this._tileY);
		if (forceUpdate ||
			Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }) ||
			Crafty.DrawManager.onScreen({ _x : pos.X, _y : pos.Y, _w : this.w, _h : this.h }))
		{
			this.x = pos.X;
			this.y = pos.Y;
			this.z = pos.Z;
			return true;
		}
		return false;
	},

	GetSpritePosAtTile : function(tileX, tileY)
	{
		var x = tileX * this._world.TileSize + (this.TileWidth * this._world.TileSize - this.w) / 2.0;
		var y = tileY * this._world.TileSize + this.TileHeight * this._world.TileSize - this.h;
		var z = Math.round(tileY + this.TileHeight + 1); // add 1 padding with other things (like map, player), could be const
		return { X : x, Y : y, Z : z};
	},

	GetBounds : function()
	{
		var bounds = [];
		var r = this._tileX + this.TileWidth;
		var b = this._tileY + this.TileHeight;
		for (var x = this._tileX; x < r; x++)
		{
			for (var y = this._tileY; y < b; y++)
				bounds.push({X : x, Y : y});
		}

		return bounds;
	},

	GetCenter : function()
	{
		var centerX = this._tileX + (this.TileWidth - 1) / 2;
		var centerY = this._tileY + (this.TileHeight - 1) / 2;
		return { X : centerX, Y : centerY }
	},

	GetCenterReal : function()
	{
		var center = this.GetCenter();
		var x = (center.X + 0.5) * this._world.TileSize;
		var y = (center.Y + 0.5) * this._world.TileSize;
		return { X : x, Y : y };
	},

	GetCenterRounded : function()
	{
		var center = this.GetCenter();
		center.X = Math.floor(center.X + 0.5);
		center.Y = Math.floor(center.Y + 0.5);
		return center;
	},

	SetCenter : function(x, y)
	{
		this._tileX = x - (this.TileWidth - 1) / 2.0;
		this._tileY = y - (this.TileHeight - 1) / 2.0;
		this._needUpdateSprite = true;
	},

	MoveTo : function(x, y)
	{
		this._moveTo = { X : x, Y : y };
		var center = this.GetCenterRounded();
		var dirX = Math.min(Math.round(x - center.X), 1);
		var dirY = Math.min(Math.round(y - center.Y), 1);
		this.trigger("NewDirection", { x : dirX, y : dirY });
	},

	StopMoving : function()
	{
		this._moveTo = null;
		this.trigger("NewDirection", { x : 0, y : 0 });
	}
});