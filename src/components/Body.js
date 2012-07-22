Crafty.c('Body',
{

	TileWidth : 1,
	TileHeight : 1,
	IsDestroyed : false,
	SpriteVerticalOffset : 0,

	_world : null,
	_tileX : 0,
	_tileY : 0,

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

		this._updateSpritePos(true);
		this.trigger("Change");
		this.trigger("Appeared");

		return this;
	},

	_removeBody : function()
	{
		this.IsDestroyed = true;
	},

	_updateSpritePos : function(forceUpdate)
	{
		var pos = this.GetSpritePosAtTile(this._tileX, this._tileY);
		if (forceUpdate ||
			Crafty.DrawManager.onScreen({ _x : this.x, _y : this.y, _w : this.w, _h : this.h }) ||
			Crafty.DrawManager.onScreen({ _x : pos.x, _y : pos.y, _w : this.w, _h : this.h }))
		{
			// TODO: should update _x, _y, _z, then trigger events
			this.x = pos.x;
			this.y = pos.y;
			this.z = pos.z;
			this.trigger("VisualUpdated");
			return true;
		}
		return false;
	},

	GetSpritePosAtTile : function(tileX, tileY)
	{
		var x = tileX * this._world.TileSize + (this.TileWidth * this._world.TileSize - this.w) / 2.0;
		var y = tileY * this._world.TileSize + this.TileHeight * this._world.TileSize - this.h - this.SpriteVerticalOffset;
		var z = Math.round((tileY + this.TileHeight + 1) * 10); // add 1 padding with other things (like map, player), could be const
		return { x : x, y : y, z : z};
	},

	GetRadius : function()
	{
		return Math.max(this.TileWidth, this.TileHeight) * 0.5;
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

	GetTile : function()
	{
		var center = this.GetCenter();
		center.x = Math.floor(center.x + 0.5);
		center.y = Math.floor(center.y + 0.5);
		return center;
	},

	_toTileSpace : function(x, y)
	{
		var tileX = (x / this._world.TileSize) - 0.5;
		var tileY = (y / this._world.TileSize) - 0.5;
		return { x : tileX, y : tileY };
	},

	IsWithinBoxRange : function(center, size)
	{
		var myCenter = this.GetCenter();
		return Math.abs(myCenter.x - center.x) <= size && Math.abs(myCenter.y - center.y) <= size;
	}
});

Crafty.c('Static',
{
	init: function()
	{
		this.requires("Body");
		this.bind("Appeared", this._addStatic);
		this.bind("Remove", this._removeStatic);
		return this;
	},

	_addStatic : function()
	{
		if (this.has("Movable"))
			throw ("Static cannot coexist with Movable!");

		this._world.AddStatic(this);
	},

	_removeStatic : function()
	{
		this._world.RemoveStatic(this);
	}
});

Crafty.c('Movable',
{
	MovementSpeed : 0.1,

	_moveTo : null,
	_spritePosDirty : false,
	_velocity : null,
	_avoidVelocity : { x : 0, y : 0 },

	init: function()
	{
		this.requires("Body");
		this.bind("Appeared", this._initMovable);
		return this;
	},

	_initMovable : function()
	{
		if (this.has("Static"))
			throw ("Movable cannot coexist with Static!");

		this.bind("EnterFrame", this._updateMovable);
	},

	_updateMovable : function()
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
				var speed = this.MovementSpeed;
				var x = center.x + delta.x / dist * speed + this._avoidVelocity.x;
				var y = center.y + delta.y / dist * speed + this._avoidVelocity.y;
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
		else if (this._avoidVelocity.x != 0 || this._avoidVelocity.y != 0)
		{
			var center = this.GetCenter();
			var x = center.x + this._avoidVelocity.x;
			var y = center.y + this._avoidVelocity.y;
			this.SetCenter(x, y);
		}

		if (this._spritePosDirty)
		{
			if (this._updateSpritePos(false))
				this._spritePosDirty = false;
		}
	},

	SetCenter : function(x, y)
	{
		var oldCenter = this.GetCenter();
		this._tileX = x - (this.TileWidth - 1) / 2.0;
		this._tileY = y - (this.TileHeight - 1) / 2.0;
		this._spritePosDirty = true;
		this.trigger("BodyMoved", { from : oldCenter, to : { x : x, y : y } } );
	},

	IsMoving : function()
	{
		return this._moveTo != null;
	},

	MoveTo : function(x, y)
	{
		this._moveTo = { x : x, y : y };
		var center = this.GetCenter();
		this.trigger("NewDirection", Math3D.Normalize({ x : x - center.x, y : y - center.y }));
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

	GetMovementDirection : function()
	{
		if (this._moveTo != null)
		{
			return Math3D.Direction(this.GetCenter(), this._moveTo);
		}
		else if (this._velocity != null)
		{
			return Math3D.GetNormal(this._velocity);
		}
		else
		{
			return { x : 0, y : 0 };
		}
	}
});

