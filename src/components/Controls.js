Crafty.c('MouseControl',
{
	_isInCastingMode : false,
	_beam : null,

	init : function()
	{
		if (!this.has("NavigationHandle"))
			throw ("MouseMoveControl relies on NavigationHandle to move the dude around!");

		this.bind("MapMouseDown", this._onMapMouseDown);
		this.bind("MapMouseUp", this._onMapMouseUp);
		this.bind("MapMouseMove", this._onMapMouseMove);
		this.bind("KeyDown", this._onHeroControlKeyDown);

		return this;
	},

	_onHeroControlKeyDown : function(e)
	{
		if (e.key == Crafty.keys['1'])
			this._isInCastingMode = !this._isInCastingMode;

		if (this._isInCastingMode)
			this.StopNavigation();
		else
			this._stopBeam();

		this.text(this._isInCastingMode ? "casting" : "moving");
	},

	_onMapMouseDown : function(e)
	{
		if (this._isInCastingMode)
		{
			var center = this.GetCenterReal();
			var x = center.x;
			var y = center.y - 16;
			this._beam = Crafty.e("2D, Canvas, blueBeam").attr({ x : x, y : y, w : 500}).origin("middle left");
			this._rotateBeam(e);
		}
		else
		{
			var tileX = Math.floor(e.realX / this._world.TileSize);
			var tileY = Math.floor(e.realY / this._world.TileSize);

			console.log("Move to ", tileX, tileY);

			this.NavigateTo(tileX, tileY);
		}
	},

	_onMapMouseUp : function(e)
	{
		if (this._isInCastingMode)
		{
			this._stopBeam();
		}
	},

	_onMapMouseMove : function(e)
	{
		if (this._isInCastingMode && this._beam != null)
		{
			this._rotateBeam(e);
		}
	},

	_stopBeam : function()
	{
		if (this._beam != null)
		{
			this._beam.destroy();
			this._beam = null;
		}
	},

	_rotateBeam : function(e)
	{
		var center = this.GetCenterReal();
		var dx = e.realX - center.x;
		var dy = e.realY - center.y;
		dx *= -1;
		dy *= -1;

		var theta = Math.acos(dx / Math.sqrt(dx * dx + dy * dy)) * 180.0 / Math.PI;
		if (dy < 0)
			theta = - theta;

		console.log("theta ", theta);
		this._beam.rotation = theta;
	}
});
