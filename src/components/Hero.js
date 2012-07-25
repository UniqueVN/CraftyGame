Crafty.c('Hero',
{
	Pickups : null,

	init: function()
	{
		this.requires('Pawn');
		this.bind("EnterFrame", this._updateHero);

		this.Pickups = {};

		return this;
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
		if (this.Pickups[name])
		{
			this.Pickups[name]++;
		}
		else
		{
			this.Pickups[name] = 1;
		}
	}
});
