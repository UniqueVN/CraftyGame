Crafty.c('Pickup',
{
	PickupName : "Void",

	init: function()
	{
		this.requires("Body");
		this.bind("Appeared", this._pickupAppeared);
		return this;
	},

	_pickupAppeared : function()
	{
		this._world.AddPickup(this);
	},

	PickedUpBy : function(hero)
	{
		this._world.RemovePickup(this);

		this._pickingHero = hero;
		this._pickupSpeed = 0.02;
		this.bind("EnterFrame", this._flyTowardsHero);
	},

	_flyTowardsHero : function()
	{
		var newSpeed = this._pickupSpeed + 0.03;
		var avgSpeed = (this._pickupSpeed + newSpeed) * 0.5;

		var center = this.GetCenter();
		var delta = Math3D.Delta(center, this._pickingHero.GetCenter());
		var dist = Math3D.Size(delta);

		if (dist <= avgSpeed)
		{
			this._pickingHero.ReceivedPickup(this);
			this.destroy();
		}
		else
		{
			var x = center.x + delta.x / dist * avgSpeed;
			var y = center.y + delta.y / dist * avgSpeed;
			this._setCenter(x, y);
			this._updateSpritePos();
			this._pickupSpeed = newSpeed;
		}
	}
});
