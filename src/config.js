Config = Backbone.Model.extend({
    defaults: {
        renderType : 'Canvas',
		CANVAS_WIDTH: 1024,
		CANVAS_HEIGHT: 768,
		MAP_WIDTH: 60,
		MAP_HEIGHT: 40,
		TILE_SIZE: 32,
		PLAYER_SIZE: 64,
		PLAYER_SPEED: 4.5
    },
    initialize: function() {
    },
});