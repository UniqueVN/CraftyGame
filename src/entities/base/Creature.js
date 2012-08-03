Creature = MapEntity.extend(
{
	Health : 100,
	Speed : 0.1,
	WalkAnimationStart : 1,
	WalkAnimationFrames : 8,
	WalkAnimationRows : [0, 1, 2, 3],
	WalkAnimationSpeed : 20,
	SpriteVerticalOffset : 0,
	ActionAnimations : {},
	PlayShootAnim : false,
	Faction : Factions.Ghost,
	SoulPoints : 0,
	Abilities : {},
	AIProfile :
	{
		Goals : [ Goal_AttackEnemy, Goal_DestroyTemple ]
	},

	initialize: function()
	{
		this._createEntity();
		this._setupAnimations();
	},

	_createEntity : function()
	{
		var entity = Crafty.e("2D, Canvas, Body, Pawn, Soul, Damageable, BodyAnimations, DebugRendering, AbilityUser, NavigationHandle, AvoidanceHandle, AI, " + this._getRandomSprite())
			.attr(
			{
				TileWidth:this.Width,
				TileHeight:this.Height,
				MovementSpeed : this.Speed,
				Faction : this.Faction,
				SoulPoints : this.SoulPoints,
				AIProfile: this.AIProfile,
				MaxHealth: this.Health,
				SpriteVerticalOffset : this.SpriteVerticalOffset
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
			entity.WalkAnimation(this.WalkAnimationFrames, this.WalkAnimationRows, this.WalkAnimationSpeed, this.WalkAnimationStart);

		for (var name in this.ActionAnimations)
		{
			var data = this.ActionAnimations[name];
			var interval = data[2] || 5;
			var steps = data[3] === undefined ? 1 : data[3];
			entity.ActionAnimation(name, data[0], data[1], interval, steps);
		}
	}
});
