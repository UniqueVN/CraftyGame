Crafty.c('Hero', {
	init: function() {
			//setup animations
			this.requires("SpriteAnimation, Collision")
			.animate("walk_left", 6, 3, 8)
			.animate("walk_right", 9, 3, 11)
			.animate("walk_up", 3, 3, 5)
			.animate("walk_down", 0, 3, 2)
			//change direction when a direction change event is received
			.bind("NewDirection",
				function (direction) {
					if (direction.x < 0) {
						if (!this.isPlaying("walk_left"))
							this.stop().animate("walk_left", 10, -1);
					}
					if (direction.x > 0) {
						if (!this.isPlaying("walk_right"))
							this.stop().animate("walk_right", 10, -1);
					}
					if (direction.y < 0) {
						if (!this.isPlaying("walk_up"))
							this.stop().animate("walk_up", 10, -1);
					}
					if (direction.y > 0) {
						if (!this.isPlaying("walk_down"))
							this.stop().animate("walk_down", 10, -1);
					}
					if(!direction.x && !direction.y) {
						this.stop();
					}
			})
			// A rudimentary way to prevent the user from passing solid areas
			.bind('Moved', function(from) {
				//console.log(this + " moving");
				if(this.hit('solid')){
					this.attr({x: from.x, y:from.y});
				}
			});
		return this;
	}
});
