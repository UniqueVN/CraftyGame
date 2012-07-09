Crafty.c('AbilityUser',
{
	init: function()
	{
		this.requires("Body");
		this._abilities = {};
	},

	AddAbility : function(slot, ability)
	{
		this._abilities[slot] = ability;
		return this;
	},

	UseAbility : function(slot, data)
	{
		var ability = this._abilities[slot];
		if (!ability)
			throw ("ability in slot '", slot, "' not found!");

		ability.UsedBy(this, data);
	}
});

var Ability = Class(
{
});

var Ability_Shoot = Class(Ability,
{
	UsedBy : function(user, data)
	{
		if (!data.dir)
			throw ("Ability_Shoot requires you to pass in dir!");

		var center = user.GetCenter();
		var projectile = user.GetWorld().SpawnProjectile(center.x, center.y);
		projectile.Launch(user, data.dir);
	}
})
