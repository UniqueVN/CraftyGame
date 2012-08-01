var Factions =
{
	Undefined : -1,
	Neutral : 0,
	Monk : 1,
	Ghost : 2
};

var World = Class(
{
	constructor : function()
	{
		//////////////////////////////////////////////////////////////////////////////////////////
		// Member Variables
		//////////////////////////////////////////////////////////////////////////////////////////

		this.TileSize = gameContainer.conf.get("TILE_SIZE");
		this.MapWidth = gameContainer.conf.get("MAP_WIDTH");
		this.MapHeight = gameContainer.conf.get("MAP_HEIGHT");
		this.PhysicalWidth = this.MapWidth * this.TileSize;
		this.PhysicalHeight = this.MapHeight * this.TileSize;

		this.CollisionMap = new CollisionMap(this.MapWidth, this.MapHeight);
		this.TerrainMap = new TerrainMap(this.MapWidth, this.MapHeight);
		this.TerrainManager = new TerrainManager();
		this.Regions = [];
		this.RegionFactory = new RegionFactory();

		this.PickupMap = new CollisionMap(this.MapWidth, this.MapHeight);

		this._staticEntities = [];
		this._terrainMap = [];
		this._spawnPoint = [];

		this._pawns = [];
		this._pawns[Factions.Neutral] = [];
		this._pawns[Factions.Monk] = [];
		this._pawns[Factions.Ghost] = [];

		this._buildings = [];
		this._buildings[Factions.Neutral] = [];
		this._buildings[Factions.Monk] = [];
		this._buildings[Factions.Ghost] = [];

		this.Player = null;

		this._projectileFactory = new ProjectileFactory();

		//////////////////////////////////////////////////////////////////////////////////////////
		// Initialization
		//////////////////////////////////////////////////////////////////////////////////////////

		NavigationManager.SetWorld(this);

		this.InitMapData();

		this.TileMap = Crafty.e("2D, Canvas, TileMap, Mouse")
			.attr({x: 0, y: 0, z: 0, w:this.PhysicalWidth, h:this.PhysicalHeight, World : this})
			.randomGenerate(this.MapWidth, this.MapHeight, this.TileSize)
			.bind("MouseDown", function(e){ Crafty.trigger('MapMouseDown', e); })
			.bind("MouseUp", function(e){ Crafty.trigger('MapMouseUp', e); })
			.bind("MouseMove", function(e){ Crafty.trigger('MapMouseMove', e); });

		this._activateInitialRegions();
	},

	//////////////////////////////////////////////////////////////////////////////////////////
	// Functions
	//////////////////////////////////////////////////////////////////////////////////////////

	SpawnProjectile : function(definition, x, y)
	{
		return this._projectileFactory.Spawn(this, definition, x, y);
	},

	InitMapData : function()
	{
		for (var i = 0; i < this.MapWidth; i++)
			this._terrainMap[i] = [];
	},

	AddStatic : function(entity)
	{
		/*
		var staticEntityInfo =
		{
			Id : this._staticEntities.length,
			Entity : entity,
			Bounds : entity.GetBounds()
		}
		this._staticEntities.push(staticEntityInfo);

		for (var i = 0; i < staticEntityInfo.Bounds.length; i++)
		{
			var pos = staticEntityInfo.Bounds[i];
			this._terrainMap[pos.x][pos.y] = entity;
		}*/

		this.TerrainMap.AddEntity(entity);

	},

	RemoveStatic : function(entity)
	{
		// tht073012 - Don't throw exception now
		// throw ("Not Implemented!");
	},

	AddBuilding : function(entity)
	{
		if (entity.Faction === Factions.Undefined)
			throw ("Cannot have entity with undefined faction!");
		this._buildings[entity.Faction].push(entity);
	},

	RemoveBuilding : function(entity)
	{
		var list = this._buildings[entity.Faction];
		var i = list.indexOf(entity);
		// if (i === -1)
		// 	throw ("Entity is no longer in the list, could be in some other lists?");
		list.splice(i, 1);
	},

	AddPawn : function(entity)
	{
		if (entity.Faction === Factions.Undefined)
			throw ("Cannot have entity with undefined faction!");
		this._pawns[entity.Faction].push(entity);

		this.CollisionMap.AddEntity(entity);
	},

	RemovePawn : function(entity)
	{
		var list = this._pawns[entity.Faction];
		var i = list.indexOf(entity);
		// if (i === -1)
		// 	throw ("Entity is no longer in the list, could be in some other lists?");
		list.splice(i, 1);

		this.CollisionMap.RemoveEntity(entity);
	},

	GetEnemyFaction : function(faction)
	{
		if (faction === Factions.Monk)
			return Factions.Ghost;
		else if (faction === Factions.Ghost)
			return Factions.Monk;
		else
			return Factions.Undefined;
	},

	GetFactionPawns : function(faction)
	{
		if (faction === Factions.Undefined)
			throw ("Nothing exists in faction Undefined!");

		return this._pawns[faction];
	},

	GetFactionBuildings : function(faction)
	{
		if (faction === Factions.Undefined)
			throw ("Nothing exists in faction Undefined!");

		return this._buildings[faction];
	},

	GameOver: function()
	{
		this.hud.GameOver();
		//Crafty.scene("gameOver");
	},

	Announce: function(announceStr)
	{
		this.hud.Announce(announceStr);
	},

	AddPickup : function(pickup)
	{
		this.PickupMap.AddEntity(pickup);
	},

	RemovePickup : function(pickup)
	{
		this.PickupMap.RemoveEntity(pickup);
	},

	AddRegion : function(tileMap, id, type, pos)
	{
		id = id || this.Regions.length;

		var region = this.RegionFactory.Spawn(tileMap, this, id, type, pos);

		this.Regions.push(region);
		return region;
	},

	AddSpawnPoint: function(p)
	{
		this._spawnPoint.push(p);
	},

	GetSpawnPoint: function(id)
	{
		id = Crafty.math.clamp(id, 0, this._spawnPoint.length - 1);
		return this._spawnPoint[id];
	},

	GetRandomSpawnPoint: function()
	{
		id = Crafty.math.randomInt(0, this._spawnPoint.length - 1);
		return this._spawnPoint[id];
	},

	_activateInitialRegions : function()
	{
		var nestedRegions = [];
		var templeRegion = null;
		for (var i = 0; i < this.Regions.length; i++)
		{
			var region = this.Regions[i];
			if (region.Type === RegionTypes.Nest)
				nestedRegions.push(region);
			else if (region.Type === RegionTypes.Base)
				templeRegion = region;
		}

		this.TempleRegion = templeRegion;
		this.nestedRegions = nestedRegions;

		var t = Crafty.math.randomInt(0, nestedRegions.length - 1);
		var initialRegion = nestedRegions[t];
		templeRegion.ActivateAgainstInfested(initialRegion);

		for (var i = 0; i < nestedRegions.length; i++)
		{
			nestedRegions[i].SetDestination(templeRegion);
		}
		// initialRegion.SetDestination(templeRegion);
		initialRegion.Activate();

		debug.log("Nest Regions:", this.nestedRegions);
		debug.log("START INFEST FROM REGION: " + t + " - initialRegion.Id = " + initialRegion.Id, initialRegion);
	}
});

