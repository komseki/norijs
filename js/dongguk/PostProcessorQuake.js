/**
 * 동국대 개발 
 * requireJs에서 사용하기 위해 수정.
 * define으로 정의 .
 */

define( ['require', 'THREE'],
function(require){
    return function PostProcessor() {

        var _this = this;
        var canvas = document.createElement('canvas');

        //snow
        var snowCanvas;
        var snowCtx;
        var snowPositions;
        var snowLives;
        var snowSizes;
        var snowSeedLife;
        var snowSeedSize;
        var snowTotal;
        var snowTail;
        var snowCount;

        //rain
        var rainCanvas;
        var rainContext;
        var rainTotal;
        var rainCount;
        var rainTail;
        var rainPositions;
        var rainLives;
        var rainSizes;
        var rainColors;
        var rainAlpha;
        var rainWidths;
        var rainHeights;
        var rainSeedSize;
        var rainSeedLife;
        var rainSpeeds;
        var rainStops;
        var rainOptions;
        var PRIVATE_GRAVITY_FORCE_FACTOR_X;
        var reflectionScaledownFactor = 5;
        var reflectionDropMappingWidth = 200;
        var reflectionDropMappingHeight = 200;
        var reflected;
        var width;
        var height;
        var img;
        var crop;

        var ox;
        var oy;
        var xe;
        var ye;
        var xm;
        var ym;

        //earthquake
        var pre_x = 0;
        var pre_y = 0;
        var pre_z = 0;

        //steps
        var currentStep = 0;
        var stepOffset = 3;

       



        this.earthquake = function( _camera, force_x, force_y, force_z) {

            var cx = (0.5  - Math.random()) * force_x;
            var cy = (0.5  - Math.random()) * force_y;
            var cz = (0.5  - Math.random()) * force_z;

            var change_camera = _camera;

            change_camera.position.set(change_camera.position.x - pre_x + cx, change_camera.position.y - pre_y + cy, change_camera.position.z - pre_z + cz);

            pre_x = cx;
            pre_y = cy;
            pre_z = cz;

            return change_camera;
        };

        this.changeState = function( state ){

            if(state) {
                pre_x = 0;
                pre_y = 0;
                pre_z = 0;
                return false;
            }
            else {
                return true;
            }


        }

        

    }

} );