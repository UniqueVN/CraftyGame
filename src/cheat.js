// ========================================================================================== //
// CHEAT MANAGER
var Cheat = Class({
	constructor: function(player) {
		this.player = player;
		this.playerEntity = player.getEntity();
		this.world = this.playerEntity.GetWorld();
	},

	// GOD MODE
	god: function() {
		this.playerEntity.toggleComponent("Damageable");
	},

	ActivateNest: function(id) {
		this.world.nestedRegions[id].Activate();
	},

	ReleaseTheBoss: function(id) {
		this.world.nestedRegions[id].ReleaseTheBoss();
	},

	ShowMeTheMoney : function(pickup, amount)
	{
		this.playerEntity.IncreasePickup(pickup, amount);
	}
});