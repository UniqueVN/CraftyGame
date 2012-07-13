Config = Backbone.Model.extend({
    defaults: {
        renderType : 'Canvas',
		CANVAS_WIDTH: 1024,
		CANVAS_HEIGHT: 768,
		MAP_WIDTH:  1000,
		MAP_HEIGHT: 1000,
		TILE_SIZE: 32,
		PLAYER_SIZE: 64,
		PLAYER_SPEED: 6.5,
		SHOW_TREES: false,
		SHOW_ROCKS: false
    },
    initialize: function() {
    },
});