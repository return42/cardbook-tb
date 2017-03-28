if ("undefined" == typeof(ovl_cardbookComposeMsg)) {
	var ovl_cardbookComposeMsg = {
		
		newInCardBook: function() {
			try {
				var myNewCard = new cardbookCardParser();
				cardbookUtils.openEditionWindow(myNewCard, "CreateCard", "cardbook.cardAddedIndirect");
			}
			catch (e) {
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
				var errorTitle = "newInCardBook";
				prompts.alert(null, errorTitle, e);
			}
		},

		setAB: function() {
			document.getElementById("tasksMenuAddressBook").removeAttribute("key");
			document.getElementById("key_addressbook").setAttribute("key", "");
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			var exclusive = prefs.getBoolPref("extensions.cardbook.exclusive");
			var myPopup = document.getElementById("menu_NewPopup");
			if (exclusive) {
				document.getElementById('tasksMenuAddressBook').setAttribute('hidden', 'true');
				// this menu has no id, so we have to do manually
				myPopup.lastChild.remove();
			} else {
				document.getElementById('tasksMenuAddressBook').removeAttribute('hidden');
			}

			var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
			var strBundle = stringBundleService.createBundle("chrome://cardbook/locale/cardbook.properties");
			var myMenuItem = document.createElement("menuitem");
			myMenuItem.setAttribute("id", "newCardBookCardFromMsgMenu");
			myMenuItem.addEventListener("command", function(aEvent) {
					ovl_cardbookComposeMsg.newInCardBook();
					aEvent.stopPropagation();
				}, false);
			myMenuItem.setAttribute("label", strBundle.GetStringFromName("newCardBookCardMenuLabel"));
			myMenuItem.setAttribute("accesskey", strBundle.GetStringFromName("newCardBookCardMenuAccesskey"));
			myPopup.appendChild(myMenuItem);
		}

	};
	
	ovl_cardbookComposeMsg.setAB();

};
