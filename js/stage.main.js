/**
 * 메인 홈 화면 스크립트
 */
define( function(){
	var listTmpl,
	Handlebars,
	_reloaded = false,
	_context,
	_playSound = '';
	/**
	 * 모듈 로드
	 * @param context {Object} 모듈자신
	 */
	function requireModule( context ){
		requirejs( [ 'text!search_list', 'handlebars', 'Swiper' ], function( pListTmpl, pHandlebars ){
			listTmpl = pListTmpl;
			Handlebars = pHandlebars;
			_context = context;
			//
			_context._init();
		}, function( err ){
			debug.log( '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!' );
		} );
	};
	/**
	 * 페이지 구성.
	 */
	function _setPage(){
		// 홈으로 이동시 모듈 제거 부분. 현재는 사용안함.
		if( _reloaded ){
			Nori.getManager('main').remove( 'play' );
			requirejs.undef( 'THREE' );
			requirejs.undef( 'stage.play' );
			requirejs.undef( 'stage.play.ui' );
			requirejs.undef( 'stage.play.3d' );
			
			requirejs( ['stage.play', 'THREE'], function(p){
				
				Nori.getManager('main').add( 'play', p );
				_makeDom();
				_startPage();
				
			} );
			return;	
		}
		// 화면을 막고 _makeDom 함수 호출.
		$.showBlock( _makeDom );
		// 가이드 팝업을 띄운다.
		_setGuidePopup();
	}
	
	/**
	 * 페이지의 Dom 이벤트등의 기능을 시작.
	 */
	function _startPage(){
		if( !_reloaded ){
			_playSound = '';
			Nori.SoundManager.getSound( 'nar' ).stop();
		}
		$('#popupContainer').closeLayer( null, true, function(){
			_setMainCard();
			_setThumb();
		} );
		Nori.SoundManager.getSound( 'intro' ).setLoop(true).start();
		_playSound = 'intro';
		//
		$('.gallery-btn').on( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'basic' ).start();
			window.webapp.mobloCallGallery();
		} );
		
		$('#homeShotdown').on( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'basic' ).start();
			_setShotdownPopup();
		});
	}
	
	/**
	 * 메인 홈화면을 만든다.
	 */
	function _makeDom(){
		var html = R.findTmpl( listTmpl, 'tmplMain' ),
		tmpl = Handlebars.compile( html );
		$('#gameContainer').html( tmpl( {ismirror:VARS.isMirror} ) ).show();
		$('#introContainer').html('').hide();
	}
	
	/**
	 * 작업기간으로 인해 다로 모션작업 및 이벤트 부여 안함.
	 * 현재 나라는 1개 전부임.
	 *  */
	function _setMainCard(){
		// TODO :: 임시로 메인 카드에도 게임 진행되게 이벤트 부여.
		$('#card_01').on( VARS.tapnm, function(){
			Nori.SoundManager.getSound( 'choice' ).start();
        	_setBoardReadPopup();
		} );
	}

	/**
	 * 하단 썸네일 구성.
	 */
	function _setThumb(){

		var largeItemCnt = 5;
		// 썸네일
		$('#thumbThemeList').show();
		//
		if( $('body').width() > 1600 ){
			var thumbItem = R.findTmpl( listTmpl, 'tmplMainThumbList' ),
				tmpl = Handlebars.compile( thumbItem ),
				obj = { img : "images/main/theme_none.png", alt : "테마 준비중입니다" };
			//
			var i=0, len = largeItemCnt-$('#thumbThemeList>li').length;
			len = len<0? 0 : len; 
			for( ;i<len;i+=1 ){
				$('#thumbThemeList').append( tmpl(obj) );
			}
		}
		var swiper = new Swiper('.swiper-container', {
            slidesPerView : 4,
            loop : false,
			initialSlide : 0,
			centeredSlides : false,
            breakpoints: {
            	1920: {
                    slidesPerView: largeItemCnt
                },
                1600: {
                    slidesPerView: 4
                },
                1200 : {
                    slidesPerView: 3
                },
                1155 : {
                    slidesPerView: 4
                },
                900: {
                    slidesPerView: 3
                },
                859: {
                    slidesPerView: 4
                },
                590 : {
                    slidesPerView: 3
					
                },
                490 : {
                    slidesPerView: 2
                }
            },
            onTap : function( s, e ){
            	var $slide = $(s.clickedSlide);
            	if( $slide.hasClass( 'swiper-slide-active' ) ){
            		Nori.SoundManager.getSound( 'choice' ).start();
            		_setBoardReadPopup();
            	}
            },
            onInit : function( s ){
            	/* 롤링될 썸네일 없어 막아놓음.
            	$('#mainThumbPrev').on( VARS.tapnm, function(){
            		Nori.SoundManager.getSound( 'rolling' ).start();
            	} );
            	
            	$('#mainThumbNext').on( VARS.tapnm, function(){
            		Nori.SoundManager.getSound( 'rolling' ).start();
            	} );
            	//*/
            }
        });
        
		// 상단 노출
		$('.main-lnb').toggleClass( 'on' );
        $('.main-lnb-container').toggleClass( 'on' );
        
        // 하단 노출
        $('.main-foot').toggleClass( 'on' );
        $('.main-foot-container').toggleClass( 'on' );
	}
	
	/**
	 * 페이지 이동을 위해. 화면의 버튼 및 구성요소를 없앤다.
	 */
	function _clearPage(){
		$('#popupContainer').closeLayer();
        window.webapp.mobloProgress(true);
		_playSound = '';
		Nori.SoundManager.getSound( 'intro' ).stop();
		//
		var endCnt = 0;
		$('.main-lnb, .main-foot').one( 'transitionend', function(){
        	endCnt++;
        	if( endCnt == 2 ){
        		_nextPage();
        	}
        } );
		// 상단 감추기
		$('.main-lnb').toggleClass( 'on' );
        $('.main-lnb-container').toggleClass( 'on' );
        
        // 하단 감추기
        $('.main-foot').toggleClass( 'on' );
        $('.main-foot-container').toggleClass( 'on' );
	};
	
	/**
	 * 다음 페이지로 이동.
	 */
	function _nextPage(){
		//className
		//
		//var tmpl = Handlebars.compile( R.findTmpl( listTmpl, 'tmplPlay' ) );
		//$('#stageContainer').html( tmpl( {ampm:VARS.ampm==='day'? '-night' : ''} ) );
		$('#mainPlay').show();
		$('#mainHome').hide();
		//
		Nori.getManager('main').play('play');
	};
	
	/**
	 * 사용자 가이드 화면을 띄운다.
	 */
	function _setGuidePopup(){
		$('#popupContainer').openLayer({
			id : 'guide',
			template : R.findTmpl( listTmpl, 'tmplGuide' ),
			onInit : function(){
				var $this = this;
				//
				Nori.SoundManager.getSound( 'nar' ).start();
				_playSound = 'nar';
				// 확인
				$this.find( '.popup-close-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					$this.find( '.popup-confirm-btn' ).off( VARS.tapnm );
					_startPage();
				} );
				
				// 닫기
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					$this.find( '.intro-shotdown-ok-btn' ).off( VARS.tapnm );
					_startPage();
				} );
				
			}
		});
	}
	
	/**
	 * 종료버튼 클릭시 종료 팝업을 띄운다.
	 */
	function _setShotdownPopup(){
		$.showBlock();
		$('#popupContainer').openLayer({
			id : 'guide',
			template : R.findTmpl( listTmpl, 'tmplPopupHomeShotdown' ),
			onInit : function(){
				var $this = this;
				// 확인
				$this.find( '.popup-confirm-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					window.webapp.mobloAppFinish();
				} );
				
				
				$this.find( '.popup-cancel-btn' ).one( VARS.tapnm, function(){
					Nori.SoundManager.getSound( 'basic' ).start();
					$this.find( '.popup-confirm-btn' ).off( VARS.tapnm );
					$('#popupContainer').closeLayer();
				} );
				
			}
		});
	}
	
	/**
	 * 블럭 가져오기 팝업을 띄운다.
	 */
	function _setBoardReadPopup(){
		$.showBlock();
		
		$('#popupContainer').openLayer({
			id : 'continue',
			template : R.findTmpl( listTmpl, 'tmplPopupContinue' ),
			onInit : function(){
				var $this = this;
				// 가져오기
				$this.find( '.popup-continue-btn' ).on( VARS.tapnm, function(){
					$this.find( '.popup-continue-btn' ).off( VARS.tapnm );
					$this.find( '.popup-new-btn' ).off( VARS.tapnm );
					$this.find( '.popup-close-btn-small' ).off( VARS.tapnm );
					//
					Nori.SoundManager.getSound( 'basic' ).start();
					VARS.initRead = true;
            		_clearPage();
				} );
				
				// 새로만들기
				$this.find( '.popup-new-btn' ).on( VARS.tapnm, function(){
					$this.find( '.popup-continue-btn' ).off( VARS.tapnm );
					$this.find( '.popup-new-btn' ).off( VARS.tapnm );
					$this.find( '.popup-close-btn-small' ).off( VARS.tapnm );
					//
					Nori.SoundManager.getSound( 'basic' ).start();
					VARS.initRead = false;
					_clearPage();
				} );
				
				// 닫기
				$this.find( '.popup-close-btn-small' ).one( VARS.tapnm, function(){
					$this.find( '.popup-continue-btn' ).off( VARS.tapnm );
					$this.find( '.popup-new-btn' ).off( VARS.tapnm );
					$this.find( '.popup-close-btn-small' ).off( VARS.tapnm );
					//
					Nori.SoundManager.getSound( 'basic' ).start();
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
		_context : 'assets/',
		_dom : null,
		__playInit__ : function( reloaded ){
			_reloaded = reloaded;
			requireModule( this );
		},
		__onResume__ : function(){
			if( _playSound === 'intro'  ){
				Nori.SoundManager.getSound( _playSound ).setLoop(true).start();
			}
		},
		__onPause__ : function(){
			if( _playSound !== ''  ){
				Nori.SoundManager.getSound( _playSound ).stop();
			}
		},
		_init : function(){
			_setPage();
		}
	};
});
	