var TerrainMap = Class(
{
	constructor : function(w, h)
	{
		this._width = w;
		this._height = h;
		this._cells = [];

		for (var i = 0; i < w; i++)
			this._cells[i] = [];
	},

	AddEntity : function(entity)
	{
		var bounds = entity.GetBounds();
		var entry =
		{
			bounds : bounds
		}

		for (var i = 0; i < bounds.length; i++)
		{
			var pos = bounds[i];
			var cell = this._cells[pos.x][pos.y];
			if (cell === undefined)
			{
				cell = { entity : null };
				this._cells[pos.x][pos.y] = cell;
			}

			// tht073012 - Temporary disable this check so we can add the tower on top of the base
			// if (cell.entity != null)
			// 	throw ("Cell " + pos.x + ", " + pos.y + " already occupied by " + cell.entity[0]);

			cell.entity = entity;
		}
	},

	IsCellBlocked : function(x, y)
	{
		if (x < 0 || x >= this._width || y <0 || y >= this._height)
			return true;

		var cell = this._cells[x][y];
		if (cell && cell.entity != null)
			return true;

		return false;
	},

	LineCheck : function(start, end, radius)
	{
		radius = radius || 0;

		var minX = Math.min(start.x, end.x);
		var minY = Math.min(start.y, end.y);
		var maxX = Math.max(start.x, end.x);
		var maxY = Math.max(start.y, end.y);

		var r = Math.ceil(radius);
		var x0 = Math.floor(minX + 0.5) - r;
		var y0 = Math.floor(minY + 0.5) - r;
		var x1 = Math.floor(maxX + 0.5) + r;
		var y1 = Math.floor(maxY + 0.5) + r;

		var bestHit = null;

		for (var x = x0; x <= x1; x++)
		{
			for (var y = y0; y <= y1; y++)
			{
				var cell = this._cells[x][y];
				if (cell === undefined)
					continue;

				if (cell.entity === null)
					continue;

				var box = { x : x - 0.5, y : y - 0.5, w : 1, h : 1 };

				var hit = this._lineBoxIntersect(start, end, radius, box)
				if (hit)
				{
					if (bestHit === null || hit.dist < bestHit.dist)
					{
						hit.cell = cell;
						bestHit = hit;
					}
				}
			}
		}

		if (bestHit != null)
		{
			bestHit.location = Math3D.Add(start, Math3D.Scale(Math3D.Direction(start, end), bestHit.dist));
		}

		return bestHit;
		/*
		var r = Math.ceil(radius);
		var size = 1 + r * 2;
		var x0 = Math.floor(start.x + 0.5);
		var y0 = Math.floor(start.y + 0.5);

		var bestHit = null;

		// starting cells
		for (var x = x0 - r; x <= x0 + r; x++)
		{
			for (var y = y0 - r; y <= y0 + r; y++)
			{
				var hit = this._lineCellIntersect(start, end, radius, this._cells[x][y])
				if (hit)
				{
					if (bestHit === null || hit.dist < bestHit.dist)
						bestHit = hit;
				}
			}
		}

		if (bestHit === null)
		{
			var fx = end.x - start.x;
			var fy = end.y - start.x;
			var sx = fx > 0 ? 1 : (fx < 0 ? -1 : 0);
			var sy = fy > 0 ? 1 : (fy < 0 ? -1 : 0);


			if (fx === 0)
			{

			}
			else if (fy === 0)
			{

			}
			else
			{
				var k = fy / fx;
				var cx = start.x;
				var cy = start.y;
				var tx = x0;
				var ty = y0;

				while (true)
				{
					var nx = tx + sx * 0.5;
					var dx = (nx - cx) * sx;
				}
			}
		}*/
	},

	_lineBoxIntersect : function(start, end, radius, box)
	{
		var o = { x : box.x + box.w/2, y : box.y + box.h/2 };
		var r = Math.max(box.w, box.h) + radius;

		var a = Math3D.Delta(start, end);
		var b = Math3D.Delta(start, o);
		var p = Math3D.Dot(a, b);
		var la = Math3D.SizeSq(a);
		var lb = Math3D.SizeSq(b);
		var lp = p * p / la;
		var ld = lb - lp;
		var lr = r * r * 2;
		if (ld > lr)
			return false;

		if (this._circleBoxIntersect(start, radius, box))
			return { dist : 0 };

		var bestHit = null;

		if (radius > 0)
		{
			var corners =
				[
					{ x : box.x, y : box.y },
					{ x : box.x + box.w, y : box.y },
					{ x : box.x + box.w, y : box.y + box.h },
					{ x : box.x, y : box.y + box.h }
				]

			for (var i = 0; i < corners.length; i++)
			{
				var hit = this._lineCircleIntersect(start, end, corners[i], radius);
				if (hit && (bestHit === null || hit.dist < bestHit.dist))
					bestHit = hit;
			}
		}

		var min = { x : box.x - radius, y : box.y - radius };
		var max = { x : box.x + box.w + radius, y : box.y + box.h + radius };

		var sides =
		[
			[ start.x, end.x, min.x, start.y, end.y, min.y, max.y ],
			[ start.x, end.x, max.x, start.y, end.y, min.y, max.y ],
			[ start.y, end.y, min.y, start.x, end.x, min.x, max.x ],
			[ start.y, end.y, max.y, start.x, end.x, min.x, max.x ]
		]

		for (var i = 0; i < sides.length; i++)
		{
			var side = sides[i];
			var hit = this._lineSideIntersect(side[0], side[1], side[2], side[3], side[4], side[5], side[6]);
			if (hit && (bestHit === null || hit.dist < bestHit.dist))
				bestHit = hit;
		}

		if (bestHit === null)
			return false;

		return bestHit;
	},

	_circleBoxIntersect : function(center, radius, box)
	{
		var cx = Crafty.math.clamp(center.x, box.x, box.x + box.w);
		var cy = Crafty.math.clamp(center.y, box.y, box.y + box.h);
		var dx = cx - center.x;
		var dy = cy - center.y;

		return (cx *  cx + cy * cy <= radius * radius);
	},

	_lineCircleIntersect : function(start, end, o, r)
	{
		var a = Math3D.Delta(start, end);
		var b = Math3D.Delta(start, o);
		var p = Math3D.Dot(a, b);
		var la = Math3D.SizeSq(a);
		var lb = Math3D.SizeSq(b);
		var lp = p * p / la;
		var ld = lb - lp;
		var lr = r * r;
		if (ld > lr)
			return false;

		if (p < 0)
		{
			if (lb > lr)
				return false;
			return { dist : 0 };
		}
		else if (p > la)
		{
			if (Math3D.DistanceSq(end, o) > lr)
				return false;
		}

		var dp = Math.sqrt(lp);
		var de = Math.sqrt(lr - ld);

		return { dist : Math.max(dp - de, 0) };
	},

	_lineSideIntersect : function(start, end, side, startH, endH, sideMin, sideMax)
	{
		if ((start < side && end < side) || (start > side && end > side))
			return false;

		var sideH = startH + (endH - startH) / (end - start) * (side - start);
		if (sideH >= sideMin && sideH <= sideMax)
		{
			return { dist : Math.abs(side - start) };
		}
		return false;
	}
});

