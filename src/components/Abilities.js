Crafty.c('AbilityUser',
{
	_currentAbility : null,

	init: function()
	{
		this.requires("BodyAnimations");
		this._abilities = {};
		this.bind("EnterFrame", this._updateAbilities);
	},

	AddAbility : function(slot, ability)
	{
		this._abilities[slot] = ability;
		return this;
	},

	GetAbility : function(slot)
	{
		return this._abilities[slot];
	},

	UseSlot : function(slot, data)
	{
		if (this._currentAbility != null)
			return;

		var ability = this._abilities[slot];
		if (!ability)
			throw ("ability in slot '", slot, "' not found!");

		this.UseAbility(ability, data);
	},

	UseAbility : function(ability, data)
	{
		if (this._currentAbility != null)
			return;

		ability.UsedBy(this, data);
		if (ability.IsActive)
			this._currentAbility = ability;

	},

	_updateAbilities : function()
	{
		if (this._currentAbility != null)
		{
			this._currentAbility.Update(this);
			if (!this._currentAbility.IsActive)
				this._currentAbility = null;
		}
	}
});

AbilityBehaviorType =
{
	Melee : 0,
	Ranged : 1
};

var Ability = Class(
{
	constructor : function()
	{
		this.IsActive = false;
		this._playingAnim = null;
		this._animCallback = null;
	},

	Update : function(user)
	{
		if (this._playingAnim != null)
		{
			if (!user.IsPlayingActionAnim(this._playingAnim))
			{
				this._playingAnim = null;
				this._animCallback.call(this, user);
				this.IsActive = false;
			}
		}
	},

	_playAbilityAnim  : function(user, name, dir, callback)
	{
		user.PlayActionAnim(name, dir);
		this._playingAnim = name;
		this._animCallback = callback;
		this.IsActive = true;
	}
});

var ActionAbility = Class(Ability,
{
	constructor : function()
	{
		ActionAbility.$super.call(this);

		this.PlayAnim = false;
		this._actionData = null;
		this._actionAnimName = "Action";
	},

	UsedBy : function(user, data)
	{
		if (this.PlayAnim)
		{
			this._actionData = data;
			user.trigger("PauseMovement");
			this._playAbilityAnim(user, this._actionAnimName, this._getActionDir(user, data), this._readForAction);
		}
		else
		{
			this._performAction(user, data);
		}
	},

	_getActionDir : function(user, data)
	{
		return { x : 0, y : 0 };
	},

	_readForAction : function(user)
	{
		user.trigger("ResumeMovement");
		this._performAction(user, this._actionData);
	},

	_performAction : function(user, data)
	{

	}
});

var Ability_Shoot = Class(ActionAbility,
{
	constructor : function()
	{
		Ability_Shoot.$super.call(this);

		this._actionAnimName = "Shoot";
		this.BehaviorType = AbilityBehaviorType.Ranged;
	},

	_getActionDir : function(user, data)
	{
		if (!data.dir)
			throw ("Ability_Shoot requires you to pass in dir!");

		return data.dir;
	},

	_performAction : function(user, data)
	{
		var center = user.GetCenter();
		var projectile = user.GetWorld().SpawnProjectile(center.x, center.y);
		projectile.Launch(user, this._getActionDir(user, data));
	}
})

var Ability_Melee = Class(ActionAbility,
{
	constructor : function()
	{
		Ability_Melee.$super.call(this);

		this._actionAnimName = "Melee";
		this.BehaviorType = AbilityBehaviorType.Melee;

		this.Range = 1;
		this.Span = 1;
	},

	_getActionDir : function(user, data)
	{
		if (!data.dir)
			throw ("Ability_Melee requires you to pass in dir!");

		return data.dir;
	},

	_performAction : function(user, data)
	{
		var start = user.GetCenter();
		var dir = this._getActionDir(user, data);
		var end = Math3D.Add(start, Math3D.Scale(dir, this.Range));

		var result = user.GetWorld().CollisionMap.LineCheck(start, end, this.Span * 0.5);
		var hits = result.hits;
		for (var i = 0; i < hits.length; i++)
		{
			var entity = hits[i].entity;
			if (entity != user && !entity.IsFriendly(user) && entity.has("Damageable"))
			{
				entity.TakeDamage(5);
			}
		}
	}
})
