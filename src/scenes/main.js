//method to randomy generate the map
function generateWorld(){
	var mapWidth = gameContainer.conf.get("MAP_WIDTH");
	var mapHeight = gameContainer.conf.get("MAP_HEIGHT");
	var tileSize = gameContainer.conf.get("TILE_SIZE");
	
	//generate the grass along the x-axis
	for (var i = 0; i < mapWidth; i++) {
		//generate the grass along the y-axis
		for (var j = 0; j < mapHeight; j++) {
			grassType = Crafty.math.randomInt(1, 4);
			Crafty.e("2D, Canvas, grass"+grassType)
				.attr({x: i * tileSize, y: j * tileSize});
			
			//1/50 chance of drawing a flower and only within the bushes
			if(i > 0 && i < mapWidth - 1 && j > 0 && j < mapHeight - 1 && Crafty.math.randomInt(0, 50) > 49) {
				Crafty.e("2D, DOM, flower, solid, SpriteAnimation")
				//Crafty.e("2D, Canvas, flower, solid, SpriteAnimation")
					.attr({x: i * tileSize, y: j * tileSize})
					.animate("wind", 0, 1, 3)
					.animate("wind", 80, -1);
			}
		}
	}
	
	//create the bushes along the x-axis which will form the boundaries
	for(i = 0; i < mapWidth; i++) {
		Crafty.e("2D, Canvas, wall_top, solid, bush"+Crafty.math.randomInt(1,2))
			.attr({x: i * tileSize, y: 0, z: 2});
		Crafty.e("2D, Canvas, wall_bottom, solid, bush"+Crafty.math.randomInt(1,2))
			.attr({x: i * tileSize, y: (mapHeight - 1) * tileSize, z: 2});
	}
	
	//create the bushes along the y-axis
	//we need to start one more and one less to not overlap the previous bushes
	for(i = 1; i < mapHeight; i++) {
		Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
			.attr({x: 0, y: i * tileSize, z: 2});
		Crafty.e("2D, Canvas, wall_right, solid, bush"+Crafty.math.randomInt(1,2))
			.attr({x: (mapWidth - 1) * tileSize, y: i * tileSize, z: 2});
	}
}

Crafty.scene("main", function() {
	var tileSize = gameContainer.conf.get("TILE_SIZE");
	
//	generateWorld();
    
	var mapWidth = gameContainer.conf.get("MAP_WIDTH");
	var mapHeight = gameContainer.conf.get("MAP_HEIGHT");
	var tileSize = gameContainer.conf.get("TILE_SIZE");
    
	var tileMap = Crafty.e("2D, Canvas, TileMap")
						.attr({x: 0, y: 0, z: 0, w:tileSize * mapWidth, h:tileSize * mapHeight})
						.randomGenerate(mapWidth, mapHeight, tileSize);
	
	var player = new Player();

	// tht062312 - Always keep player on center of the screen
	// MUST FIX: this make viewport follow or center on player is too slow right now.
	//Crafty.viewport.centerOn(player, 1);
	//Crafty.viewport.follow(player, 0, 0);
	
	console.log("START MAIN SCENE: player = ", player);
});