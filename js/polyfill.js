/**
 * 몇가지 함수들에대한 pollyfil
 */
/**
 * isArray
 *  */
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}


/**
 * Date.now()
 * performance.now()
 *  */
(function(){
	/**
	 * Date.now()
	 *  */
	Date.now = Date.now || function(){
		return +new Date;
	};
	
	var now = Date.now();
	
	/**
	 * performance.now()
	 *  */
	if( !window.performance ){
		window.performance = {};
	}
	
	window.performance.now = window.performance.now || function(){
		return Date.now() - now;
	};
})();




/**
 * requestAnimationFrame
 * cancelAnimationFrame
 *  */
window.requestAnimationFrame = (function(){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || function( f ){
		return window.setTimeout( function(){
			f( performance.now() );
		}, 1000 / 60 );
	};
})();

window.cancelAnimationFrame = (function(){
	return window.cancelAnimationFrame ||window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || function( id ){
		return window.clearTimeout( id );
	};
})();


(function(){
	
	if( !Function.prototype.bind ){
		Function.prototype.bind = function( oThis ) {
			if (typeof this !== 'function') {
		      // closest thing possible to the ECMAScript 5
		      // internal IsCallable function
		      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		    }
		
		    var aArgs   = Array.prototype.slice.call(arguments, 1),
		        fToBind = this,
		        fNOP    = function() {},
		        fBound  = function() {
		          return fToBind.apply(this instanceof fNOP
		                 ? this
		                 : oThis,
		                 aArgs.concat(Array.prototype.slice.call(arguments)));
		        };
		
		    if (this.prototype) {
		      // native functions don't have a prototype
		      fNOP.prototype = this.prototype; 
		    }
		    fBound.prototype = new fNOP();
			//
		    return fBound;
		};
	}
	
})();

