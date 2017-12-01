define( function(){
	var Handlebars, listTmpl,
		_context,
		_ingTimer = 0,
		_currentAddress;
	/**
	 * 모듈 로드
	 * @param context {Object} 모듈자신
	 */
	function __requireModule( context ){
		requirejs( ['handlebars', 'text!search_list', 'nativeConn'], function( pHandlebars, pListTmpl ){
			Handlebars = pHandlebars;
			listTmpl = pListTmpl;
			//
			_context = context;
			_context._init();
		} );
	};
	
	/**
	 * 다음 스테이지로 이동.
	 */
	function _nextStage(){
		Nori.Commands.callCmd( 'startTitleloading' );
	}
	
	/**
	 * 블루투스 이벤트 및 초기화
	 *  */
	function _initBLE(){
		// 블루투스 장치를 검색해 발견된 장치에대한 정보 수신.
		window.webapp.addEventListener( window.webapp.BLE_FIND_DEVICE, function( data ){
			if( data === null || data === undefined ){
				return;
			}
			_addListItem( data );
		});
		
		// 블루투스 장치 검색 종료시 수신.
		window.webapp.addEventListener( window.webapp.BLE_SCAN_FINISHED, function(){
			debug.log( window.webapp.BLE_SCAN_FINISHED );
			// 재검색 버튼 노출
			$('#cancelSearch').hide();
			$('#reSearch').show();
		} );
		
		// 블루투스 장치의 접속 요청후 해당 접속 결과 수신.
		window.webapp.addEventListener( window.webapp.BLE_CONNECT_STATE, function( result ){
			debug.log( window.webapp.BLE_CONNECT_STATE + ' ::: ' +  result );
			clearTimeout( _ingTimer );
			if( result === 'success' ){
				VARS.addr = JSON.parse(window.webapp._currentDevice).address;
				_setSuccess();
			}else{ // NULL
				VARS.addr = '';
				_setFail();
			}
		} );
		
		// 장치 검색 명령 Android에 전달.
		window.webapp.mobloScan();
	}
	
	/**
	 * 재검색
	 *  */
	function _reScan(){
		window.webapp.deleteDevices();
		window.webapp.mobloScanCancel();
		window.webapp.mobloScan();
	}
	
	/**
	 * 사용하지 않음.
	 */
	function _reset(){
		$('#appFinish').off( VARS.tapnm );
		$('#help').off( VARS.tapnm );
		$('#reSearch').off( VARS.tapnm );
		$('#cancelSearch').off( VARS.tapnm );
	}
	
	/**
	 * 블루투스 관련 화면의 Dom 틀을 구성한다.
	 */
	function _setIntroFrame(){
		var html = R.findTmpl( listTmpl, 'tmplIntroFrame' );
		$('#introContainer').show().html( html );
	}
	
	/**
	 * 장치검색 화면구성 및 기능 처리.
	 *  */
	function _setSearchList(){
		var html = R.findTmpl( listTmpl, 'tmplSearchList' ),
			ver = window.webapp.mobloAppVersion();

			
		// 템플릿 삽입
		$('#introContents').html( html );
		
		// 하단 버전 정보 표시
		if( ver !== undefined ){
			$('#version').html( ver ).parent().show();
		}
		
		
		// 앱종료
		$('#appFinish').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_openShotdownPopup();
		} );
		
		// 도움말
		$('#help').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_openHelpPopup();
		} );
		
		// 재검색
		$('#reSearch').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			$('#searchList').html('');
			$('#reSearch').hide();
			$('#cancelSearch').show();
			//
			_reScan();
		} );
		
		// 검색취소
		$('#cancelSearch').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			window.webapp.mobloScanCancel();
			$('#cancelSearch').hide();
			$('#reSearch').show();
		} );
	}
	
	/**
	 * 스캔된 장치 추가
	 *  */
	function _addListItem( data ){
		var tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplDeviceItem' ) ),
		tmpDom = document.createElement('div'),
		$ul = $('#searchList');
		// 더미가 리스트 객체가 있다면 (로딩용 등..) 없앤다.
		if( $ul.find('.dummy-element').length > 0 ){
			$ul.html('');
		}
		
		// 템플릿 삽입
		tmpDom.innerHTML = tmpl( data );
		
		// 리스트아이템 이벤트 연결
		$(tmpDom.querySelector('li>a')).one( VARS.tapnm, function(){
			// 연결시도
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_setConnecting( this.dataset.address );
		});
		// 리스트에 추가
		$ul.append( tmpDom.firstElementChild );
		
		// 
		tmpDom = null;
	}
	
	/**
	 * 장치 접속중 화면
	 *  */
	function _setConnecting( addrKey ){
		var data = window.webapp.getDevice( addrKey ),
			html = R.findTmpl( listTmpl, 'tmplConnecting' ),
			datastr;
		//
		_currentAddress = addrKey;
		
		// 템플릿 삽입
		$('#introContents').html( html );
		$('.conn-state-ing-icon').data( 'pos', 0 );
		$('.conn-state-ing-icon').css( 'background-position-y', '0px' );
		
		// 
		_connectingAni();
		
		// 취소버튼 클릭
		$('#ingCancel').one( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_cancelConnecting();
		});
		
		// 클릭한기기의 접속을 시도함
		try{
			datastr = JSON.stringify(data);
		}catch(e){
			// TODO : 혹시 데이터에 이상이있을수 있어 처리함.
			alert( VARS.CAN_NOT_USED );
			_cancelConnecting();
			return;
		}
		
		window.webapp.mobloStart( datastr );
	}
	
	/**
	 * 접속중 취소.
	 *  */
	function _cancelConnecting(){
		clearTimeout( _ingTimer );
		_setSearchList();
	}
	
	/**
	 * 접속중 애니메이션
	 *  */
	function _connectingAni(){
		clearTimeout( _ingTimer );
		_ingTimer = setTimeout( function(){
			var h = $('.conn-state-ing-icon').height();
			var max = h*-6;
			var pos = $('.conn-state-ing-icon').data( 'pos' );
			pos -= h;
			if( pos <= max ){
				pos = 0;
			}
			$('.conn-state-ing-icon').data( 'pos', pos );
			$('.conn-state-ing-icon').css( 'background-position-y', pos + 'px' );
			//
			_connectingAni();
		}, 250 );
	}
	
	/**
	 * 접속 성공
	 *  */
	function _setSuccess(){
		var tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplSuccess' ) );
		$('#introContents').html( tmpl( window.webapp.getDevice(_currentAddress) ) );
		$('#changeName').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_openRenamePopup();
		});
		$('#successOk').tap( function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_nextStage();
		});
	}
	
	/**
	 * 접속실패
	 *  */
	function _setFail(){
		var html = R.findTmpl( listTmpl, 'tmplFail' );
		//
		$('#introContents').html( html );
		
		$('#retryFail').one( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_setConnecting( _currentAddress );
		});
		
		$('#cancelFail').one( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'btn_basic' ).start();
			_setSearchList();
		});
	}
	
	/**
	 * 도움말 탭 열기 / 닫기
	 *  */
	function _setHelpTabs( $container, idx ){
		var items = $container.find( 'li' ),
			$ul = $container.find( 'ul' ),
			currentIdx = $ul.data( 'currentIdx' ),
			i=0, len = items.length, $item, idx;
		//
		if( currentIdx === idx ){
			currentIdx = -1;
		}else{
			currentIdx = idx;
		}
		//
		$ul.data( 'currentIdx', currentIdx );
		//
		for( ;i<len;i+=1 ){
			$item = $(items[i]);
			if( currentIdx === $item.data('idx') ){
				$item.find( '.faq_a' ).show();
			}else{
				$item.find( '.faq_a' ).hide();
			}
		}
		
	};
	
	/**
	 * 도움말 변경 팝업
	 *  */
	function _openHelpPopup(){
		$.showBlock();
		
		
		$('#popupContainer').openLayer({
			id : 'help',
			template : R.findTmpl( listTmpl, 'tmplHelp' ),
			onReady : function(){
				var stageW = document.body.clientWidth - 36,
		            stageH = document.body.clientHeight - 48,
		            $wrap = $('.intro-popup-help .popup-wrap'),
		            titH = $wrap.find('.box-tit').height(),
		            gab = 30 * (titH/80);
		        //
		        $wrap.css({
		           width : stageW,
		           height : stageH 
		        });
		        
		        $('.intro-popup-help .box-cont-wrap').css({
		            height : stageH - titH
		        });
		        $('.intro-popup-help .box-cont-wrap .box-cont').css({
		            height : stageH - titH - gab
		        });
			},
			onInit : function(){
				var $this = this;
				// 닫기버튼 
				$this.find( '.help-close-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'btn_basic' ).start();
					
					$this.find('.faq_q').each( function( j, q ){
						$(q).off( VARS.tapnm );
					} );
					
					
					$('#popupContainer').closeLayer();
				} );
				// 
				var items = $this.find('li'),
					i=0, len = items.length, $item;
				//
				$this.find('ul').data( 'currentIdx', -1 );
				//
				for( ;i<len;i+=1 ){
					$item = $(items[i]);
					$item.data( 'idx', i );
					$item.find( '.faq_q' ).tap( function(){
						var $q = $(this);
						_setHelpTabs( $this, $q.parent().data('idx') );
					} );
				}
			}
		});
	}
	
	/**
	 * 이름 변경 팝업
	 *  */
	function _openRenamePopup(){
		$.showBlock();
		var tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplRename' ) ),
			ctx = { name : window.webapp.getDevice(_currentAddress).name.replace( /moblo\-/i, '' ) };
		$('#popupContainer').openLayer({
			id : 'rename',
			template : tmpl( ctx ),
			onInit : function(){
				var $this = this,
					name = ctx.name;
				// 확인
				$this.find( '.rename-ok-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'btn_basic' ).start();
					var nm = window.webapp.getDevice(_currentAddress).name,
						val = $this.find( 'input' ).val();
					if( nm !== val ){
						$('#successName').html( val );
						window.webapp.getDevice(_currentAddress).name = val;
						window.webapp.mobloNameChange(val);
					}
					$this.find( 'input' ).off('focus').off('blur');
					$('#popupContainer').closeLayer();
				} );
				
				$this.find( 'input' ).on( 'focus', function(){
					$(this).parent().addClass( 'write' );
				} ).on( 'blur', function(){
					$(this).parent().removeClass( 'write' );
				} );
			}
		});
	}
	
	/**
	 * 종료 팝업
	 *  */
	function _openShotdownPopup(){
		$.showBlock();
		$('#popupContainer').openLayer({
			id : 'introShotdown',
			template : R.findTmpl( listTmpl, 'tmplIntroShotdown' ),
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.intro-shotdown-ok-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'btn_basic' ).start();
					window.webapp.mobloAppFinish();
				} );
				
				// 취소
				$this.find( '.intro-shotdown-cancel-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'btn_basic' ).start();
					$this.find( '.intro-shotdown-ok-btn' ).off( VARS.tapnm );
					$('#popupContainer').closeLayer();
				} );
				
			}
		});
	}
	
	
	/**
	 * define requirejs module
	 * 
	 *  */
	return {
		__playInit__ : function(){
			__requireModule( this );
		},
		_init : function(){
			debug.log( 'search' );
			//
			_setIntroFrame();
			_setSearchList();
			// 화면구성 준비 완료 메세지. app.js/mirror.app.js 에서 수신해 Android로 명령을 보낸다.
			// 명령을 받은 Android에서 intro 화면을 제거하고 Webview 화면을 노출한다.
			Nori.Commands.callCmd( 'ready' );
			_initBLE();
		}
	};
}); //define



