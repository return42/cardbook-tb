if ("undefined" == typeof(wdw_cardbookAskUser)) {
	var wdw_cardbookAskUser = {
		
		load: function () {
			var strBundle = document.getElementById("cardbook-strings");
			document.title = strBundle.getString("askUserTitle");
			document.getElementById('messageLabel').value = window.arguments[0].message;
			document.getElementById('askUserButton1').label = strBundle.getString(window.arguments[0].button1 + "AskUserLabel");
			document.getElementById('askUserButton2').label = strBundle.getString(window.arguments[0].button2 + "AskUserLabel");
			if (window.arguments[0].button3 != null && window.arguments[0].button3 !== undefined && window.arguments[0].button3 != "") {
				document.getElementById('askUserButton3').label = strBundle.getString(window.arguments[0].button3 + "AskUserLabel");
				document.getElementById('askUserButton3').hidden = false;
			} else {
				document.getElementById('askUserButton3').hidden = true;
			}
		},

		fireButton: function (aButton) {
			var myButton = aButton.id.replace("askUser", "").toLowerCase(); 
			window.arguments[0].result = window.arguments[0][myButton];
			close();
		},

		cancel: function () {
			window.arguments[0].result = "cancel";
			close();
		}

	};

};
