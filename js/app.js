//'use strict';
define( function( search, preloading, main ){
	/**
	 * 어플리케이션 초기설정 함수.
	 * 필요한 모듈 설정 및 페이지에대한 설정을 한다.
	 */
	function init(){
		requirejs( [ 'stage.deviceSearch', 'stage.titleLoading', 'stage.main', 'nativeConn', 'zepto.module', 'text', 'utils', 'nori', 'VARS', 'R' ], function( search, titleloading, main, nativeConn ){
			// tap event PC 환경에서 사용할 수 있게 변경.
			(function(){
				if( VARS.isMouse ){
					var _tap = $.fn.tap;
					$.fn.tap = $.fn.click;
				}else{
					$.fn.tap = $.fn.tap;
				}
			}());
		
			// 갤럭시 뷰이상의 화면사이즈인지 체크하기 위한 boolean 설정.
			VARS.largeScreen = parseInt(document.body.clientWidth) >= 1920;
			
			// 매니저 생성및 스테이지 추가.
			var mgr = new Nori.StageManager( 'main' );
			mgr.add( 'search', search );
			mgr.add( 'titleloading', titleloading );
			mgr.add( 'main', main );
			// 커맨드 생성.
			Nori.Commands.getInstance();

			// 처음 인트로 페이지 준비시 등록/수신.
			Nori.Commands.registCmd( 'ready', function(){
				Nori.SoundManager.init();
				Nori.SoundManager.loadBuffers( [{"id" : "eff_cm_btn_basic", "url" : VARS.sound.basicOnly}], function(){
					Nori.SoundManager.registerSound( 'btn_basic', 'eff_cm_btn_basic' );
					nativeConn.mobloWebReady();
				} );
			});
			
			// 타이틀 화면 이동 명령 등록/수신.
			Nori.Commands.registCmd( 'startTitleloading', function(){
				mgr.play( 'titleloading' );
			});
			
			// 메인페이지 이동 명령 등록/수신.
			Nori.Commands.registCmd( 'startMain', function( reload ){
				mgr.play( 'main', reload );
			});
			
			// 앱 재시작시 Android에서 전달받음.
			window.webapp.addEventListener( window.webapp.MOBLO_ON_RESUME, function(){
				var manager = Nori.getManager('main'),
					name = manager.getCurrentPageName(),
					stage = manager.getStage(name);
				//
				if( stage !== undefined && stage !== null ){
					stage.__onResume__();
				}
			} );
			
			// 앱 정지시 Android 에서 전달받음.
			window.webapp.addEventListener( window.webapp.MOBLO_ON_PAUSE, function(){
				var manager = Nori.getManager('main'),
					name = manager.getCurrentPageName(),
					stage = manager.getStage(name);
				//
				if( stage !== undefined && stage !== null ){
					stage.__onPause__();
				}
			} );

			// 테스트용 UI 레이어 띄움.
			if( __hash.testui ){
				// utils.js 
				testui();
			}

			// 테스트용 타이틀 화면 바로 이동
			if( __hash.title || __hash.play ){
				if( __hash.play ){
					VARS.isPlayTest = true;
				}
				mgr.play( 'titleloading' );
				return;
			}

			// 블루투스 화면시작 :: 최초 시작점
			mgr.play( 'search' );
			
		} );
	};
	
	
	
	return function(){
		init();
	};
} );
	
	