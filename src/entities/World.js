var RegionTypes =
{
	Neutral : 0,
	Temple : 1,
	Nest : 2
};

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
		this.TerrainManager = new TerrainManager();
		this.Regions = [];

		this._staticEntities = [];
		this._terrainMap = [];
		this._spawnPoint = [];

		this._dynamicEntities = [];
		this._dynamicEntities[Factions.Neutral] = [];
		this._dynamicEntities[Factions.Monk] = [];
		this._dynamicEntities[Factions.Ghost] = [];


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

	InitMapData : function()
	{
		for (var i = 0; i < this.MapWidth; i++)
			this._terrainMap[i] = [];
	},

	AddStaticEntity : function(entity)
	{
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
		}
	},

	AddDynamicEntities : function(entity)
	{
		if (entity.Faction === Factions.Undefined)
			throw ("Cannot have entity with undefined faction!");

		this._dynamicEntities[entity.Faction].push(entity);
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

	GetFactionEntities : function(faction)
	{
		if (faction === Factions.Undefined)
			throw ("Nothing exists in faction Undefined!");

		return this._dynamicEntities[faction];
	},

	AddSpawnPoint: function(p)
	{
		this._spawnPoint.push(p);
	},

	AddRegion : function(x, y)
	{
		var region = new Region(this, this.Regions.length);
		region.Center = { x : x, y : y };
		this.Regions.push(region);
		return region;
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
			if (region.Type == RegionTypes.Nest)
				nestedRegions.push(region);
			else if (region.Type == RegionTypes.Temple)
				templeRegion = region;
		}

		var initialRegion = nestedRegions[Crafty.math.randomInt(0, nestedRegions.length - 1)];
		initialRegion.Infest(templeRegion);
	}
});

var Region = Class(
{
	constructor : function(world, id)
	{
		this.Id = id;
		this.Type = RegionTypes.Neutral;
		this.Center = { x: 0, y : 0 };
		this.Neighbours = [];

		this._world = world;
		this._spawnPoint = null;
	},

	AddNeighbour : function(region)
	{
		if (this.HasNeighbour(region))
			return;

		this.Neighbours.push(region);
		region.Neighbours.push(this);
	},

	HasNeighbour : function(region)
	{
		return this.Neighbours.indexOf(region) != -1;
	},

	Infest : function(destination)
	{
		this._spawnPoint = new SpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
		if (destination != null)
			this._spawnPoint.getEntity().SetSpawnedDestination(this, destination);
	}
});