function read_cookie(name) {
    var nameEQ = escape(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
    }
    return null;
}
function fixCanvasLocation(top_margin) {
    var width = $(window).width();
    var height = $(window).height();
    var canvas = document.getElementById('canvas_0');
    var eventLayer = document.getElementById('eventLayer');

    if (canvas != null && eventLayer != null) {
        var left_margin = 0;
        if (canvas.offsetWidth < width) {
            left_margin = (width - canvas.offsetWidth) / 2;
        }
        canvas.style.top = top_margin + "px";
        canvas.style.marginLeft = left_margin + "px";
        eventLayer.style.top = top_margin + "px";
        eventLayer.style.marginLeft = left_margin + "px";
        app.clientGui.setCanvasMargin({"x": left_margin, "y": top_margin})
        app.clientGui.setClientOffset(-left_margin, -top_margin);
    }
}
function toggleMenuBar() {
    if (document.getElementById("login").className == "") {
        fixCanvasLocation(0);
        document.getElementById("login").className = "hidden";
        document.getElementById("menubarbutton").firstChild.data = "Pin Menu";
    } else {        
        fixCanvasLocation(45);
        document.getElementById("login").className = "";
        document.getElementById("menubarbutton").firstChild.data = "Hide Menu";
    }
}
function showMenuBar() {
    if (document.getElementById("login").className == "hidden") {
        document.getElementById("login").className = "hidden-peek";
    }
}
function hideMenuBar() {
    if (document.getElementById("login").className == "hidden-peek") {
        document.getElementById("login").className = "hidden";

    }
}
function closeSession(error) {
    inactivityClosed = true;
    clearTimeout(inactivityTimer);
    clearTimeout(inactivityCountdownTimer);
    if (!error) {
       app.disconnect();
    }
    
    if (error) {
        document.getElementById("dialog-end-text").innerHTML =
          "There was a connection error. Please close this tab and try again later";
    }

    document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("overlay").style.opacity = "0.7";
    document.getElementById("dialog-end").style.visibility = "visible";
    var canvas = document.getElementById('canvas_0');
    if (canvas) {
        canvas.style.visibility = "hidden";
    }
}
function showClientID() {
    var hwaddress = read_cookie("hwaddress");
    alert("El identificador de este navegador es: " + hwaddress);
}
var progFS = false;
var isFS = false;
var wasFS = false;
function toggleFullScreen(elem) {
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
        if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else {
            alert("Este navegador no soporta el cambio automatico a pantalla completa. Por favor, pulse F11 para cambiar de forma manual");
        }
    } else {
        if (document.mozCancelFullScreen) {
            progFS = true;
            document.mozCancelFullScreen();
        }
    }
}
function showCloseDialog() {
    document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("dialog-close").style.visibility = "visible";
}
function closeAction(close) {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("dialog-close").style.visibility = "hidden";
    if (close) {
        closeSession(false);
    } else if (wasFS) {
        wasFS = false;
        toggleFullScreen(document.body);
    }
}
function overlayAction(fullscreen) {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("dialog-fs").style.visibility = "hidden";
    if (fullscreen) {
        toggleMenuBar();
        toggleFullScreen(document.body);
    }
}
function showExtWin() {
    document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("extwin").style.visibility = "visible";
}
function hideExtWin() {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("extwin").style.visibility = "hidden";
}
function isFullScreen() {
    isFS = true;
    document.getElementById("fullscreen").firstChild.data = "Ventana Normal";
    document.getElementById("menubarbutton").style.visibility = "hidden";
}
function notFullScreen() {
    isFS = false;
    document.getElementById("fullscreen").firstChild.data = "Pantalla Completa";
    document.getElementById("menubarbutton").style.visibility = "visible";
    if (progFS) {
        progFS = false;
    } else {
        wasFS = true;
        showCloseDialog();
    }
}
function sendCtrlAltDel() {
    app.sendCtrlAltDel();
    document.getElementById("inputmanager").focus();
}
document.addEventListener("mozfullscreenchange", function () {
    (document.mozFullScreen) ? isFullScreen() : notFullScreen();
}, false);
inactivityTimer = null;
inactivityCountdownTimer = null;
inactivityCountdown = false;
inactivityCountdownSecs = 0;
inactivityClosed = false;
function setInactivityTimer() {
	if (inactivityTimeout == 0 || inactivityClosed) {
		return;
	}
	if (inactivityCountdown) {
		stopInactivityCountdown();
	}
	if (inactivityTimer != null) {
		clearTimeout(inactivityTimer);
	}
	inactivityTimer = setTimeout(inactivityHandler, inactivityTimeout * 1000);
}
function inactivityHandler() {
	startInactivityCountdown();
}
function startInactivityCountdown() {
	document.getElementById("inactivity-close-text").innerHTML =
		"Su sesión de VDI se cerrará por inactividad en " +
		inactivityGrace + " segundos";
	document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("inactivity-close").style.visibility = "visible";
	if (inactivityCountdownTimer != null) {
		clearTimeout(inactivityCountdownTimer);
	}
	inactivityCountdownSecs = inactivityGrace;
	inactivityCountdownTimer = setTimeout(inactivityCountdownHandler, 1000);
	inactivityCountdown = true;
}
function stopInactivityCountdown() {
	document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("inactivity-close").style.visibility = "hidden";
	if (inactivityCountdownTimer != null) {
		clearTimeout(inactivityCountdownTimer);
	}
	inactivityCountdown = false;
	setInactivityTimer();
	document.getElementById("inputmanager").focus();
}
function inactivityCountdownHandler() {
	inactivityCountdownSecs -= 1;
	if (inactivityCountdownSecs < 1) {
		document.getElementById("inactivity-close").style.visibility = "hidden";
		inactivityClosed = true;
		closeSession(true);
		return;
	}
	document.getElementById("inactivity-close-text").innerHTML =
		"Su sesión de VDI se cerrará por inactividad en " +
		inactivityCountdownSecs + " segundos";
	if (inactivityCountdownTimer != null) {
		clearTimeout(inactivityCountdownTimer);
	}
	inactivityCountdownTimer = setTimeout(inactivityCountdownHandler, 1000);
}
