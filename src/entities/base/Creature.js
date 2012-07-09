Creature = MapEntity.extend(
{
	Speed : 0.1,
	WalkAnimationFrames : 9,
	WalkAnimationRows : [0, 1, 2, 3],

	initialize: function()
	{
		this._createEntity();
		this._setupAnimations();
	},

	_createEntity : function()
	{
		var entity = Crafty.e("2D, DOM, Mouse, Body, Damageable, BodyAnimations, NavigationHandle, AI, " + this._getRandomSprite())
			.attr(
			{
				TileWidth:this.Width,
				TileHeight:this.Height,
				IsStatic:false,
				MovementSpeed : this.Speed,
				Faction : Factions.Ghost
			});

		this.set({'entity' : entity });
	},

	_setupAnimations : function()
	{
		var entity = this.getEntity();

		if (this.WalkAnimationFrames > 0)
			entity.WalkAnimation(this.WalkAnimationFrames, this.WalkAnimationRows);
	}
});
