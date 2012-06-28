Config = Backbone.Model.extend({
    defaults: {
        renderType : 'Canvas',
		CANVAS_WIDTH: 800,
		CANVAS_HEIGHT: 600,
		MAP_WIDTH: 60,
		MAP_HEIGHT: 40,
		TILE_SIZE: 32,
		PLAYER_SPEED: 3.2
    },
    initialize: function() {
    },
});