/**
 * 리소스를 변수형태로 저장하고,
 * 리소스를 반환하는 함수를 가지고있는 객체.
 */
var R = (function(){
	return {
		/**
		 * 로드한 3D 리소스를 저장.
		 * @link stage.titleLoading.js#_loadCompleteCheck
		 */
		assets : {
			resourceObjList : null,
			resourceMtlList : null
		},
		/**
		 * 사용하지 않음.
		 */
		template : {
			popupFrame : ''
		},
		/**
		 * 화면캡쳐시 이미지를 저장할 리스트
		 */
		captureImages : [],
		/**
		 * 텍스트타입의 템플릿에서 해당아이디를 가진 &lt;script type="text/template"&gt;&lt;/script&gt;파일 내부의 텍스트를 반환함. 
		 * @param tmpl {String} 요소를 가져올 템플릿 텍스트
		 * @param id {String} 템플릿의 아이디
		 *  */
		findTmpl : function( tmpl, id ){
			var reg = new RegExp( '\<\s*script.*id\s*\=\s*[\'|\"]' + id + '[\'|\"].*type\s*\=\s*[\'|\"]text\/template[\'|\"]\s*\>((.|[\r\n])*?)\<\/\s*script\s*\>', 'g');
			var execs = reg.exec( tmpl );
			if( execs ){
				return execs[1] || ''; 
			}else{
				return '';
			}
		},
		/**
		 * requirejs에 저장된 템플릿 텍스트를 가져온다. 
		 * 실제 사용하지 않는다.
		 * @param file {String} 저장된 템플릿, require 모듈 이름.
		 * @param id {String} 템플릿의 아이디
		 *  */
		findRequireTmpl : function( file, id ){
			var tmpl = require.s.contexts._.defined['text!'+file];
			return findTmpl( tmpl, id );
		}
	};
}());
