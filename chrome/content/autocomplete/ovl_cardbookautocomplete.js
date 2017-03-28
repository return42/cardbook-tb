Components.utils.import("chrome://cardbook/content/cardbookRepository.js");

function changeAutoComplete() {
	let done = false;
	let i = 1;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var autocompletion = prefs.getBoolPref("extensions.cardbook.autocompletion");
	if (autocompletion) {
		while (!done) {
			let textbox = document.getElementById(autocompleteWidgetPrefix + "#" + i);
			if (textbox) {
				try {
					var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
					var cardbookAutocompletion = prefs.getBoolPref("extensions.cardbook.autocompletion");
					if (cardbookAutocompletion) {
						var exclusive = prefs.getBoolPref("extensions.cardbook.exclusive");
						if (exclusive) {
							textbox.setAttribute('autocompletesearch', 'addrbook-cardbook');
						} else {
							textbox.setAttribute('autocompletesearch', 'addrbook-cardbook addrbook ldap');
						}
					} else {
						textbox.setAttribute('autocompletesearch', 'addrbook ldap');
					}
				} catch(e) {
					textbox.setAttribute('autocompletesearch', 'addrbook ldap');
				};
				textbox.showCommentColumn = true;
				i++;
			} else {
				done = true;
			}
		}
	}
	window.removeEventListener('load', arguments.callee, true);
}

window.addEventListener("load", changeAutoComplete, false);
