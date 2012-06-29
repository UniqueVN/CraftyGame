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