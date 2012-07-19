// ========================================================================================== //
// SPAWN POINT
Crafty.c('SpawnPoint',
{
	_waveDuration: 500,	// duration (milisecond) between each spawn wave
	_waveSpawnCount: 1, 	// Number of monster spawned in each wave
	_spawnCoolDown : 0,
	_startingRegion : null,
	_destRegion : null,
	_spawnedCreatures : [],
	_bActive: false,

	init: function()
	{
		this.requires('Body');
		// this.bind("EnterFrame", this._updateSpawn);
		// this._spawnCoolDown = this._waveDuration;
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

		return this;
	},

	SetupWave: function(waveDuration, spawnCount)
	{
		this._waveDuration = waveDuration;
		this._waveSpawnCount = spawnCount;

		return this;
	},

	Activate: function()
	{
		this._bActive = true;
		this._spawnCoolDown = this._waveDuration;
		this.bind("EnterFrame", this._updateSpawn);
		// this._spawn();
	},

	Deactivate: function()
	{
		this._bActive = false;
		this._spawnCoolDown = 0;
		this.unbind("EnterFrame", this._updateSpawn);
	},

	IsActivated: function()
	{
		return this._bActive;
	},

	_updateSpawn : function(e)
	{
		if (!this._bActive)
			return;

		// TODO: Make the spawn duration based on real time seconds instead of frame
		if (--this._spawnCoolDown <= 0)
		{
			this._spawn();
		}
	},

	_spawn : function()
	{
		if (this._spawnedCreatures.length === 0)
			return;

		for (var i = 0; i < this._waveSpawnCount; i++)
		{
			var monsters = this._spawnedCreatures;
			var monster = monsters[Crafty.math.randomInt(0, monsters.length - 1)];
			var spawned = new monster().Appear(this._world, this._tileX, this._tileY);
			var entity = spawned.getEntity();
			var x = this._tileX + Crafty.math.randomInt(-2, 2);
			var y = this._tileY + 1;
			entity.NavigateTo(x, y);
			entity.SetDestinationRegion(this._startingRegion, this._destRegion);
		}

		this._spawnCoolDown = this._waveDuration;
	}
});

var SpawnPoint = MapEntity.extend(
{
	Width : 1,
	Height : 1,
	WaveDuration : 500,
	WaveSpawnCount : 1,
	Creatures : [],
	Sprites : ['grave'],
 
 	initialize: function()
 	{
		var entity = Crafty.e("2D, DOM, Body, SpawnPoint, " + this._getRandomSprite())
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height})
			.Spawns(this.Creatures)
			.SetupWave(this.WaveDuration, this.WaveSpawnCount);
		this.set({'entity' : entity });
	}
});

var MinionSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['torii1'],
	Creatures : [ PlatinumWorrior, Highlander ]
});

