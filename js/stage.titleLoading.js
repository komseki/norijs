
define( function(require){
	
	var listTmpl,
		Handlebars,
		_context,
		_resourceData = null,
		_loadCnt = 0,
		_totalLoadLength = 0,
		_progressMax = 580,
		_progressStart = 12,
		
		
		_3dLoadCnt = 0,
		_total3dLoadLength = 0,
		_assetContext = '',
		_loadGroupList = [],
		_loadGroupCnt = 0,
		_loadList = [],
		
		_sndLoadCnt = 0;
		
		_loadIndexList = {},
		_resouceObjectList = {},
		_resouceMaterialList = {},
		_typeTimer = 0,
		_isLoadStarted = false,
		_scriptLoadList = ['stage.play', 'stage.play.ui', 'stage.play.3d',
							'THREE', 'OBJLoader', 'Detector', 'TWEEN',
							'OrbitControls', 'stats'],
		_scriptLoadCnt = 0,
		_timeEndLoadFunc = console.timeEnd;
	
	/**
	 * 모듈 로드
	 * @param context {Object} 모듈자신
	 */
	function requirePageModule( context ){
		requirejs( [ 'text!search_list', 'resources', 'handlebars' ], function( pListTmpl, pResources, pHandlebars ){
			listTmpl = pListTmpl;
			Handlebars = pHandlebars;
			_resourceData = pResources;
			_context = context;
			//
			_context._init();
		} );
	};
	
	/**
	 * 돔 로드
	 *  */
	function _setPage(){
		
		var html = R.findTmpl( listTmpl, 'tmplTitle' );
			//tmpl = Handlebars.compile( html ),
			
		$('#popupContainer').html('');
		$('#introContainer').html('');
		$('#introContainer').html( html ).show();
	}

	/**
	 * 로딩바 svg 구현
	 */
	function _setSVG(){
		var svg = '',
            $par = $('.loading-bar-wrap'),
            $el = $('.loading-bar-wrap #loadingbar'),
            w = $el.width(),
            h = $el.height();
        //
        svg += '<svg id="svg" x="0" y="0" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">';
        svg += '<defs>';
        svg += '<clipPath id="svgPath">';
        svg += '<rect id="svgRect" x="0" y="0" width="100%" height="100%" rx="'+(h/2)+'" ry="'+(h/2)+'" style="fill: none; stroke: none;"/>';
        svg += '</clipPath>';
        svg += '</defs>';
        svg += '<image id="loadingImg" xlink:href="images/common/title_loading_bar.png" x="-100%" y="0" height="100%" width="100%" clip-path="url(#svgPath)" style="fill: none; stroke: none;"/>';
        svg += '</svg>';
		
		$('.loading-bar-wrap #loadingbar').html( svg );
		
		_progressMax = w-h;
		_progressStart = h;

		$(window).on( VARS.eventName.RESIZE + '.title', resizeHandle );
		

		setTimeout( function(){
			_initLoad();
			//requireModule();
		}, 100 );
	}


	/**
	 * window.resize / window.onorientationchange 이벤트 리스너.
	 */
	function resizeHandle(){
		var rh = $('.loading-bar-wrap #loadingbar').height()/2;
		$('#svgRect').attr( 'rx', rh );
		$('#svgRect').attr( 'ry', rh );
	}

	
	/* 이전코드 :: 동적 가변 적용전 로딩바.(정적 가변)
	function _setSVG(){
		var svg = '',
            $par = $('.loading-bar-wrap'),
            $el = $('.loading-bar-wrap #loadingbar'),
            w = $el.width(),
            h = $el.height();
        //
        svg += '<svg x="0" y="0" width="'+w+'px" height="'+h+'px" xmlns="http://www.w3.org/2000/svg">';
        svg += '<defs>';
        svg += '<clipPath id="svgPath">';
        svg += '<rect id="svgRect" x="0" y="0" width="'+h+'" height="'+h+'" rx="'+(h/2)+'" ry="'+(h/2)+'" style="fill: none; stroke: none;"/>';
        svg += '</clipPath>';
        svg += '</defs>';
        svg += '<image id="loadingImg" xlink:href="images/common/title_loading_bar.png" x="-'+(w-h)+'" y="0" height="'+h+'px" width="'+w+'px" clip-path="url(#svgPath)" style="fill: none; stroke: none;"/>';
        svg += '</svg>';
		
		$('.loading-bar-wrap #loadingbar').html( svg );
		
		_progressMax = w-h;
		_progressStart = h;

		setTimeout( function(){
			_initLoad();
			//requireModule();
		}, 100 );
	}

	function requireModule(){
		requirejs( ['resources', 'stage.play', 'stage.play.ui', 'stage.play.3d',
					'THREE', 'OBJLoader', 'Detector', 'TWEEN',
					'OrbitControls', 'stats'],
					_initLoad,
					function(){
						setTimeout( function(){
							requireModule();
						}, 100 );
					} ); // end onerror
	}// end requireModule
	//*/
	
	/**
	 * 프로그레스바 표시
	 *  */
	function _setProgressBar( now ){
		//$('#loadingBar').css( 'width', Math.floor( 6 + ( _progressMax * now / 100 ) ) );
		var value = Math.floor( ( _progressMax * now / 100 ) );
		//$('#svgRect').attr( 'width', _progressStart + value );
		if( value < 6 ){
			return;
		}
		$('#svgRect').attr( 'width', now + '%' );
		var x = value - _progressMax;
		if( x < _progressStart - _progressMax){
			x = _progressStart - _progressMax;
		}
        $('#loadingImg').attr( 'x', (now-100) + '%' );
	}

	/**
	 * 미러링 페이지의 소켓 연결 체크.
	 */
	function _checkMirrorConnecting(){
		setTimeout( function(){
			if( VARS.isMirror && VARS.deviceWsConnected ){
				_nextPage();
			}else{
				_checkMirrorConnecting();
			}
		}, 250 );
	}
	
	/**
	 * 메인 페이지로 이동.
	 *  */
	function _nextPage(){
		// 콘솔 메세지 함수 복원.
		console.timeEnd = _timeEndLoadFunc;
		//
		$(window).off( VARS.eventName.RESIZE + '.title', resizeHandle );
		//
		// mirror 일경우
		if( VARS.isMirror ){
			var html = R.findTmpl( listTmpl, 'tmplMain' ),
			tmpl = Handlebars.compile( html );
			$('#gameContainer').html( tmpl( {ismirror:VARS.isMirror} ) ).show();
			$('#mainHome').hide();
			$('#mainPlay').show();
			$('#introContainer').html('').hide();
			//
			//VARS.initRead = true;
			Nori.getManager('main').play('play');
			return;
		}
		
		// TODO :: test , 바로 플레이로 이동
		if( VARS.isPlayTest ){
			$('#introContainer').html('').hide();
			//window.webapp.mobloProgress(true);
			var html = R.findTmpl( listTmpl, 'tmplMain' ),
			tmpl = Handlebars.compile( html );
			$('#gameContainer').html( tmpl({ismirror:VARS.isMirror}) );
			$('#mainPlay').show();
			$('#mainHome').hide();
			$('#gameContainer').show();
			//
			VARS.initRead = false;
			Nori.getManager('main').play('play');
			return;
		}
		
		Nori.Commands.callCmd( 'startMain' );
	}
	
	
	/**
	 * 리소스 로딩을 위한 설정.
	 */
	function _initLoad( data ){
		var group;
		//
		for( var key in _resourceData ){
			group = _resourceData[key];
			if( group.datas !== undefined ){
				_total3dLoadLength += group.datas.length;
				_loadGroupList.push( group );
			}
		}
		
		_loadCnt = 0;
		_3dLoadCnt = 0;
		_scriptLoadCnt = 0;
		_sndLoadCnt = 0;
		
		_totalLoadLength += _total3dLoadLength;
		_totalLoadLength += VARS.sound.soundList.length;
		_totalLoadLength += _scriptLoadList.length;
		
		_getBoardType();
	}
	
	/**
	 * 보드타입 요청 없을경우 default 9x9
	 *  */
	function _getBoardType(){
		window.webapp.reqMobloBoardType( _setBoardType );
		// 9x9 중 펌웨어 업데이트가 되지 않는것은 반환되지 않음.
		// 타이머로 1초간 대기후 자동으로 넘김
		_typeTimer = setTimeout( function(){
			_setBoardType( '9x9' );
		}, 1000 );
	}
	
	/**
	 * 보드타입 수신
	 *  */
	function _setBoardType( type ){
		clearTimeout( _typeTimer );
		VARS.boardType = type;
		_scriptLoad();
		//_startLoadResource();
	}
	
	/**
	 * javascript 로드
	 */
	function _scriptLoad(){
		var list = [ _scriptLoadList[_scriptLoadCnt] ];
		requirejs( list, _scriptLoadCheck, function(){
			setTimeout( function(){
				_scriptLoad();
			}, 24 );
		});
		
	};
	
	/**
	 * javascript 로드 체크
	 */
	function _scriptLoadCheck(){
		_scriptLoadCnt ++;
		_loadCnt ++;
		_setProgressBar( _loadCnt*100/_totalLoadLength );
		//
		if( _scriptLoadCnt === _scriptLoadList.length ){
			var mod = require( 'stage.play' );
			Nori.getManager('main').add( 'play', mod );
			_startLoadResource();
		}else{
			setTimeout( function(){
				_scriptLoad();
			}, 24 );
		}
	};
	
	/**
	 * 3D 리소스 로드 시작
	 */
	function _startLoadResource(){
		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		// 라이브러리에서 로그 생성방지
		console.timeEnd = function(){}; // 
		
		// 중복호출 방지.
		if( _isLoadStarted ){
			return;
		}
		_isLoadStarted = true;
		
		var loadGroup = _loadGroupList[_loadGroupCnt];
		_assetContext = loadGroup.context;
		_loadList = loadGroup.datas;
		
		// load data parse
		var i=0, len = _total3dLoadLength, obj;
		for( ;i<len;i+=1 ){
			obj = _loadList[i];
			_loadIndexList[ obj.name ] = i;
		};
		// resource Load
		_3dLoadCnt = 0;
		_resourceLoad( _loadList[_3dLoadCnt] );
	}
	
	/**
	 * 파일 포맷에 따른 로더 반환
	 */
	function _getLoader( type ){
		var loader;
		switch( type ){
			case 'obj' : 
				loader = new THREE.OBJLoader();
			break;
			case 'json' :
				loader = new THREE.ObjectLoader();
			break;
			default : // image
				if( type === 'image/tga' ){
					loader = new THREE.TGALoader();
				}else{
					loader = new THREE.ImageLoader();
				}
			break; 
		}
		return loader;
	}
	
	/**
	 * 파일 포맷에 따른 콜백함수 반환
	 */
	function _getCompleteCallback( type ){
		var callback;
		switch( type ){
			case 'obj' : 
				callback = _onLoadObject3D;
			break;
			case 'json' :
				callback = _onLoadObject3D;
			break;
			default : // image
				callback = _onLoadImage;
			break; 
		}
		return callback;
	}
	
	/**
	 * 사용할 리소스 로드
	 *  */
	function _resourceLoad ( info ){
		var type = info.type,
			onComplete,
			loader,
			path;
		//
		
		loader = _getLoader( type );
		onComplete = _getCompleteCallback( type );
		
		path = _assetContext + info.path;
		//
		loader.load( path, function( o ){
			onComplete( o );
		}, function( xhr ){
			_onLoadProgress( xhr );
		}, function( xhr ){
			_onLoadError( xhr );
		} );
	}
	
	/**
	 * 리소스 프로그레스 함수
	 * 실제 구현은 없음.
	 */
	function _onLoadProgress( xhr ){
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			//console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	}
	
	/**
	 * 리소스 로드 에러 함수
	 * 실제 구현은 없음.
	 */
	function _onLoadError( xhr ){
		// 
		//console.log( xhr );
	}
	
	/**
	 * obj, json 리소스 로드 완료 함수
	 */
	function _onLoadObject3D( obj ){
		
		var info = _loadList[_3dLoadCnt];
		_resouceObjectList[ info.name ] = obj;
		_loadCompleteCheck();
	}
	
	/**
	 * 텍스처 로드 완료 함수.
	 */
	function _onLoadImage( image ){
		//MeshBasicMaterial
		var info = _loadList[_3dLoadCnt],
			texture;
		if( info.type === 'image/tga' ){
			texture = image;
		}else {
			texture = new THREE.Texture();
			texture.image = image;
		}
		texture.needsUpdate = true;
		//
		_resouceMaterialList[ info.name ] = new THREE.MeshPhongMaterial({ map:texture});
		//
		_loadCompleteCheck();
	}
	
	/**
	 * 3D리소스 로드 완료 체크
	 */
	function _loadCompleteCheck(){
		_3dLoadCnt ++;
		_loadCnt ++;
		
		if( _3dLoadCnt == _total3dLoadLength ){
			_setProgressBar( _loadCnt*100/_totalLoadLength );
			R.assets.resourceObjList = _resouceObjectList;
			R.assets.resourceMtlList = _resouceMaterialList;
			loadSound();
			//_nextPage();
			return;
		}else{
			_setProgressBar( _loadCnt*100/_totalLoadLength );
		}
		_resourceLoad( _loadList[_3dLoadCnt] );
	}
	
	/**
	 * 사운드 로드
	 */
	function loadSound(){
		
		if( Nori.SoundManager._context === null ){
			Nori.SoundManager.init();
		}
		
		var snd = new Nori.SoundLoader({
			urlList : VARS.sound.soundList,
			context : Nori.SoundManager._context,
			onComplete : function(){
				_sndLoadCnt ++;
				_loadCnt++;
				_setProgressBar( _loadCnt*100/_totalLoadLength );
			},
			onFinish : function( audioBufferList ){
				Nori.SoundManager.addAudioBufferList(audioBufferList);
				
				// id, bufferId
				Nori.SoundManager.registerSound( 'contents', 'contents' );
				Nori.SoundManager.registerSound( 'intro', 'intro' );
				Nori.SoundManager.registerSound( 'nar', 'nar' );
				
				// effect
				var list = VARS.effSoundConfig, key;
				for( key in list ){
					Nori.SoundManager.registerSound( key, 'eff_all', list[key] );
				}
				
				// end;
				if( VARS.isMirror ){
					_checkMirrorConnecting();
				}else{
					_nextPage();
				}
			}
		}).load();
	}

	
	/**
	 * define requirejs module
	 *  */
	return {
		__playInit__ : function( isMirror ){
			VARS.isMirror = isMirror;
			requirePageModule(this);
		},
		_init : function(){
			debug.log( 'preloading | init' );
			_setPage();
			_setSVG();
			
		}
	};
});




