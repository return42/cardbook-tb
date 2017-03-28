Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
Components.utils.import("resource:///modules/mailServices.js");
Components.utils.import("resource://gre/modules/Services.jsm");

const ACR = Components.interfaces.nsIAutoCompleteResult;

function cardbookAutocompleteResult(aSearchString) {
    this._searchResults = [];
    this.searchString = aSearchString;
}

cardbookAutocompleteResult.prototype = {
    _searchResults: null,

    searchString: null,
    searchResult: ACR.RESULT_NOMATCH,
    defaultIndex: -1,
    errorDescription: null,

    get matchCount() {
        return this._searchResults.length;
    },

    getValueAt: function getValueAt(aIndex) {
        return this._searchResults[aIndex].value;
    },

    getLabelAt: function getLabelAt(aIndex) {
        return this.getValueAt(aIndex);
    },

    getCommentAt: function getCommentAt(aIndex) {
        return this._searchResults[aIndex].comment;
    },

    getStyleAt: function getStyleAt(aIndex) {
        return "local-abook";
    },

    getImageAt: function getImageAt(aIndex) {
        return "";
    },

    getFinalCompleteValueAt: function(aIndex) {
    	return this.getValueAt(aIndex);
    },

    removeValueAt: function removeValueAt(aRowIndex, aRemoveFromDB) {
    },

    getCardAt: function getCardAt(aIndex) {
        return this._searchResults[aIndex].card;
    },

    getEmailToUse: function getEmailToUse(aIndex) {
        return this._searchResults[aIndex].emailToUse;
    },

    /* nsISupports */
    QueryInterface: XPCOMUtils.generateQI([ACR])
};

function cardbookAutocompleteSearch() {}