// ========================================================================================== //
// SPAWN AREA
Crafty.c('SpawnArea',
{
	_waveDuration: 500,	// duration (milisecond) between each spawn wave
	_waveSpawnCount: 3,	// Number of monsters spawned in each spawn wave
	_spawnCoolDown : 0,
	_startingRegion : null,
	_destRegion : null,
	_spawnedCreatures : [],
	_spawnPointTypes: [],
	_spawnPoints: [],
	_width: 1,
	_height: 1,
	_bActive: false,
 
	init: function()
	{
		this.requires('Body');
		// this.bind("EnterFrame", this._updateSpawn);
		// this._spawnCoolDown = this._waveDuration;
	},

	SetupSpawnPoint: function(spawnPointTypes, width, height)
	{
		this._spawnPointTypes = spawnPointTypes;
		this._width = width;
		this._height = height;

		for (var i = 0; i < this._width; i++) {
			this._spawnPoints[i] = [];
			for (var j = 0; j < this._height; j++) {
				var t = Crafty.math.randomInt(0, this._spawnPointTypes.length - 1);
				var spawnPointType = this._spawnPointTypes[t];

				this._spawnPoints[i][j] = new spawnPointType();
			}
		}
		return this;
	},

	SetSpawnedDestination : function(start, end)
	{
		for (var i = 0; i < this._width; i++) {
			for (var j = 0; j < this._height; j++) {
				var spawnPoint = this._spawnPoints[i][j].getEntity();
				spawnPoint.SetSpawnedDestination(start, end);
			}
		}
		this._startingRegion = start;
		this._destRegion = end;

		// debug.log(this, "SetSpawnedDestination: ", start, end);
		// debug.log(this._spawnPoints);

		return this;
	},

	SetupWave: function(waveDuration, spawnCount)
	{
		this._waveDuration = waveDuration;
		this._waveSpawnCount = spawnCount;

		return this;
	},

	Activate: function()
	{
		this._bActive = true;
		this._spawnCoolDown = this._waveDuration;
		this.bind("EnterFrame", this._updateSpawn);
		// this._spawn();
	},

	Deactivate: function()
	{
		this._bActive = false;
		this._spawnCoolDown = 0;
		this.unbind("EnterFrame", this._updateSpawn);
	},

	IsActivated: function()
	{
		return this._bActive;
	},

	GetSpawnPoints: function()
	{
		return this._spawnPoints;
	},

	_updateSpawn : function(e)
	{
		if (!this._bActive)
			return;

		if (--this._spawnCoolDown <= 0)
		{
			this._spawn();
		}
	},

	_spawn : function()
	{
		var index = 0;
		var maxIndex = this._width * this._height;
		for (var i = this._waveSpawnCount - 1; i >= 0; i--) {
			// Chose a random spawn point to spawn
			index = Crafty.math.randomInt(index, (maxIndex - 1) / (i + 1));
			var x = Math.floor(index / this._width);
			var y = index - this._width * x;
			var spawnPoint = this._spawnPoints[x][y];
			spawnPoint.getEntity()._spawn();
		}

		this._spawnCoolDown = this._waveDuration;
	}
});

var SpawnArea = MapEntity.extend(
{
	Width : 2,
	Height : 2,
	WaveDuration: 500,
	WaveSpawnCount: 2,
	PadX: 1,
	PadY: 1,
	SpawnPointTypes: [GhostSpawnPoint, SkeletonSpawnPoint],

 	initialize: function()
 	{
		var entity = Crafty.e("2D, DOM, Body, SpawnArea, " + this._getRandomSprite())
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height})
			.SetupSpawnPoint(this.SpawnPointTypes, this.Width, this.Height)
			.SetupWave(this.WaveDuration, this.WaveSpawnCount);
		this.set({'entity' : entity });
	},

	Appear: function(world, x, y)
	{
		var spawnPoints = this.getEntity().GetSpawnPoints();

		for (var i = 0; i < this.Width; i++) {
			for (var j = 0; j < this.Height; j++) {
				var spawnPoint = spawnPoints[i][j];
				spawnPoint.Appear(world, x + i + (i - 1) * this.PadX, y + j + (j - 1) * this.PadY);
			}
		}

		return this;
	},
});

// ========================================================================================== //
// REGION
var RegionTypes =
{
	Neutral : 0,
	Base : 1,
	Nest : 2
};

var Region = Class({
	constructor : function(world, id, type, center) {
		this.Id = id;
		this.Type = type || RegionTypes.Neutral;
		this.Center = center;
		this.Neighbours = [];
		this.Destination = null;
		this.bClean = true;

		this._world = world;
		this._spawnPoints = [];

		this._setupSpawnPoint();
	},

	AddNeighbour : function(region) {
		if (this.HasNeighbour(region))
			return;

		this.Neighbours.push(region);
		region.Neighbours.push(this);
	},

	HasNeighbour : function(region)	{
		return this.Neighbours.indexOf(region) != -1;
	},

	SetDestination: function(destination) {
		this.destination = destination;
		if (this.destination) {
			for (var i = this._spawnPoints.length - 1; i >= 0; i--) {
				this._spawnPoints[i].getEntity().SetSpawnedDestination(this, destination);
			};
		}
	},

	Activate: function(destination) {
		this.SetDestination(destination);
		for (var i = this._spawnPoints.length - 1; i >= 0; i--) {
			this._spawnPoints[i].getEntity().Activate();
		};
	},

	Deactivate: function() {
		for (var i = this._spawnPoints.length - 1; i >= 0; i--) {
			this._spawnPoints[i].getEntity().Deactivate();
		};
	},

	_setupSpawnPoint: function() {
		var newSpawnPoint = new GhostSpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
		this._spawnPoints.push(newSpawnPoint);
	}
});

