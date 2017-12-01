/**
 * 3D 화면 관련 스크립트 모듈
 *  */
define( ['require', 'text!search_list', 'three/libs/dat.gui.min', 'effect', 'socketConn'], function( require, tmpl ){
	var _context,
		FPS = VARS.useBLE? parseInt(1000/60) : parseInt(1000/40),
		
		STAGE_WIDTH,
		STAGE_HEIGHT,
		STAGE_HALFX,
		STAGE_HALFY,
		
		// board size
		BOARD_X,
		BOARD_Y,
		BOARD_Z,
		
		// 기준점 0, 0, 0
		BOARD_POS_X,
		BOARD_POS_Y,
		BOARD_POS_Z,
		
		BLOCK_X,
		BLOCK_Y,
		BLOCK_Z,
		
		// 총 칸 갯수
		COORDS_X_SIZE,
		COORDS_Z_SIZE,
		
		_container,
		_requestTimer = 0,
		_fpsTimer = 0, 
		
		_boardBbox,
		
		// Object
		_board,
		_cloud,
		_planet,
		_planets = {},
		
		_blockPosVal = 1,
		_addedBlockList = {},
		_addedBlockDatas = {},
		_addedFireBlockList = {},
		_addedDepthList = {},
		_castObjectIndexs,
		_castObjects,
		
		_raycaster,
		_mouseVec,
		
		
		_camera, _scene, _renderer,
		_backgroundScene, _background, _backgroundCamera,
		_controls,
		_stats,
		
		_listTmpl = tmpl,
		
		_clock,

		_effect;

		
	/**
	 * 초기화 및 이벤트 부여.
	 *  */
	function _setPlayInit(){
		_container = document.getElementById('playContainer');
		
		// resize or orientchange evnet
		$(window).off(VARS.eventName.RESIZE + '.play').on( VARS.eventName.RESIZE + '.play', onWindowResize );
		$(window).triggerHandler( VARS.eventName.RESIZE + '.play' );
		
		// set
		_settigPropertyInfo();
		
		// 개발용 test ui 이벤트
		if( __hash.testui ){
			var list = [];
			$('.test-add').tap( function(){
				var opt = [
					{"position":{"x":49, "y":51,"z":49},"blockType":66,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":50, "y":51,"z":49},"blockType":73,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":49, "y":52,"z":49},"blockType":79,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":50, "y":52,"z":49},"blockType":71,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]}
				];
				var idx = parseInt( this.dataset.idx );
				//
				if( this.dataset.state === 'add' ){
					this.dataset.state = 'remove';
					opt[idx].blockState = 50;
					_onChangeBlock( opt[idx], true );
					return;
				};
				//
				this.dataset.state = 'add';
				_onChangeBlock( opt[idx], true );
			} );
			
			$('.test-roof').tap( function(){
				var opt = [
					{"position":{"x":49, "y":51,"z":50},"blockType":118,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":50, "y":51,"z":50},"blockType":118,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":49, "y":52,"z":50},"blockType":118,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]},
					{"position":{"x":50, "y":52,"z":50},"blockType":118,"blockState":49,"data":[50,49,49,49,49,49,49,49,49]}
				];
				var idx = parseInt( this.dataset.idx );
				//
				if( this.dataset.state === 'add' ){
					this.dataset.state = 'remove';
					opt[idx].blockState = 50;
					_onChangeBlock( opt[idx], true );
					return;
				};
				//
				this.dataset.state = 'add';
				_onChangeBlock( opt[idx], true );
			} );
			
			$('#all').tap( function(){
				$('.test-add').trigger( VARS.tapnm );
				$('.test-roof').trigger( VARS.tapnm );
			});

			$('#remove').tap( function(){
				$('.test-add').trigger( VARS.tapnm );
				$('.test-roof').trigger( VARS.tapnm );
			});
		}
	}
	
	/**
	 * window.resize / window.onorientationchange 이벤트 리스너
	 */
	function onWindowResize(){
		
		document.body.style.width = window.innerWidth;
		document.body.style.height = window.innerHeight;
		
		setTimeout( function(){
			window.scrollTo( 0, 0 );
		}, 0 );
		
		window.STAGE_WIDTH = STAGE_WIDTH = _container.clientWidth;
		window.STAGE_HEIGHT = STAGE_HEIGHT = _container.clientHeight;
		window.STAGE_HALFX = STAGE_HALFX = STAGE_WIDTH / 2;
		window.STAGE_HALFY = STAGE_HALFY = STAGE_HEIGHT / 2;
		
		if( _camera !== undefined ){
			_camera.aspect = STAGE_WIDTH / STAGE_HEIGHT;
			_camera.updateProjectionMatrix();
		}
		if( _renderer !== undefined ){
			_renderer.setSize( STAGE_WIDTH, STAGE_HEIGHT );
		}
		
	}
	
	/**
	 * 블럭 터치/마우스클릭.
	 */
	function _setGesture(){
		$(_container).off(VARS.tapnm).on( VARS.tapnm, function(e, o){
			
			o = o || { x1:e.clientX, y1:e.clientY };
			
			var xgab = _container.getBoundingClientRect().left,
				ygab = _container.getBoundingClientRect().top;
			//
			_mouseVec.set( ( (o.x1-xgab) / STAGE_WIDTH ) * 2 - 1, - ( (o.y1-ygab) / STAGE_HEIGHT ) * 2 + 1 );
			_raycaster.setFromCamera( _mouseVec, _camera );
			var intersects = _raycaster.intersectObjects( _castObjects );
			if ( intersects.length > 0 ) {
				var intersect = intersects[ 0 ],
				block = intersect.object.parent,
				udata = block.userData,
				led = !udata.led,
				id = block.name,
				arr = id.split('_');

				var sendData = JSON.parse(udata.json);
				sendData.data[0] = led? 49 : 50;
				//
				switch (udata.type){
					case '3d':
						sendData.blockState = 51;
						_onChangeBlock( sendData, true );
					break;
					case 'mould' :
						if( parseInt(arr[2]) > 1 ){
							sendData.blockState = 51;
							_onChangeBlock( sendData, true );
						}
					break;
					default :
					break;
				}
			}
		} );
	}
	
	
	/**
	 * 보드의 크기, 블럭의 크기등을 설정.
	 * 보드 좌표는 bg_board mesh에서 추출
	 *  */
	function _settigPropertyInfo(){
		var world = R.assets.resourceObjList['board'],
			board;
		//
		world.traverse( function( child ){
			if ( child instanceof THREE.Mesh ) {
				if( child.name === 'bg_board' ){
					_boardBbox = new THREE.Box3().setFromObject( child );
				}
			}
		} );
		
		BLOCK_X = BLOCK_Z = 1.6;//1.600000023841858;
		BLOCK_Y = 1;
		
		/**
		 * 보드 위치
		 * max.z = near
		 * min.z = far
		 * min.x = left
		 * max.y = right
		 * max.y = ground
		 *  */
		BOARD_X = Math.abs(_boardBbox.max.x - _boardBbox.min.x);
		BOARD_Y = Math.abs(_boardBbox.max.y - _boardBbox.min.y);
		BOARD_Z = Math.abs(_boardBbox.max.z - _boardBbox.min.z);
		
		// 왼쪽 하단 시작 좌표.
		BOARD_POS_X = _boardBbox.min.x + (BLOCK_X/2);
		BOARD_POS_Y = 0;
		BOARD_POS_Z = _boardBbox.max.z - (BLOCK_Z/2);
		
		// x, z 축에 대한 총 좌표 갯수
		// 보드 타입별 구분
		
		_setBoardType();
		_init3D();
	}

	/**
	 * 보드타입에 따른 변수값 할당.
	 */
	function _setBoardType(){
		switch( VARS.boardType ){
			case '7x7' :
				_blockPosVal = 0;
				COORDS_X_SIZE = COORDS_Z_SIZE = 7;
			break;
			case '5x5' :
				_blockPosVal = -1;
				COORDS_X_SIZE = COORDS_Z_SIZE = 5;
			break;
			default : // 9x9 or nothing
				_blockPosVal = 1;
				COORDS_X_SIZE = COORDS_Z_SIZE = 9;
			break; 
		}
	}
	
	/**
	 * 3D 구성을 위한 기본 셋팅.
	 */
	function _init3D(){
		
		_castObjectIndexs = {};
		_castObjects = [];
		_raycaster = new THREE.Raycaster();
		_mouseVec = new THREE.Vector2();
		
		//
		_scene = new THREE.Scene();
		
		// 랜더러 설정.
		_renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, preserveDrawingBuffer:true});
		_renderer.setPixelRatio( window.devicePixelRatio );
		_renderer.autoClear = false;
		_renderer.setClearColor( 0xffffff, 1 );
		_renderer.setSize( STAGE_WIDTH, STAGE_HEIGHT );
		
		// 카메라 설정
		var aspect = STAGE_WIDTH / STAGE_HEIGHT, // 안씀
		radius = _boardBbox.max.z*2;
		_camera = new THREE.PerspectiveCamera( 33, STAGE_WIDTH / STAGE_HEIGHT, 1, 10000 );
		_camera.position.set( -23, 20, 23 );
		_camera.lookAt(_scene.position);
		_scene.add(_camera);
		
		
		// background scene 설정.
		var bgMtl = R.assets.resourceMtlList['background_'+ (VARS.ampm=='day'? 'day' : 'night')];
		bgMtl.map.minFilter = THREE.LinearFilter; //THREE.NearestFilter
		var scale = Math.max( STAGE_WIDTH/1280, STAGE_HEIGHT/800 ),
			w = Math.round( 1280*scale ),
			h = Math.round( 800*scale );
        _background = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1280, 800, 1, 1), bgMtl );
		_background.scale.set( scale, scale, 1 );
		_backgroundScene = new THREE.Scene();

		/**
		 * VFX 불꽃놀이 효과 추가로 인해 카메라 변경 및 포지션 변경.
		 * 이전 카메라 설정 : _backgroundCamera = new THREE.Camera();
		 */
		_backgroundCamera = new THREE.PerspectiveCamera( 33, STAGE_WIDTH / STAGE_HEIGHT, 1, 10000 );//new THREE.Camera();

		var dist = STAGE_HEIGHT / ( 2 * Math.tan( _backgroundCamera.fov * Math.PI / 360 ) );
		_backgroundCamera.position.set( 0, 0, dist );
		_backgroundCamera.lookAt(_backgroundScene.position);
		_backgroundScene.add( _backgroundCamera );
		_backgroundScene.add( _background );
		
		// set basic light
		_setLight();
		
		// 테스트 컨트롤러
		_setThreeControls();
		
		// 모니터링
		_setMonitor();
		
		// 보드 생성
		_addBoard();
		
		
		// 해. 달 만듦
		_makePlanet('day');
		_makePlanet('night');
		
		// 해 또는 달
		_addPlanet();
		
		// UX 이벤트
		_setGesture();
		
		// VFX 효과 초기화.
		_initVFX();
		
		// 3D 화면 시작.
		_start3D();
	}
	
	/**
	 * Light 설정.
	 */
	function _setLight(){
        
        var amc = {ambientColor:0xffffff, intensity:1 };
        var amb = new THREE.AmbientLight( amc.ambientColor, amc.intensity);
        _scene.add( amb );
        
        var bgAmb = new THREE.AmbientLight( amc.ambientColor, amc.intensity);
        _backgroundScene.add( bgAmb );
        
        /**
		 * 사용안함.
        var dmc = { directionalLightColor : 0x000000, directionalLightIntensity:0 };
        var light = new THREE.DirectionalLight( dmc.directionalLightColor, dmc.directionalLightIntensity );
        light.position.set( 0, 20, 0 ).normalize();
        _scene.add( light );
		*/
    }
    
	/**
	 * 컨트롤 설정
	 */
    function _setThreeControls(){
    	_controls = new THREE.OrbitControls( _camera, _renderer.domElement );
    	_controls.zoomSpeed = 0.5;
    	_controls.rotateSpeed = 0.5;
		//
    	/* 카메라 포지션 조정을 위한 개발 코드
    	var gui = new dat.GUI();
    	gui.add(_camera.position, 'x', -100.00, 100.00).step(0.01).listen();
	    gui.add(_camera.position, 'y', -100.00, 100.00).step(0.01).listen();
	    gui.add(_camera.position, 'z', -100.00, 100.00).step(0.01).listen();
	    gui.add(_camera, 'zoom', 0.00, 10.00).step(0.01).listen().onChange( _camera.updateProjectionMatrix );
	    //gui.add(_camera, 'fov', 1.00, 100.00).step(0.01).listen().onChange( _camera.updateProjectionMatrix );
    	
    	_controls.addEventListener( 'change', function(){
    		console.log( _camera.position );
    		console.log( _camera.zoom );
    		console.log( _camera.fov );
    	} );
    	//*/
    }
    
	/**
	 * FPS 모니터링 추가 함수. 
	 * VARS.isDebug=true일때 화면에 표시함.
	 * Stat.js 
	 */
    function _setMonitor(){
    	if( !VARS.isDebug ){
    		return;
    	}
        // monitor
        _stats = new Stats();
        _stats.domElement.style.position = 'absolute';
        _stats.domElement.style.top = '0px';
        _container.appendChild( _stats.domElement );
    }
	
	/**
	 * 보드를 구성하고 scene에 추가한다.
	 */
	function _addBoard(){
		var res = R.assets.resourceMtlList,
			suffix = '_' + VARS.ampm;
		_board = R.assets.resourceObjList['board'];
		//
		_board.traverse( function( child ){
			if ( child instanceof THREE.Mesh ) {
				if( res[child.name + suffix] ){
					child.material = res[child.name + suffix];
				}else{
					child.material = res['tree' + suffix];
				}
			}
		} );
		//
		_scene.add( _board );
	}
	
	
	/**
	 * 해, 달을 만듦.
	 * @param ampm {String} day/night
	 */
	function _makePlanet( ampm ){
		var type, pos, obj, mtl, rotation,
			startPosition;
		//
		if( ampm=='day' ){
			type = 'sun';
			rotation = { x:0, y:0, z:0 };
			pos = {x:0, y:5, z:-15};
		}else{
			type = 'moon';
			rotation = { x:0, y:1.6, z:-0.56 };
			pos = {x:15, y:5, z:0};
		}
		startPosition = $.extend(true, pos, {y:pos.y-3});
		
		if( _planets[ampm] === undefined ){
			obj = R.assets.resourceObjList[type];
			mtl = R.assets.resourceMtlList['sun_moon'].clone();
			if( !obj || !mtl ){
				return;
			}
			//
			_planets[ampm] = obj;
			_planets[ampm].name = type;
			_planets[ampm].position.copy( startPosition );
			_planets[ampm].traverse( function(child){
				if( child instanceof THREE.Mesh ){
					child.material = mtl;
					child.material.opacity = 0;
					child.material.transparent = true;
					child.rotation.x = rotation.x;
					child.rotation.y = rotation.y;
					child.rotation.z = rotation.z;
				}
			} );
			_scene.add( _planets[ampm] );
		}
	}
	
	/**
	 * _makePlanet함수에서 생성/추가 한 해/달을 화면에 tween으로 표시.
	 */
	function _addPlanet(){
		var pos,startPosition, endPosition,
			ampm = VARS.ampm;
		//
		if( ampm=='day' ){
			pos = {x:0, y:5, z:-15};
		}else{
			pos = {x:15, y:5, z:0};
		}
		startPosition = $.extend(true, {opacity:0}, pos, {y:pos.y-3});
		endPosition = $.extend(true, {opacity:1}, pos);
		
		if( _planet !== undefined && _planet !== null ){
			_removePlanet( _planet, startPosition );
		}
		//
		_planet = _planets[ampm];
		_planet.visible = true;
		_onAddTween( _planet, startPosition, endPosition, 1000, TWEEN.Easing.Exponential.Out );
	}
	
	/**
	 * 해/달 화면에서 보이지 않게 처리.
	 * @param obj {Object} 해또는달 Object3D
	 * @param startPosition {Object} 포지션 객체
	 */
	function _removePlanet( obj, startPosition ){
		obj.visible = false;
		obj.position.copy( startPosition );
		obj.traverse( function(child){
			if( child instanceof THREE.Mesh ){
				child.material.opacity = 0;
			}
		} );
	}

	/**
	 * 특수효과 초기화
	 */
	function _initVFX(){
		_effect = require( 'effect' );
		_effect.init( _scene, _camera, _backgroundScene );
	}
	
	/**
	 * 3D 시작.
	 */
	function _start3D(){
		_clock = new THREE.Clock();
		
		// add
		_container.appendChild( _renderer.domElement );
		
		// background 만 먼저 랜더링시킴
		_backgroundRender();
		
		// start render
		_enterframe();
		
		// 게임시작 준비완료 명령.
		Nori.Commands.callCmd( 'readyPlay' );
	}
	
	/**
	 * 랜더링의 animationframe 중지
	 */
	function _removeEnterfame(){
		clearTimeout( _fpsTimer );
		cancelAnimationFrame( _requestTimer );
	}
	
	/**
	 * animationframe 함수.
	 */
	function _enterframe(){
		if( _camera === undefined || _renderer === undefined || _scene === undefined ){
			return;
		}
		//
		_fpsTimer = setTimeout( function(){
			_removeEnterfame();
			_requestTimer = requestAnimationFrame( _enterframe );
			_render();
			if( !!_effect ){
				_effect.render( _clock.getDelta() );
			}
		}, FPS);
	}
	
	/**
	 * 배경 렌더러
	 */
	function _backgroundRender(){
		_camera.lookAt( _scene.position );
		_renderer.clear();
		_renderer.render( _backgroundScene, _backgroundCamera );
	}
	
	/**
	 * 일반 렌더러
	 */
	function _render( onlyBg ){
		TWEEN.update();
		_camera.lookAt( _scene.position );
		_renderer.clear();
		_renderer.render( _backgroundScene, _backgroundCamera );
		_renderer.clearDepth();
		_renderer.render( _scene, _camera );
		//
		if( VARS.isDebug && !!_stats ){
			_stats.update();
		}
	}
	
	/**
	 * 낮/밤 변경시
	 */
	function _onChangeTime(){
		var time = time || 250;
		var easing = easing || TWEEN.Easing.Exponential.In;
		//
		_changeBg();
		_changeBoardTimeTexture();
		_changeBlockTimeTexture();
		_changeFire();
		_addPlanet();
	}

	/**
	 * 낮/밤 변경시, 촛불 켜거나 끄기
	 */
	function _changeFire(){
		if( VARS.ampm == 'day' ){
			_effect.removeAllFire();
		}else{
			//
			var block, bpos, large, id;
			for( id in _addedFireBlockList ){
				block = _addedFireBlockList[id];
				if( !!block && !block.userData.isTween ){
					bpos = block.position;
					large = block.userData.large;
					var x = bpos.x,
						y = new THREE.Box3().setFromObject( block ).max.y,
						z = bpos.z;
					//
					// 밤일때만 불켬
					if( large ){
						_effect.addFire( large, 'fire_1_'+block.name, x-0.02, y-0.06, z-0.28 );
						_effect.addFire( large, 'fire_2_'+block.name, x+0.42, y-0.04 , z+0.16 );
					}else{
						_effect.addFire( large, 'fire_1_'+block.name, x-0.01, y-0.06, z-0.14 );
						_effect.addFire( large, 'fire_2_'+block.name, x+0.21, y-0.04 , z+0.08 );
					}
				}
			}
		}
	}

	/**
	 * 낮/밤 변경시 배경 변경.
	 */
	function _changeBg(){
		_background.traverse( function( child ){
			if ( child instanceof THREE.Mesh ) {
				var name = 'background_'+ (VARS.ampm=='day'? 'day' : 'night'),
					bgMtl = R.assets.resourceMtlList[name];
				//
				if( !!bgMtl ){
					bgMtl.map.minFilter = THREE.LinearFilter;
					child.material = bgMtl;
				}
			}
		} );
		//
		/* 이전코드 :: css 배경핸들링
		if( VARS.ampm == 'day' ){
			$('.play-scene-bg-day').show();
			$('.play-scene-bg-night').hide();
		}else{
			$('.play-scene-bg-night').show();
			$('.play-scene-bg-day').hide();
		}
		//*/
	}
	
	/**
	 * 낮/밤 변경시 보드 텍스쳐 변경.
	 */
	function _changeBoardTimeTexture(){
		if( !_board ){
			return;
		}
		//
		var res = R.assets.resourceMtlList,
			suffix = '_' + VARS.ampm;
		//
		_board.traverse( function( child ){
			if ( child instanceof THREE.Mesh ) {
				if( res[child.name + suffix] ){
					child.material = res[child.name + suffix];
				}else{
					child.material = res['tree' + suffix];
				}
			}
		} );
	}
	
	/**
	 * 낮/밤 변경시 블럭의 텍스쳐 변경
	 */
	function _changeBlockTimeTexture(){
		var id, block, mtlPrefix, mtl, 
			res = R.assets.resourceMtlList;
		for( id in _addedBlockList ){
			block = _addedBlockList[id];
			if( block instanceof THREE.Object3D ){
				mtlPrefix = block.userData.mtlPrefix;
				block.traverse( function( child ){
					if ( child instanceof THREE.Mesh ) {
						mtl = res[mtlPrefix + ( block.userData.led? '_LED_' : '_' ) + VARS.ampm];
						if( mtl ){
							child.material = mtl;
						}
					}
				} );
			}
		}
	}
	
	/** String.fromCharCode
	 * ascii 48~57 => 0~9 
	 * ascii 65~90 => A~Z
	 * ascii 97~122 => a~z
	 * 
	 * blockState : 49(add), 50(remove)
	 * blockType : 71(G)
	 * led : data[0] : 49(on), 50(off)
	 * position({}) : {x:50, y:55, z:49}
	 *  가로 : x
	 *  세로 : y -> z
	 * 	높이 : z -> y
	 * 
	 * @param data {Object} {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	 * @param iscall {boolean} true/false 소켓전송여부.
	 *  */
	function _onChangeBlock( data, iscall ){
		var blockState = String.fromCharCode( data.blockState ),
			typeCode = parseInt( data.blockType ),
			led = ( parseInt( data.data[0] ) - 48 ) == 1 ? true : false,
			cx = parseInt( data.position.x ) - 48,
			cy = parseInt( data.position.z ) - 48,
			cz = parseInt( data.position.y ) - 48,
			chkExp = new RegExp('^'+typeCode+'\\s|\\s'+typeCode+'\\s|\\s'+typeCode+'$');
		//
		switch( blockState ){
			case '1' : // add
				if( typeCode === 83 && _checkAddedBlock(cx, cy, cz) ){
					_setProximity(parseInt(data.data[7]) - 48);
				}else{
					//_addBlock( cx, cy, cz, typeCode, led, data, false );
					//* 지붕일 경우, 큰 블럭 사용여부에 대한체크
					if( cy > 1 && chkExp.test( '98 103 105 111 121 118 114' ) ){
						if( data.large ){
							_checkLargeData( data );
							_addBlock( cx, cy, cz, typeCode, led, data, data.large );
						}else{
							_checkRoofBlock( cx, cy, cz, typeCode, led, data );
						}
					}else{
						_addBlock( cx, cy, cz, typeCode, led, data, false );
					}
					//*/
				}
			break;
			case '2' : // remove
				if(!!_addedDepthList[cy]){
					var seqIdx = _getSeqIndex(cx, cz);
					if( !!_addedDepthList[cy][seqIdx] ){
						_removeRoofBlock( cx, cy, cz, seqIdx );
					}else{
						_removeBlock( cx, cy, cz );
					}
				}else{
					_removeBlock( cx, cy, cz );
				}
			break;
			case '3' : // change : 큰것은 4개 다 라이트 처리 필요.
				var id = _getBlockId( cx, cy, cz ),
				block = _addedBlockList[id],
				large = false;
				// 큰블럭일때
				if( !!block && block.userData.large ){
					var roofInfo = _addedDepthList[cy][_getSeqIndex( cx, cz )],
						startIdx = roofInfo.startIdx;
					large = true;
				}
				//
				if( !!block && !!block.userData && block.userData.led !== led ){
					_changeBlockLedState( cx, cy, cz, led );
					data.blockState = 49;
					//
					if( large ){
						var seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ],
							i=0, prop;
						for( ;i<seqArr.length;i+=1 ){
							prop = _addedDepthList[cy][seqArr[i]];
							_sendChangeLed( prop.data, led );
						}
					}else{
						_sendChangeLed( data, led );
					}
				}
			break;
			default :  
			break;
		}
		//
		if( iscall ){
			var sendData;
			if( blockState === '3' ){
				sendData = $.extend( true, {}, data, {blockState:51} );
			}else{
				sendData = data;
			}
			Nori.Commands.callCmd( 'sendSocket', window.webapp.MOBLO_CHANGE_BLOCK, sendData );
		}
	}

	/**
	 * 소켓을통해 큰블럭추가 명령 전달시 생성된 뎁스별 데이터가없음.
	 * 뎁스별 데이터 생성시킴.
	 * @param data {Object} {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	 */
	function _checkLargeData( data ){
		var blockState = String.fromCharCode( data.blockState ),
			typeCode = parseInt( data.blockType ),
			led = ( parseInt( data.data[0] ) - 48 ) == 1 ? true : false,
			cx = parseInt( data.position.x ) - 48,
			cy = parseInt( data.position.z ) - 48,
			cz = parseInt( data.position.y ) - 48,
			startIdx = _getSeqIndex( cx, cz ),
			list = _addedDepthList[cy] = _addedDepthList[cy] || {},
			seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ],
			id, x, z, prop;
			//
		seqArr.forEach( function( seqIdx, i ){
			z  = Math.floor(seqIdx / COORDS_X_SIZE )+1;
			x = seqIdx % COORDS_X_SIZE;
			id = _getBlockId(x, cy, z);
			prop = $.extend(true, {}, data, {position:{x:x+48, y:z+48, z:cy+48}});
			list[seqIdx] = {id:id, cx:x, cy:cy, cz:z, typeCode:typeCode, led:led, data:prop, large:true, startIdx:startIdx};
		} );
	}

	/**
	 * 지붕 블럭 삭제
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @param seqIdx {Number} 블럭의 층별 시퀀스 좌표.
	 */
	function _removeRoofBlock( cx, cy, cz, seqIdx){
		var list = _addedDepthList[cy],
			block;
		//
		if( list[seqIdx] === undefined || list[seqIdx] === null || list[seqIdx].large !== true ){
			_removeBlock( cx, cy, cz );
			delete _addedDepthList[cy][seqIdx];
			return;
		}


		var startIdx = list[seqIdx].startIdx,
			seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ],
			i=0, len=seqArr.length, idx,
			prop = list[startIdx],
			isLed = false;
		// 큰블럭삭제
		block = _addedBlockList[ _getBlockId( prop.cx, prop.cy, prop.cz ) ];
		isLed = block.userData.led;
		_removeBlock( prop.cx, prop.cy, prop.cz, true );
		

		// 작은블럭 다시 추가.
		for( ;i<len;i+=1 ){
			var idx = seqArr[i],
				prop = list[idx];
			//
			if( seqIdx === idx ){
				_restoreBlock( prop.cx, prop.cy-1, prop.cz );
				delete _addedDepthList[cy][seqIdx]
			}else{
				prop.large = false;
				prop.startIdx = -1;
				prop.data.position.x = prop.cx + 48;
				prop.data.position.y = prop.cz + 48;
				prop.data.position.z = prop.cy + 48;
				prop.led = isLed;
				//_addBlock( prop.cx, prop.cy, prop.cz, prop.typeCode, prop.led, prop.data, false );
				_checkRoofBlock( prop.cx, prop.cy, prop.cz, prop.typeCode, prop.led, prop.data );
			}
		};
	}

	/**
	 * 지붕 블럭 추가시 큰것으로 만들기 위해 체크 후 add
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @param typeCode {Number} 보드타입 코드
	 * @param led {Boolean} LED 여부
	 * @param data {Object} {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	 */
	function _checkRoofBlock( cx, cy, cz, typeCode, led, data ){
		if( _addedDepthList[cy] === undefined || _addedDepthList[cy] === null ){
			// 체크할게 없음
			_addBlock( cx, cy, cz, typeCode, led, data, false );
			return false;
		}
		var seqIdx = _getSeqIndex( cx, cz ), 
			list = _addedDepthList[cy],
			id = _getBlockId(cx, cy, cz),
			chkArr = [true, true, true, true],
			chkPoints = [
				// 왼쪽에서 오른쪽 방향
				seqIdx-1,
				// 자기위치 오른쪽방향
				seqIdx,
				// 왼쪽아래에서 오른쪽방향
				seqIdx-COORDS_X_SIZE-1,
				// 아래 오른쪽방향
				seqIdx-COORDS_X_SIZE
			];
		// 체크를 위해 넣음.
		list[seqIdx] = {id:id, cx:cx, cy:cy, cz:cz, typeCode:typeCode, led:led, data:data, large:false, startIdx:-1};

		// 왼쪽끝 : 2, 4 ( 1, 3 )
		if( cx < 2 ){
			chkArr[0] = false;
			chkArr[2] = false;
		}
		// 오른쪽끝 : 1, 3 ( 2, 4 )
		if( cx >= COORDS_X_SIZE   ){
			chkArr[1] = false;
			chkArr[3] = false;
		}
		// 상단끝 : 3, 4 ( 1, 2 )
		if( cz >= COORDS_Z_SIZE ){
			chkArr[0] = false;
			chkArr[1] = false;
		}
		// 하단끝 : 1, 2 ( 3, 4 )
		if( cz < 2 ){
			chkArr[2] = false;
			chkArr[3] = false;
		}

		/*
		┌───┬───┐
		│ C │ D │
		├───┼───┤
		│ A │ B │
		└───┴───┘
		A = startIdx
		B = startIdx+1
		C = startIdx+COORDS_X_SIZE
		D = startIdx+COORDS_X_SIZE+1
		*/
		var i=0, len=chkArr.length, startIdx, state = false, 
			seqArr,
			j=0, prop;
		for(;i<len;i+=1){
			if( chkArr[i] ){
				startIdx = chkPoints[i]; // 왼쪽 하단번호
				seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ];
				state = _checkLargeSet( list[ startIdx ] ) &&
				_checkLargeSet( list[ startIdx+1 ] ) &&
				_checkLargeSet( list[ startIdx+COORDS_X_SIZE] ) &&
				_checkLargeSet( list[ startIdx+COORDS_X_SIZE+1] );
				
				if( state ){
					state = _checkLargeTypeCode( list, seqArr );
				}

				if( state ){ // 조건이 맞을 경우.
					for( ;j<seqArr.length;j+=1 ){
						prop = list[seqArr[j]];
						prop.large = true;
						prop.startIdx = startIdx;
					}
					break;
				}
			}
		}

		if( state === false ){
			_addBlock( cx, cy, cz, typeCode, led, data, false );
		}else{
			var z  = Math.floor(startIdx / COORDS_X_SIZE )+1,
				x = startIdx % COORDS_X_SIZE,
				block;
			// 기존블럭제거.
			i=0, len = seqArr.length;
			for( ;i<seqArr.length;i+=1 ){
				prop = list[seqArr[i]];
				prop.led = false;
				_sendChangeLed( prop.data, false );
				_removeBlock( prop.cx, prop.cy, prop.cz );

			}
			// 큰 블럭 추가, 포지션은 좌측 하단 블럭으로 맞춤. 
			//*
			var largeData = $.extend( true, {}, data );
			largeData.position.x = x + 48;
			largeData.position.y = z + 48;
			largeData.position.z = cy + 48;
			//*/
			_addBlock( x, cy, z, typeCode, led, largeData, true );
		}

		return startIdx;
	}

	/**
	 * 같은타입인지 체크
	 * @param list {Object} 층별 추가된 블럭데이터
	 * @param seqArr {Array} 체크할 seqIdx 리스트
	 * @return {boolean} true : 같은타입
	 */
	function _checkLargeTypeCode( list, seqArr ){
		var type = '', state=false, i=0;
		while( i<4 ){
			if( type === '' ){
				type = list[seqArr[i]].typeCode;
			}else{
				if( type !== list[seqArr[i]].typeCode ){
					state = false;
					break;
				}else{
					state = true;
				}
			}
			//
			i++;
		}
		//
		return state;
	}

	/**
	 * 큰블럭에 포함된 데이터인지 체크
	 * @param obj {Object} roof 블럭별 데이터.
	 * @return {Boolean} true : large
	 */
	function _checkLargeSet( obj ){
		if( obj===undefined || obj===null ){
			return false;
		}else{
			 if( obj.large ){
				 return false;
			 }
		}
		//
		return true;
	}

	/**
	 * 근접센서 블럭
	 * 블럭위에 물체를 올리면 0-2 반복
	 * 아무것도 없을때 주변영향을 받는지 5-6 반복되는 오작동 있음.
	 * 9센치 이상이면 0
	 * 9센치 이하이면 9부터 숫자 출력됨.
	 * @param delta {Number} 센서에서 전달받은값 (range : 0-9)
	 */
	function _setProximity( delta ){
		if( delta <= 2 ){
			// 불 크기 원래크기로 변경.
			_effect.controlsFire( 1 );
		}else{
			// 불 크기 조정
			_effect.controlsFire( delta );
		}
	}

	/**
	 * 해당 좌표에 블럭있는지
	 * true : 블럭있음.
	 * false : 블럭없음.
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 */
	function _checkAddedBlock( cx, cy, cz ){
		var id = _getBlockId( cx, cy, cz );
		if( _addedBlockList[id] !== undefined || _checkOutPosition( cx, cy, cz ) ){
			return true; 
		}
		return false;
	}

	/**
	 * 해당 좌표 하단에 블럭있는지
	 * true : 블럭 있음.
	 * false : 블럭 없음.
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 */
	function _checkLowerBlock( cx, cy, cz ){
		if( cy === 1){
			return true;
		}
		var id = _getBlockId( cx, cy-1, cz );
		if( _addedBlockList[id] !== undefined || _checkOutPosition( cx, cy, cz ) ){
			return true; 
		}
		return false;
	}
	
	/**
	 * 블럭 생성.
	 * x, y, z ( 전달받은 blooth 데이터의 ASCII 값을 변환한후, y, z 좌표를 바꾼 값 )
	 * typeCode 블럭 타입(3D, 조형)의 ASCII 값
	 * led LED 상태값, true|false
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @param typeCode {Number} 보드타입 코드
	 * @param led {Boolean} LED 여부
	 * @param data {Object} {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	 * @param large {Boolena} 큰블럭 생성여부 
	 *  */
	function _addBlock( cx, cy, cz, typeCode, led, data, large ){
		// test code
		//if(typeCode==118) large = true;
		//
		var typeInfoList = VARS.blockTypeCodeList,
			id = _getBlockId( cx, cy, cz ),
			bname, name, blockProp, typestr,
			ledstr = led? '_LED' : '';
		// 블럭이 이미 있거나, 하단의 블럭이 없으면 코드 실행안함.
		if( _checkAddedBlock(cx, cy, cz) || !_checkLowerBlock(cx, cy, cz) ){
			return;
		}
		
		// 사용가능한 블럭 코드인지 확인
		if( typeInfoList[ typeCode+'' ] === undefined ){
			return;
		}
		
		// 블럭 색상
		blockProp = typeInfoList[ typeCode+'' ].disc;
		//
		// 65~90 => A~Z
		// 97~122 => a~z
		var chkExp = new RegExp('^'+typeCode+'\\s|\\s'+typeCode+'\\s|\\s'+typeCode+'$');
		if( chkExp.test( '66 71 73 79 89 86 82' ) ){ // 3D 블럭.
			typestr = '3d';
			name = typestr + '_' + blockProp;
			name += ( cy > 1 )? '_wall' : '_door';
			bname = name;// + '_door';
			
		}else if( chkExp.test( '98 103 105 111 121 118 114' ) ){ // 조형블럭
			typestr = 'mould';
			name = typestr + '_' + blockProp;
			name += ( cy > 1 )? '_roof' : '';
			bname = name;
		}else if( typeCode === 83 ){ // 근접센서 블럭
			typestr = 'sensor';
			name = 'sensor_proximity';
			bname = name;
		}

		var suffix = ledstr + '_' + VARS.ampm, 
			block = R.assets.resourceObjList[ bname ],
			endPosition = _getBlockPosition( cx, cy, cz, large ),
			startPosition = _getBlockPosition( cx, cy+3, cz, large );

		if( typestr === 'sensor' ){
			suffix = '';
		}
			
		//
		startPosition.opacity = 0;
		endPosition.opacity = 1;

		if( block === undefined ){
			return;
		}

		block = block.clone();
		block.name = id;
		block.position.copy( startPosition );
		block.userData.isTween = false;
		block.userData.typeCode = typeCode;
		block.userData.type = typestr; // 3d|mould
		block.userData.led = led;// led on/off true|false
		block.userData.json = JSON.stringify(data); // 원본데이터 문자열
		block.userData.mtlPrefix = name;
		block.userData.large = large;
		block.traverse(function( child ){
			if ( child instanceof THREE.Mesh ) {
				if( typestr === '3d' ){
					var copy = child.geometry.clone();
					child.geometry = copy;
				};
				// 테스트용 모델링 : 좌표계가달라 재 설정.
				if( typestr === 'sensor' ){
					child.rotation.x = -1.6;
					child.position.y = 0.6289436988430879;
				}
				//
				child.material = R.assets.resourceMtlList[ name + suffix ].clone();
				child.material.opacity = 0;
				child.material.transparent = true;
				//
				_castObjectIndexs[child.uuid] = _castObjects.length;
				_castObjects.push(child);
			}
		});
		
		if( large ){
			val = 2;
		}else{
			val = 1;
		}

		// 모델링이 잘못되어 스케일이 미묘하게 틀어지는 모델이 있어 추가함.
		// 모델링 수정되었으나 혹시몰라 남겨둠.
		if( bname.indexOf( 'mould' ) > -1 && bname.indexOf( 'roof' ) > -1 ){
			var box = new THREE.Box3().setFromObject( block );
			var scale = (BLOCK_X*val) / ( box.max.x - box.min.x );
			block.scale.set( scale, scale, scale );
		}

		// 테스트용 모델링 : 모델링 파일 크기가 달라 크기 변경.
		if( typestr === 'sensor' ){
			var box = new THREE.Box3().setFromObject( block );
			var scale = BLOCK_X / ( box.max.x - box.min.x );
			block.scale.set( scale, scale, scale );
		}
		
		// 추가된 블럭 데이터 저장.
		_addedBlockList[id] = block;
		_addedBlockDatas[id] = _getBlockData( block.userData.json, led, large );

		// 지붕 거대화 체크를 위한 데이터 저장
		//*
		if( cy > 1 &&chkExp.test( '98 103 105 111 121 118 114' ) ){
			var seqIdx = _getSeqIndex(cx, cz);
			_addedDepthList[cy] = _addedDepthList[cy] || {};
			//cx, cy, cz, typeCode, led, data, large
			if( large ){
				_addedDepthList[cy][seqIdx] = {id:id, cx:cx, cy:cy, cz:cz, typeCode:typeCode, led:led, data:data, large:large, startIdx:seqIdx};
			}else{
				_addedDepthList[cy][seqIdx] = {id:id, cx:cx, cy:cy, cz:cz, typeCode:typeCode, led:led, data:data, large:large, startIdx:-1};
			}
		}
		//*/

		// 불효과를 위한 데이터 저장
		if( name === 'mould_purple_roof' ){
			_addedFireBlockList[id] = block;
		}
		_scene.add( block );
		
		
		//Nori.SoundManager.getSound( 'attachedBlock' ).start();
		_onAddTween( block, startPosition, endPosition );
	}


	/**
	 * 저장할 블럭데이터를 json 문자열로 반환.
	 * @param json {String} 블럭데이터
	 * @param led {Boolean} true/false
	 * @param large {Boolean} true/false 큰블럭여부 
	 * @return json string {String}
	 */
	function _getBlockData( json, led, large ){
		var obj = JSON.parse( json );
		obj.data[0] = led? 49 : 50;
		obj.large = large;
		return JSON.stringify( obj );
	}
	
	/**
	 * 블럭추가시 트윈 움직임
	 * @param block {Object} THREE Object3D
	 * @param startPosition {Object} {x,y,z}
	 * @param endPosition {Object} {x,y,z}
	 * @param time {Number} 움직임시간 default 250
	 * @param easing {String} transition 타입 default TWEEN.Easing.Exponential.In
	 */
	function _onAddTween( block, startPosition, endPosition, time, easing ){
		time = time || 250;
		easing = easing || TWEEN.Easing.Exponential.In;
		//
		
		var isblock = false,
			iscut = false,
			large = block.userData.large;
		if( block.userData.type==='3d' || block.userData.type==='mould' ){
			isblock = true;
			var coords = _getBlockCoordsById( block.name );
			if( coords.cy > 1 ){
				iscut = true;
			}
		}
		// onComplete 에서 실행할 경우 easing 텀으로 인해 오작동.
		if( iscut ){
			if( large ){ // 큰블럭일때 성벽 제거.
				var startIdx = _getSeqIndex(coords.cx, coords.cz),
					seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ],
					list = _addedDepthList[coords.cy],
					i = 0, len = seqArr.length, prop;
				//
				for(;i<len;i+=1){
					prop = list[seqArr[i]];
					_cutBlock( prop.cx, prop.cy-1, prop.cz );
				}
			}else{
				_cutBlock( coords.cx, coords.cy-1, coords.cz );
			}
		}
		block.userData.isTween = true;
		new TWEEN.Tween( startPosition )
		.to( endPosition, time )
		.easing( easing )
		.onUpdate(function(){
			var prop = this;
			block.position.copy( {x:prop.x, y:prop.y, z:prop.z} );
			block.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material.opacity = prop.opacity;
				}
			});
		})
		.onComplete(function(){
			if( isblock ){
				Nori.SoundManager.getSound( 'attachedBlock' ).start();

				if( block.userData.mtlPrefix === 'mould_purple_roof' ){
					var bbox = new THREE.Box3().setFromObject( block ),
						bpos = block.position;
						
					var x = bpos.x,
						y = bbox.max.y,
						z = bpos.z;
					//
					if( large ){
						_effect.quake();
					}
					
					// 밤일때만 불켬
					if( VARS.ampm === 'night' ){
						if( large ){
							// 작은것들 불 없애고 큰것 불켬.

							var startIdx = _getSeqIndex( coords.cx, coords.cz ),
								seqArr = [ startIdx, startIdx+1, startIdx+COORDS_X_SIZE, startIdx+COORDS_X_SIZE+1 ],
								i=0, prop;
							//
							for( ;i<seqArr.length;i+=1 ){
								prop = _addedDepthList[coords.cy][seqArr[i]];
								_effect.removeFire( 'fire_1_'+prop.id );
								_effect.removeFire( 'fire_2_'+prop.id );
							}
							
							_effect.addFire( large, 'fire_1_'+block.name, x-0.02, y-0.06, z-0.28 );
							_effect.addFire( large, 'fire_2_'+block.name, x+0.42, y-0.04 , z+0.16 );
						}else{
							_effect.addFire( large, 'fire_1_'+block.name, x-0.01, y-0.06, z-0.14 );
							_effect.addFire( large, 'fire_2_'+block.name, x+0.21, y-0.04 , z+0.08 );
						}
					}
				}
				block.userData.isTween = false;
			}
		})
		.start();
	}
	
	/**
	 * 블럭제거
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @param large {Boolean} 삭제할 블럭이 큰블럭인지 여부.
	 */
	function _removeBlock( cx, cy, cz, large ){
		var id = _getBlockId( cx, cy, cz ),
			block = _addedBlockList[id],
			idx, uuid;
		//
		// 블럭이 있는지확인.
		if( block === undefined || block === null ){
			return;
		}
		var typeCode = block.userData.typeCode;
		Nori.SoundManager.getSound( 'removeBlock' ).start();

		var isfire = block.userData.mtlPrefix === 'mould_purple_roof';
		
		if( isfire ){
			_effect.removeFire( 'fire_1_'+block.name );
			_effect.removeFire( 'fire_2_'+block.name );
		}

		if( typeCode === 83 ){
			_setProximity(0);
		}

		block.traverse(function(child){
			if( child instanceof THREE.Mesh ){
				uuid = child.uuid;
				idx = _castObjectIndexs[uuid];
				_castObjects.splice( idx, 1 );
				
			}
		});
		
		// TODO :: 인덱스가 변경되어 새로 리스트를 만듦 개선필요.
		_castObjectIndexs = {};
		_castObjects.forEach( function( item, i ){
			_castObjectIndexs[item.uuid] = i;
		} );
		//
		if( cy > 1 ){
			_restoreBlock( cx, cy-1, cz );
		}

		_scene.remove( block );
		delete _addedBlockList[ id ];
		delete _addedBlockDatas[id];
		//
		if(  isfire ){
			delete _addedFireBlockList[ id ];
		}
	}
	
	/**
	 * 3D 블럭의 모델링 윗부분에 성벽같은 부분이 다른 블럭이 위로 올라갈경우
	 * 중간이 비어보여 윗쪽으로 블럭이 추가될때 윗쪽 부분 좌표를 아래로 내림.
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 */
	function _cutBlock( cx, cy, cz ){
		var id = _getBlockId( cx, cy, cz ),
			block = _addedBlockList[id],
			cuts, min;
		//
		if( block === undefined ){
			return;
		}else{
			if( block.userData.type !== '3d' ){
				return;
			}
		}
		cuts = block.userData.cuts;
		min = 1;
		
		if( cuts === undefined ){
			cuts = [];
			//
			block.traverse(function( child ){
				if ( child instanceof THREE.Mesh ) {
					var a = child.geometry.attributes.position.array,
						i=1, len=a.length, n;
					for( ;i<len;i+=3 ){
						n = a[i];
						if( n>1 ){
							cuts[i] = n;
							a[i] = min;
						}
					}
					block.userData.cuts = cuts;
					child.geometry.attributes.position.needsUpdate = true;
				}
			});
		}else{
			block.traverse(function( child ){
				if ( child instanceof THREE.Mesh ) {
					var a = child.geometry.attributes.position.array,
					i=1, len=cuts.length, n;
					//
					for( ;i<len;i+=3 ){
						n = cuts[i];
						if( !!n ){
							a[i] = min;
						}
					}
					child.geometry.attributes.position.needsUpdate = true;
				}
			});
		}
	}
	
	/**
	 * 3D블럭 위의 블럭이 제거될경우 제거했던 성벽 모양을 복구.
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 */
	function _restoreBlock( cx, cy, cz ){
		var id = _getBlockId( cx, cy, cz ),
			block = _addedBlockList[id],
			cuts;
			
		if( !!block ){
			if( !block.userData ){
				return;
			}else{
				if( block.userData.type !== '3d' ){
					return;
				}
			}
		}else{
			return;
		}
		cuts = block.userData.cuts;
		if( cuts === undefined ){
			return;
		}
		//
		block.traverse(function( child ){
			if ( child instanceof THREE.Mesh ) {
				var a = child.geometry.attributes.position.array,
					i=1, len=cuts.length, n;
				//
				for( ;i<len;i+=3 ){
					n = cuts[i];
					if( !!n ){
						a[i] = n;
					}
				}
				child.geometry.attributes.position.needsUpdate = true;
			}
		});
	}
	
	/**
	 * LED 변경
	 * @param x {Number} 보드상 x 좌표 (1부터시작)
	 * @param y {Number} 보드상 y 좌표 (1부터시작)
	 * @param z {Number} 보드상 z 좌표 (1부터시작)
	 *  */
	function _changeBlockLedState( x, y, z, led ){
		var id = _getBlockId( x, y, z ),
			block = _addedBlockList[id],
			catefilter = '3d mould';
		//
		if( !block || catefilter.indexOf( block.userData.type ) < 0 ){
			return;
		}
		
		if( block.userData.led === led ){
			return;
		}
		
		var udata = block.userData,
			ledstr = led? '_LED' : '',
			name = block.userData.mtlPrefix + ledstr + '_' + VARS.ampm,
			material = R.assets.resourceMtlList[ name ].clone();
		//
		
		block.userData.led = led; 
		block.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = material;
			}
		} );

		_addedBlockDatas[id] = _getBlockData( block.userData.json, led, block.userData.large );
	}
	
	/**
	 * 블럭이 놓여질 위치를 반환한다.
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @param large {Boolean} 큰블럭인지 여부.
	 * @return {Object} 좌표 오브젝트.
	 *  */
	function _getBlockPosition( cx, cy, cz, large ){
		// 큰블럭은 위치가 다름.
		var val = large? 0.5 : 0;
		return {
			x : BOARD_POS_X + ( BLOCK_X * (cx-_blockPosVal+val) ),
			y : BOARD_POS_Y + ( BLOCK_Y * (cy-1) ),
			z : BOARD_POS_Z - ( BLOCK_Z * (cz-_blockPosVal+val) )
		};
	}
	
	/**
	 * 왼쪽 하단에서 1부터 시작되는 시퀀스 번호.
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @return {Number} 층별시퀀스번호
	 */
	function _getSeqIndex( cx, cz ){
		return cx + ((cz-1) * COORDS_X_SIZE);
	}

	/**
	 * 좌표를 이용해 블럭별 ID를 만들어 반환.
	 * 
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @return {String} 블럭 ID
	 */
	function _getBlockId( cx, cy, cz ){
		return 'b_' + cx + '_' + cy + '_' + cz;
	}
	
	/**
	 * 블럭의 ID를 좌표로 변경해 좌표객체를 반환.
	 * @param id {String}
	 * @return {Object} 좌표 오브젝트. {cx, cy, cz}
	 */
	function _getBlockCoordsById( id ){
		var a = id.split('_');
		return { cx:parseInt(a[1]), cy:parseInt(a[2]), cz:parseInt(a[3]) };
	}
	
	/**
	 * 블럭추가시 보드판 크기를 벗어났는지 체크.
	 * @param cx {Number} 보드상 x 좌표 (1부터시작)
	 * @param cy {Number} 보드상 y 좌표 (1부터시작)
	 * @param cz {Number} 보드상 z 좌표 (1부터시작)
	 * @return {Boolean} true : 벗어남.
	 */
	function _checkOutPosition( cx, cy, cz ){
		return cx < 1 || cy < 1 || cz < 1 || cx > COORDS_X_SIZE || cz > COORDS_Z_SIZE;
	};

	/**
	 * 미러링시 추가된 블럭의 데이터 정보를 반환함.
	 * @return {Object} _addedBlockDatas
	 */
	function _getBlockList(){
		return _addedBlockDatas;
	}
	
	
	/**
	 * LED 변경을 보드로 보낸다.
	 * led 파라미터가 sendData 값보다 우선함.
	 * @param sendData {Objedt} 블럭데이터 {"position":{"x":"49", "y":"49","z":"49"},"blockType":"82","blockState":"49","data":["50","49","49","49","49","49","49","49","49"]}
	 * @param led {Boolean} LED상태, true : 켜짐
	 *  */
	function _sendChangeLed( sendData, led ){
		if( VARS.isMirror ){
			return;
		}
		//
		sendData.data[0] = led? 49 : 50;
		sendData.blockState = 49;
		window.webapp.mobloBlockControl( sendData );
	}
	
	/**
	 * 현재 개발된 기능에서 사용안함.
	 * (기능구현중 릴리즈 오픈 , 개발 중단됨)
	 */
	function _onReturnGame(){
		_enterframe();
		$('#canvasBlock').html('').hide();
	}
	
	/**
	 * 현재 개발된 기능에서 사용안함.
	 * (기능구현중 릴리즈 오픈 , 개발 중단됨)
	 * 자동촬영기능.
	 */
	function _onAutoShot(){
		window.webapp.mobloProgress( true );
		//
		R.captureImages = [];
		var imgData = _renderer.domElement.toDataURL("image/jpeg", 1.0);
		var img = new Image();
		img.onload = function(){
			$('#canvasBlock').append( this ).show();
			_autoShot(0);
		};
		img.src = imgData;
	}
	
	/**
	 * 현재 개발된 기능에서 사용안함.
	 * (기능구현중 릴리즈 오픈 , 개발 중단됨)
	 * 자동촬영 개별 캡쳐.
	 */
	function _autoShot(idx){
		idx = idx || 0;
		
		var pos,
		positions = [
			{x:-23, y:20, z:23},
			{x:-35, y:24, z:0},
			{x:0, y:22, z:35}
		];
		
		// 렌더링중지
		_removeEnterfame();
		
		// 위치이동 및 렌더링
		pos = positions[idx];
		_camera.position.set( pos.x, pos.y, pos.z );
		_render();
		
		// 이미지 추출
		var imgData = _renderer.domElement.toDataURL("image/jpeg", 1.0);
		
		// 저장
		R.captureImages.push( imgData );
		//
		
		// 다음 호출.
		idx++;
		if( idx == 3 ){
			//
			_camera.position.set( -23, 20, 23 );
			_render();
			setTimeout(function(){
				Nori.Commands.callCmd( 'openAutoShot' );
			}, 100);
			return;
		}
		
		setTimeout( function(){
			_autoShot( idx );
		}, 24 );
		
		
		
		/* 저장시 사용할 코드
		$('body').append( '<img id="test'+idx+'" src="" />' );
		$('#test'+idx).attr('src', imgData);
		var sendData = imgData.replace( /^(data\:)*image\/.*\,/g, '' );
		window.webapp.callNative( 'mobloPutImage', [ex] )
		//*/
	}
	
	/**
	 * 현재 개발된 기능에서 사용안함.
	 * (기능구현중 릴리즈 오픈 , 개발 중단됨)
	 * 홈으로 이동기능
	 */
	function _onGoHome(){
		// 랜더링중지
		_removeEnterfame();
		
		_camera = null;
		_scene = null;
		_renderer = null;
		
		_backgroundScene = null;
		_background = null;
		_backgroundCamera = null;
		
		_requestTimer = 0;
		_fpsTimer = 0;
		_board = null,
		_planet = null,
		_planets = {},
		
		_blockPosVal = 1,
		_addedBlockList = {},
		_addedBlockDatas = {},
		_castObjectIndexs = null,
		_castObjects = null,
		
		_raycaster = null,
		_mouseVec = null,
		
		
		_controls = null,
		_stats = null,
		
		_clock = null;
	}
	
	/**
	 * 드롭 형태 파티클 효과 생성.
	 * @param type {String} 
	 */
	function _effectAddDrop( type ){
		_effect.addDrop(type);
		Nori.Commands.callCmd( 'sendSocket', 'effect', {
			type : type,
			state : true
		} );
	}
	/**
	 * 드롭 형태 파티클 효과 제거.
	 * @param type {String} 
	 */
	function _effectRemoveDrop( type ){
		_effect.removeDrop(type);
		Nori.Commands.callCmd( 'sendSocket', 'effect', {
			type : type,
			state : false
		} );
	}
	/**
	 * 지진효과 시작.
	 */
	function _effectQuack(){
		_effect.quake();
		Nori.Commands.callCmd( 'sendSocket', 'effect', {
			type : 'quake'
		} );
	}
	/**
	 * 불꽃놀이 효과 시작
	 */
	function _effectFireworks(){
		_effect.fireworks();
		Nori.Commands.callCmd( 'sendSocket', 'effect', {
			type : 'fireworks'
		} );
	}

	/**
	 * VFX 파티클 효과 수신.
	 * @param opts {Object} 효과 정보 {type:효과이름, state:true/false}
	 */
	function _effectCall( opts ){
		var type = opts.type;
		switch( type ){
			case 'leaf' :
			case 'flower' :
			case 'snow' :
			case 'rain' :
				if( opts.state ){
					_effect.addDrop(type);
				}else{
					_effect.removeDrop(type);
				}
			break; 
			case 'quake' :
				_effect.quake();
			break; 
			case 'fireworks' :
				_effect.fireworks();
			break; 
		}
	}
	
	
	
	
	return {
		init : function(){
			_setPlayInit();
		},
		getBlockList : _getBlockList,
		setBoardType : _setBoardType,
		cmdChangeTime : function(){
			_onChangeTime();
		},
		cmdChangeBlock : function( data, iscall ){
			_onChangeBlock( data, iscall );
		},
		cmdAutoShot : function(){
			_onAutoShot();
		},
		cmdReturnGame : function(){
			_onReturnGame();
		},
		cmdGoHome : function(){
			_onGoHome();
		},
		cmdEffectAddDrop : _effectAddDrop,
		cmdEffectRemoveDrop : _effectRemoveDrop,
		cmdEffectQuack : _effectQuack,
		cmdEffectFireworks : _effectFireworks,
		cmdEffectCall : _effectCall

	};
});




