Player = BaseEntity.extend({
	//var playerSpeed = gameContainer.conf.get("PLAYER_SPEED");
	
	defaults: {
        'speed' : 2,
    },
    initialize: function(){
		var tileSize = gameContainer.conf.get("TILE_SIZE");
		
    	var model = this;
    	var entity = Crafty.e("2D, Canvas, player, KeyMoveControls, Mouse, Hero, Animate, Collision")
		.attr({x: 160, y: 144, z: 1, w:tileSize, h:tileSize})
		.keyControls(this.defaults.speed);

    	model.set({'entity' : entity });
    }
});