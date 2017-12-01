/***
 * 게임 화면 이외의 UI 및 팝업 컨트롤
 * */
define( function(require){	
	var listTmpl,
		Handlebars,
		_context,
		_playUiCnt = 0,
		_checkHideUiCnt = 0,
		_swiperMove = false;
	/**
	 * 모듈 로드
	 * @param context {Object} 모듈자신
	 */
	function requireModule( context ){
		requirejs( [ 'text!search_list', 'handlebars' ], function( pListTmpl, pHandlebars ){
			listTmpl = pListTmpl;
			Handlebars = pHandlebars;
			_context = context;
			_playUiCnt = 0;
			//
			_context._init();
		} );
	};
	
	/**
	 * 돔 로드
	 *  */
	function _setPage(){
		_showPlayUi();
	}
	
	/**
	 * 기본 UI 노출 및 이벤트 부여
	 *  */
	function _showPlayUi(){
		var ms=400, ease='cubic-bezier(0.165, 0.84, 0.44, 1)';
		//
		// 하단 왼쪽, 오른쪽 버튼
		$('.foot-btn-box-left,.foot-btn-box-right,.foot-btn-box-center').each( function( i, item ){
            var $item = $(item),
                h = $item.find('button').height();
            //
            $item.animate({
                height : (124 * ( h / 107 )) + 'px'
            }, {
                duration : ms,
                easing : ease,
                complete : function(){
                    $(this).css({
                        height : h + 'px',
                        bottom : (17 * ( h / 107 )) + 'px'
                    });
                    _playUiShowComplete();
                }
            });
            
        } );

		$('.top-btn-box-right').each( function( i, item ){
            var $item = $(item),
                h = $item.find('button').height();
            //
            $item.animate({
                top : (17 * ( h / 107 )) + 'px'
            }, {
                duration : ms,
                easing : ease,
                complete : function(){
                    $(this).css({
                        top : (17 * ( h / 107 )) + 'px'
                    });
					_playUiShowComplete();
                }
            });
            
        } );

        /* 오픈시 사용하지 않아 막음.
       	$('.foot-btn-box-left').animate({
            height : '124px'
        }, {
            duration : ms,
            easing : ease,
            complete : function(){
                $('.foot-btn-box-left').css({
                    height : '107px',
                    bottom : '17px'
                });
                _playUiShowComplete();
            }
        });
        $('.foot-btn-box-right').animate({
            height : '124px'
        }, {
            duration : ms,
            easing : ease,
            complete : function(){
                $('.foot-btn-box-right').css({
                    height : '107px',
                    bottom : '17px'
                });
                _playUiShowComplete();
            }
        });
		$('.camera-icon').data( 'opened', false );
        $('.play-lnb').animate( {height:'124px'}, ms, ease );
        $('.camera-icon').animate( {bottom:'0px'}, {duration:ms, easing:ease, complete:function(){
            $('.play-lnb').css({top : 30, height : 94}).addClass('radius');
            setTimeout(function(){
                $('.play-lnb').addClass('tween').addClass( 'lnb-shadow' );
                $('.camera-btn-box').show();
                $('.camera-icon').one( VARS.tapnm, _openCameraTab );
                _playUiShowComplete();
            }, 24);
        }} );
        
        
        $('#autoShot').off(VARS.tapnm).on( VARS.tapnm, function(){
        	Nori.SoundManager.getSound( 'choice' ).start();
        	Nori.Commands.callCmd( 'autoShot' );
        } );
        
        $('#selfShot').off(VARS.tapnm).on( VARS.tapnm, function(){
        	Nori.SoundManager.getSound( 'choice' ).start();
        	Nori.Commands.callCmd( 'selfShot' );
        } );
        */
        
        // 시간(낮, 밤) 변경
        $('#timeBtn').off(VARS.tapnm).on( VARS.tapnm, function(){
        	Nori.Commands.callCmd( 'changeTime', true );
        } );
        
        // 홈으로
        $('.home-btn').off(VARS.tapnm).on( VARS.tapnm, function(){
        	Nori.SoundManager.getSound( 'basic' ).start();
        	Nori.Commands.callCmd( 'goHome' );
        } );

		// 미러링 : 공유하기
		$('#mirror').off(VARS.tapnm).on( VARS.tapnm, function(){
			if( $('#mirror').hasClass('ws-btn') ){
        		Nori.Commands.callCmd( 'startSocket' );
			}else{
				Nori.Commands.callCmd( 'shareGame' );
			}
        } );
		//*/
		/* 지진 효과 버튼 이벤트
		큰블럭 생성시 효과 발생시키고 주석처리.
		$('#quake').on( VARS.tapnm, function(){
			// 테스트용 코드.
			//window.location.href = "http://192.168.1.115:62005/castlemaker/index.html?title=true";
			Nori.Commands.callCmd( 'effectQuack' );
		} );
		//*/

		// 불꽃놀이 버튼 이벤트
		$('#fireworks').on( VARS.tapnm, function(){
			Nori.Commands.callCmd( 'effectFireworks' );
		} );

		// 드롭 효과 버튼 이벤트
		// leaf, flower, snow, rain
		$('.effect-toggle').on( VARS.tapnm, function(){
			var $this = $(this),
				type = this.dataset.type;
			if( $this.hasClass( 'off' ) ){ // 꺼진상태
				_effectToggle( {type:type, state:true}, true );
			}else{
				_effectToggle( {type:type, state:false}, true );
			}
		} );
	}

	/**
	 * 드롭 효과 토글 버튼 그룹 제어.
	 * 
	 * @param data { type:string, state:boolean } type : 효과 타입, state : 켜짐/꺼짐
	 * @param iscall boolean 효과 호출 할지 여부 false이면 버튼 상태만 바꿈.
	 */
	function _effectToggle( data, iscall ){
		var type = data.type,
			state = data.state,
			$this = $('[data-type='+type+']');
		//
		if( new RegExp(type).test('fireworks quake') ){
			return;
		}
		// clear other
		$('.effect-toggle').each(function( i, item ){
			if( item.dataset.type !== type ){
				if( !$(item).hasClass( 'off' ) ){ // 켜진것 끔
					$(item).addClass( 'off' );
					if( iscall ){
						Nori.Commands.callCmd( 'effectRemoveDrop', item.dataset.type );
					}
				}
			}
		});
		// set current item
		if( state ){ // 꺼진상태
			$this.removeClass( 'off' );
			if( iscall ){
				Nori.Commands.callCmd( 'effectAddDrop', type );
			}
		}else{
			$this.addClass( 'off' );
			if( iscall ){
				Nori.Commands.callCmd( 'effectRemoveDrop', type );
			}
		}
	}

	/**
	 * 클릭된 드롭효과 이벤트의 효과타입 반환.
	 * @return {String} 드롭효과 타입.
	 */
	function _getClickedEffect(){
		var type = '';
		$('.effect-toggle').each(function( i, item ){
			if( !$(item).hasClass( 'off' ) ){
				type = item.dataset.type;
			}
		});
		return type;
	}
	
	/**
	 * ui 감추기
	 */
	function _hidePlayUi(){
		var ms=250, ease='cubic-bezier(0.165, 0.84, 0.44, 1)';
		_checkHideUiCnt = 0;
		//
		$('#autoShot').off(VARS.tapnm);
		$('#selfShot').off(VARS.tapnm);
		$('.time-btn').off(VARS.tapnm);
		$('.home-btn').off(VARS.tapnm);
		//
		// 하단 왼쪽, 오른쪽 버튼
       	$('.foot-btn-box-left').css({ height : '124px', bottom : '0' }).animate({ height : '0px' }, 
       	{
            duration : ms,
            easing : ease,
            complete : function(){
            	_checkHidePlayUi();
            }
        });
        $('.foot-btn-box-right').css({ height : '124px', bottom : '0' }).animate({ height : '0px' }, 
       	{
            duration : ms,
            easing : ease,
            complete : function(){
            	_checkHidePlayUi();
            }
        });
        
        $('.play-lnb').css({ height : '124px', top : '0' }).removeClass( 'lnb-shadow' ).animate({ height : '0px' }, 
       	{
            duration : ms,
            easing : ease,
            complete : function(){
            	$('.camera-btn-box').css( {'background-position-x' : '-277px'} );
            	$('.camera-btn-box .camera-btn').hide();
            	$('.play-lnb').addClass('radius').removeClass('open').css( {'width' : '94px'} );
            	//
            	_checkHidePlayUi();
            }
        });
	}
	
	/**
	 * ui 전부 화면에서 제거되었는지 확인
	 * @param callback {Function}
	 */
	function _checkHidePlayUi( callback ){
		_checkHideUiCnt ++;
		if( _checkHideUiCnt === 3 ){
			if( typeof callback === 'function' ){
				callback();
			}
		};
	}
	
	/**
	 * 카메라 버튼 클릭시 탭 열기
	 *  */
	function _openCameraTab(){
		Nori.SoundManager.getSound( 'basic' ).start();
		//
        var isopen = !$('.camera-icon').data( 'opened' );
        if( isopen ){
            $('.play-lnb').animate( {'width' : '371px'}, {duration:400, easing:'cubic-bezier(0.165, 0.84, 0.44, 1)'});
            $('.camera-btn-box').animate( {'background-position-x' : 0}, {duration:400, easing:'cubic-bezier(0.165, 0.84, 0.44, 1)', complete:function(){
                $('.camera-btn-box .camera-btn').show();
                $('.camera-icon').one( VARS.tapnm, _openCameraTab );
            }} );
        }else{
            $('.camera-btn-box .camera-btn').hide();
            $('.play-lnb').animate( {'width' : '94px'}, {duration:400, easing:'cubic-bezier(0.165, 0.84, 0.44, 1)'});
            $('.camera-btn-box').animate( {'background-position-x' : '-277px'}, {duration:400, easing:'cubic-bezier(0.165, 0.84, 0.44, 1)', complete:function(){
                $('.play-lnb').removeClass('open');
                $('.camera-icon').one( VARS.tapnm, _openCameraTab );
            }} );
        }
        $('.camera-icon').data( 'opened', isopen );
	}
	
	/**
	 * 기본 UI 노출 애니메이션 완료.
 	 *  */
	function _playUiShowComplete(){
		_playUiCnt ++;
		var total = VARS.isMirror? 2 : 4;
		if( _playUiCnt === total ){
			$(window).off(VARS.eventName.RESIZE + '.ui').on( VARS.eventName.RESIZE + '.ui', _onWindowResize );
			Nori.Commands.callCmd( 'startGame' );
		}
	}

	/**
	 * window.resize / window.orientationchange 이벤트 리스너
	 */
	function _onWindowResize(){
		$('.foot-btn-box-left,.foot-btn-box-right,.foot-btn-box-center').each( function( i, item ){
			var $item = $(item),
				h = $item.find('button').height();
			//
			$item.css( {
				height : h + 'px',
				bottom : (17 * ( h / 107 )) + 'px'
			} );
		} );
	}
	
	/**
	 * 현재 사용하지 않는기능.
	 * 개발중 오픈으로 개발중단.
	 * 홈으로 이동시 이벤트 해제.
 	 *  */
	function _onGoHome(){
		$('#autoShot').off( VARS.tapnm );
		$('#selfShot').off( VARS.tapnm );
		$('.time-btn').off( VARS.tapnm );
		Nori.SoundManager.getSound( 'contents' ).stop();
		//
		_hidePlayUi();
	}
	
	/**
	 * 낮밤 변경시 BG 변경.
	 *  */
	function _onChangeTime(){
		$('#timeBtn').toggleClass('time-btn').toggleClass('time-btn-night');
		//
		Nori.SoundManager.getSound( 'basic' ).start();
		// 이전 CSS 방식 코드들
		//$('.main-contents').toggleClass('day');
		//$('.main-contents').toggleClass('night');
	}
	
	
	/**
	 * 현재 사용하지 않는기능.
	 * 구현중 오픈으로 개발중단.
	 * 자동촬영 팝업 열기
	 *  */
	function _openAutoShotPopup(){
		var tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplAutoShot' ) ),
			html = tmpl(R);
		$('#popupContainer').openLayer({
			id : 'autoShot',
			template : html,
			onReady : function(){
				var $this = this;
				_setSwiper( $this );
			},
			onInit : function(){
				var $this = this;
                //
				$this.find('.main-lnb').toggleClass( 'on' );
                $this.find('.main-lnb-container').toggleClass( 'on' );
                // 뒤로가기
                $this.find('.back-btn').one( VARS.tapnm, function(){
                	Nori.Commands.callCmd( 'returnGame' );
                	
                	$('#popupContainer').closeLayer();
                } );
                
                // 사진 저장
                $this.find('.down-btn').on( VARS.tapnm, function(){
                	window.webapp.mobloPutImage( _getAutoImgDatas() );
                	//
                	/*
                	window.webapp.addEventListener( window.webapp.BLE_SCAN_FINISHED, function(){
						debug.log( window.webapp.BLE_SCAN_FINISHED );
						// 재검색 버튼 노출
						$('#cancelSearch').hide();
						$('#reSearch').show();
					} );
                	//*/
                } );
                
                // 사진 공유
                $this.find('.share-btn').on( VARS.tapnm, function(){
                	window.webapp.mobloShareImage( _getAutoImgDatas() );
                } );
			}
		});
	}
	
	/**
	 * 자동촬영 이미지 데이터 반환
	 * 현재사용하지 않음.
	 * 구현중 오픈으로 개발 중단.
	 * @return {Array}
	 */
	function _getAutoImgDatas(){
		var ids = {};
    	$('#autoList .check-box.on').each( function( i, item ){
    		var id = item.dataset.formId;
    		if( ids[id] === undefined ){
    			ids[id] = id;
    		}
    	} );
    	var arr = [];
    	for( var idx in ids ){
    		arr.push( R.captureImages[ ids[idx] ].replace(/^(data\:)*image\/.*\,/g, '') );
    	}
    	return arr;
	}
	
	/**
	 * 자동촬영 팝업 슬라이더
	 * 현재 사용하지 않음.
	 * 구현중 오픈으로 개발중단.
	 *  */
	function _setSwiper( $this ){
		var swiper = new Swiper('.popup-container .swiper-container', {
            slidesPerView : 'auto',
            spaceBetween : 30,
            centeredSlides: true,
            //preloadImages: false,
            //lazyLoading: true,
            loop : true,
            onInit : function( mod ){
                $('#autoList .check-box').on( 'click', function(){
                    var id = this.dataset.formId;
                    $('#autoList .check-box').each( function( i, item ){
                        if( id == item.dataset.formId ){
                            if($(item).hasClass('on')){
                                $(item).removeClass('on');
                            }else{
                                $(item).addClass('on');
                            }
                        }
                    } );
                } );
                //
                window.webapp.mobloProgress( false );
            },
            //onSlidePrevStart : moveStart,
            //onSlidePrevEnd : moveEnd,
            //onSlideNextStart : moveStart,
            //onSlideNextEnd : moveEnd,
            onTransitionEnd : _swiperMoveEnd,
            onSliderMove : function(){
                if( _swiperMove ){
                    return;
                }
                _swiperMove = true;
                $('#autoList').find('.slide-box.on').each( function(i, item){
                    $item = $(item);
                    $item.removeClass( 'on' );
                } );
            }
        });
	}

	/**
	 * 웹소켓 버튼 공유 버튼과 교체.
	 * @param state {Boolean} true / 미러링연결시.
	 * @link stage.play.js#_mirrorOnOpen
	 * @link stage.play.js#_mirrorOnClose
	 */
	function _changeWsBtn( state ){
		if( state ){
			$('#mirror').removeClass('ws-btn');
			$('#mirror').addClass( 'mirror-btn' );
		}else{
			$('#mirror').removeClass( 'mirror-btn' );
			$('#mirror').addClass('ws-btn');
		}
		
	}
	
	/* 사용안함
	function _moveStart(){
        $('#autoList').find('.slide-box.on').each( function(i, item){
            $item = $(item);
            $item.removeClass( 'on' );
        } );
    }
    //*/
    
    /**
     * Swiper 모듈 콜백
     *  */
    function _swiperMoveEnd(){
        // 인덱스는 아래와 같이 가져온다.
        var idx = parseFloat( $('#autoList').find('.swiper-slide-active')[0].dataset['swiperSlideIndex'], 0);
        var $item;
        $('#autoList').find('li').each( function(i, item){
            $item = $(item);
            if( $item.hasClass( 'swiper-slide-active' ) ){
                $item.find('.slide-box').addClass( 'on' );
            }else{
                $item.find('.slide-box').removeClass( 'on' );
            }
        } );
        _swiperMove = false;
    }
	
	
	
	/**
	 * define requirejs module
	 *  */
	return {
		initUi : function(){
			requireModule(this);
		},
		_init : function(){
			_setPage();
		},
		// 홈으로
		cmdGoHome : function(){
			_onGoHome();
		},
		// 시간변경
		cmdChangeTime : function(){
			_onChangeTime();
		},
		// 자동촬영 이벤트 발생
		cmdAutoShot : function(){
			// ui 막아야함.
		},
		// 자동촬영 팝업열기
		cmdOpenAutoShot : function(){
			_openAutoShotPopup();
		},
		// 수동촬영 이벤트 발생
		cmdSelfShot : function(){
			_hidePlayUi();
		},
		cmdEffectToggle : _effectToggle,
		getClickedEffect : _getClickedEffect,
		changeWsBtn : _changeWsBtn
	};
});




