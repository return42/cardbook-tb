if ("undefined" == typeof(wdw_birthdaySync)) {  
	var wdw_birthdaySync = {
		lTimerSync : null,
		lEventTimerSync : { notify: function(lTimerSync) {
			wdw_birthdaySync.do_refresh();
		} },
		
		syncAllBirthdays: function () {
			Components.utils.import("chrome://cardbook/content/cardbookRepository.js");
			cardbookBirthdaysUtils.syncWithLightning();
			wdw_birthdaySync.do_refresh();
			
			wdw_birthdaySync.lTimerSync = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
			wdw_birthdaySync.lTimerSync.initWithCallback(wdw_birthdaySync.lEventTimerSync, 1000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
		},
	
		do_close: function () {
			wdw_birthdaySync.lTimerSync.cancel();
			close();
		},

		do_refresh: function () {
			var strBundle = document.getElementById("cardbook-strings");
			var maxDaysUntilNextBirthday = cardbookBirthdaysUtils.getPref("extensions.cardbook.numberOfDaysForWriting");

			// if there are no birthdays in the configured timespan
			if (cardbookBirthdaysUtils.lBirthdayList.length == 0) {
				var today = new Date();
				today = new Date(today.getTime() + maxDaysUntilNextBirthday * 24*60*60*1000);
				var noBirthdaysFoundMessage = strBundle.getFormattedString("noBirthdaysFoundMessage", new Array(convertDateToString(today)));
				var treeView = {
					rowCount : 1,
					getCellText : function(row,column){
						if (column.id == "addressbook") return noBirthdaysFoundMessage;
					}
				}
				document.getElementById('syncListTree').view = treeView;
				document.title=strBundle.getFormattedString("syncListWindowLabelEnded", [0,0]);
			} else {
				var totalRecordsToInsert = cardbookBirthdaysUtils.lBirthdayList.length * cardbookBirthdaysUtils.lCalendarList.length;
				var totalRecordsInserted = cardbookBirthdaysUtils.lBirthdaySyncResult.length - cardbookBirthdaysUtils.lCalendarList.length;
				
				var lBirthdaySyncResultGrouped = [];
				for (var i=0; i<cardbookBirthdaysUtils.lBirthdaySyncResult.length; i++) {
					var jfound = -1;
					for (var j=0; j<lBirthdaySyncResultGrouped.length; j++) {
						if (cardbookBirthdaysUtils.lBirthdaySyncResult[i][4] == lBirthdaySyncResultGrouped[j][4] && jfound == -1) {
							jfound = j;
						}
					}
					if (jfound == -1) {
						lBirthdaySyncResultGrouped.push([cardbookBirthdaysUtils.lBirthdaySyncResult[i][0],cardbookBirthdaysUtils.lBirthdaySyncResult[i][1],cardbookBirthdaysUtils.lBirthdaySyncResult[i][2],cardbookBirthdaysUtils.lBirthdaySyncResult[i][3],cardbookBirthdaysUtils.lBirthdaySyncResult[i][4]]);
					} else {
						lBirthdaySyncResultGrouped[jfound][1] += cardbookBirthdaysUtils.lBirthdaySyncResult[i][1];
						lBirthdaySyncResultGrouped[jfound][2] += cardbookBirthdaysUtils.lBirthdaySyncResult[i][2];
						lBirthdaySyncResultGrouped[jfound][3] += cardbookBirthdaysUtils.lBirthdaySyncResult[i][3];
					}
				}
	
				var treeView = {
					rowCount : lBirthdaySyncResultGrouped.length,
					getCellText : function(row,column){
						if (column.id == "addressbook") return lBirthdaySyncResultGrouped[row][0];
						else if (column.id == "existing") return lBirthdaySyncResultGrouped[row][1];
						else if (column.id == "failed") return lBirthdaySyncResultGrouped[row][2];
						else if (column.id == "succeeded") return lBirthdaySyncResultGrouped[row][3];
						else return lBirthdaySyncResultGrouped[row][4];
					}
				}
				document.getElementById('syncListTree').view = treeView;
				if (totalRecordsToInsert != totalRecordsInserted) {
					var lTotalDisplayed = (totalRecordsInserted<0?'0':totalRecordsInserted.toString());
					document.title=strBundle.getFormattedString("syncListWindowLabelRunning", [lTotalDisplayed,totalRecordsToInsert.toString()]);
				} else {
					document.title=strBundle.getFormattedString("syncListWindowLabelEnded", [totalRecordsInserted.toString(),totalRecordsToInsert.toString()]);
				}
			}
		}
	};
};