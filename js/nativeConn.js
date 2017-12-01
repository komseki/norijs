/**
 * 안드로이드와의 통신 담당 스크립트
 */
define( function(require){
	
	var ___CEventTarget___ = require( 'eventtarget' );
	var CWebApp = function(){};
	CWebApp.prototype = new ___CEventTarget___();
	CWebApp.constructor = CWebApp;
	
	var CNative = (function(){
		return {
			// 블루투스 연결상태 결과값 커스텀 이벤트명
			BLE_CONNECT_STATE : 'bleConnectState',
			// 블루투스 스캔완료 커스텀 이벤트명
			BLE_SCAN_FINISHED : 'bleScanFinished',
			// 블루투스 장치 스캔 커스텀 이벤트명
			BLE_FIND_DEVICE : 'bleFindDevice',
			// 이미지 저장완료 커스텀 이벤트명
			SAVE_FINISH : 'saveFinish',
			// 블럭정보수신 커스텀 이벤트명
			MOBLO_CHANGE_BLOCK : 'mobloChangeBlock',
			// 앱 재시작 커스텀이벤트명
			MOBLO_ON_RESUME : 'mobloOnResume',
			// 앱 중지 커스텀이벤트명
			MOBLO_ON_PAUSE : 'mobloOnPause',
			// 블럭갯수 반환 (ReadLoop 완료) 커스텀이벤트명.
			MOBLO_BLOCK_COUNT : 'mobloBlockCount',
			_devices : null,
			// 연결 선택한 디바이스 데이터.
			_currentDevice : null,
			_callbacks : null,
			getDevice : function(){
				var key = arguments[0];
				return this._devices[key] || this._devices;
			},
			deleteDevices :function(){
				this._devices = null;
			},
			/** Start / Restart BLE Scannig
	         * 장비 스캔 시작/재시작 요청
	         *  */
			mobloScan : function(){
				this.callNative( 'mobloScan' );
				//
				// 개발용코드 :: PC에서 확인시 블루투스 장비 더미 데이터를 생성한다.
				if( VARS.useBLEDummy && !VARS.useBLE ){
					// 접속실패 화면이동
					window.webapp.mobloList( {address: "null:null:null:null:null:null", name: "TEST-FAIL"} );	
					// 접속성공 화면이동
					window.webapp.mobloList( {address: "test:null:null:null:null:null", name: "TEST-SUCCESS"} );
					// 접속중 화면이동
					window.webapp.mobloList( {address: "conn:null:null:null:null:null", name: "TEST-CONNECTING"} );
				}
			},
			/** 
			 * 장비 스캔 중지 요청
	         *  */
			mobloScanCancel : function(){
				this.callNative( 'mobloScanCancel' );
			},
			/**
			 * BLE :: 선택한 블루트스 장비 연결
			 * @param data {String} 요청할 장비에대한 데이터, 스캔시 전달받은데이터 안드로이드로 전달.
			 *  */
			mobloStart : function( data ){
				this._currentDevice = data;
	            this.callNative( 'mobloStart', data );
	            //
	            // 개발용코드 :: PC에서 확인시 더미데이터에 대한 핸들링..
				if( VARS.useBLEDummy && !VARS.useBLE ){
					var t = this;
					setTimeout( function(){
						var o = JSON.parse(data);
						if( /test\-fail/i.test( o.name ) ){
							t.customDispatchEvent( t.BLE_CONNECT_STATE, 'NULL' );
						}else if( /test\-success/i.test( o.name ) ){
							t.customDispatchEvent( t.BLE_CONNECT_STATE, 'success' );
						}else{
							//
						}
					}, 700 );
				}
	        },
	        /** 
	         * 현재 연결된 블루투스 장비에대한 연결해제 요청.
	         *  */
	        mobloStop : function(){
	            this.callNative( 'mobloStop' );
	        },
			/** moblo command
			 * command : loop/read/readLoop/wait
			 * 보드를 감사하라는 명령 요청
			 */
	        loop : function(){
	        	this.callNative( 'mobloCommand', 'loop' );
	        },
			/** moblo command
			 * command : loop/read/readLoop/wait
			 * 현재 보드의 블럭정보를 읽으라는 요청
			 */
	        read : function(){
	        	this.callNative( 'mobloCommand', 'read' );
	        },
			/** moblo command
			 * command : loop/read/readLoop/wait
			 * 현재 보드를 읽고 보드를 감시하라는 명령 요청
			 */
	        readLoop : function(){
	        	this.callNative( 'mobloCommand', 'readLoop' );
	        },
			/** moblo command
			 * command : loop/read/readLoop/wait
			 * 현재 보드감시를 중지하도록 명령 요청
			 */
	        wait : function(){
	        	this.callNative( 'mobloCommand', 'wait' );
	        },
			/** BLE Device List
			 * 블루투스 장비 스캔시 장비가 검출될때마다 안드로이드에서 호출됨.
	         * @param jsonstr {String} JSON String, BLE DEVICE
	         * ex) Device : {"device": {"name":"장비명", "address":"00:10:00:00:00:00"}}
	         *  */
			mobloList : function( jsonstr ){
				var data = typeof jsonstr === 'string'? JSON.parse( jsonstr ) : jsonstr;
				this._devices = this._devices || {};
				if( this._devices[ data.address ] === undefined ){
					this._devices[ data.address ] = data;
					this.customDispatchEvent( this.BLE_FIND_DEVICE, data );
				}
			},
			/** Finished BLE Device Scanning
	         * 블루투스 장비 검색완료시 호출됨.
	         *  */
	        mobloScanFinish : function(){
	        	this.customDispatchEvent( this.BLE_SCAN_FINISHED );
	        },
	        /** ConnectState
	         *  블루투스 연결상태 결과값
			 *  @param result {String} success, fail
	         *  */
	        mobloConnectState : function( result ){
				if( result === 'success' ){
					//
				}else{
					this._currentDevice = null;
				}
	        	this.customDispatchEvent( this.BLE_CONNECT_STATE, result );
	        },
	        /** receive block & tag data
			 * 블럭 추가/제거/LED변경시 호출됨.
	         * @param jsonstr {String} : {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	         *  */
	        mobloBlockData : function( jsonstr ){
	        	var data = typeof jsonstr === 'string'? JSON.parse( jsonstr ) : jsonstr;
	        	this.customDispatchEvent( this.MOBLO_CHANGE_BLOCK, data );
	        },
	        /**
	         * send data
	         * @param data (JSON) : {"position":{"x":49, "y":49,"z":49},"blockType":82,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]}
	         *  */
	        mobloBlockControl : function( data ){
	        	var jsonstr = '';
	        	try{
	        		jsonstr = JSON.stringify(data);
	        	}catch(e){};
		        this.callNative( 'mobloBlockControl', jsonstr );
	        },
	        /**
	         * 웹 준비 완료시. 안드로이드로 호출
	         *  */
	        mobloWebReady : function(){
	        	return this.callNative( 'mobloWebReady' );
	        },
	        /**
	         * 앱버전 반환
	         *  */
	        mobloAppVersion : function(){
	        	return this.callNative( 'mobloAppVersion' );
	        },
	        /**
	         * 모블로 블루투스 장비 이름 변경시 안드로이드로 호출
			 * @param name {String} 변경할 이름.
	         *  */
	        mobloNameChange : function( name ){
	        	this.callNative( 'mobloNameChange', name );
	        },
	        /**
	         * 사진첩 열기 안드로이드로 호출
	         *  */
	        mobloCallGallery : function(){
	        	this.callNative( 'mobloCallGallery' );
	        },
	        /**
	         * 디바이스에 사진저장
			 * base64 : "data:image/png," "data:image/jpg," "data:image/jpeg,"  제거
			 * @param data {Array} [base64]
	         *  */
	        mobloPutImage : function( data ){
	        	this.callNative( 'mobloPutImage', data );
	        },
	        /**
	         * 사진 공유하기 기능 안드로이드 호출
			 * base64 : "data:image/png," "data:image/jpg," "data:image/jpeg,"  제거
			 * @param data {Array} [base64]
	         *  */
	        mobloShareImage : function( data ){
	        	this.callNative( 'mobloShareImage', data );
	        },
	        /**
	         * 사진 저장완료 결과 수신
			 * @param bool {boolean} true/false
	         *  */
	        mobloImageSaveFinish : function( bool ){
	        	this.customDispatchEvent( this.SAVE_FINISH, bool );
	        },
			/**
			 * 기본공유하기 기능을 이용한 메세지 공유하기
			 * @param message {String}
			 */
			mobloShareMsg : function( message ){
				this.callNative( 'mobloShareMsg', message );
			},
			/**
			 * 모블로 보드타입 요청 및 반환
			 * @param type 
			 */
	        mobloBoardType : function( type ){
	        	if( typeof this._callbacks['mobloBoardType'] === 'function' ){
		        	this._callbacks['mobloBoardType'].call( null, type );
	        	}
	        },
			/**
			 * 모블로 보드타입 요청 / 반환시 콜백을 통해 반환.
			 * @param callback {function} 결과리턴될 함수.
			 */
	        reqMobloBoardType : function( callback ){
	        	if( this._callbacks === null || this._callbacks === undefined ){
	        		this._callbacks = {};
	        	}
	        	this._callbacks['mobloBoardType'] = callback;
	        	//
	        	this.callNative( 'mobloBoardType' );
	        },
	        /** 
	         * 안드로이드 화면 프로그레스 생성/제거
			 * @param bool {boolean} true / false
	         *  */
			mobloProgress : function( bool ){
				if( bool ){
					$.showAllBlock();
				}else {
					$.hideAllBlock();
				}
				this.callNative( 'mobloProgress', bool );
			},
	        /**
	         * 앱종료
	         *  */
	        mobloAppFinish : function(){
	        	this.callNative( 'mobloAppFinish' );
	        },
	        /**
			 * 앱이 재시작 될 경우 호출됨.
			 */
	        mobloOnResume : function(){
	        	this.customDispatchEvent( this.MOBLO_ON_RESUME );
	        },
	        /**
			 * 앱이 Pause 상태로 전환될 경우 호출됨.
			 */
	        mobloOnPause : function(){
	        	this.customDispatchEvent( this.MOBLO_ON_PAUSE );
	        },
	        /**
			 * 안드로이드 토스트 노출
			 * @param msg {String} 전달할 토스트 메세지.
			 */
	        mobloToast : function( msg ){
	        	this.callNative( 'mobloToast', msg );
	        },
			/**
			 * ReadLoop시 읽어드린 블럭갯수 반환
			 * @param cnt {Number} 블럭갯수
			 */
	        mobloBlockCount : function( cnt ){
	        	this.customDispatchEvent( this.MOBLO_BLOCK_COUNT );
	        },
	        
	        /** call native app
	         * 안드로이드와 통신하는 함수.
	         *  */
	        callNative : function(){
	        	
	        	if( arguments.length < 1 ){
	        		return;
	        	}
	        	
	        	var fn = arguments[0],
	        		params = Array.prototype.slice.call( arguments, 1 );
				
				if( fn === undefined || fn === null ){
					//debug.log( arguments );
					return;
				}
	        	
	            //debug.log( 'call native :: ' +  fn + ' | ' + ( !!params? params[0] : '' ) );
	            try{
	                var native = window.MobloApp;
	                if( !!native ){
	                    if( params.length > 0 ){
	                        return native[fn].apply( native, params );   
	                    }else{
	                        return native[fn].call( native );
	                    }
	                }else{
	                }
	            }catch(e){
	                debug.log( 'native call exception :: ' + fn );
	            }
	        },
			/**
			 * 개발용 함수.
			 * 안드로이드에서 통신상태 확인을 위해 웹에 메세지 전달.
			 * @param str {String}
			 */
	        mobloDebug : function( str ){
	        	debug.log( 'For Android :: ' + str );
	        }
		};
	}());
	
	// merge prototype
	for( var key in CNative ){
		CWebApp.prototype[key] = CNative[key];
	};
	
	
/**
 * define requirejs module
 * 
 *  */
	return window.webapp = new CWebApp();
});

	

