/**
 * DOM
 *  */

/**
 * 주소 파라미터 분기
 * mirror 룸번호 전달 및 테스트시 사용하기위해 만듦.
 *  */
(function(){
	var __hash = {};
	var href = window.location.href,
	arr,
	params;
	if( href.indexOf('?') > -1 ){
		arr = href.split('?')[1].split('&');
		arr.forEach(function( args, i ){
			params = args.split('=');
			
			switch( params[0] ){
				case 'debuglog' :
					if( params[1] == 'true' ){
						__hash.debuglog = true;
					}
				break;
				case 'testui' :
					if( params[1] == 'true' ){
						__hash.testui = true;
					}
				break;
				case 'title' :
					if( params[1] == 'true' ){
						__hash.title = true;
					}
				break;
				case 'play' :
					if( params[1] == 'true' ){
						__hash.play = true;
					}
				break;
				case 'r' :
				case 'R' :
					__hash.room = params[1];
				break;
			}
		});
	}
	window.__hash = __hash;
})();


/** 2016-05-27
 * 전달받은 객체의 속성값을 반환한다.
 * px, em, pt의 경우에는 숫자형으로 변환하여 반환.
 * 
 * @param elm {HTMLElement} 돔 엘리먼트
 * @param prop {String} 속성명
 * @return value {*} 문자 또는 숫자
 *  */
function css( elm, prop ){
	var v = getComputedStyle( elm ).getPropertyValue(prop);
	if( /^\d+(.\d+)(|px|em|pt)$/gi.test(v) ){
		return v = parseFloat( v, 10 );
	}
	return v;
};

/**
 * 디버깅 위한 코드
 */
var debug = {
	_start : Date.now(),
	log : function(){
		if( !window.__hash.debuglog ) return;
		var i=0, len= arguments.length,
		dom = document.querySelector('.debug'),
		p;
		//
		if( dom === undefined || dom === null ){
			if( document.body === undefined ){
				return;
			}
			var Handlebars = require( 'handlebars' );
			var args = arguments;
			//
			require( ['text!debug_layer'], function( tmpl ){
				$('head').append( R.findTmpl( tmpl, 'style' ) );
				$('body').append( R.findTmpl( tmpl, 'dom' ) );
				//
				debug.log.apply( debug, Array.prototype.slice.call( args, 0 ) );
			} );
			//
			return;
		}
		//
		for( ;i<len;i+=1 ){
			p = document.createElement( 'p' );
			p.innerHTML = ( (Date.now() - this._start)/1000 ) + ' | ' + arguments[i];
			dom.appendChild( p );
		};
	}
};

var testui = function(){
	if( !__hash.testui ) return;
	//
	var Handlebars = require( 'handlebars' );
	//
	require( ['text!test_ui'], function( tmpl ){
		$('head').append( R.findTmpl( tmpl, 'style' ) );
		$('body').append( R.findTmpl( tmpl, 'dom' ) );
	} );
}

/**
 * require 로드된 모듈 삭제
 * @param moduleName {String} 모듈이름
 */
var deleteModule = function( moduleName ){
	var context = require.s.contexts['_'];
	requirejs.undef( moduleName );
	try{
		//delete context.defined[moduleName];
		//delete context.loaded[moduleName];
		//delete context.specified[moduleName];
	}catch(e){};
	
	var scripts = document.getElementsByTagName('script');
	for (var i = scripts.length - 1; i >= 0; i--) {
	    var script = scripts[i];
	    if (script.getAttribute('data-requiremodule') === moduleName) {
	        script.parentNode.removeChild(script);
	        break;
	    }
	};
};

/**
 * mouse/touch 관련 이벤트 객체
 */