var CollisionMap = Class(
{
	constructor : function(w, h)
	{
		this._cellSize = 16;
		this._movableMap = [];
		this._cols = Math.floor(w / this._cellSize);
		this._rows = Math.floor(h / this._cellSize);

		for (var i = 0; i < this._cols; i++)
		{
			this._movableMap[i] = [];
			for (var j = 0; j < this._rows; j++)
				this._movableMap[i][j] = [];
		}
	},

	AddEntity : function(entity)
	{
		var centerTile = entity.GetTile();

		var bounds = this._getBounds(centerTile, entity.TileWidth, entity.TileHeight);
		var minCell = bounds.min;
		var maxCell = bounds.max;

		for (var x = minCell.x; x <= maxCell.x; x++)
		{
			for (var y = minCell.y; y <= maxCell.y; y++)
				this._movableMap[x][y].push(entity);
		}

		var entry =
		{
			center : centerTile,
			min : minCell,
			max : maxCell
		};

		entity._collisionMapEntry = entry;
		var map = this;

		if (entity.has("Movable"))
			entity.bind("BodyMoved", function() { map._updateEntity(this); } );
	},

	RemoveEntity : function(entity)
	{
		var entry = entity._collisionMapEntry;
		if (!entry)
			throw ("No collision map entry found, entity must be added first before removing!");

		for (var x = entry.min.x; x <= entry.max.x; x++)
		{
			for (var y = entry.min.y; y <= entry.max.y; y++)
			{
				var list = this._movableMap[x][y];
				var idx = list.indexOf(entity);
				if (idx === -1)
					throw ("somehow entity is not in the list!");
				list.splice(idx, 1);
			}
		}

		delete entity['_collisionMapEntry'];
	},

	_getBounds : function(center, w, h)
	{
		var minX = center.x - w / 2.0 - 0.5;
		var minY = center.y - h / 2.0 - 0.5;
		var maxX = center.x + w / 2.0 + 0.5;
		var maxY = center.y + h / 2.0 + 0.5;

		return { min : this._getCell(minX, minY), max : this._getCell(maxX, maxY) };
	},

	_getCell : function(x, y)
	{
		var cellX = Math.floor(Math.max(0, x + 0.5) / this._cellSize);
		var cellY = Math.floor(Math.max(0, y + 0.5) / this._cellSize);
		return { x : cellX, y : cellY };
	},

	_updateEntity : function(entity)
	{
		var entry = entity._collisionMapEntry;
		if (!entry)
			throw ("No collision map entry found, entity must be added first before updating!");

		var newCenter = entity.GetTile();
		var oldCenter = entry.center;
		if (newCenter.x != oldCenter.x || newCenter.y != oldCenter.y)
		{
			var bounds = this._getBounds(newCenter, entity.TileWidth, entity.TileHeight);

			// remove
			for (var x = entry.min.x; x <= entry.max.x; x++)
			{
				var xInNewBounds = x >= bounds.min.x && x <= bounds.max.x;
				for (var y = entry.min.y; y <= entry.max.y; y++)
				{
					var yInNewBounds = y >= bounds.min.y && y <= bounds.max.y;
					if (!xInNewBounds || !yInNewBounds)
					{
						var list = this._movableMap[x][y];
						var idx = list.indexOf(entity);
						if (idx === -1)
							throw ("somehow entity is not in the list!");
						list.splice(idx, 1);
					}
				}
			}

			// insert
			for (var x = bounds.min.x; x <= bounds.max.x; x++)
			{
				var xInOldBounds = x >= entry.min.x && x <= entry.max.x;
				for (var y = bounds.min.y; y <= bounds.max.y; y++)
				{
					var yInOldBounds = y >= entry.min.y && y <= entry.max.y;
					if (!xInOldBounds || !yInOldBounds)
					{
						this._movableMap[x][y].push(entity);
					}
				}
			}

			entry.center = newCenter;
			entry.min = bounds.min;
			entry.max = bounds.max;
		}
	},

	RadiusCheck : function(center, radius)
	{
		var result = {};
		result.hits = [];
		var added = {};

		var minCell = this._getCell(center.x - radius, center.y - radius);
		var maxCell = this._getCell(center.x + radius, center.y + radius);

		for (var x = minCell.x; x <= maxCell.x; x++)
		{
			for (var y = minCell.y; y <= maxCell.y; y++)
			{
				var list = this._movableMap[x][y];
				for (var i = 0; i < list.length; i++)
				{
					var entity = list[i];
					var totalRadius = radius + entity.GetRadius();
					if (Math3D.DistanceSq(center, entity.GetCenter()) <= totalRadius * totalRadius)
					{
						var id = entity[0];

						if (added[id])
							continue;

						added[id] = true;
						result.hits.push( { entity : entity } );
					}
				}
			}
		}

		return result;
	},

	LineCheck : function(start, end, radius)
	{
		var result = {};
		result.hits = [];
		radius = radius || 0;
		var checked = {};

		var minCell = this._getCell(Math.min(start.x, end.x), Math.min(start.y, end.y));
		var maxCell = this._getCell(Math.max(start.x, end.x), Math.max(start.y, end.y));

		for (var x = minCell.x; x <= maxCell.x; x++)
		{
			for (var y = minCell.y; y <= maxCell.y; y++)
			{
				var list = this._movableMap[x][y];

				for (var i = 0; i < list.length; i++)
				{
					var entity = list[i];
					var id = entity[0];
					if (checked[id])
						continue;

					checked[id] = true;

					if (this._lineCircleIntersect(start, end, entity.GetCenter(), entity.GetRadius() + radius))
						result.hits.push( { entity : entity } );
				}
			}
		}

		return result;
	},

	_lineCircleIntersect : function(start, end, o, r)
	{
		var a = Math3D.Delta(start, end);
		var b = Math3D.Delta(start, o);
		var p = Math3D.Dot(a, b);
		var la = Math3D.SizeSq(a);
		var lb = Math3D.SizeSq(b);
		var lp = p * p / la;
		var ld = lb - lp;
		var lr = r * r;
		if (ld > lr)
			return false;

		if (p < 0)
			return lb <= lr;
		else if (p > la)
			return Math3D.DistanceSq(end, o) <= lr;
		else
			return true;
	},

	_lineBoxIntersect : function(start, end, box)
	{
		var min = { x : box.x, y : box.y };
		var max = { x : box.x + box.w, y : box.y + box.h };

		if ((start.x < min.x && end.x < min.x) ||
			(start.x > max.x && end.x > max.x) ||
			(start.y < min.y && end.y < min.y) ||
			(start.y > max.y && end.y > max.y))
			return false;

		if (this._insideBox(start, box) || this._insideBox(end, box))
			return true;

		if (this._lineSideIntersect(start.x, end.x, min.x, start.y, end.y, min.y, max.y) ||
			this._lineSideIntersect(start.x, end.x, max.x, start.y, end.y, min.y, max.y) ||
			this._lineSideIntersect(start.y, end.y, min.y, start.x, end.x, min.x, max.x) ||
			this._lineSideIntersect(start.y, end.y, max.y, start.x, end.x, min.x, max.x))
			return true;

		return false;
	},

	_insideBox : function(point, box)
	{
		return point.x >= box.x && point.x <= (box.x + box.w) &&
			point.y >= box.y && point.y <= (box.y + box.h);
	},

	_lineSideIntersect : function(start, end, side, startH, endH, sideMin, sideMax)
	{
		if ((start < side && end < side) || (start > side && end > side))
			return false;

		var sideH = startH + (endH - startH) / (end - start) * (side - start);
		return sideH >= sideMin && sideH <= sideMax;
	},

	BoxCheck : function(center, size)
	{

	}
});