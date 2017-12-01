/**
 * WebSocket 모듈
 * WebSocket을 래핑해 사용하며, addEventListener 형태로
 * 이벤트를 전달한다.
 */
define( function(require){

	var _socket;
	var ___CEventTarget___ = require( 'eventtarget' );
	var Connector = function(){};
	Connector.prototype = new ___CEventTarget___();
	Connector.constructor = Connector;

	var proto = {
		id : '',
		ws : null,
		ON_OPEN : 'onOpen', // WebSocket.onopen 이벤트명
		ON_CLOSE : 'onClose', // WebSocket.onclose 이벤트명
		ON_MESSAGE : 'onMessage', // WebSocket.onmessage 이벤트명
		ON_ERROR : 'onError', // WebSocket.onerror 이벤트명
		/**
		 * 소켓을 생성하고 접속한다.
		 * @param uri {String}
		 */
		connect : function( uri ){
			this.ws = new WebSocket( uri );
			this.ws.onopen = null;
			this.ws.onclose = null;
			this.ws.onmessage = null;
			this.ws.onerror = null;
			this.ws.onopen = this.onopen.bind( this );
			this.ws.onclose = this.onclose.bind( this );
			this.ws.onmessage = this.onmessage.bind( this );
			this.ws.onerror = this.onerror.bind( this );
			//
			return this.ws;
		},
		/**
		 * 메세지를 발송한다.
		 * @param msg {String}
		 */
		send : function( msg ){
			if( !!this.ws ){
				this.ws.send( msg );
			}
		},
		/**
		 * 소켓을 종료한다.
		 */
		close : function(){
			if( !!this.ws ){
				this.ws.close();
			}
		},
		/**
		 * onopen 리스너함수, 이벤트를 발송한다.
		 */
		onopen : function( e ){
			this.customDispatchEvent( this.ON_OPEN, e );
		},
		/**
		 * onclose 리스너함수, 이벤트를 발송한다.
		 */
		onclose : function( e ){
			this.customDispatchEvent( this.ON_CLOSE, e );
		},
		/**
		 * onmessage 리스너함수, 이벤트를 발송한다.
		 */
		onmessage : function( e ){
			this.customDispatchEvent( this.ON_MESSAGE, e );
		},
		/**
		 * onerror 리스너함수, 이벤트를 발송한다.
		 */
		onerror : function( e ){
			this.customDispatchEvent( this.ON_ERROR, e );
		},
	};
	
	// merge prototype
	for( var key in proto ){
		Connector.prototype[key] = proto[key];
	};


	// 모듈 define
	return {
		getInstance : function(){
			if( _socket === null || _socket === undefined ){
				_socket = new Connector();
				_socket.id = Date.now();
			}
			return _socket;
		}	
	};
});