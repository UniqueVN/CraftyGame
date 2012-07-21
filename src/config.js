Config = Backbone.Model.extend({
    defaults: {
        renderType : 'Canvas',
		CANVAS_WIDTH: 1024,
		CANVAS_HEIGHT: 768,
		MAP_WIDTH:  1000,
		MAP_HEIGHT: 1000,
		MINI_MAP_WIDTH: 200,
		MINI_MAP_HEIGHT: 150,
		MINI_MAP_X: 10,
		MINI_MAP_Y: 10,
		TILE_SIZE: 32,
		PLAYER_SIZE: 64,
		PLAYER_SPEED: 6.5,
		SHOW_TREES: true,
	    ENABLE_DEBUG: true
    },
    initialize: function() {
    },
});