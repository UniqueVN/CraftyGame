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
	}
});