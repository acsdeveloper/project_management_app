function isNull(value) {
	return typeof value === 'undefined' || value === 'unknown' || value === null || value === 'null' || value === '';
}

function validateEmail(email) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
}

function validateIpAddress(ip) {
	var ipaddress = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	return ipaddress.test(ip);
}

function validateNumber(number) {
	var mobile = /^[\d\s\-\+]+$/;
	return mobile.test(number);
}

function validateUrl(url) {
	var link = /^http(s)?:\/\/.+/i;
	return link.test(url);
}


function isNumberKey(evt) {
	var charCode = (evt.which) ? evt.which : event.keyCode
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;
	return true;
}

function validUrlTitle(title_string) {
	var title_string = title_string;
	title_string = title_string.replace(/[^a-z\d\s]+/gi, "");
	title_string = title_string.replace(/ /g, "-");
	return title_string;
}


const run_mode = 'debug';

function log(text) {
	if (run_mode == 'debug') console.log(text);
}
