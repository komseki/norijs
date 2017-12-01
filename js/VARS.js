/**
 * 공용으로 사용되는 변수를 모아놓음.
 * - 고정된 정보값(uri 등..) 또는 변수 모음.
 */
var VARS = (function(){
	var props = {
		//assetContext : 'assets/',
		//wsUri : 'ws://192.168.1.115:8080/websocket_test/chat',
		//wsUri : 'ws://m5c.motionblue.com:8888/ws/castlemaker',
		wsUri : 'ws://kiss.pcninc.co.kr:7580', // websocket uri
		// 소켓 룸번호
		wsRoom : '',
		// ble 연결 주소값, 소켓 연결시 시리얼번호로 사용.
		addr : '',
		// api 모델코드
		modelCode : 'moblo',
		// api userid
		userid : 'jsbak@motionblue.com',
		// api 서비스 코드
		serviceCode : 'qLHEiqyivE',
		// 소켓 수신시 사용 -  apicode : 명려어 매칭
		wsApiCodes : {
			'G0kOPu0nlT' : 'mobloChangeBlock',
			'VQK5ylHyeb' : 'effect',
			'3NClv4oDjr' : 'time',
			'lm5DScc0rq' : 'board',
			'DeaAtII2Qe' : 'read'
		},
		// 소켓 발송시 사용 - 명령어 : apicode 매칭
		wsCmds : {
			'init' : '', // 방접속 초기화
			'mobloChangeBlock' : 'G0kOPu0nlT',
			'effect' : 'VQK5ylHyeb',
			'time' : '3NClv4oDjr',
			'board' : 'lm5DScc0rq',
			'read' : 'DeaAtII2Qe'
		},
		deviceWsConnected : false, // 웹소켓 접속여부
		isMirror : false, // 미러링페이지 인지여부
		isPlayTest : false, // test webgl direct
		isDebug : false, // statjs FPS 모니터링 설정 :: 좌측상단에 표시
		isSound : true, // false이면 음악소리 나지 않음
		initRead : false, // 시작시 보드읽어올건지 여부
		currentPage : '', // 페이지 구분을 위해 만들었으나 사용하지 않음.
		isMouse : window.touchstart === undefined? true : false, // 마우스 또는 터치이벤트 여부
		useWS : false, // 웹소켓사용중인지 여부
		useBLEDummy : true, // 테스트용 블루투스 더미데이터 사용여부
		useBLE : ( (/android/i).test( window.navigator.userAgent ) )? true : false, // 블루투스 사용가능상태 여부
		NINE_BY_NINE : '9x9', // 9x9 보드타입
		SEVEN_BY_SEVEN : '7x7', // 7x7 보드타입
		FIVE_BY_FIVE : '5x5', // 5x5 보드타입
		boardType : '', // 현재보드타입 설정값
		ampm : 'day', // 낮/밤 설정값
		
		_eventNames : null,
		/**
		 * 블럭정보 블럭 ASCII코드 : 정보
		 * disc 속성은 stage.play.3d.js파일에서 블럭 리소스 매칭시 사용함.
		 */
		blockTypeCodeList : {
			// motor
			//'77' : { str:'M', disc : 'motor' },
			// 3d
			'66' : { str:'B', disc : 'blue' }, 
			'71' : { str:'G', disc : 'green' },
			'73' : { str:'I', disc : 'navy' },
			'79' : { str:'O', disc : 'orange' },
			'89' : { str:'Y', disc : 'yellow' },
			'86' : { str:'V', disc : 'purple' },
			'82' : { str:'R', disc : 'red' },
			// mould
			'98' : { str:'b', disc : 'blue' },
			'103' : { str:'g', disc : 'green' },
			'105' : { str:'i', disc : 'navy' },
			'111' : { str:'o', disc : 'orange' },
			'121' : { str:'y', disc : 'yellow' },
			'118' : { str:'v', disc : 'purple' },
			'114' : { str:'r', disc : 'red' },
			//근접센서
			'83' : {str:'S', disc:'proximity'}
		},
		/**
		 * 문자열별 블럭정보. 사용은 하지 않음.
		 */
		blockTypeStrList : {
			// motor
			//M : { code:'77', disc : 'motor' },
			// 3d 
			B : { code:'66', disc : 'blue' }, 
			G : { code:'71', disc : 'green' },
			I : { code:'73', disc : 'navy' },
			O : { code:'79', disc : 'orange' },
			Y : { code:'89', disc : 'yellow' },
			V : { code:'86', disc : 'purple' },
			R : { code:'82', disc : 'red' },
			// mould 98 103 105 111 121 118 114 
			b : { code:'98', disc : 'blue' },
			g : { code:'103', disc : 'green' },
			i : { code:'105', disc : 'navy' },
			o : { code:'111', disc : 'orange' },
			y : { code:'121', disc : 'yellow' },
			v : { code:'118', disc : 'purple' },
			r : { code:'114', disc : 'red' },
			//근접센서
			'S' : {code:'83', disc:'proximity'}
		},
		/**
		 * 사용할 사운드파일 정보
		 */
		sound : {
			basicOnly : "assets/sound/eff_cm_btn_basic.mp3",
			soundList : [
				{"id" : "contents", "url" : 'assets/sound/bgm_cm_contents.mp3'},
				{"id" : "intro", "url" : 'assets/sound/bgm_cm_intro.mp3'},
				{"id" : "eff_all", "url" : 'assets/sound/eff_all.mp3'},
				{"id" : "nar", "url" : 'assets/sound/nar_cm_moby_direct.mp3'}
			] 
		},
		/* 사운드 시작커서위치 및 재생시간.
		1-8번까지 파일 합쳐 eff_all.mp3 만듦.
		eff_all.mp3 
		1. eff_cm_btn_basic : 0 - 0.156
		2. eff_cm_btn_choice : 0.156 - 0.365
		3. eff_cm_btn_remove : 0.365 - 0.844
		4. eff_cm_btn_rolling : 0.844 - 1.463
		5. eff_cm_btn_shooting : 1.463 - 2.113
		6. eff_cm_btn_touch.mp3 : 2.113 - 2.401
		7. eff_block_attached : 2.401 - 4.177
		8. eff_block_remove : 4.177 - 5.953 
		*/
		effSoundConfig : {
			basic : {"when":0, "offset":0, "duration":0.156},
			choice : {"when":0, "offset":0.156, "duration":0.209},
			remove : {"when":0, "offset":0.365, "duration":0.479},
			rolling : {"when":0, "offset":0.844, "duration":0.619},
			shooting : {"when":0, "offset":1.463, "duration":0.65},
			touch : {"when":0, "offset":2.113, "duration":0.288},
			attachedBlock : {"when":0, "offset":2.401, "duration":1.776},
			removeBlock : {"when":0, "offset":4.177, "duration":1.776}
		},
		
		CAN_NOT_USED : '사용할 수 없는 기기입니다.'
	};

	// 변수 초기화
	props.boardType = props.NINE_BY_NINE;
	props.eventName = (function(){
		return props._eventNames || (props._eventNames = eventUtils.getEventNames());
	}());
	props.tapnm = props.isMouse ? 'click' : 'tap';

	// 서비스코드 조합.
	//props.wsUri += '/' + props.serviceCode;

	
	return props;
}());


