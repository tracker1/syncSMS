//syncSMS by dmxrob (Robert Stinnett) - http://blog.dmxrob.net | ssh://bbs.dmxrob.net | telnet://bbs.dmxrob
//Github:  https://github.com/robertstinnett/syncSMS
//Code for Error Handling by Kirkman - http://breakintochat.com & https://github.com/Kirkman

// Setup some color variables
var gy = "\1n\001w"; //Synchronet Ctrl-A Code for Normal White (which looks gray)
var wh = "\001w\1h"; //Synchronet Ctrl-A Code for High Intensity White
var drkyl = "\001n\001y"; //Synchronet Ctrl-A Code for Dark (normal) Yellow
var yl = "\001y\1h"; //Synchronet Ctrl-A Code for High Intensity Yellow
var drkbl = "\001n\001b"; //Synchronet Ctrl-A Code for Dark (normal) Blue
var bl = "\001b\1h"; //Synchronet Ctrl-A Code for High Intensity Blue
var drkrd = "\001n\001r"; //Synchronet Ctrl-A Code for Dark (normal) Red
var rd = "\001r\1h"; //Synchronet Ctrl-A Code for High Intensity Red
var drkcy = "\001n\001c"; //Synchronet Ctrl-A Code for Dark (normal) Cyan
var cy = "\001c\1h"; //Synchronet Ctrl-A Code for High Intensity Cyan
var gr = "\001g\1h"; //Synchronet Ctrl-A Code for High Intensity Green

// Set some program variables

var version = cy + "1.00" + bl + " - " + cy + "02/17/2019";
var apiEndpoint = "https://api.twilio.com/2010-04-01/Accounts/"; // Twilo Endpoint

//Load modopts.ini info early so we can detect if the section exists for [syncSMS]
//see sysop.txt for what should be in this section
var opts=load({},"modopts.js","syncSMS"); 
if (opts === null) {
	log("ERROR in sms.js: opts is null.");
	log("ERROR in sms.js: Are you sure you have a section in modopts.ini labeled [syncSMS]? See sysop.txt for instructions.");
	exit();
}

load("http.js"); //this loads the http libraries which you will need to make requests to the web server
load("sbbsdefs.js"); //loads a bunch-o-stuff that is probably beyond the understanding of mere mortals 

// Get configuration information
// See the sysop.txt file for more information
var smsFromNumber = opts.smsFromNumber;
var smsToNumber = opts.smsToNumber;
var twilioAccountSid = opts.twilioAccountSid;
var twilioAuthToken = opts.twilioAuthToken;


function displayHeader() {
	// Display program splash screen
	console.clear();
	console.putmsg(gr + "  ________"); 
	console.crlf();
	console.putmsg(gr + " (_]----[_)");
	var whereTitleGoes = console.getxy();
	console.crlf();
	console.putmsg(gr + ".~ |.''.|");
	var whereSloganGoes = console.getxy();
	console.crlf();
	console.putmsg(gr + "~. |'..'|");
	console.crlf();
	console.putmsg(gr + " `~`----`"); 
	console.crlf();
	var whereBottomIs = console.getxy();
    console.gotoxy(whereTitleGoes);
	console.putmsg(bl + "  syncSMS " + cy + "v" + version + bl + " by " + wh + "dmxrob");
	console.gotoxy(whereSloganGoes);
	console.putmsg(yl + "  Send direct text messages to the SysOp");
	console.gotoxy(whereBottomIs);
	console.crlf(2);
	
}

function sendSMSMessage() {
	// Get the message to send and then send it!
	
	console.putmsg(bl + "Enter your phone number: ");
	var myPhone =  console.getstr(LEN_PHONE,K_UPPER|K_LINE|K_EDIT|K_AUTODEL);
	console.crlf();
	console.putmsg(bl + "Enter your message below. Limit of 120 characters. Keep it short and sweet.");
	console.crlf();
	console.putmsg(yl + ":");
	var mySMSMessage = console.getstr(79,K_WRAP|K_LINE|K_EDIT);
	console.putmsg(yl + ":" + wh);
	mySMSMessage = mySMSMessage + console.getstr(41,K_LINE|K_EDIT);

	if (console.yesno("Send above text msg to " + system.operator + "")) {
		// Ok, let's send it.

		mySMSMessage = "U:" + user.alias + " P:" + myPhone + " M:" + mySMSMessage;

		log("syncSMS Message Sent: "+ mySMSMessage);

		var req = new HTTPRequest(twilioAccountSid,twilioAuthToken);
		var reqData = "From=" + smsFromNumber + "&To=" + smsToNumber + "&Body=" + mySMSMessage;
		var sendSMSResult = req.Post(apiEndpoint + twilioAccountSid  + "/Messages.json",encodeURI(reqData));

		if (sendSMSResult === undefined) {
			// Something went wrong
			log("ERROR in sms.js (syncSMS):  Request to Twilio returned nothing/undefined");
			console.putmsg("Sorry, something went wrong - SysOp notified. :-(")
			console.pause();
			exit();
		}
		else {
			console.crlf(2);
			var twilioResponseJSON = JSON.parse(sendSMSResult);
			if (twilioResponseJSON.status == "queued") {
		
				console.putmsg(bl + "Your text message has been sent to the SysOp.");
				console.crlf();
			}
			else {
				console.putmsg(rd + "Error sending messaging.  Aborted.");
				log("ERROR in sms.js (syncSMS): Message failed to send. Twilio status returned " + twilioResponseJSON.status);
				console.crlf();

			}

		}		
	}
	else {
		console.putmsg(rd + "Message send aborted.  Nothing sent.");
		console.crlf();
	}
}

		
try {

	log("syncSMS launched: " + user.alias + " - " + user.ip_address);
	displayHeader();
	sendSMSMessage();
	console.pause();
    console.clear();
    console.aborted = false;

} catch (err) {

log("ERROR in sms.js. " + err);
log(LOG_DEBUG,"DEBUG for sms.js. The user.connection object looked like this at the time of error: " + user.connection);

} finally {

    exit();

}

exit();
