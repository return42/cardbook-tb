if ("undefined" == typeof(ovl_lightningAttendees)) {
	var ovl_lightningAttendees = {
		
		onLoad: function() {
			try {
				var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
				var cardbookAutocompletion = prefs.getBoolPref("extensions.cardbook.autocompletion");
				if (cardbookAutocompletion) {
					var exclusive = prefs.getBoolPref("extensions.cardbook.exclusive");
					if (exclusive) {
						document.getElementById("attendeeCol3#1").setAttribute('autocompletesearch', 'addrbook-cardbook');
					} else {
						document.getElementById("attendeeCol3#1").setAttribute('autocompletesearch', 'addrbook-cardbook addrbook ldap');
					}
				} else {
					document.getElementById("attendeeCol3#1").setAttribute('autocompletesearch', 'addrbook ldap');
				}
			} catch(e) {
				document.getElementById("attendeeCol3#1").setAttribute('autocompletesearch', 'addrbook ldap');
			};
			window.removeEventListener('load', arguments.callee, true);
		}
	}
};
window.addEventListener("load", function(e) { ovl_lightningAttendees.onLoad(e); }, false);
