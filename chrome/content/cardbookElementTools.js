if ("undefined" == typeof(cardbookElementTools)) {
	var cardbookElementTools = {
		
		deleteRowsType: function (aType) {
			cardbookElementTools.deleteRows(aType + 'Groupbox');
		},

		deleteRows: function (aObjectName) {
			var aListRows = document.getElementById(aObjectName);
			while (aListRows.firstChild) {
				aListRows.removeChild(aListRows.firstChild);
			}
		},

		addCaption: function (aType, aParent) {
			var strBundle = document.getElementById("cardbook-strings");
			var aCaption = document.createElement('caption');
			aParent.appendChild(aCaption);
			aCaption.setAttribute('id', aType + '_caption');
			aCaption.setAttribute('label', strBundle.getString(aType + "GroupboxLabel"));
			aCaption.setAttribute('class', 'header');
		},
		
		addHBox: function (aType, aIndex, aParent) {
			var aHBox = document.createElement('hbox');
			aParent.appendChild(aHBox);
			aHBox.setAttribute('id', aType + '_' + aIndex + '_hbox');
			aHBox.setAttribute('flex', '1');
			aHBox.setAttribute('align', 'center');
			// dirty hack to have the lines not shrinked on Linux only with blue.css
			aHBox.setAttribute('style', 'min-height:36px;');
			return aHBox;
		},
		
		addKeyTextbox: function (aParent, aId, aValue, aParameters, aVersion, aIndex) {
			var myKexTextBox = cardbookElementTools.addTextbox(aParent, aId, aValue, aParameters);
			myKexTextBox.version = aVersion;

			if (aIndex == 0) {
				function checkKeyTextBox(event) {
					var myIdArray = this.id.split('_');
					if (!document.getElementById(myIdArray[0] + '_1_' + this.version + '_cardbookaddButton')) {
						if (this.value == "") {
							document.getElementById(myIdArray[0] + '_0_' + this.version + '_cardbookaddButton').disabled = true;
							document.getElementById(myIdArray[0] + '_0_' + this.version + '_cardbookremoveButton').disabled = true;
						} else {
							document.getElementById(myIdArray[0] + '_0_' + this.version + '_cardbookaddButton').disabled = false;
							document.getElementById(myIdArray[0] + '_0_' + this.version + '_cardbookremoveButton').disabled = false;
						}
					}
				};
				myKexTextBox.addEventListener("input", checkKeyTextBox, false);
			}
		},

		addTextbox: function (aParent, aId, aValue, aParameters) {
			var aTextbox = document.createElement('textbox');
			aParent.appendChild(aTextbox);
			aTextbox.setAttribute('id', aId);
			aTextbox.setAttribute('value', aValue);

			for (var prop in aParameters) {
				aTextbox.setAttribute(prop, aParameters[prop]);
			}
			return aTextbox;
		},

		loadAddressBooks: function (aPopupName, aMenuName, aDefaultId, aExclusive, aAddAllABs, aIncludeReadOnly, aIncludeSearch) {
			var myPopup = document.getElementById(aPopupName);
			cardbookElementTools.deleteRows(aPopupName);
			var defaultIndex = 0;
			var j = 0;
			if (aAddAllABs) {
				var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				var strBundle = stringBundleService.createBundle("chrome://messenger/locale/addressbook/addressBook.properties");
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", strBundle.GetStringFromName("allAddressBooks"));
				menuItem.setAttribute("value", "allAddressBooks");
				myPopup.appendChild(menuItem);
				if ("allAddressBooks" == aDefaultId) {
					defaultIndex=j;
				}
				j++;
			}
			var sortedAddressBooks = [];
			for (var i = 0; i < cardbookRepository.cardbookAccounts.length; i++) {
				if (cardbookRepository.cardbookAccounts[i][1] && cardbookRepository.cardbookAccounts[i][5] && (aIncludeReadOnly || !cardbookRepository.cardbookAccounts[i][7])
					 && (aIncludeSearch || (cardbookRepository.cardbookAccounts[i][6] !== "SEARCH"))) {
						sortedAddressBooks.push([cardbookRepository.cardbookAccounts[i][0], cardbookRepository.cardbookAccounts[i][4]]);
				}
			}
			if (!aExclusive) {
				var contactManager = Components.classes["@mozilla.org/abmanager;1"].getService(Components.interfaces.nsIAbManager);
				var contacts = contactManager.directories;
				while ( contacts.hasMoreElements() ) {
					var contact = contacts.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
					sortedAddressBooks.push([contact.dirName, contact.dirPrefId]);
				}
			}
			sortedAddressBooks = cardbookUtils.sortArrayByString(sortedAddressBooks,0,1);
			for (var i = 0; i < sortedAddressBooks.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", sortedAddressBooks[i][0]);
				menuItem.setAttribute("value", sortedAddressBooks[i][1]);
				myPopup.appendChild(menuItem);
				if (sortedAddressBooks[i][1] == aDefaultId) {
					defaultIndex=j;
				}
				j++;
			}
			document.getElementById(aMenuName).selectedIndex = defaultIndex;
		},

		loadCategories: function (aPopupName, aMenuName, aDefaultPrefId, aDefaultCatId, aAddAllCats, aAddOnlyCats, aAddNoCats) {
			var myPopup = document.getElementById(aPopupName);
			cardbookElementTools.deleteRows(aPopupName);
			var defaultIndex = 0;
			var j = 0;
			if (aAddAllCats) {
				var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				var strBundle = stringBundleService.createBundle("chrome://cardbook/locale/cardbook.properties");
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", strBundle.GetStringFromName("allCategories"));
				menuItem.setAttribute("value", "allCategories");
				myPopup.appendChild(menuItem);
				if ("allCategories" == aDefaultCatId) {
					defaultIndex=j;
				}
				j++;
			}
			if (aAddAllCats) {
				var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				var strBundle = stringBundleService.createBundle("chrome://cardbook/locale/cardbook.properties");
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", strBundle.GetStringFromName("onlyCategories"));
				menuItem.setAttribute("value", "onlyCategories");
				myPopup.appendChild(menuItem);
				if ("onlyCategories" == aDefaultCatId) {
					defaultIndex=j;
				}
				j++;
			}
			if (aAddNoCats) {
				var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
				var strBundle = stringBundleService.createBundle("chrome://cardbook/locale/cardbook.properties");
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", strBundle.GetStringFromName("noCategories"));
				menuItem.setAttribute("value", "noCategories");
				myPopup.appendChild(menuItem);
				if ("noCategories" == aDefaultCatId) {
					defaultIndex=j;
				}
				j++;
			}
			var sortedCategories = [];
			if (cardbookRepository.cardbookAccountsCategories[aDefaultPrefId]) {
				for (var i = 0; i < cardbookRepository.cardbookAccountsCategories[aDefaultPrefId].length; i++) {
					sortedCategories.push([cardbookRepository.cardbookAccountsCategories[aDefaultPrefId][i], aDefaultPrefId+"::"+cardbookRepository.cardbookAccountsCategories[aDefaultPrefId][i]]);
				}
			}
			sortedCategories = cardbookUtils.sortArrayByString(sortedCategories,0,1);
			for (var i = 0; i < sortedCategories.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", sortedCategories[i][0]);
				menuItem.setAttribute("value", sortedCategories[i][1]);
				myPopup.appendChild(menuItem);
				if (sortedCategories[i][1] == aDefaultCatId) {
					defaultIndex=j;
				}
				j++;
			}
			document.getElementById(aMenuName).selectedIndex = defaultIndex;
		},

		loadDateFormats: function (aPopupName, aMenuName, aDefaultValue) {
			var myPopup = document.getElementById(aPopupName);
			cardbookElementTools.deleteRows(aPopupName);
			var defaultIndex = 0;
			var j = 0;
			for (var i = 0; i < cardbookRepository.dateFormats.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", cardbookRepository.dateFormats[i]);
				menuItem.setAttribute("value", cardbookRepository.dateFormats[i]);
				myPopup.appendChild(menuItem);
				if (cardbookRepository.dateFormats[i] == aDefaultValue) {
					defaultIndex=j;
				}
				j++;
			}
			document.getElementById(aMenuName).selectedIndex = defaultIndex;
		},

		addMenuIMPPlist: function (aParent, aType, aIndex, aArray, aImppDefault, aCode, aProtocol) {
			var aMenulist = document.createElement('menulist');
			aParent.appendChild(aMenulist);
			aMenulist.setAttribute('id', aType + '_' + aIndex + '_menulistIMPP');
			var aMenupopup = document.createElement('menupopup');
			aMenulist.appendChild(aMenupopup);
			aMenupopup.setAttribute('id', aType + '_' + aIndex + '_menupopupIMPP');
			cardbookElementTools.deleteRows(aMenupopup.id);
			var found = false;
			for (var i = 0; i < aArray.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute('id', aType + '_' + aIndex + '_menuitemIMPP_' + i);
				menuItem.setAttribute("label", aArray[i][1]);
				menuItem.setAttribute("value", aArray[i][0]);
				aMenupopup.appendChild(menuItem);
				if (aImppDefault != null && aImppDefault !== undefined && aImppDefault != "") {
					if (aImppDefault == aArray[i][0]) {
						aMenulist.selectedIndex = i;
						found = true;
					}
				} else {
					if (aCode != "") {
						if (aArray[i][0] == aCode) {
							aMenulist.selectedIndex = i;
							found = true;
						}
					} else if (aProtocol != "") {
						if (aArray[i][2] == aProtocol) {
							aMenulist.selectedIndex = i;
							found = true;
						}
					}
				}
			}
			if (!found) {
				aMenulist.selectedIndex = 0;
			}
			return found;
		},

		addMenuCaselist: function (aParent, aType, aIndex, aValue) {
			var strBundle = document.getElementById("cardbook-strings");
			var aMenulist = document.createElement('menulist');
			aParent.appendChild(aMenulist);
			aMenulist.setAttribute('id', aType + '_' + aIndex + '_menulistCase');
			var aMenupopup = document.createElement('menupopup');
			aMenulist.appendChild(aMenupopup);
			aMenupopup.setAttribute('id', aType + '_' + aIndex + '_menupopupCase');
			cardbookElementTools.deleteRows(aMenupopup.id);
			var found = false;
			var caseOperators = [['ig', 'ignoreCaseLabel'], ['g', 'matchCaseLabel']]
			for (var i = 0; i < caseOperators.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute('id', aType + '_' + aIndex + '_menuitemCase_' + i);
				menuItem.setAttribute("label", strBundle.getString(caseOperators[i][1]));
				menuItem.setAttribute("value", caseOperators[i][0]);
				aMenupopup.appendChild(menuItem);
				if (aValue == caseOperators[i][0]) {
					aMenulist.selectedIndex = i;
					found = true;
				}
			}
			if (!found) {
				aMenulist.selectedIndex = 0;
			}
		},

		addMenuObjlist: function (aParent, aType, aIndex, aValue) {
			var aMenulist = document.createElement('menulist');
			aParent.appendChild(aMenulist);
			aMenulist.setAttribute('id', aType + '_' + aIndex + '_menulistObj');
			var aMenupopup = document.createElement('menupopup');
			aMenulist.appendChild(aMenupopup);
			aMenupopup.setAttribute('id', aType + '_' + aIndex + '_menupopupObj');
			cardbookElementTools.deleteRows(aMenupopup.id);
			var myColumns = cardbookUtils.getAllAvailableColumns("all");
			var found = false;
			for (var i = 0; i < myColumns.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute('id', aType + '_' + aIndex + '_menuitemObj_' + i);
				menuItem.setAttribute("label", myColumns[i][1]);
				menuItem.setAttribute("value", myColumns[i][0]);
				aMenupopup.appendChild(menuItem);
				if (aValue == myColumns[i][0]) {
					aMenulist.selectedIndex = i;
					found = true;
				}
			}
			if (!found) {
				aMenulist.selectedIndex = 0;
			}
		},

		addMenuTermlist: function (aParent, aType, aIndex, aValue) {
			var aMenulist = document.createElement('menulist');
			aParent.appendChild(aMenulist);
			aMenulist.setAttribute('id', aType + '_' + aIndex + '_menulistTerm');
			var aMenupopup = document.createElement('menupopup');
			aMenulist.appendChild(aMenupopup);
			aMenupopup.setAttribute('id', aType + '_' + aIndex + '_menupopupTerm');
			cardbookElementTools.deleteRows(aMenupopup.id);
			var stringBundleService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
			var strBundle = stringBundleService.createBundle("chrome://messenger/locale/search-operators.properties");
			var found = false;
			var operators = ['Contains', 'DoesntContain', 'Is', 'Isnt', 'BeginsWith', 'EndsWith', 'IsEmpty', 'IsntEmpty']
			for (var i = 0; i < operators.length; i++) {
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute('id', aType + '_' + aIndex + '_menuitemTerm_' + i);
				menuItem.setAttribute("label", strBundle.GetStringFromName(Components.interfaces.nsMsgSearchOp[operators[i]]));
				menuItem.setAttribute("value", operators[i]);
				aMenupopup.appendChild(menuItem);
				if (aValue == operators[i]) {
					aMenulist.selectedIndex = i;
					found = true;
				}
			}
			if (!found) {
				aMenulist.selectedIndex = 0;
			}

			function fireMenuTerm(event) {
				if (document.getElementById(this.id).disabled) {
					return;
				}
				cardbookComplexSearch.showOrHideForEmpty(this.id);
			};
			aMenulist.addEventListener("command", fireMenuTerm, false);
		},

		addEditButton: function (aParent, aType, aIndex, aVersion, aButtonType, aFunction) {
			var strBundle = document.getElementById("cardbook-strings");
			var aEditButton = document.createElement('button');
			aParent.appendChild(aEditButton);
			aEditButton.setAttribute('id', aType + '_' + aIndex + '_' + aVersion + '_cardbook' + aButtonType + 'Button');
			if (aButtonType == "add") {
				aEditButton.setAttribute('label', '+');
			} else if (aButtonType == "remove") {
				aEditButton.setAttribute('label', '-');
			} else if (aButtonType == "up") {
				aEditButton.setAttribute('label', '↑');
			} else if (aButtonType == "down") {
				aEditButton.setAttribute('label', '↓');
			}
			aEditButton.setAttribute('class', 'small-button');
			aEditButton.setAttribute('tooltiptext', strBundle.getString(aButtonType + "EntryTooltip"));
			aEditButton.addEventListener("click", aFunction, false);
			aEditButton.addEventListener("command", aFunction, false);
		}
	};

};