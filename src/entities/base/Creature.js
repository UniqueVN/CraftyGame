Creature = MapEntity.extend(
{
	Speed : 0.1,
	WalkAnimationFrames : 9,
	WalkAnimationRows : [0, 1, 2, 3],
	WalkAnimationSpeed : 20,
	ActionAnimations : {},
	PlayShootAnim : false,
	Faction : Factions.Ghost,
	Abilities : {},

	initialize: function()
	{
		this._createEntity();
		this._setupAnimations();
	},

	_createEntity : function()
	{
		var entity = Crafty.e("2D, DOM, Mouse, Body, Damageable, BodyAnimations, DebugRendering, AbilityUser, NavigationHandle, AvoidanceHandle, AI, " + this._getRandomSprite())
			.attr(
			{
				TileWidth:this.Width,
				TileHeight:this.Height,
				IsStatic:false,
				MovementSpeed : this.Speed,
				Faction : this.Faction
			});

		for (var slot in this.Abilities)
		{
			var data = this.Abilities[slot];
			var ability = new data.Type();
			for (var key in data)
			{
				if (key === "Type")
					continue;

				ability[key] = data[key];
			}

			entity.AddAbility(slot, ability);
		}


		this.set({'entity' : entity });
	},

	_setupAnimations : function()
	{
		var entity = this.getEntity();

		if (this.WalkAnimationFrames > 0)
			entity.WalkAnimation(this.WalkAnimationFrames, this.WalkAnimationRows, this.WalkAnimationSpeed);

		for (var name in this.ActionAnimations)
		{
			var data = this.ActionAnimations[name];
			entity.ActionAnimation(name, data[0], data[1]);
		}
	}
});
