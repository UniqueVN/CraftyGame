Crafty.scene("gameOver", function() {
	console.log("START GAME OVER SCENE");

	var canvasWidth = gameContainer.conf.get("CANVAS_WIDTH");
	var canvasHeight = gameContainer.conf.get("CANVAS_HEIGHT");
	
	Crafty.background("#000");
	Crafty.e("2D, DOM, Text").attr({w: 100, h: 20, x: (canvasWidth - 100) / 2, y: (canvasHeight - 20) / 2})
		.text("Base destroyed!!!\n We're doom!!!")
		.css({"text-align": "center"});
	
	var btnRestart = new Button("Restart", 100, 100);
});