var TowerBase = MapEntity.extend(
{
	Width : 1,
	Height : 1,
	Sprites : ['cup'],

	initialize: function()
	{
		var entity = Crafty.e("2D, Canvas, SpriteAnimation, Body, Static, Mouse, " + this.Sprites[0])
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height});
		entity.bind('Click', this.onClick.bind(this));

		this.set({'entity' : entity });
	},

	onClick: function()
	{
		debug.log("SPAWN THE TOWER NOW");

		var entity = this.getEntity();

		var cost = 500;
		var player = entity.GetWorld().Player;
		var souls = player.Pickups['soul'] || -1;
		if (souls >= cost)
		{
			player.Pickups['soul'] -= cost;
		}
		else
		{
			return;
		}

		new Tower().Appear(entity.GetWorld(), entity._tileX, entity._tileY);
		entity.destroy();
		// entity._removeBody();
	}
});

var Tower = MapEntity.extend(
{
	Width : 1,
	Height : 1,
	Sprites : ['cherryTree0', 'cherryTree1', 'lionStatue'],
	Abilities:
	{
		"Primary" :
		{
			Type : Ability_Spell,
			PlayAnim : false,
			Spell :
			{
				Pattern : SpellPatterns.Arc,
				Projectile : MagicMissle,
				Arc : 30,
				Total : 3,
				RandomAngle : 10
			}
		}
	},
	Faction: Factions.Monk,

	initialize: function()
	{
		var entity = Crafty.e("2D, Canvas, SpriteAnimation, Body, Static, AbilityUser, Faction, TowerAI, " + this._getRandomSprite())
			.attr({z:2, TileWidth:this.Width, TileHeight:this.Height, Faction : this.Faction});
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
	}
});

Crafty.c('TowerAI',
{
	init: function()
	{
		this._goals = [];
		this.bind("Appeared", function()
		{
			this._goals.push(new Goal_AttackEnemy(this));
		});

		this.bind("EnterFrame", this._think);
	},

	_think : function(e)
	{
		var frame = e.frame;

		for (var i = 0; i < this._goals.length; i++)
			this._goals[i].Update(frame);

		for (var i = 0; i < this._goals.length; i++)
		{
			var goal = this._goals[i];
			if (goal.Priority > 0)
			{
				goal.Behave(frame);
				break;
			}
		}
	}
});