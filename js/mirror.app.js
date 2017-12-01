define( function(){
	//'use strict';
	/**
	 * 미러링 페이지용 어플리케이션 초기설정 함수.
	 * 필요한 모듈 설정 및 페이지에대한 설정을 한다.
	 */
	function init(){
		
		requirejs( [ 'stage.deviceSearch', 'stage.titleLoading', 'stage.main', 'nativeConn', 'zepto.module', 'text', 'utils', 'nori', 'VARS', 'R' ], function( search, titleloading, main, nativeConn ){
			//debug.log( 'init' );
			// tap event PC 환경에서 사용할 수 있게 변경.
			(function(){
				if( VARS.isMouse ){
					var _tap = $.fn.tap;
					$.fn.tap = $.fn.click;
				}else{
					$.fn.tap = $.fn.tap;
				}
			}());

			// 파라미터로 넘어온 룸정보 저장.
			VARS.wsRoom = __hash.room;
		
			// 갤럭시 뷰이상의 화면사이즈인지 체크하기 위한 boolean 설정.
			VARS.largeScreen = parseInt(document.body.clientWidth) >= 1920;

			// 매니저 생성및 스테이지 추가.
			var mgr = new Nori.StageManager( 'main' );
			mgr.add( 'search', search );
			mgr.add( 'titleloading', titleloading );
			mgr.add( 'main', main );
			// 커맨드 생성.
			Nori.Commands.getInstance();
			// 처음 인트로 페이지 준비시 수신.
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

			// 소켓 시작 명령 등록/수신
			Nori.Commands.registCmd( 'startSocket', _startSocket);
			
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
			
			// 앱 정지시 Android에서 전달받음.
			window.webapp.addEventListener( window.webapp.MOBLO_ON_PAUSE, function(){
				var manager = Nori.getManager('main'),
					name = manager.getCurrentPageName(),
					stage = manager.getStage(name);
				//
				if( stage !== undefined && stage !== null ){
					stage.__onPause__();
				}
			} );
			
			// 미러사이트 시작
			_startSocket();

			// 테스트용 UI 레이어 띄움.
			if( __hash.testui ){
				// utils.js 
				testui();
			}

			// 타이틀페이지 시작.
			mgr.play( 'titleloading', true );
		} );
	};

	/**
	 * 소켓 접속 시도.
	 */
	function _startSocket(){
		var sc = require('socketConn').getInstance();
		sc.connect( VARS.wsUri );
		//
		sc.removeEventListener( sc.ON_OPEN, _mirrorOnOpen );
		sc.removeEventListener( sc.ON_ERROR, _mirrorOnError );
		sc.removeEventListener( sc.ON_CLOSE, _mirrorOnClose );
		//
		sc.addEventListener( sc.ON_OPEN, _mirrorOnOpen );
		sc.addEventListener( sc.ON_ERROR, _mirrorOnError );
		sc.addEventListener( sc.ON_CLOSE, _mirrorOnClose );
	}

	/**
	 * 소켓 연결시 콜백
	 */
	function _mirrorOnOpen(){
		var sc = require('socketConn').getInstance();
		VARS.deviceWsConnected = true;
	}

	/**
	 * 소켓 에러 이벤트 콜백
	 */
	function _mirrorOnError( e ){
		//
		//console.log( 'error', e);
		// _setWsFailPopup
	}

	/**
	 * 소켓 종료 이벤트 콜백
	 */
	function _mirrorOnClose( e ){
		console.log('close', e);
		var sc = require('socketConn').getInstance();
		if( VARS.deviceWsConnected ){
			VARS.deviceWsConnected = false;
			_setWsEndPopup();
		}else{
			_setWsFailPopup();
		}
	}

	/**
	 * 소켓 접속실패 팝업
	 */
	function _setWsFailPopup(){
		$.showBlock();
		var listTmpl = require( 'text!search_list' );
		
		$('#popupContainer').openLayer({
			id : 'wsfail',
			template : R.findTmpl( listTmpl, 'tmplPopupWsFail' ),
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
					_startSocket();
				} );
				
				$this.find( '.popup-cancel-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
				} );
			}
		});
	}
	
	/**
	 * 소켓 종료 팝업
	 */
	function _setWsEndPopup(){
		//$('#popupContainer').closeLayer('wsfail', false);
		var listTmpl = require( 'text!search_list' );
		$.showBlock();
		
		$('#popupContainer').openLayer({
			id : 'wsend',
			template : R.findTmpl( listTmpl, 'tmplPopupWsEnd' ),
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
				} );
			}
		});
	}
	
	
	
	return function(){
		init();
	};
} );
	
	
