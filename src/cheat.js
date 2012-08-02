// ========================================================================================== //
// CHEAT MANAGER
var Cheat = Class({
	constructor: function(player) {
		this.player = player;
		this.playerEntity = player.getEntity();
		this.world = this.playerEntity.GetWorld();
	},

	// GOD MODE
	God: function() {
		this.playerEntity.toggleComponent("Damageable");
	},

	ActivateNest: function(id) {
		this.world.nestedRegions[id].Activate();
	},

	ReleaseTheBoss: function(id) {
		this.world.nestedRegions[id].ReleaseTheBoss();
	},

	Doom: function() {
		this.world.GameOver();
	},

	Win: function() {
		this.world.WinGame();
	},

	ShowMeTheMoney : function(pickup, amount)
	{
		this.playerEntity.IncreasePickup(pickup, amount);
	}
});