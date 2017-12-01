/**
 * 게임화면 스크립트
 * 3d 부분과 ui 부분에서의 이벤트 처리 담당.
 * 3d 부분은 stage.play.3d.js
 * ui 부분은 stage.play.ui.js
 */
define( function(require){
	
	var listTmpl,
		_context,
		_ui,
		_3d,
		_sc = require( 'socketConn' ).getInstance(),
		_readList;
	/**
	 * 모듈 로드
	 * @param context {Object} 모듈자신
	 */
	function requireModule( context ){
		var modules = [
			'text!search_list',
			'stage.play.ui', 
			'stage.play.3d',
			'crypto'
		];
		//
		requirejs( modules, function( pListTmpl, ui, cont3d ){
			listTmpl = pListTmpl;
			_context = context;
			_ui = ui;
			_3d = cont3d;
			_playUiCnt = 0;
			//
			_context._init();
		} );
	};
	
	/**
	 * 3d/ui 에서 수신받을 명령을 등록.
	 *  */
	function _setPage(){
		
		// 홈으로, 현재 종료 버튼.
		// TODO :: 유아교육전에서 닫기버튼으로 사용.
		Nori.Commands.registCmd( 'goHome', function(){
			_setShotdownPopup();
			//
			/* 홈으로 가기 개발중이던 내용. 이후 종료버튼으로 변경함.
			// ui 버튼 비활성화.
			_ui.cmdGoHome();
			_3d.cmdGoHome();
			Nori.Commands.unregistCmd('changeTime');
			Nori.Commands.unregistCmd('autoShot');
			Nori.Commands.unregistCmd('openAutoShot');
			Nori.Commands.unregistCmd('selfShot');
			Nori.Commands.unregistCmd('returnGame');
			Nori.Commands.unregistCmd('readyPlay');
			//
			Nori.Commands.callCmd( 'startMain', true );
			//*/
		});
		
		// 낮밤 바꿈
		Nori.Commands.registCmd( 'changeTime', _changeTime);
		
		// 사진촬영 버튼 클릭시
		Nori.Commands.registCmd( 'autoShot', function(){
			_ui.cmdAutoShot();
			_3d.cmdAutoShot();
		});
		
		// 자동촬영 캡쳐 이후 팝업 열기
		Nori.Commands.registCmd( 'openAutoShot', function(){
			_ui.cmdOpenAutoShot();
		});
		
		// 수동촬영 버튼 클릭시
		Nori.Commands.registCmd( 'selfShot', function(){
			_ui.cmdSelfShot();
		});
		
		// 자동촬영에서 본페이지로 돌아가기.
		Nori.Commands.registCmd( 'returnGame', function(){
			_3d.cmdReturnGame();
		});
		
		// 게임화면 실행 준비 완료.
		Nori.Commands.registCmd( 'readyPlay', function(){
			Nori.SoundManager.getSound( 'contents' ).setLoop(true).start();
			//
			//VARS.initRead
			// 블럭 정보 정보 수신
			window.webapp.addEventListener( window.webapp.MOBLO_CHANGE_BLOCK, function( data ){
				
				if( VARS.initRead ){
					_readList.push( data );
				}else{
					_3d.cmdChangeBlock( data, true );
				}
			} );

			// 미러링일 경우 보드의 내용 읽어옴.
			if( VARS.isMirror ){
				window.webapp.mobloProgress( true );
				_wsSend( 'read' );
			}
			
			// UI 생성.
			setTimeout( function(){
				_ui.initUi();
			}, 200 );
		});
		
		// 각 부분의 화면구성 완료후 게임 시작 명령 등록 / 수신
		Nori.Commands.registCmd( 'startGame', function(){
			// 보드와의 통신 수신 대기 / 보드 읽기
			if( VARS.initRead ){
				window.webapp.addEventListener( window.webapp.MOBLO_BLOCK_COUNT, _readComplete );
				_readList = [];
				window.webapp.readLoop();
			}else{
				window.webapp.loop();
				if( !VARS.isMirror ){
					window.webapp.mobloProgress( false );
				}
			}
		});

		// 소켓시작 명령 등록/수신
		Nori.Commands.registCmd( 'startSocket', function(){
			if( VARS.deviceWsConnected ){
				return;
			}
			_getRoomCode();
			//_startSocket();
		});

		// 공유하기
		Nori.Commands.registCmd( 'shareGame', function(){
			_shareGame();
		});

		// 소켓 발송
		Nori.Commands.registCmd( 'sendSocket', _wsSend);
		// 드롭 파티클 실행
		Nori.Commands.registCmd( 'effectAddDrop', _3d.cmdEffectAddDrop);
		// 드롭 파티클 제거
		Nori.Commands.registCmd( 'effectRemoveDrop', _3d.cmdEffectRemoveDrop);
		// 지진 효과 실행
		Nori.Commands.registCmd( 'effectQuack', _3d.cmdEffectQuack);
		// 불꽃 효과 실행
		Nori.Commands.registCmd( 'effectFireworks', _3d.cmdEffectFireworks);

		
		// 게임 화면 먼저 생성.
		_3d.init();

		// 미러링 화면의 경우.
		if( VARS.isMirror ){
			_wsListen();
			_wsSend( 'board' );
			//_wsSend( 'read' );
		}
	}

	/**
	 * 낮/밤 변경,
	 * @param iscall {Boolean} 소켓 발송여부.
	 */
	function _changeTime( iscall ){
		if( VARS.ampm.indexOf( 'day' ) > -1 ){
			VARS.ampm = 'night';
		}else{
			VARS.ampm = 'day';
		}
		_ui.cmdChangeTime();
		_3d.cmdChangeTime();

		if( iscall ){
			_wsSend( 'time', {time:VARS.ampm} );
		}

	}
	
	/**
	 * 가져오기 기능의 블럭정보 모두 수신했을경우.
	 * @param cnt {Number} 가져온 블럭 총 갯수
	 */
	function _readComplete( cnt ){
		var i=0, len=_readList.length;
		for( ;i<len;i+=1 ){
			_3d.cmdChangeBlock( _readList[i] );
		}
		_readList = null;
		//
		VARS.initRead = false;
		window.webapp.mobloProgress( false );
	};
	
	/**
	 * 어플 종료 팝업
	 */
	function _setShotdownPopup(){
		$.showBlock();
		$('#popupContainer').openLayer({
			id : 'guide',
			template : R.findTmpl( listTmpl, 'tmplPopupHomeShotdown' ),
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					window.webapp.mobloAppFinish();
				} );
				
				
				$this.find( '.popup-cancel-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					$this.find( '.popup-confirm-btn' ).off( VARS.tapnm );
					$('#popupContainer').closeLayer();
				} );
				
			}
		});
	}

	/**
	 * 웹소켓 수신
	 * { apicode : { api : {} }
	 * api : {
	 * 	basic : { ... },
	 *  custom : { ... },
	 *  user : '',
	 *  room : ''
	 * }
	 * 예전 : { clientId:id, data:{cmd:"command"} }
	 */
	function _wsListen(){
		_sc.addEventListener( _sc.ON_MESSAGE, function(e){
			var msg = typeof e.data === 'string'? JSON.parse( e.data ) : {},
				data = msg.api.custom;
			if( msg.api.basic.clientId !== _sc.id ){
				switch( VARS.wsApiCodes[msg.apicode] ){
					case window.webapp.MOBLO_CHANGE_BLOCK : // 블럭 추가/삭제/LED변경
						_3d.cmdChangeBlock( data );
					break;
					case 'effect' : // 효과 type, state
						_3d.cmdEffectCall( data );
						_ui.cmdEffectToggle( data );
					break;
					case 'time' : // 낮밤 변경
						// data.time 에 데이터를 전달하나, 실제 사용은 토글 형태로 이루어짐.
						_changeTime();
					break;
					case 'board' : // 보드 및 현재 구성 정보 요청 / 수신
						if( VARS.isMirror ){
							if( data.boardType === undefined ){
								VARS.boardType = VARS.NINE_BY_NINE;
							}else{
								VARS.boardType = data.boardType;								
							}
							_3d.setBoardType();
							window.webapp.mobloProgress( false );
						}else{
							_wsSend( 'board', {boardType:VARS.boardType} );
						}
					break;
					case 'read' : // 추가된 블럭의 정보 요청 / 수신
						if( VARS.isMirror ){
							if( data.boardType === undefined ){
								VARS.boardType = VARS.NINE_BY_NINE;
							}else{
								VARS.boardType = data.boardType;								
							}
							_3d.setBoardType();
							//
							if( !!data.blocks ){
								var list = data.blocks;
								for( key in list ){
									_3d.cmdChangeBlock( JSON.parse(list[key]) );
								}
							}

							if( data.effects !== '' && data.effects !== undefined ){
								var effData = {
									type : data.effects,
									state : true
								};
								_ui.cmdEffectToggle( effData );
								_3d.cmdEffectCall( effData );
							}

							if( data.time !== undefined && VARS.ampm !== data.time ){
								_changeTime();
							}

						}else{
							_wsSend( 'read', {
								time : VARS.ampm,
								effects : _ui.getClickedEffect(),
								blocks : _3d.getBlockList(),
								boardType : VARS.boardType
							} );
						}
					break;
					default :
					break;
				}
			}
		} );
	}

	/**
	 * 미러링 공유하기 버튼 
	 */
	function _shareGame(){
		_setWsSharePopup();
	}

	/**
	 * 인증 및 룸번호 수신.
	 */
	function _getRoomCode(){
		$.ajax({
			url : 'http://kiss.pcninc.co.kr:7579/API/' + VARS.userid + '/' + VARS.serviceCode + '',
			type : 'GET',
			async : false,
			data : { mc : VARS.modelCode, sn : CryptoJS.MD5(VARS.addr).toString() },
			//dataType: 'jsonp',
   			//jsonp: 'cb',
			success : function( data ){
				// data.rst.api.room
				VARS.wsRoom = data.channel;
				_startSocket();
			},
			error : function(e){
				//
			}

		});
	}


	/**
	 * 소켓 접속 시작.
	 */
	function _startSocket(){
		window.webapp.mobloProgress( true );
		_setWsConnPopup();
		//
		_sc.connect( VARS.wsUri );
		//
		_sc.removeEventListener( _sc.ON_OPEN, _mirrorOnOpen );
		_sc.removeEventListener( _sc.ON_ERROR, _mirrorOnError );
		_sc.removeEventListener( _sc.ON_CLOSE, _mirrorOnClose );
		//
		_sc.addEventListener( _sc.ON_OPEN, _mirrorOnOpen );
		_sc.addEventListener( _sc.ON_ERROR, _mirrorOnError );
		_sc.addEventListener( _sc.ON_CLOSE, _mirrorOnClose );
	}

	/**
	 * WebSocket onopen
	 */
	function _mirrorOnOpen(){
		VARS.deviceWsConnected = true;
		_wsListen();
		_ui.changeWsBtn( true );
		$('#popupContainer').closeLayer( 'wsConn', false, function(){
			_setWsSharePopup();
		} );
		_wsSend( 'init', {} );
		//
		window.webapp.mobloProgress( false );
	}

	/**
	 * WebSocket onerror 
	 */
	function _mirrorOnError( e ){
		//
		// _setWsFailPopup
	}

	/**
	 * WebSocket onclose 
	 */
	function _mirrorOnClose( e ){
		_ui.changeWsBtn( false );
		if( VARS.deviceWsConnected ){
			VARS.deviceWsConnected = false;
			_setWsEndPopup();
		}else{
			$('#popupContainer').closeLayer(null, false, function(){
				_setWsFailPopup();
			});
		}
	}

	/**
	 * 소켓 접속중 팝업
	 */
	function _setWsConnPopup(){
		$.showBlock();
		var listTmpl = require( 'text!search_list' ),
			Handlebars = require('handlebars'),
			ctx = { connecting:true },
			tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplPopupWsConn' ) ),
			html = tmpl( ctx );
		
		$('#popupContainer').openLayer({
			id : 'wsConn',
			template : html
			//onInit : function(){}
		});
	}

	/**
	 * 미러링 공유 팝업
	 */
	function _setWsSharePopup(){
		$.showBlock();
		var listTmpl = require( 'text!search_list' ),
			Handlebars = require('handlebars'),
			ctx = { connecting:false },
			tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplPopupWsConn' ) ),
			html = tmpl( ctx );
		
		$('#popupContainer').openLayer({
			id : 'wsShare',
			template : html,
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
					if( !VARS.isMirror ){
						var msg = 'http://m5c.motionblue.com:8888/castlemaker/mirror.html';
						msg += '?r=' + VARS.wsRoom;

						window.webapp.mobloShareMsg( 'Let\'s Play!! 캐슬메이커\n' + msg );
					}
				} );
				
				$this.find( '.popup-cancel-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
				} );
			}
		});
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
					$('#popupContainer').closeLayer(null, false, function(){
						_startSocket();
					});
				} );
				
				$this.find( '.popup-cancel-btn' ).one( VARS.tapnm, function(){
					$('#popupContainer').closeLayer();
					window.webapp.mobloProgress( false );
				} );
			}
		});
	}

	/**
	 * 웹소켓 전송
	 * 데이터를 생성해 만듦
	 * { apicode : { api : {} }
	 * api : {
	 * 	basic : { clientId : '' },
	 *  custom : { ... },
	 *  user : '',
	 *  room : ''
	 * }
	 * 예전 : { clientId:id, data:{cmd:"command"} }
	 * @param cmd {String} 데이터 구분 문자열
	 * @param msg {Object} 전달할 데이터 
	 */
	function _wsSend( cmd, msg ){
		if( VARS.deviceWsConnected ){
			msg = msg || {};
			var data;
			if( typeof msg === 'string' ){
				//data = $.extend( {cmd:cmd}, JSON.parse(msg) );
				data = JSON.parse(msg);
			}else{
				//data = $.extend( {cmd:cmd}, msg );
				data = msg;
			}
			//
			var sendMsg = {
				apicode : VARS.wsCmds[cmd],
				user : VARS.userid,
				room : VARS.wsRoom,
				api : {
					basic : {
						clientId : _sc.id
					},
					custom : data
				}
			};
			_sc.send( JSON.stringify(sendMsg) );
		}
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
	
	
	/**
	 * define requirejs module
	 *  */
	return {
		__playInit__ : function(){
			requireModule(this);
		},
		__onResume__ : function(){
			Nori.SoundManager.getSound( 'contents' ).setLoop(true).start();
		},
		__onPause__ : function(){
			Nori.SoundManager.getSound( 'contents' ).stop();
		},
		_init : function(){
			_setPage();
		}
	};
});