var eventUtils = {
	/**
	 * 특정 기준선에 대한 비교를 통해 가로 또는 세로 움직임에 대한 방향값 반환
	 * 
	 * horizontal = 1
	 * vertical = 2
	 * 
	 * @param {Object} options 
	 *  - sx {Number} 시작 좌표
	 *  - sy {Number} 시작 좌표
	 *  - x {Number} 끝 좌표
	 *  - y {Number} 끝 좌표
	 *  - slope {Number} 기준 기울기 default : ( (window.innerHeight/2) / window.innerWidth ).toFixed(2) * 1
	 *  - limit {Number} 움직임 최소값 default : 5px
	 *  */
	getDirectionType : function( o ){
		var sx = o.sx,
			sy = o.sy,
			x = o.x,
			y = o.y,
			slope = o.slope || ( (window.innerHeight/2) / window.innerWidth ).toFixed(2) * 1,
			limit = o.limit || 5,
			//
			type = -1,
			tx = Math.abs( sx-x ),
			ty = Math.abs( sy-y ),
			dst = Math.sqrt( (tx*tx) + (ty*ty) );
		//
		
		//
		if( dst < limit ) { return type; };	// min move px
		
		if( tx==0 ){
			type = 2;
		}else if( ty==0 ){
			type = 1;
		}else{
			var userSlope = parseFloat( (ty/tx).toFixed(2), 10 );
			//
			if( userSlope > slope ){
				type = 2; // v
			}else{
				type = 1; // h
			}
		}
		//
		return type;
	},
	getTouchEventObject : function ( e ){
		if( e.type.indexOf( 'touch' ) < 0 ){ // mouseEvent
			return [{
				identifier : 0,
				target : e.target,
				pageX : e.clientX,
				pageY : e.clientY,
				screenX : 0,
				screenY : 0,
			}];
		}else{ // touchEvent
			return e.touches || e.changedTouches;
		}
	},
	getEventNames : function (){
		var evtNm = {
			START : 'mousedown',
			END : 'mouseup',
			MOVE : 'mousemove',
			CANCEL : 'mouseleave',
			RESIZE : 'onorientationchange' in window ? 'orientationchange' : 'resize'
		};
		
		if('ontouchstart' in window){ //  other mobile browser
			evtNm.START = 'touchstart';
			evtNm.MOVE  = 'touchmove';
			evtNm.END = 'touchend';
			evtNm.CANCEL = 'touchcancel';
		} else if(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints > 0) { // ie mobile browser
			evtNm.START = 'MSPointerDown';
			evtNm.MOVE  = 'MSPointerMove';
			evtNm.END = 'MSPointerUp';
			evtNm.CANCEL = 'MSPointerCancel';
		}
		
		return evtNm;
	},
	getEventObject : function( e ){
		return e.originalEvent || e || window.event;
	},
	/** 
	 * 이벤트 중지.
	 * e.stopPropagation();
	 * e.preventDefault();
	 * e.stopImmediatePropagation();
	 * //
	 * @params event [, bubbling, cancelable, immediate ]
	 *  */
	fireEvent : function(){
		if( arguments.length == 0 ){
			return;
		}
		var e = arguments[0],
			states = Array.prototype.slice.call( arguments, 1 ),
			len = states.length,
			methods = ['stopPropagation', 'preventDefault', 'stopImmediatePropagation'],
			i=0,
			fn;
		//
		while( i<methods.length ){
			fn = e[ methods[i] ];
			if( typeof fn === 'function' && (state=len==0? true : states[i])===true ){
				state = false;
				fn.call( e );
			}
			i++;
		}
	}
};



// zeptojs plugin
(function(){
	/**
	 * 일반 화면막음.
	 * @param callback {function}
	 */
	$.showBlock = function( callback ){
		$('#screenBlock').fadeIn( 100, callback );
	};
	
	/**
	 * 일반 화면막은것 제거
	 * @param callback {function}
	 */
	$.hideBlock = function( callback ){
		var $screen = $('#screenBlock');
		$screen.fadeOut(0, function(){
			if( typeof callback === 'function' ){
				$screen.hide();
				callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
			}
		});
	};
	
	/**
	 * 최상위 뎁스상의 화면 막기
	 * @param callback {function}
	 */
	$.showAllBlock = function( callback ){
		$('#screenAllBlock').fadeIn( 100, callback );
	};
	
	/**
	 * 최상위 뎁스상의 화면 막은것 제거
	 * @param callback {function}
	 */
	$.hideAllBlock = function( callback ){
		var $screen = $('#screenAllBlock');
		$screen.fadeOut(0, function(){
			if( typeof callback === 'function' ){
				$screen.hide();
				callback.apply( this, Array.prototype.slice.call( arguments, 1 ) );
			}
		});
	};
	
	
	
	/**
	 * 레이어 띄우기
	 * @param options {Object} 레이어옵션
	 */
	$.fn.openLayer = function( options ){
		var $this = this,
			tmpl = options.template || '', // 템플릿
			onInit = options.onInit, // 초기화 콜백함수
			onReady = options.onReady, // 레디 콜백함수
			args = Array.prototype.slice.call( arguments, 1 ),
			el = document.createElement( 'div' ),
			now = Date.now(),
			id = options.id || 'popup_' + now, // 팝업 아이디
			$pop;
		//
		
		if( $this.data( 'popup' ) === undefined || $this.data( 'popup' ) === null ){
			el.id = id;
			el.innerHTML = tmpl;
			$this.html( el );
			//
			$pop = $(el);
			$pop.css({
				position : 'absolute',
				top : 0,
				left : 0,
				width : '100%',
				height : '100%'
			});
			
			$this.data( 'popup', id );
		}else{
			$pop = $this.find( '#' + $this.data( 'popup' ) );
		}
		//
		$pop.css( {
			opacity:0, transform:'scale(1.1)', display:'block'
		} );
		$this.show();
		
		if( typeof onReady === 'function' ){
			onReady.apply( $pop, args );
		}
		
		$pop.animate( {
			opacity:1, transform:'scale(1)'
		}, 300, 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', function(){
			if( typeof onInit === 'function' ){
				//args.unshift( $this );
				onInit.apply( $pop, args );
			}
		});
	};
	
	/**
	 * 팝업닫기
	 * @param id {String} 삭제할 팝업 아이디
	 * @param bool {boolean} 애니메이션 여부
	 * @param callback {function} 삭제후 호출할 콜백함수
	 */
	$.fn.closeLayer = function( id, bool, callback ){
		var $this = this,
			bool = bool===false? false : true, // false : 애니메이션 없이 삭제
			$pop;
		//
		id = id || $this.data( 'popup' );
		$pop = $( $this.find( '#' + id ) );
		
		if( bool ) {
			$pop.animate( {
				opacity:0, transform:'scale(0.95)'
			}, 300, 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', function(){
				//if( typeof onInit === 'function' ){}
				$pop.hide();
				$this.hide();
				$this.html( '' );
				$this.data( 'popup', null );
			});
		}else{
			$pop.hide();
			$this.hide();
			$this.html( '' );
			$this.data( 'popup', null );
		}
		$.hideBlock( callback );
	};
	
})();



