/**
 * 이벤트 타겟 객체 반환
 * 이벤트 리스너와 유사한 구조를 생성한다.
 * 객체 생성시 상속해 사용한다.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 */
define( function(){
	var ___CEventTarget___ = function(){
		this.listeners = {};
	};
	
	___CEventTarget___.prototype = (function(){
		
		return {
			listeners : null,
			addEventListener : function( type, callback ){
				if(!(type in this.listeners)) {
					this.listeners[type] = [];
				}
				this.listeners[type].push(callback);
			},
			removeEventListener : function( type, callback ){
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
			// 파라미터를 함께 전달 가능하게 한다.
			customDispatchEvent : function( type ){
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

    return ___CEventTarget___;
});