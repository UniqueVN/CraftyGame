Crafty.c('AI',
{
	init: function()
	{
		this.requires("NavigationHandle");
		this.bind("EnterFrame", this._think);
	},

	_think : function(e)
	{
		// just randomly roaming for now!
		if (!this.IsNavigating())
		{
			var center = this.GetCenterRounded();
			var size = 10;
			var minX = Crafty.math.clamp(center.X - size, 0, this._world.MapWidth - 1 - size * 2 );
			var minY = Crafty.math.clamp(center.Y - size, 0, this._world.MapHeight - 1 - size * 2 );
			var x = Crafty.math.randomInt(minX, minX + size * 2);
			var y = Crafty.math.randomInt(minY, minY + size * 2);
			this.NavigateTo(x, y);
		}
	}
});
