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

	UseAbility : function(slot, data)
	{
		if (this._currentAbility != null)
			return;

		var ability = this._abilities[slot];
		if (!ability)
			throw ("ability in slot '", slot, "' not found!");

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

var Ability_Shoot = Class(Ability,
{
	constructor : function(playAnim)
	{
		Ability_Shoot.$super.call(this);

		this._playShootAnim = playAnim || false;
		this._fireDir = null;
	},

	UsedBy : function(user, data)
	{
		if (!data.dir)
			throw ("Ability_Shoot requires you to pass in dir!");

		this._fireDir = data.dir;

		if (this._playShootAnim)
		{
			this._playAbilityAnim(user, "Shoot", this._fireDir, this._readToFire);
			user.PauseNavigation();
		}
		else
		{
			this._fire(user);
		}
	},

	_readToFire : function(user)
	{
		user.ResumeNavigation();
		this._fire(user);
	},

	_fire : function(user)
	{
		var center = user.GetCenter();
		var projectile = user.GetWorld().SpawnProjectile(center.x, center.y);
		projectile.Launch(user, this._fireDir);
	}
})
