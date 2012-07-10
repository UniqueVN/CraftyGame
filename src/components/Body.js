Crafty.c('Body',
{

	TileWidth : 1,
	TileHeight : 1,
	IsStatic : true,
	MovementSpeed : 0.1,
	Faction : Factions.Neutral,
	NotColliding : 0,

	_world : null,
	_tileX : 0,
	_tileY : 0,
	_moveTo : null,
	_needUpdateSprite : false,
	_velocity : null,

	init: function()
	{
		var entity = this;
		this.requires("2D");
		return this;
	},

	GetWorld : function()
	{
		return this._world;
	},

	Appear: function(world, x, y)
	{
		if (!this.has("Sprite"))
			throw ("Must have Sprite for body!");

		if (this._world != null)
			throw ("Already appeared in a world!");

		this._world = world;
		this._tileX = x;
		this._tileY = y;

		this.bind("Remove", this._removeBody);

		if (this.IsStatic)
			this._initStaticBody();
		else
			this._initDynamicBody();

		this._updateSpritePos(true);
		this.trigger("Change");
		this.trigger("Appeared");

		return this;
	},

	_initStaticBody : function()
	{
		this._world.AddStaticEntity(this);
	},

	_initDynamicBody : function()
	{
		this._world.AddDynamicEntity(this);
		this.bind("EnterFrame", this._update);
	},

	_removeBody : function()
	{
		this._world.RemoveEntity(this);
	},

	_update : function()
	{
		if (this._moveTo != null)
		{
			var center = this.GetCenter();
			var delta = {};
			delta.x = this._moveTo.x - center.x;
			delta.y = this._moveTo.y - center.y;
			var dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
			if (dist <= this.MovementSpeed)
			{
				this.SetCenter(this._moveTo.x, this._moveTo.y);
				this.StopMoving();
				this.trigger("MoveFinished");
			}
			else
			{
				var x = center.x + delta.x / dist * this.MovementSpeed;
				var y = center.y + delta.y / dist * this.MovementSpeed;
				this.SetCenter(x, y);
			}
		}
		else if (this._velocity != null)
		{
			var center = this.GetCenter();
			var x = center.x + this._velocity.x;
			var y = center.y + this._velocity.y;
			this.SetCenter(x, y);
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
			Crafty.DrawManager.onScreen({ _x : pos.x, _y : pos.y, _w : this.w, _h : this.h }))
		{
			this.x = pos.x;
			this.y = pos.y;
			this.z = pos.z;
			return true;
		}
		return false;
	},

	GetSpritePosAtTile : function(tileX, tileY)
	{
		var x = tileX * this._world.TileSize + (this.TileWidth * this._world.TileSize - this.w) / 2.0;
		var y = tileY * this._world.TileSize + this.TileHeight * this._world.TileSize - this.h;
		var z = Math.round(tileY + this.TileHeight + 1); // add 1 padding with other things (like map, player), could be const
		return { x : x, y : y, z : z};
	},

	GetBoundingBox : function()
	{
		return { x : this._tileX-0.5, y : this._tileY-0.5, w : this.TileWidth, h : this.TileHeight };
	},

	GetBounds : function()
	{
		var bounds = [];
		var r = this._tileX + this.TileWidth;
		var b = this._tileY + this.TileHeight;
		for (var x = this._tileX; x < r; x++)
		{
			for (var y = this._tileY; y < b; y++)
				bounds.push({x : x, y : y});
		}

		return bounds;
	},

	SetCenter : function(x, y)
	{
		var oldCenter = this.GetCenter();
		this._tileX = x - (this.TileWidth - 1) / 2.0;
		this._tileY = y - (this.TileHeight - 1) / 2.0;
		this._needUpdateSprite = true;
		this.trigger("BodyMoved", { from : oldCenter, to : { x : x, y : y } } );
	},

	GetCenter : function()
	{
		var centerX = this._tileX + (this.TileWidth - 1) / 2;
		var centerY = this._tileY + (this.TileHeight - 1) / 2;
		return { x : centerX, y : centerY }
	},

	GetCenterReal : function()
	{
		var center = this.GetCenter();
		var x = (center.x + 0.5) * this._world.TileSize;
		var y = (center.y + 0.5) * this._world.TileSize;
		return { x : x, y : y };
	},

	_toTileSpace : function(x, y)
	{
		var tileX = (x / this._world.TileSize) - 0.5;
		var tileY = (y / this._world.TileSize) - 0.5;
		return { x : tileX, y : tileY };
	},

	GetCenterRounded : function()
	{
		var center = this.GetCenter();
		center.x = Math.floor(center.x + 0.5);
		center.y = Math.floor(center.y + 0.5);
		return center;
	},

	IsWithinBoxRange : function(center, size)
	{
		var myCenter = this.GetCenter();
		return Math.abs(myCenter.x - center.x) <= size && Math.abs(myCenter.y - center.y) <= size;
	},

	IsColliding : function()
	{
		return this.NotColliding <= 0;
	},

	MoveTo : function(x, y)
	{
		this._moveTo = { x : x, y : y };
		var center = this.GetCenterRounded();
		var dirX = Math.min(Math.round(x - center.x), 1);
		var dirY = Math.min(Math.round(y - center.y), 1);
		this.trigger("NewDirection", { x : dirX, y : dirY });
	},

	StopMoving : function()
	{
		this._moveTo = null;
		this.trigger("NewDirection", { x : 0, y : 0 });
	},

	SetMotion : function(velocity)
	{
		this._velocity = {};
		this._velocity.x = velocity.x;
		this._velocity.y = velocity.y;
		this.trigger("NewDirection", Math3D.GetNormal(velocity));
	},

	SetMotionDir : function(dir)
	{
		this.SetMotion(Math3D.Scale(dir, this.MovementSpeed));
	},

	StopMotion : function()
	{
		this._velocity = null;
		this.trigger("NewDirection", { x : 0, y : 0 });
	},

	IsFriendly : function(other)
	{
		return other != null && this.Faction === other.Faction;
	},

	GetEnemies : function()
	{
		var enemyFaction = this._world.GetEnemyFaction(this.Faction);
		return this._world.GetFactionEntities(enemyFaction);
	}
});