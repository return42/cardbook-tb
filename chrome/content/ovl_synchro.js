if ("undefined" == typeof(ovl_synchro)) {
	var ovl_synchro = {

		lTimerSync : null,
		lEventTimerSync : { notify: function(lTimerSync) {
			let stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
			let strBundle = stringBundleService.createBundle("chrome://cardbook/locale/cardbook.properties");
			cardbookRepository.cardbookUncategorizedCards = strBundle.GetStringFromName("uncategorizedCards");
			cardbookRepository.cardbookCollectedCards = strBundle.GetStringFromName("collectedCards");
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
			cardbookRepository.preferEmailPref = prefs.getBoolPref("extensions.cardbook.preferEmailPref");

			cardbookRepository.setSolveConflicts();
			cardbookRepository.setTypes();
			cardbookRepository.loadCustoms();
			cardbookSynchronization.loadAccounts();
		}
		},
		
		runBackgroundSync: function () {
			ovl_synchro.lTimerSync = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
			ovl_synchro.lTimerSync.initWithCallback(ovl_synchro.lEventTimerSync, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
		}

	};

	ovl_synchro.runBackgroundSync();

};
