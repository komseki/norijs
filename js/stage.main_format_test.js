/**
 * define requirejs module
 * 사용하는파일 아님
 *  */
define( [ 'R', 'nativeConn', 'THREE', 'OrbitControls', 'stats' ], function( src, nativeConn ){
	
	var FPS = parseInt(1000/60),
	
	
	STAGE_WIDTH,
	STAGE_HEIGHT,
	STAGE_HALFX,
	STAGE_HALFY,
	
	_camera, _scene, _renderer,
	_controls,
	_stats,
	
	_clock = new THREE.Clock();
	
	return {
		
		_context : 'assets/',
		
		_dom : null,
		
		__playInit__ : function(){
			this._init();
		},
		_init : function(){
			this._dom = document.getElementById( 'stageContainer' );
			this._setWindowResize();
			this._test();
		},
		_test : function(){
			//console.log( src.getResouceObjectList() );
			//console.log( src.getResouceMaterialList() );
			
			
			_scene = new THREE.Scene();
			_scene.rotation.x = 0;
			_scene.rotation.y = 0;
			_scene.rotation.z = 0;
			
			var ambient = new THREE.AmbientLight( 0xaaaaaa );
			_scene.add( ambient );
			
			// create Camera
			var aspect = STAGE_WIDTH / STAGE_HEIGHT,
			radius = 0;
			_camera = new THREE.PerspectiveCamera( 33, STAGE_WIDTH / STAGE_HEIGHT, 1, 10000 );
			_camera.position.set( 0, 1, 10 );
			_camera.lookAt(_scene.position);
			_scene.add(_camera);
			
			// create Renderer
			_renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, preserveDrawingBuffer:true });
			_renderer.setPixelRatio( window.devicePixelRatio );
			_renderer.setClearColor( 0x000000, 1 );
			_renderer.setFaceCulling( THREE.CullFaceNone, THREE.FrontFaceDirectionCCW );
			_renderer.setSize( STAGE_WIDTH, STAGE_HEIGHT );
			
			_controls = new THREE.OrbitControls( _camera, _renderer.domElement );
			
			this._dom.appendChild( _renderer.domElement );
			
			_stats = new Stats();
			_stats.domElement.style.position = 'absolute';
			_stats.domElement.style.top = '0px';
			this._dom.appendChild( _stats.domElement );
			
			enterFrame();
			
			
			var objList = R.assets.resourceObjList;
			var mtlList = R.assets.resourceMtlList;
			
			var block = objList[ 'mould_green_roof' ].clone();
			var material = mtlList[ 'mould_green_roof'  ].clone();
			
			
			//
			block.position.copy( {x : -2, y : 0, z : 0 } );
			block.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = material;
					child.material.opacity = 1;
					child.material.transparent = true;
				}
			} );
			_scene.add( block );
			
			block = objList[ 'mould_orange_roof' ].clone();
			material = mtlList[ 'mould_orange_roof'  ].clone();
			
			block.position.copy( {x : 0, y : 0, z : 0 } );
			block.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = material;
					child.material.opacity = 1;
					child.material.transparent = true;
				}
			} );
			_scene.add( block );
			
			
			block = objList[ 'mould_red_roof' ].clone();
			material = mtlList[ 'mould_red_roof'  ].clone();
			
			block.position.copy( {x : 2, y : 0, z : 0 } );
			block.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = material;
					child.material.opacity = 1;
					child.material.transparent = true;
				}
			} );
			_scene.add( block );
			
			
			block = objList[ 'mould_yellow_roof' ].clone();
			material = mtlList[ 'mould_yellow_roof'  ].clone();
			block.position.copy( {x : -2, y : -2, z : 0 } );
			block.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material = material;
					child.material.opacity = 1;
					child.material.transparent = true;
				}
			} );
			_scene.add( block );
			
			
			/*
			
			//
			var gl = _renderer.context;
			var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
			gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			//pixels = Uint8ClampedArray.from(pixels.buffer);
			console.log(pixels.buffer); // Uint8Array
			
			var blob = new Blob([pixels], {type: 'image/jpeg'});
			var url = URL.createObjectURL(blob);
			
			_renderer.domElement.style.display = 'none';
			
			var paper = document.createElement( 'canvas' );
			paper.width = _renderer.domElement.width;
			paper.height = _renderer.domElement.height;
			this._dom.appendChild( paper );
			
			var ctx = paper.getContext('2d');
			var imgData = ctx.createImageData( paper.width, paper.height );
			imgData.data.set(pixels, 0, pixels.length);
			console.log(imgData);
			//ctx.putImageData( URL.createObjectURL(blob) );
			ctx.putImageData( imgData, 0, 0 );
			
			clearTimeout( timer );
			cancelAnimationFrame( frames );
			*/
			
			var frames = 0;
			var timer = 0;
			//*
			
			var that = this;
			var btn = document.createElement( 'button' );
			btn.value = 'SCREEN_SHOT';
			btn.innerHTML = 'SCREEN_SHOT';
			btn.style.cssText = 'position:absolute; right:0; top:0; font-size:2em;color:#FFF; background:#CCC;';
			document.body.appendChild( btn );
			
			
			btn.addEventListener( 'click', function(){
				render();
				var imageData = _renderer.domElement.toDataURL('image/jpeg', 1.0);
				var arr = imageData.split( ',' );
				var img = new Image();
				img.onload = function(){
					var ratio = 1;
					var p = document.createElement( 'canvas' );
					c = p.getContext( '2d' );
					var w = p.width = _renderer.domElement.width * ratio;
					var h = p.height = _renderer.domElement.height * ratio;
					c.drawImage( this, 0, 0, w, h );
					
					var a = c.getImageData( 0, 0, w, h  );
					//p.width = w * ratio;
					//p.height = h * ratio;
					
					//console.log( a.data.buffer );
					
					var i = new Image();
					var url = p.toDataURL( 'image/jpeg', 1.0 );
					var ex = url.slice( url.indexOf( ',' )+1, url.length );
					// 요기 생성
					//i.src = 'data:image/jpeg;base64,' + ex;
					//that._dom.appendChild( i );
					//
					//document.getElementById('test').innerHTML = ex;
					
					nativeConn.callNative( 'mobloPutImage', [ex] );
					_renderer.domElement.style.display = 'block';
					enterFrame();
				};
				img.src = imageData;
				//that._dom.appendChild( img );
				_renderer.domElement.style.display = 'none';
				//
				
				clearTimeout( timer );
				cancelAnimationFrame( frames );
				//that._dom.innerHTML = arr[1];
				//console.log(arr[1]);
				//atob(arr[1])
				
				//nativeConn.callNative( 'mobloPutImage', [arr[1]] );
			} );
			//*/
			
			
			function enterFrame() {
				if( _camera === undefined || _renderer === undefined || _scene === undefined ){
					return;
				}
				//
				timer = setTimeout( function(){
					frames = requestAnimationFrame( enterFrame );
					render();
				}, FPS);
			}
			
			function render() {
				_stats.update();
				
				if( _controls && typeof _controls.update === 'function' ){
					_controls.update();
				}
				//
				_camera.lookAt( _scene.position );
				_renderer.render( _scene, _camera );
			}
			
		},
		_setWindowResize : function(){
			STAGE_WIDTH = this._dom.clientWidth;
			STAGE_HEIGHT = this._dom.clientHeight;
			STAGE_HALFX = STAGE_WIDTH / 2;
			STAGE_HALFY = STAGE_HEIGHT / 2;
		}
		
		
	};
});