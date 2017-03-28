// for the yellow star
// onToolbarsPopupShowingWithMode
(function() {
	// Keep a reference to the original function.
	var _original = onToolbarsPopupShowingWithMode;

	// Override a function.
	onToolbarsPopupShowingWithMode = function() {
		// Execute original function.
		var rv = _original.apply(null, arguments);
		
		// Execute some action afterwards.
		if (document.getElementById('cardboookModeBroadcaster').getAttribute('mode') == 'cardbook') {
			onViewToolbarsPopupShowing(arguments[0], ["navigation-toolbox", "cardbook-toolbox"], arguments[1]);
		}
		
		// return the original result
		return rv;
	};

})();