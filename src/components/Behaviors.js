Crafty.c('SpawnPoint',
{
	_nextSpawnTime : 0,
	_startingRegion : null,
	_destRegion : null,

	init: function()
	{
		this.requires('Body');
		this.bind("EnterFrame", this._updateSpawn);
		this._nextSpawnTime = Crafty.timer.curTime + 5000;
	},

	SetSpawnedDestination : function(start, end)
	{
		this._startingRegion = start;
		this._destRegion = end;
	},

	_updateSpawn : function(e)
	{
		if (Crafty.timer.curTime >= this._nextSpawnTime)
		{
			this._spawn();
			this._nextSpawnTime += 10000;
		}
	},

	_spawn : function()
	{
		var spawned = new Slime().Appear(this._world, this._tileX, this._tileY);
		var entity = spawned.getEntity();
		var x = this._tileX + Crafty.math.randomInt(-2, 2);
		var y = this._tileY + 1;
		entity.NavigateTo(x, y);
		entity.SetDestinationRegion(this._startingRegion, this._destRegion);
	}
});