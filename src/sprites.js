/**
    examples:
    'sprites_name' : {
         'file' : 'path/to/file',
         'tile' : width,
         'tileh' : height,
         'elements': {
             'sprite_name' : [0, 0]
         }
    },
*/

Sprites = Backbone.Model.extend({
    defaults: {
        images:{
			gameSprite : {
				file: 'res/images/sprite.png',
				tile: 16,
				tileh: 16,
				elements: {
					grass1: [0,0],
					grass2: [1,0],
					grass3: [2,0],
					grass4: [3,0],
					flower: [0,1],
					bush1: [0,2],
					bush2: [1,2],
					player: [0,3]
				}
			},
			charMale: {
			    file: 'res/images/charMale.png',
			    tile: 64,
			    tileh: 64,
			    elements: {
			        malePlayer: [0, 0]
			    }
			},
			charMaleNaked: {
			    file: 'res/images/BODY_male.png',
			    tile: 64,
			    tileh: 64,
			    elements: {
			        maleNaked: [0, 0]
			    }
			},
			skeleton: {
			    file: 'res/images/BODY_skeleton.png',
			    tile: 64,
			    tileh: 64,
			    elements: {
			        skeleton: [0, 0]
			    }
			},
			slime: {
			    file: 'res/images/slime.png',
			    tile: 32,
			    tileh: 32,
			    elements: {
			        slime: [0, 0]
			    }
			},
            rock: {
                file: 'res/images/rock.png',
                tile: 32,
                tileh: 32,
                elements: {
                    rock1: [0, 0],
                    rock2: [1, 0]
                }
            },
            dirt: {
                file: 'res/images/dirt.png',
                tile: 32,
                tileh: 32,
                elements: {
                    dirt0: [1, 3],
                    dirt1: [0, 5],
                    dirt2: [1, 5],
                    dirt3: [2, 5]
                }
            },
            water: {
                file: 'res/images/water.png',
                tile: 32,
                tileh: 32,
                elements: {
                    // Edge
                    waterEdge1: [1, 4], // TOP
                    waterEdge2: [1, 2], // BOTTOM
                    waterEdge4: [0, 3], // RIGHT
                    waterEdge8: [2, 3], // LEFT
                    // Convex Corner
                    waterEdge12: [1, 0], // TOP-LEFT
                    waterEdge15: [2, 0], // TOP-RIGHT
                    waterEdge18: [1, 1], // BOTTOM-LEFT
                    waterEdge21: [2, 1], // BOTTOM-RIGHT
                    // Valley Corner
                    waterEdge9: [2, 4], // TOP-LEFT
                    waterEdge5: [0, 4], // TOP-RIGHT
                    waterEdge10: [2, 2], // BOTTOM-LEFT
                    waterEdge6: [0, 2], // BOTTOM-RIGHT
                    // Hole
                    waterHole0: [0, 0],
                    waterHole1: [0, 1],
                    // Center
                    water0: [1, 3],
                    water1: [0, 5],
                    water2: [1, 5],
                    water3: [2, 5]
                }
            },
	        muzzleShots: {
		        file: 'res/images/Muzzleflashes-Shots.png',
		        tile: 32,
		        tileh: 32,
		        elements: {
			        blueBeam: [3, 3]
		        }
	        }
        }
    },
    initialize: function(){

    },
    create: function(key){
        if(key != undefined){
            element = this.get('static_images')[key];
            if(element['tileh'] == undefined)
                Crafty.sprite(element['tile'], element['file'], element['elements']);
            else
                Crafty.sprite(element['tile'], element['tileh'], element['file'], element['elements']);

            element = this.get('images')[key];
            if(element['tileh'] == undefined)
                Crafty.sprite(element['tile'], element['file'], element['elements']);
            else
                Crafty.sprite(element['tile'], element['tileh'], element['file'], element['elements']);

            return true;
        };

        _.each(this.get('images'), function(element, k){
            if(element['tileh'] == undefined)
                Crafty.sprite(element['tile'], element['file'], element['elements']);
            else
                Crafty.sprite(element['tile'], element['tileh'], element['file'], element['elements']);
        });

    },
    getPaths: function(){
        var array = [], i=0;
        _.each(this.get('images'), function(element, key){
            array[i] = element['file']
            i++;
        });

        return array;
    }
});