// ========================================================================================== //
// NEST
var MinionBase = Class(Region, {
	constructor: function(world, id, center) {
		MinionBase.$super.call(this, world, id, RegionTypes.Base, center);
	},

	_setupSpawnPoint: function() {
		var newSpawnPoint = new MinionSpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
		this._spawnPoints.push(newSpawnPoint);
	}
});

// ========================================================================================== //
// NEST
var Nest = Class(Region, {
	constructor: function(world, id, center) {
		this.bossSpawnPoint = null;
		
		Nest.$super.call(this, world, id, RegionTypes.Nest, center);
	},

	_setupSpawnPoint: function() {
		this._spawnPoints = [];
		Nest.$super._setupSpawnPoint.call(this);
		this.bossSpawnPoint = new GhostSpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
	},

	ReleaseTheBoss: function() {
		debug.log(this + " RELEASE THE BOSS: bossSpawnPoint = " + this.bossSpawnPoint + " id = " + this.Id);
		this.bossSpawnPoint.getEntity()._spawn();
	}
});

// ========================================================================================== //
// GRAVEYARD
var Graveyard = Class(Nest, {
	constructor: function(world, id, center) {
		Graveyard.$super.call(this, world, id, center);
	},

	_setupSpawnPoint: function() {
		this._spawnPoints = [];

		var graves = new GraveSpawnArea();
		graves.Appear(this._world, this.Center.x - graves.Width * 2, this.Center.y - graves.Height);
		this._spawnPoints.push(graves);

		this.bossSpawnPoint = new GraveBossSpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
	}
});

var GhostSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['grave0'],
	Creatures : [Ghost]
});

var SkeletonSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['grave1'],
	Creatures : [SkeletonArcher]
});

var GraveBossSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['graveBig'],
	Creatures : [SkeletonArcher]
});

var GraveSpawnArea = SpawnArea.extend(
{
	Width : 5,
	Height : 5,
	WaveDuration: 500,
	WaveSpawnCount: 3,
	SpawnPointTypes: [GhostSpawnPoint, SkeletonSpawnPoint]
});

// ========================================================================================== //
// FARM
var Farm = Class(Nest, {
	constructor: function(world, id, center) {
		Farm.$super.call(this, world, id, center);
	},

	_setupSpawnPoint: function() {
		this._spawnPoints = [];

		var field = new FarmFieldSpawnArea();
		field.Appear(this._world, this.Center.x - field.Width * 2, this.Center.y - field.Height);
		this._spawnPoints.push(field);

		this.bossSpawnPoint = new FarmBossSpawnPoint().Appear(this._world, this.Center.x, this.Center.y);
	}
});

var PumpkinSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['plantHole0'],
	Creatures : [Pumpkin]
});

var ManEaterFlowerSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['plantHole1'],
	Creatures : [ManEaterFlower]
});

var FarmBossSpawnPoint = SpawnPoint.extend(
{
	Sprites : ['dummy'],
	Creatures : [Dummy]
});

var FarmFieldSpawnArea = SpawnArea.extend(
{
	Width : 5,
	Height : 5,
	WaveDuration: 500,
	WaveSpawnCount: 3,
	SpawnPointTypes: [PumpkinSpawnPoint, ManEaterFlowerSpawnPoint]
});

// ========================================================================================== //
// REGION FACTORY
var RegionFactory = Class({
	$statics: {
		NestType: [Graveyard, Farm]
	},

	Spawn : function(world, id, type, pos) {
		var region;
		if (type === RegionTypes.Nest) {
			var nestType = this.NestType[Crafty.math.randomInt(0, this.NestType.length - 1)];
			region = new nestType(world, id, pos);
		}
		else if (type === RegionTypes.Base) {
			region = new MinionBase(world, id, pos);
		}
		else {
			region = new Region(world, id, type, pos);
		}

		return region;
	}
});

