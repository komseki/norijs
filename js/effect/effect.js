define(function( require ){
    var ParticleSystem = require( 'ParticleSystem' ),
        ParticleSystemRain = require( 'ParticleSystemRain' ),
        PostProcessorQuake = require( 'PostProcessorQuake' ),
		_ppsq = new PostProcessorQuake(),
        // assets 폴더.
        _assetContext = 'assets/',
        _scene,
        _backgroundScene, 
        _camera,
        _particleSystems = {}, 
        _renderList = {},
        _startTime = 0,
        _now = 0, 
        _windDir = 0,
        // 불효과 기본값.
        fireCen = new THREE.Vector3(0,0,0),
        fireNor = new THREE.Vector3(0,1,0),
        fireRad = 0.1,
        // 드랍 파티클 기본 위치 및 설정값
        dropCen = new THREE.Vector3(0,15,0), // 생성위치
        dropNor = new THREE.Vector3(0,0,0), // 방향
        dropRad = 15, // 지름
        // 불꽃놀이 효과 갯수
        _fwCnt = 0,
        // 불꽃놀이 포지션 기본 위치값, 현재는 사용안함.
        _fireworksPositions = [
            new THREE.Vector3(-5, 8, -15),
            new THREE.Vector3(1, 6, -15),
            new THREE.Vector3(25, 2, -5),
            new THREE.Vector3(22, 2, -15),
            new THREE.Vector3(22, 2, 0)
        ];

    /**
     * 불효과 추가
     * 
     * @param large {Boolean} 큰것, 일반 구분값
     * @param id {String} 고유 아이디값 ex) fire_1_ + block.name (= fire_1_b_x_y_z )
     * @param x {Number} x 좌표
     * @param y {Number} y 좌표
     * @param z {Number} z 좌표
     */
    function _addFire( large, id, x, y, z ){
        var particleSystem = _particleSystems[ id ],
            seedVelMag ,
            seedSize,
            windStrength,
            seedLife;
        if( particleSystem !== undefined && particleSystem !==null ){
            return;
        }
        if( large ){
            seedVelMag = 0.5;
            seedSize = 2;
            windStrength = 0.01;
            seedLife = 0.8;
        }else{
            seedVelMag = 0.25;
            seedSize = 1.2; // 0.8
            windStrength = 0.005;
            seedLife = 0.4;
        }
        //
        var params = {
            seedVelDir : new THREE.Vector3(0, 0.1, 0), // 타올라갈 위치
            seedVelMag : seedVelMag, //타오르는 정도2
            seedLife : seedLife, // 생명주기
            seedSize : seedSize, // 조각사이즈0.5
            seedSpread : 0.0, // 타올라 퍼지는 정도
            windStrength: windStrength, // 0.0
            texFile : _assetContext+"texture/explosion.png", //explosion
            colorBase : new THREE.Color(0Xffff00),
            particleColor: new THREE.Color(1, 0.1, 0.1),
            blendingType : THREE.CustomBlending // NormalBlending
        }

        var particleSystem = _particleSystems[ id ] = new ParticleSystem();
        particleSystem.initialize( 500 );//2000, 100000
        particleSystem.setParameters( params );

        _renderList[id] = true;

        particleSystem.userData.large = large;
        if( large ){
            particleSystem.userData.len = 1;//20
            particleSystem.userData.cycle = 0.0025;
            particleSystem.userData.rad = 0.03;
        }else{
            particleSystem.userData.len = 1;//10
            particleSystem.userData.cycle = 0.0025;
            particleSystem.userData.rad = 0;
        }
        particleSystem.userData.len = 9;//20
        particleSystem.userData.cycle = 0.0225;
        

        // 위치
        var mesh = particleSystem.getMesh();
        mesh.position.set( x, y, z );
        _scene.add( mesh );
    }

    /**
     * 불 효과 컨트롤
     * 
     * 근접센서블럭 연동시 센서값에 따라 타오르는 정도 조절
     * 
     * @param val {Number} 1<= val <=9
     */
    function _controlsFire( val ){
        var key='', sys, state;

        var seedVelMag,
            seedSize,
            windStrength,
            seedLife;
        //
        for( key in _renderList ){
            sys = _particleSystems[key];
            state = _renderList[key];
            if( !!sys ){
                if( /fire\_.*/.test( key ) ){
                    if( sys.userData.large ){
                        seedVelMag = 0.3;
                        seedSize = 2;
                        windStrength = 0.01;
                        seedLife = 0.8;
                    }else{
                        seedVelMag = 0.25;
                        seedSize = 1.2;
                        windStrength = 0.005;
                        seedLife = 0.4;
                    }
                    var params = {
                        seedVelDir : new THREE.Vector3(0, 0.1, 0), // 타올라갈 위치
                        seedVelMag : seedVelMag*val, //타오르는 정도2
                        seedLife : seedLife, // 생명주기
                        seedSize : seedSize, // 조각사이즈0.5
                        seedSpread : 0.0, // 타올라 퍼지는 정도
                        windStrength: windStrength, // 0.0
                        texFile : _assetContext+"texture/explosion.png", //explosion
                        colorBase : new THREE.Color(0Xffff00),
                        particleColor: new THREE.Color(1, 0.1, 0.1),
                        blendingType : THREE.CustomBlending // NormalBlending
                    }
                    sys.setParameters( params );
                    //sys.userData.len = 9+val;//20
                    //sys.userData.cycle = 0.0025 * val;
                }
            }
        }
    }

    /**
     * 불 효과 제거,
     * 특정 아이디의 파티클을 제거
     * 
     * @param id {String} 불 파티클 아이디
     */
    function _removeFire( id ){
        var particleSystem = _particleSystems[ id ];
        if( particleSystem !== undefined && particleSystem !==null ){
            _renderList[id] = false;
            delete _renderList[id];

            _scene.remove( particleSystem.getMesh() );
            particleSystem = _particleSystems[ id ] = null;
            delete _particleSystems[ id ];
        }
    }

    /**
     * Scene의 모든 불 효과를 제거함.
     */
    function _removeAllFire(){
        var sys;
        for( var key in _particleSystems ){
            sys = _particleSystems[key];
            if( !!sys ){
                if( /fire\_.*/.test( key ) ){
                    _removeFire( key );
                }
            }
        }
    }

    /**
     * 눈, 비, 꽃잎, 나못잎 파티클을 추가한다.
     * 
     * @param name {String} 드롭형태의 파티클 효과 이름.( snow, leaf, rain, flower )
     */
    function _addDrop( name ){
        // 생성된 파티클을 검사
        var particleSystem = _particleSystems[ name ];
        // 생성되지 않았으면 생성한다.
        if( particleSystem === undefined ){
            if( name === 'rain' ){
                particleSystem = _particleSystems[ name ] = new ParticleSystemRain();
            }else{
                particleSystem = _particleSystems[ name ] = new ParticleSystem();
            }
            particleSystem.initialize( 1000 );
            particleSystem.setParameters( _getDropParams(name) );
            _scene.add( particleSystem.getMesh() );
        }
        // 랜더링 리스트에 추가한다.
        _renderList[name] = true;
    }

    /**
     * 눈, 비, 꽃잎, 나뭇잎 파티클 제거
     * 실제로는 랜더링 리스트에서 제거해 화면에 노출되지 않게 한다.
     * 생성되어있는 파티클시스템은 재활용 한다.
     * 
     * @param name {String} 드롭형태의 파티클 효과 이름.( snow, leaf, rain, flower )
     */
    function _removeDrop( name ){
        if( _renderList[name] !== undefined &&  _renderList[name] !==null ){
            _renderList[name] = false;
        }
    }

    /**
     * 파티클 효과 종류에 따라 사용할 파라미터를 반환한다.
     * @param name {String} 드롭형태의 파티클 효과 이름.( snow, leaf, rain, flower )
     * @return {Object} Parameter Object 반환.
     */
    function _getDropParams( name ){
        var params;
        switch( name ){
            case 'snow' : 
                params = {
                    seedVelDir : new THREE.Vector3(0.0,-1, 0),
                    seedVelMag: 70.0,
                    globalForce: new THREE.Vector3(0, -0.1, 0),
                    windStrength: 5.0,
                    seedSize : 0.5,
                    seedLife : 1.5,
                    texFile: _assetContext+"texture/snowflake.png",
                    particleColor: new THREE.Color(0xFFFFFF),
                    alpha: 1
                }
            break;
            case 'leaf' :
                params = {
                    seedVelDir : new THREE.Vector3(0.0,-1, 0),
                    seedVelMag: 40.0,
                    globalForce: new THREE.Vector3(0, -0.1, 0),
                    windStrength: 1.0,
                    seedSize : 1.5,
                    seedLife : 0.5,
                    texFile: _assetContext+"texture/leaf.png",
                    particleColor: new THREE.Color(0X26b917),
                    angularVel : 0.005, // 회전
                    blendingType : THREE.NormalBlending,
                    alpha: 1
                }
            break;
            case 'rain' :
                params = {
                    seedVelDir : new THREE.Vector3(0.3, -1, 0),
                    seedVelMag: 30.0,
                    globalForce: new THREE.Vector3(0, -0.1, 0),
                    windStrength: 0.0,
                    seedSize : 2,
                    seedLife : 0.5,
                    angularVel : 0.0,
                    texFile: _assetContext+"texture/rain.png",
                    //particleColor: new THREE.Color(0X28343d),
                    blendingType : THREE.NormalBlending,
                    alpha: 0.3
                }
            break;
            case 'flower' :
                params = {
                    seedVelDir : new THREE.Vector3(0.0,-1, 0),
                    seedVelMag: 40.0,
                    globalForce: new THREE.Vector3(0, -0.1, 0),
                    windStrength: 1.0,
                    seedSize : 1.0,
                    seedLife : 0.5,
                    texFile: _assetContext+"texture/leaf.png",
                    particleColor: new THREE.Color(0Xdd47c3),
                    //blendingType : THREE.NormalBlending,
                    alpha: 1
                }
            break;
        }
        return params;
    }

    /**
     * 지진효과 실행
     * @param callback {Function} 효과 완료시 호출될 콜백함수.
     */
    function _quake( callback ){
        _ppsq.changeState( true );
        //
        var time = time || 250;
        var easing = easing || TWEEN.Easing.Exponential.In;
        new TWEEN.Tween( {x:0.2, y:0.6, z:0.2} )
        .to( {x:0, y:0, z:0}, 1000 )
        .easing( easing )
        .onUpdate(function(){
            var prop = this;
            _camera = _ppsq.earthquake(_camera, prop.x, prop.y, prop.z);
        })
        .onComplete(function(){
            _camera = _ppsq.earthquake(_camera, 0, 0, 0);
            _ppsq.changeState(false);
            if( typeof callback === 'function' ){
                callback();
            }
        })
        .start();
    }

    /**
     * 불꽃놀이 실행 함수
     */
    function _fireworks(){
        var scale = Math.max( window.STAGE_WIDTH/1280, window.STAGE_HEIGHT/800 )
        var params = {
            seedVelDir : new THREE.Vector3(0, 0, 0), // 타올라갈 위치
            globalForce: new THREE.Vector3(0, -150, 0),
            windStrength : 0,
            //seedVelMag : _getRandomInt(10,20),
            seedLife : 2, // 생명주기
            seedSize : 20*scale, // 조각사이즈
            seedSpread : 1.0, // 타올라 퍼지는 정도
            texFile : _assetContext+"texture/spark.png",
            //particleColor : new THREE.Color(_randomColor()),
            alpha : 1
        }

        var i=0, len=10;
        for(;i<len;i+=1){
            var n = i+1;
            _callFireworks( params, _getRandomInt( 200, 1000 ) );
        }
        _makeFireworks( params );
    }

    /**
     * 일정시간 간격으로 불꽃놀이 생성명령을 내린다.
     * 
     * @param params {Object} 불꽃놀이 효과 옵션값
     * @param time {Number} 생성주기
     */
    function _callFireworks( params, time ){
        setTimeout( function(){
            _makeFireworks( params );
        },  time );
    }

    /**
     * 불꽃놀이 실제 생성부분
     * @param params {Object} 효과 옵션값.
     */
    function _makeFireworks( params ){
        params.seedVelMag = _getRandomInt(100,200);
        params.particleColor = new THREE.Color(_randomColor());
        //
        var id = 'fireworks' + _fwCnt++;
        var particleSystem = _particleSystems[ id ] = new ParticleSystem();
        particleSystem.initialize( 1000 );
        particleSystem.setParameters( params );
        _renderList[id] = true;

        // 랜덤하게 위치지정.
        var x = _getRandomInt(STAGE_WIDTH*-.5, STAGE_WIDTH*.5);
        var y = _getRandomInt(0, STAGE_HEIGHT*.5);
        var z = _getRandomInt(0, 100);
        
        particleSystem.addParticlesFromSphere(1000, new THREE.Vector3(x, y, z), _getRandomInt( 1, 2 ));

        var mesh = particleSystem.getMesh();
        mesh.renderOrder = 0;
        _backgroundScene.add( mesh );
    }

    /**
     * 랜덤한색상값 반환
     * @return {number} 색상값
     */
    function _randomColor(){
        var colorCode = Math.round(Math.random() * 0xffffff);
        return colorCode;
    }

    /**
     * 랜덤한숫자 반환.
     * @return {number}
     */
    function _getRandomInt( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    }

    /**
     * VFX 효과 랜더링 함수.
     * 해당함수는 stage.play.3d.js 파일의 requestAnimationFrame 콜백 함수에서 호출한다.
     * @param delta {Number} 현재 시간 값.
     */
    function _render( delta ){
        // 매초마다 바람방향 바꿈.
        _now = Date.now();
        if( Math.floor( ( _now - _startTime)/1000 ) > 0 ){
            _windDir = Math.floor( Math.random() * 100 )%2? 1 : -1;
            _startTime = _now;
        }

		var key='', sys, state,
            vec;
        // _renderList에 추가된 것만 랜더링 함.
        for( key in _renderList ){
            sys = _particleSystems[key];
            state = _renderList[key];
            if( !!sys ){
                if( /fire\_.*/.test( key ) ){
                    var arr = key.split( '_' ),
                        data = sys.userData;
                    sys.addParticlesFromDisk(data.len, fireCen, fireNor, data.rad);
				    if( sys.getCount() > 0 ){
			            sys.updateParticles(data.cycle);
                    }
                }else if( /leaf/.test(key) ){
                    vec = new THREE.Vector3(0, _windDir); // 방향
                    if( state ){
                        sys.addParticlesFromDisk(1, dropCen, vec, 10);
                    }
                    if( sys.getCount() > 0 ){
			            sys.updateParticles(0.0025);
                    }

                }else if( /snow/.test(key) ){
                    vec = new THREE.Vector3(0, _windDir); // 방향
                    if( state ){
                        sys.addParticlesFromDisk(1, dropCen, vec, 15);
                    }
			        if( sys.getCount() > 0 ){
			            sys.updateParticles(0.0025);
                    }
                }else if( /rain/.test(key) ){
                    if( state ){
                        sys.addParticlesFromDisk(10, dropCen, dropNor, 20);
                    }
			        if( sys.getTail() > 0 ){
			            sys.updateParticles(0.01);
                    }
                }else if( /flower/.test(key) ){
                    if( state ){
                        sys.addParticlesFromDisk(1, dropCen, dropNor, 10);
                    }
			        if( sys.getTail() > 0 ){
			            sys.updateParticles(0.0025);
                    }
                }else if( /fireworks/.test(key) ){
			        if( sys.getTail() > 0 ){ // 파티클이 모두 소멸되었는지 확인.
			            sys.updateParticles(0.015);
                    }else{ 
                        _renderList[key] = false;
                        delete _renderList[key];
                        //
                        _backgroundScene.remove( sys.getMesh() );
                        sys = _particleSystems[ key ] = null;
                        delete _particleSystems[ key ];
                    }
                }
				
			}
        }
    }


    return {
        init : function( scene, camera, backgroundScene ){
            _scene = scene;
            _camera = camera;
            _backgroundScene = backgroundScene;
            _startTime = Date.now();
        },
        addFire : _addFire,
        removeFire : _removeFire,
        removeAllFire : _removeAllFire,
        controlsFire : _controlsFire,
        addDrop : _addDrop,
        removeDrop : _removeDrop,
        quake : _quake,
        fireworks : _fireworks,
        render : _render
    }
});