cardbookAutocompleteSearch.prototype = {

    addResult: function addResult(aResult, aEmailValue, aComment, aPopularity, aDirPrefId, aDebugMode) {
		if (aEmailValue != null && aEmailValue !== undefined && aEmailValue != "") {
			// check duplicate email
			for (var i = 0; i < aResult._searchResults.length; i++) {
				if (aResult._searchResults[i].value === aEmailValue) {
					return;
				}
			}

			// add result
			var myPopularity = 0;
			if (aPopularity != null && aPopularity !== undefined && aPopularity != "") {
				myPopularity = aPopularity;
			} else {
				var addresses = {}, names = {}, fullAddresses = {};
				MailServices.headerParser.parseHeadersWithArray(aEmailValue, addresses, names, fullAddresses);
				var myTmpPopularity = 0;
				for (var i = 0; i < addresses.value.length; i++) {
					if (addresses.value[i] == "") {
						continue;
					}
					if (cardbookRepository.cardbookMailPopularityIndex[addresses.value[i].toLowerCase()]) {
						myTmpPopularity = cardbookRepository.cardbookMailPopularityIndex[addresses.value[i].toLowerCase()];
						if (myPopularity === 0) {
							myPopularity = myTmpPopularity;
						}
					} else {
						continue;
					}
					if (myPopularity > myTmpPopularity) {
						myPopularity = myTmpPopularity;
					}
				}
			}
			
			if (aDebugMode) {
				aComment = aComment + " [" + myPopularity + ":" + cardbookUtils.getPrefNameFromPrefId(aDirPrefId) + "]";
			}

			if (aResult._searchResults.length === 0) {
				aResult._searchResults.push({
											 value: aEmailValue,
											 comment: aComment,
											 card: null,
											 isPrimaryEmail: true,
											 emailToUse: aEmailValue,
											 popularity: myPopularity
										 });
			} else {
				var done = 0;
				for (var i = aResult._searchResults.length - 1 ; i >= 0; i--) {
					if (Number(myPopularity) <= Number(aResult._searchResults[i].popularity)) {
						aResult._searchResults.splice(i+1, 0, {
													 value: aEmailValue,
													 comment: aComment,
													 card: null,
													 isPrimaryEmail: true,
													 emailToUse: aEmailValue,
													 popularity: myPopularity
												 });
						done = 1;
						break;
					}
				}
				if (done === 0) {
					aResult._searchResults.splice(0, 0, {
												 value: aEmailValue,
												 comment: aComment,
												 card: null,
												 isPrimaryEmail: true,
												 emailToUse: aEmailValue,
												 popularity: myPopularity
											 });
				}
			}
		}
    },

    // nsIAutoCompleteSearch

    /**
     * Starts a search based on the given parameters.
     *
     * @see nsIAutoCompleteSearch for parameter details.
     *
     * It is expected that aSearchParam contains the identity (if any) to use
     * for determining if an address book should be autocompleted against.
     *
     * aPreviousResult not used because always empty
     * popularity not used because not found how to set
     */
    startSearch: function startSearch(aSearchString, aSearchParam, aPreviousResult, aListener) {
		Components.utils.import("chrome://cardbook/content/cardbookRepository.js");
		var result = new cardbookAutocompleteResult(aSearchString);
		result.fireOnce = 0;
		var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
		loader.loadSubScript("chrome://cardbook/content/wdw_log.js");
		loader.loadSubScript("chrome://cardbook/content/cardbookUtils.js");
		
		// If the search string isn't value, or contains a comma, or the user
		// hasn't enabled autocomplete, then just return no matches / or the
		// result ignored.
		// The comma check is so that we don't autocomplete against the user
		// entering multiple addresses.
		if (!aSearchString || /,/.test(aSearchString)) {
			result.searchResult = ACR.RESULT_IGNORED;
			aListener.onSearchResult(this, result);
			return;
		}

		aSearchString = aSearchString.replace(/[\s+\-+\.+\,+\;+]/g, "").toUpperCase();

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var debugMode = prefs.getBoolPref("extensions.cardbook.debugMode");
		var preferEmail = prefs.getBoolPref("extensions.cardbook.preferEmailPref");
		if (preferEmail) {
			var allLabel = " All prefs";
			var categoryLabel = " (Category prefs)";
		} else {
			var allLabel = " All";
			var categoryLabel = " (Category)";
		}
		
		// add Cards
		for (var i in cardbookRepository.cardbookCardSearch1) {
			if (i.indexOf(aSearchString) >= 0) {
				for (var j = 0; j < cardbookRepository.cardbookCardSearch1[i].length; j++) {
					var myCard = cardbookRepository.cardbookCardSearch1[i][j];
					for (var k = 0; k < myCard.email.length; k++) {
						var myCurrentEmail = MailServices.headerParser.makeMimeAddress(myCard.fn, myCard.email[k][0][0]);
						this.addResult(result, myCurrentEmail, myCard.fn, null, myCard.dirPrefId, debugMode);
					}
					// add Lists
					if (myCard.isAList) {
						this.addResult(result, myCard.fn + " <" + myCard.fn + ">", myCard.fn + " (List)", null, myCard.dirPrefId, debugMode);
					} else {
						this.addResult(result, cardbookUtils.getMimeEmailsFromCards([myCard]).join(" , "), myCard.fn + allLabel, null, myCard.dirPrefId, debugMode);
					}
				}
			}
		}

		// add Categories
		for (var dirPrefId in cardbookRepository.cardbookAccountsCategories) {
			for (var i = 0; i < cardbookRepository.cardbookAccountsCategories[dirPrefId].length; i++) {
				var myCategory = cardbookRepository.cardbookAccountsCategories[dirPrefId][i];
				if (myCategory != cardbookRepository.cardbookUncategorizedCards) {
					if (myCategory.replace(/[\s+\-+\.+\,+\;+]/g, "").toUpperCase().indexOf(aSearchString) >= 0) {
						var myCardList = [] ;
						for (var j = 0; j < cardbookRepository.cardbookDisplayCards[dirPrefId+"::"+myCategory].length; j++) {
							var myCard = cardbookRepository.cardbookDisplayCards[dirPrefId+"::"+myCategory][j];
							myCardList.push(myCard);
						}
						this.addResult(result, cardbookUtils.getMimeEmailsFromCards(myCardList).join(" , "), myCategory + categoryLabel, null, dirPrefId, debugMode);
					}
				}
			}
		}

		if (result.matchCount) {
			result.searchResult = ACR.RESULT_SUCCESS;
			result.defaultIndex = 0;
		}

		aListener.onSearchResult(this, result);
    },

    stopSearch: function stopSearch() {
    },

    /* nsIClassInfo */
    getInterfaces: function(aCount) {
        let ifaces = [ Components.interfaces.nsIAutoCompleteSearch,
                       Components.interfaces.nsIClassInfo,
                       Components.interfaces.nsISupports ];
        aCount.value = ifaces.length;

        return ifaces;
    },

    getHelperForLanguage: function(language) {
        return null;
    },

    contractID: "@mozilla.org/autocomplete/search;1?name=addrbook-cardbook",
    classDescription: "Class description",
    classID: Components.ID("{0DE07280-EE68-11E4-B66F-4AD01D5D46B0}"),
    implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,
    flags: 0,

    // nsISupports

    QueryInterface: function(aIID) {
        if (!aIID.equals(Components.interfaces.nsIAutoCompleteSearch)
            && !aIID.equals(Components.interfaces.nsIClassInfo)
            && !aIID.equals(Components.interfaces.nsISupports))
            throw Components.results.NS_ERROR_NO_INTERFACE;
        return this;
    }
};

/** Module Registration */
function NSGetFactory(cid) {
	return (XPCOMUtils.generateNSGetFactory([cardbookAutocompleteSearch]))(cid);
}
