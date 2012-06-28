//the loading screen that will display while our assets load
Crafty.scene("loading", function() {
	var version = gameContainer.gameVersion;
	console.log("START LOADING ...");
	
	var canvasWidth = gameContainer.conf.get("CANVAS_WIDTH");
	var canvasHeight = gameContainer.conf.get("CANVAS_HEIGHT");
	
	//black background with some loading text
	Crafty.background("#000");
	Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: (canvasWidth - 100) / 2, y: (canvasHeight - 20) / 2})
		.text("Loading")
		.css({"text-align": "center"});
		
	// Create Sprites
	var sprites = new Sprites();
	sprites.create();

	// clear scene and interface
	sc = []; infc = [];
	
	// load takes an array of assets and a callback when complete
	Crafty.load(sprites.getPaths(), function() {
		// array with local components
		var elements = [
			"src/components/MouseHover.js?v="+version,
			"src/components/KeyMoveControls.js?v="+version,
			"src/components/Hero.js?v="+version,
			"src/components/TileMap.js?v="+version,
			"src/entities/base/BaseEntity.js?v="+version,
			"src/entities/base/MapEntity.js?v="+version,
			"src/entities/player.js?v="+version
		];

		//when everything is loaded, run the main scene
		require(elements, function() {
			if (gameContainer.scene != undefined) {
				Crafty.scene(gameContainer.scene);
			}
		});
	});
});