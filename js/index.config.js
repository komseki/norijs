//console.log( require.s.contexts._.defined['name'] );
//console.log( require.defined('nativeConn') ) // true, false;
//console.log( require.specified('pollyfill') );
//console.log( requirejs.undef() );
(function(){
	
	// 캐시를 사용할 수 있게 할것인지.
	// true로 변경하면 파일뒤에 해시 형태가 붙어 강제로 캐싱이 되지 않게 한다.
	var hasCache = false,
	
	/**
	 * requirejs 환경설정
	 *  */
	config = {
		baseUrl : 'js',
		waitSeconds : 100,
		// bundles : {},
		paths : {
			domReady : 'require/domReady',
			text : 'require/text',
			handlebars : 'libs/handlebars-v4.0.5',
			//jQuery :  'libs/jquery-2.1.4',
			Zepto : 'libs/zepto.min', 
			'zepto.module' : 'libs/zepto.module',
			Swiper : 'libs/swiper.min',
			THREE : 'three/three.min.71',
			OBJLoader : 'three/loaders/OBJLoader',
			Detector : 'three/Detector',
			OrbitControls : 'three/controls/OrbitControls',
			stats : 'three/libs/stats.min',
			TWEEN : 'three/libs/tween.min',
			
			// vfx handling
            effect : 'effect/effect',

            // vfx
            ParticleSystem : 'dongguk/ParticleSystem',
            ParticleSystemRain : 'dongguk/ParticleSystemRain',
            PostProcessorQuake : 'dongguk/PostProcessorQuake',
            NoiseGenerator : 'dongguk/NoiseGenerator',
			// vfx shader
            screenMeshVertex : 'dongguk/shaders/screenMeshVertex.glsl',
            screenMeshFragment : 'dongguk/shaders/screenMeshFragment.glsl',
            pointCloudVert : 'dongguk/shaders/pointCloudVert.glsl',
            pointCloudFrag : 'dongguk/shaders/pointCloudFrag.glsl',
            depthMapVertex : 'dongguk/shaders/depthMapVertex.glsl',
            depthMapFragment : 'dongguk/shaders/depthMapFragment.glsl',
            maskVertexShader : 'dongguk/shaders/maskVertexShader.glsl',
            maskFragmentShader : 'dongguk/shaders/maskFragmentShader.glsl',
			
			//resources : '../datas/resources.json', // javascript 로 변경
			search_list : '../template/search_list.hbs',
			debug_layer : '../template/debug_layer.hbs',
			test_ui : '../template/test_ui.hbs',
			crypto : 'libs/crypto/crypto-core-md5-min'
			
		},
		shim : {
			nori : {
				deps : ['polyfill'],
				exports : 'nori'
			},
			utils : {
				deps : ['polyfill'],
				exports : 'utils'
			},
			OBJLoader : {
				deps: ['THREE']
			},
			Detector : {
				deps: ['THREE']
			},
			OrbitControls : {
				deps: ['THREE']
			},
			handlebars : {
				exports : 'handlebars'
			},
			'zepto.module' : {
				deps: ['Zepto']
			}
		}
	};
	
	/**
	 * 테스트시 파일의 캐시가 잡히지 않게 파일에 파라미터를 강제로 적용.
	 *  */
	if( !hasCache ){
		config.urlArgs = 'v=' + Date.now();
	}
	
	/**
	 * 시작함수 Ready 이벤트를 체크해 app.js를 실행한다.
	 */
	var start = function(){
		//
		requirejs.config( config );
		//
		requirejs(['domReady', 'app', 'utils', 'Zepto'], function( domReady, app ){
			domReady( function(){
				$(document).ready(function(){
					app();
				});
			} );
		}, function(){
			setTimeout( start, 250 );
		});
	};
	start();
	//
})();




