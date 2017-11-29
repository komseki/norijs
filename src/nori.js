(function(){
	'use strict';
	
	/** Nori
	 *
	 *  */
	var Nori = {};
	Nori.version = '0.0.1';
	
	/**
	 * Utils
	 *  */
	var __hasOwnProperty = ({}).hasOwnProperty,
		__mSlice = Array.prototype.slice;
	
	function __isArray( o ){
		return Array.isArray( o ) || Object.prototype.toString.call(o) === '[object Array]';
	};
	
	function __isPlainObject( o ){
		if( typeof o !== 'object' || o.nodeType ){
			return false;
		}
		
		if ( o.constructor && !__hasOwnProperty.call( o.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}
		
		return true;
	}
	
	
	/**
	 *
	 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
	 *  */
	var ___CEventTarget___ = function(){
		this.listeners = {};
	};
	
	___CEventTarget___.prototype = (function(){
		
		return {
			listeners : null,
			addEventListener : function( type, callback ){
				if( this.listeners === undefined || this.listeners === null ){
					this.listeners = {};
				}
				if(!(type in this.listeners)) {
					this.listeners[type] = [];
				}
				this.listeners[type].push(callback);
			},
			removeEventListener : function( type, callback ){
				if( this.listeners === undefined || this.listeners === null ){
					return;
				}
				if(!(type in this.listeners)) {
					return;
				}
				var stack = this.listeners[type];
				for(var i = 0, l = stack.length; i < l; i++){
					if(stack[i] === callback){
						stack.splice(i, 1);
						return this.removeEventListener(type, callback);
					}
				}
			},
			dispatchEvent : function( event ){
				if(!(event.type in this.listeners)) {
					return;
				}
				var stack = this.listeners[event.type];
				event.target = this;
				for(var i = 0, l = stack.length; i < l; i++) {
					stack[i].call(this, event);
				}
			},
			customDispatchEvent : function( type ){
				if( this.listeners === undefined || this.listeners === null ){
					return;
				}
				if(!(type in this.listeners)) {
					return;
				}
				var stack = this.listeners[type];
				for(var i = 0, l = stack.length; i < l; i++) {
					stack[i].apply(this, Array.prototype.slice.call( arguments, 1 ));
				}
			}
		};
		
	})();
	
	/** Object Merge
	 * jquery extend function
	 * deep, target, object ...
	 *  */
	Nori.merge = function(){
		var deep = false,
			i = 1,
			length = arguments.length,
			target = arguments[0] || {};
		
		if( typeof target === 'boolean' ){
			deep = target;
			target = arguments[i];
			i++;
		}
		
		if( typeof target !== 'object' && typeof target !== 'function' ){
			target = {};
		}
		
		if( i === length ){
			return target;
		}
		
		var obj, key, ori, copy, collection, copyIsArray;
		for( ; i<length; i+=1 ){
			obj = arguments[i];
			for( key in obj ){
				ori = target[key];
				copy = obj[key];
				// 대상과 원본이 같으면 루프를 건너뛴다.
				if( ori === copy ){
					continue;
				}
				//
				if( deep && !!copy && ( __isPlainObject(copy) || ( copyIsArray = __isArray(copy) ) ) ){
					if( copyIsArray ){
						copyIsArray = false;
						collection = ori && __isArray(ori)? ori : [];
					}else{
						collection = ori && __isPlainObject( ori )? ori : {};
					}
					target[key] = Nori.merge( deep, ori, copy );
				}else if( copy !== undefined ){
					target[key] = copy;
				}
			}
		}
		
		return target;
	};
	
	/**
	 * 상속을 위한 객체 속성 
	 * super 메소드 구현
	 *  */
	var SuprPrototype = {
		__supr__ : {},
		/**
		 * override시 부모의 함수 호출.
		 *  */
		supr : function( name ){
			var fn;
			if( (fn = this.__supr__[name]) !== undefined ){
				if( typeof fn === 'function' ){
					fn.apply( this, __mSlice.call( arguments, 1 ) );
				}
			}
		}
	};
	
	
	/**
	 * 객체 상속.
	 *  */
	Nori.extends = function( Parent, obj ){
		var Class = function(){},
		prop = Parent;
		Class.prototype = Nori.merge( true, {}, SuprPrototype, Parent, obj );
		Class.prototype.__supr__ = prop;
		//
		return new Class();
	};
	
	Nori.managers = {};
	/**
	 * StageManager 추가
	 * @param name {String} StageManager 이름
	 * @param manager {Object} StageManager 객체
	 */
	Nori.addManager = function( name, manager ){
		if( Nori.managers[name] === undefined ){
			Nori.managers[name] = manager;
		};
	};
	
	/**
	 * StageManager 반환
	 * @param name {String} StageManager 이름
	 * @return {Object} StageManager 객체
	 */
	Nori.getManager = function( name ){
		return Nori.managers[name];
	};
	
	
	/**
	 * 각스테이지들의 공통 객체 속성
	 *  */
	var StagePrototype = {
		/**
		 * 스테이지 플레이시 호출됨.
		 * StagePrototype를 상속한 Stage 객체에 구현
		 * 
		 * @link stage.play.js return { ... }
		 */
		__playInit__ : function(){
			//console.log( 'super :: ', this.name );
		},
		/**
		 * 어플리케이션 재시작 이벤트 시 호출
		 * StagePrototype를 상속한 Stage 객체에 구현
		 * @link app.js window.webapp.addEventListener( window.webapp.MOBLO_ON_RESUME, function(){ ... } );
		 * @link mirror.app.js window.webapp.addEventListener( window.webapp.MOBLO_ON_RESUME, function(){ ... } );
		 * @link stage.play.js return { ... }
		 */
		__onResume__ : function(){
			
		},
		/**
		 * 어플리케이션 중지 이벤트 시 호출
		 * StagePrototype를 상속한 Stage 객체에 구현
		 * @link app.js window.webapp.addEventListener( window.webapp.MOBLO_ON_PAUSE, function(){ ... } );
		 * @link mirror.app.js window.webapp.addEventListener( window.webapp.MOBLO_ON_PAUSE, function(){ ... } );
		 * @link stage.play.js return { ... }
		 */
		__onPause__ : function(){
			
		}
	};
	
	
	/**
	 * StageManager 객체.
	 * 등록된 Stage 객체를 이용한 화면관리.
	 *  */
	var StageManager = function( name ){
		return this.init( name );
	};
	
	StageManager.prototype = {
		_name : 'stagemansage',
		_currentPageName : '',
		_stages : {},
		init : function( name ){
			// 전달된 이름이 없을경우, 랜덤하게 이름생성.
			if( name === undefined ){
				this._name = 'manager_' + Date.now();
			}else{
				this._name = name;
			}
			
			// manager를 등록.
			if( Nori ){
				Nori.addManager( this._name, this );
			}
			
			return this;
		},
		/**
		 * Stage를 추가.
		 * @param name {String} 구분을 위한 Stage 이름.
		 * @param obj {Object} StagePrototype을 상속할 Prototype Object
		 */
		add : function( name, obj ){
			var stage = Nori.extends( StagePrototype, obj );
			this._stages[name] = stage;
		},
		/**
		 * Stage 삭제.
		 * @param name {String} 구분을 위한 Stage 이름.
		 */
		remove : function( name ){
			this._stages[name] = null;
			delete this._stages[name];
		},
		/**
		 * Stage를 시작.
		 * @param name {String} 구분을 위한 Stage 이름.
		 */
		play : function( name ){
			var stage = this._stages[name],
				args = Array.prototype.slice.call(arguments, 1);
			//
			if( stage !== undefined && stage !== null ){
				this._currentPageName = name;
				stage.__playInit__.apply( stage, args );
			}
		},
		/**
		 * 전달받은 인자와 매칭되는 Stage를 반환
		 * @param name {String} 구분을 위한 Stage 이름.
		 * @return {Object} Stage객체
		 */
		getStage : function( name ){
			var stage = this._stages[name];
			if( stage !== undefined && stage !== null ){
				return stage;
			}
			return;
		},
		/**
		 * 현재 play중인 Stage 객체를 반환
		 * @return {Object} Stage 객체
		 */
		getCurrentPageName : function(){
			return this._currentPageName;
		}
	};
	
	/**
	 * Command 관리및 실행 객체의 실제 객체. CommandManager.getInstance 함수로 생성된다.
	 *  */
	var CommandManager = (function(){
		var Commands = function(){};
		Commands.prototype = {
			_cmds : {},
			getInstance : function(){
				return this;
			},
			/**
			 * 명령등록.
			 * receiver는 필요시 등록한다.
			 * [receiver], name, callback
			 * @param [receiver] {Object} 커맨드 실행함수를 포함할 Target Receiver, 필수 항목아님.
			 * @param name {String} Stage 이름.
			 * @param callback {Function} 명령호출시 실행할 함수. 
			 *  */
			registCmd : function(){
				var receiver = arguments[0],
					i = 1,
					name, callback;
				if( typeof receiver === 'string' ){
					name = receiver;
					receiver = null;
				}else{
					name = arguments[i];
					i++;
				}
				
				if( this._cmds[name] === undefined ){
					callback = arguments[i];
					this._cmds[name] = {receiver:receiver, callback:callback };
				}
			},
			/**
			 * 명령삭제
			 * 등록시 사용한 name값으로 삭제
			 * @param name {String} 
			 */
			unregistCmd : function( name ){
				this._cmds[name] = null;
				delete this._cmds[name];
			},
			/**
			 * 등록한 이름으로 명령을 실행한다.
			 * 첫번째객체로 타겟을 지정하거나, 실행할 command 문자열을 받는다.
			 * @param [target] 바인딩될 함수의 클록저 타겟. 없을경우 등록시 사용된 receiver 또는 null
			 * @param name {String} 실행할 명령이름
			 * @example Nori.Commands.callCmd( target, 'test');
			 * @example Nori.Commands.callCmd('test');
			 * @example Nori.Commands.callCmd('test', 1, 2, 3);
			 *  */
			callCmd : function(){
				var receiver,
					options,
					callback = arguments[0],
					i=0;
					
				if( typeof callback !== 'string' ){
					receiver = callback;
					i ++;
				}else{
					receiver = null;
				}
				options = this._cmds[ arguments[i] ];
				receiver = receiver || options.receiver;
				callback = options.callback;
				i++;
				if( typeof callback === 'function' ){
					callback.apply( receiver || null, __mSlice.call( arguments, i ) );
				}
			}
		};
		//
		return {
			getInstance : function(){
				Nori.Commands =  new Commands();
				return Nori.Commands;
			}
		};
	}());
	
	
	
	
	
	
	/**
	 * Sound, Soundloader, SoundManager
	 * 
	 * context.createGain();
	 *  */
	/**
	 * 사운드 객체.
	 */
	var Sound = (function(){
		return {
			id : '',
			url : '',
			context : null,
			config : null,
			source : null,
			buffer : null,
			loop : false,
			onEnded : null,
			getInstance : function( info ){
				return Nori.extends( ___CEventTarget___.prototype, this ).init( info || {} );
			},
			init : function( info ){
				var ctx = this.context = info.context,
					destination = ctx.destination,
					source = ctx.createBufferSource(),
					oscillator = ctx.createOscillator(),
					gainNode = ctx.createGain(),
					buffer = info.buffer;
				//
				if( buffer === undefined ){
					return;
				}
				
				//oscillator.connect( gainNode );
				gainNode.connect( destination );
				
				//
				source.buffer = buffer;
				
				source.connect( ctx.destination );
				source.connect( gainNode.gain );
				this.source = source;
				//
				
				this.buffer = buffer;
				this.loop = false;
				this.id = info.id || 'sound_' + Date.now();
				this.gainNode = gainNode;
				this.config = info.config || {};
				this.url = info.url;
				//
				return this;
			},
			/**
			 * 재생시작
			 * @param when {Number} 재생전 pause 타임.
			 * @param offset {Number} 시작위치
			 * @param duration {Number} 재생할 시간
			 * @return {Object} Sound 객체
			 *  */
			start : function( when, offset, duration ){
				if( !VARS.isSound ){
					return;
				}
				when = when===undefined? this.config.when : when;
				offset = offset===undefined? this.config.offset : offset;
				duration = duration===undefined? this.config.duration : duration;
				when = when || 0;
				offset = offset || 0;
				duration = duration || this.buffer.duration || 0;
				
				var that = this,
					ctx = this.context;
					
				var source = ctx.createBufferSource();
					source.buffer = this.buffer;
					source.connect( ctx.destination );
					source.connect( this.gainNode.gain );
					this.source = source;
				//
				source.onended = function( e ){
					if( typeof that.onEnded === 'function' ){
						that.onEnded( e );
					};
					this.disconnect( ctx.destination );
					this.disconnect( that.gainNode.gain );
				};
				//
				this.source.start = !this.source.start? this.source.noteOn : this.source.start;
				this.source.start( when, offset, duration );
				this.source.loop = this.loop;
				//
				return this;
			},
			/**
			 * 정지
			 * @param when {Number} 정지 delay 시간.
			 * @return {Object} Sound 객체
			 *  */
			stop : function( when ){
				when = when || 0;
				try{
					this.source.stop = !this.source.stop? this.source.noteOff : this.source.stop;
					this.source.stop( when );
				}catch(e){
					
				}
				//
				return this;
			},
			/**
			 * 반복
			 * @param bool {boolean} true 반복
			 * @return {Object} Sound 객체
			 *  */
			setLoop : function( bool ){
				this.loop = bool;
				return this;
			},
			/**
			 * 음량.
			 * @param val {Number} 소리크기
			 * @return {Object} Sound 객체
			 */
			setGain : function( val ){
				if( val < 0 ){
					val = 0;
				}
				this.gainNode.gain.value = 10;
				return this;
			},
			/**
			 * 사운드 객체 해제
			 */
			release : function(){
				this.source.disconnect();
				this.buffer = null;
				this.source = null;
				this.nodeSource = null;
			},
			/**
			 * 재생완료시 이벤트
			 * @param callback {Function} 콜백함수.
			 */
			onEnded : function( callback ){
				this.onEnded = callback;
			}
		};
	}());
	
	/**
	 * 사운드 로더.
	 * options.context = new AudioContext();
	 * options.urlList = [ { "path" : "*.mp3", "id" : "id" } ];
	 *  */
	var SoundLoader = function( options ){
		return Nori.extends( ___CEventTarget___.prototype, SoundLoader.prototype ).init( options || {} );
		//return this.init( options || {} );
	};
	SoundLoader.prototype = (function(){
		
		return {
			ON_LOAD_COMPLETE : 'onLoadComplete',
			ON_ERROR : 'onError',
			ON_LOAD_FINISH : 'onLoadFinish',
			_context : null,
			_bufferList : null,
			_loadUrlList : [],
			_loadCnt : 0,
			_loadTotal : 0,
			_onCompleteCallback : null,
			_onFinishCallback : null,
			_onErrorCallback : null,
			/**
			 * 로더객체 초기화, 전달되는 options 객체에 로드리스트, 콜백등을 지정한다.
			 * @param options {Object}
			 * @link stage.titleLoading.js#loadSound
			 */
			init : function( options ){
				this._context = options.context;
				this._loadUrlList = options.urlList || this._loadUrlList;
				this._onCompleteCallback = options.onComplete;
				this._onFinishCallback = options.onFinish;
				this._onErrorCallback = options.onError;
				this._bufferList = {};
				this._loadTotal = this._loadUrlList.length;
				this._loadCnt = 0;
				return this;
			},
			/**
			 * XMLHttpRequest를 이용해 사운드를 로드한다.
			 * @param info {Object} {"id" : "contents", "url" : 'assets/sound/bgm_cm_contents.mp3'}
			 */
			_load : function( info ){
				var that = this,
					id = info.id, 
					url = info.url,
					config = info.config,
					request = new XMLHttpRequest();
				//
				request.open( 'GET', url, true );
				request.responseType = 'arraybuffer';
				request.onload = function(){
					that._context.decodeAudioData(
						request.response,
						// complete
						function( buffer ){
							if(buffer === null || buffer === undefined){
								return;
							}
							//that._bufferList[id] = Sound.getInstance( Nori.merge( { buffer:buffer, context:that._context }, info ) );
							that._bufferList[info.url] = { id:id, buffer:buffer };
							that._checkNext();
						},
						// error
						function( err ){
							that._onError( err );
						}
					);
				};
				request.onerror = function(){
					that._onError( err );
				};
				request.send();
			},
			/**
			 * 사운드 로드완료시 호출
			 */
			_onComplete : function(){
				if( typeof this._onCompleteCallback === 'function' ){
					this._onCompleteCallback.call( this, this._loadTotal, this._loadCnt );
				}
				this.customDispatchEvent( this.ON_LOAD_COMPLETE, this._loadTotal, this._loadCnt );
			},
			/**
			 * 전체 로드리스트 로드완료
			 */
			_onFinishLoad : function(){
				if( typeof this._onFinishCallback === 'function' ){
					this._onFinishCallback.call( this, this._bufferList, this._loadTotal, this._loadCnt );
				}
				this.customDispatchEvent( this.ON_LOAD_FINISH, this._bufferList, this._loadTotal, this._loadCnt );
			},
			/**
			 * 로드 에러
			 */
			_onError : function( err ){
				this._checkNext();
				if( typeof this._onErrorCallback === 'function' ){
					this._onErrorCallback.call( this, err );
				}
				this.customDispatchEvent( this.ON_ERROR, err );
			},
			/**
			 * 다음로드할것이 있는지 / 로드완료 체크
			 */
			_checkNext : function(){
				this._loadCnt ++;
				if( this._loadCnt === this._loadTotal ){
					this._onComplete();
					this._onFinishLoad();
				}else{
					this._onComplete();
					this.load();
				};
			},
			/**
			 * _loadUrlList 에 지정된 음원을 로드한다.
			 */
			load : function(){
				var info = this._loadUrlList[ this._loadCnt ];
				this._load( info );
			}
		};
	}());
	
	
	Nori.SoundLoader = SoundLoader;
	
	var SoundManager = (function(){
		return {
			_context: null,
			_audioBufferList : null,
			_soundList : null,
			_loadedList : null, // {url : key}
			getInstance : function(){
				return this;
			},
			/**
			 * SoundManager객체 초기화.
			 */
			init : function(){
				window.AudioContext = window.AudioContext || window.webkitAudioContext;
				this._context = new AudioContext();
			},
			/**
			 * 이미 로드된 곳에서 매칭해서 버퍼 가져옴 
			 * 등록시 아이디를 부여하고 버퍼 리스트의 id에서 버퍼를 가져와 저장해 놓는다.
			 * @param id {String} 등록할 id
			 * @param bufferId {String} 버퍼리스트에 로딩시 부여한 id
			 * @param config {Object} 재생시 사용할 설정 객체.
			 * */
			registerSound : function( id, bufferId, config ){
				this._soundList = this._soundList || {};
				var buffer = this._audioBufferList[bufferId];
				this._soundList[id] = Sound.getInstance( { buffer:buffer, context:this._context, config:config, id:id } );
			},
			/**
			 * 로더의 기능을 SoundManager상에서 호출할수 있도록 구현해 놓은 property
			 * 로더를 이용해 버퍼를 로드하고 저장한다.
			 * 이미 로드된것에 대한 중복 처리 없음. 덮어씌운다.
			 * @param urlList {Array} [{"id" : "contents", "url" : 'assets/sound/bgm_cm_contents.mp3'}]
			 * @param onComplete {Function} 로딩 완료 함수.
			 */
			loadBuffers : function( urlList, onComplete ){
				var that = this;
				var snd = new Nori.SoundLoader({
					urlList : urlList,
					context : this._context,
					onFinish : function( audioBufferList ){
						that.addAudioBufferList(audioBufferList);
						if( typeof onComplete === 'function' ){
							onComplete();
						}
					}
				}).load();
			},
			/**
			 * 로드된 버퍼리스트를 사용하기위해 등록해 놓는다.
			 * @param audioBufferList {Object} 로더를 통해 로드한 버퍼의 리스트
			 */
			addAudioBufferList : function( audioBufferList ){
				this._audioBufferList = this._audioBufferList || {};
				this._loadedList = this._loadedList || {};
				
				var key, obj;
				for( key in audioBufferList ){
					obj = audioBufferList[key];
					this._loadedList[ key ] = obj.id;
					this._audioBufferList[obj.id] = obj.buffer;
				};
				obj = null;
			},
			/**
			 * 지정한 id의 사운드를 가져옴
			 * @param id {String} 아이디
			 * @return {Object} 사운드 객체
			*/
			getSound : function( id ){
				return this._soundList[ id ];
			},
			/**
			 * 사용하지 않는 사운드 해제
			 * TD :: 삭제시 URL 리스트 같이 사라짐. 
			 * @param id {String}
			 *  */
			release : function( id ){
				if( !this._audioBufferList || !this._audioBufferList[ id ] ){
					return;
				}
				var url = this._audioBufferList[ id ].url;
				this._audioBufferList[ id ].release();
				//
				delete this._loadedList[ url ];
				delete this._audioBufferList[ id ];
			},
			/**
			 * 지정한 id의 사운드 재생
			 * @param id {String} 아디디
			 * @return {Object} 사운드객체
			 */
			start: function( id ){
				var snd = this.getSound( id );
				if( !snd ){
					return;
				}
				return this.getSound( id ).start();
			}
			
		};
	}());
	
	
	
	/**
	 * export
	 *  */
	Nori.StageManager = StageManager;
	Nori.Commands = CommandManager;
	Nori.SoundManager = SoundManager;
	window.Nori = Nori;
	
	
	
	
	
})();

