;(function() {
	if (!HTMLElement.prototype.matchesSelector) {
		HTMLElement.prototype.matchesSelector = function(selector, ctx) {
			var ms = this.webkitMatchesSelector || this.mozMatchesSelector || this.oMatchesSelector || this.msMatchesSelector;

			if (ms) {
				return ms.apply(this, arguments);
			} 

			ctx = ctx || this.parentNode;
			var possibles = ctx.querySelectorAll(selector);
			for (var i = 0; i < possibles.length; i++) {
				if (possibles[i] === this) {
					return true;
				}
			}
			return false;
		};
	}
})();