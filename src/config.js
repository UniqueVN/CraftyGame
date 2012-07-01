Config = Backbone.Model.extend({
    defaults: {
        renderType : 'Canvas',
		CANVAS_WIDTH: 1024,
		CANVAS_HEIGHT: 768,
		MAP_WIDTH: 120,
		MAP_HEIGHT: 120,
		TILE_SIZE: 32,
		PLAYER_SIZE: 64,
		PLAYER_SPEED: 6.5
    },
    initialize: function() {
    },
});