/**
 * 블루투스 접속중 애니메이션.
 * - 테스트용으로 사용했던 코드
 * - 해당코드 사용안함
 */
function showBleConnecting( code ){
	showBlock();
	$('#bleConnecting').show();
	//
	var interval = setInterval( function(){
		var pos = $('#bleConnectingImg').data('pos');
		if( pos === undefined || pos >= 305 ){
			pos = 0;
		}else{
			pos += 61;
		}
		//
		$('#bleConnectingImg').css( 'background-position-x', pos );
		$('#bleConnectingImg').data('pos', pos);
	}, 100 );
	//
	$('#bleConnectingImg').data( 'interval', interval );
	
};

/**
 * 블루투스 접속중 애니메이션 감추기
 * - 테스트용으로 사용했던 코드
 * - 해당코드 사용안함
 */
function hideBleConnecting(clearBlock){
	var interval = $('#bleConnectingImg').data( 'interval' );
	clearInterval( interval );
	$('#bleConnectingImg').data( 'interval', null );
	$('#bleConnecting').hide();
	//
	if( clearBlock ){
		hideBlock();
	}
};

/**
 * 프리로딩 보이기
 * - 테스트용으로 사용했던 코드
 * - 사용하지 않음.
 */
function showPreLoading( code ){
	showBlock();
	setPreLoadingMsg( code );
	$('#preloading').show();
	//
	var interval = setInterval( function(){
		var pos = $('#preloadingImg').data('pos');
		if( pos === undefined || pos >= 305 ){
			pos = 0;
		}else{
			pos += 61;
		}
		//
		$('#preloadingImg').css( 'background-position-x', pos );
		$('#preloadingImg').data('pos', pos);
	}, 100 );
	//
	$('#preloadingImg').data( 'interval', interval );
	
};

/**
 * 프리로딩 감추기
 * - 테스트용으로 사용했던 코드
 * - 사용하지 않음.
 */
function hidePreLoading(){
	var interval = $('#preloadingImg').data( 'interval' );
	clearInterval( interval );
	$('#preloadingImg').data( 'interval', null );
	$('#preloading').hide();
	//
	hideBlock();
};

/**
 * 프리로딩 메세지 설정.
 * - 테스트용으로 사용했던 코드
 * - 사용하지 않음.
  */
function setPreLoadingMsg( stat, message ){
	var msg = '', withBtn = false;
	switch( stat ){
		case 0 :
			msg = message; 
		break;
		case 1 : //
			msg = '리소스 다운로드 . . .';
		break;
		case 2 : //
			msg = '다운로드 오류<br/>페이지 새로고침';
			withBtn = true;
			
			$('#btnRetry').one( 'click', function(){
				window.location.reload();
			} );
		break;
		case 3 : 
			msg = '서버접속중 . . .';
		break;
		case 4 : 
			msg = '서버접속 실패<br/> 재시도';
			withBtn = true;
			$('#btnRetry').one( 'click', function(){
				setPreLoadingMsg( 3 );
				mcc.connector.retry();
			} );
		break;
		case 5 : 
			msg = '보드 연결 확인 . . .';
		break;
		case 6 : 
			msg = '서버와접속 종료<br/>재접속';
			withBtn = true;
			$('#btnRetry').one( 'click', function(){
				setPreLoadingMsg( 3 );
				mcc.connector.retry();
			} );
		break;
		case 7 :
			msg = '블럭정보수신 . . .';
		break;
		default : //
			msg = 'Loading . . .';
		break;
	}
	if( withBtn ){
		$('.preloading .msg-box').addClass('with-btn');
	}else{
		$('.preloading .msg-box').removeClass('with-btn');
	}
	//
	$('#preloadingMsg').html( msg );
};

/**
 * 화면 이벤트 막음. 
 * - 테스트용으로 사용했던 코드
 * - 사용안함.
 */
function showBlock(){
	var nms = 'blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit';
	$( '#globalBlockLayer' ).on( nms, function( e ){
		e = e.originalEvent || e || window.event;
		if( typeof e.preventDefault === 'function' ){ // other ...
			e.preventDefault();
			e.stopPropagation();
		} else { // IE
			e.returnValue = false;
			e.cancelBubble = true;
		}
		return false;
	}).show();
};

/**
 * 화면 이벤트 막은것 제거.
 * - 테스트용으로 사용했던 코드
 * - 사용안함.
 */
function hideBlock(){
	var nms = 'blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit';
	$( '#globalBlockLayer' ).off( nms ).hide();
};
