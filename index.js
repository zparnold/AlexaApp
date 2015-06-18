/**
 * This sample shows how to create a simple Lambda function for handling speechlet requests.
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
var request = require('request');
var S = require('string');
var verseURL = "http://www.esvapi.org/v2/rest/dailyVerse?key=71249ba5b2b33d79&include-footnotes=false&include-verse-numbers=false&include-word-ids=false&include-audio-link=false&include-short-copyright=false";
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and replace application.id with yours
         * to prevent other voice applications from using this function.
         */

        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.df5f12dd-7b97-4d8f-b835-ff4a2297bd0b") {
            context.fail("Invalid Application ID");
        }


        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);

            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the app without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);

}

/**
 * Called when the user specifies an intent for this application.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ("GetVOTD" === intentName) {
        getVotd(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the app returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

/**
 * Helpers that build all of the responses.
 */
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}

/**
 * Functions that control the app's behavior.
 */
function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var verse = "";
    var sessionAttributes = {};
    var cardTitle = "ESV Verse of the Day";
    var speechOutput = "Welcome, here is the verse of the day for today: ";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Would you like to hear the verse of the day again? Please answer yes or no.";
    var shouldEndSession = false;

    getVerse(function(err,result){
        if(err){
            verse = "There was an error getting the verse. Please try again";
        }
        else {
            verse = result;
            speechOutput += verse;
            shouldEndSession = true;
            //Because asynchronous calls suck, we have to stick the callback inside of another callback
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }
    });
}

/**
 * gets the verse of the day from the ESV api and then prepares response
 */
function getVotd(intent, session, callback) {
    var cardTitle = "ESV Verse of the Day";
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = getVerse();

    repromptText = "Do you want to hear the verse of the day? Please say yes or no.";
    getVerse(function(err,result){
        if(err){
            verse = "There was an error getting the verse. Please try again";
        }
        else {
            verse = result;
            speechOutput += verse;
            shouldEndSession = true;
            //Because asynchronous calls suck, we have to stick the callback inside of another callback
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }
    });

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Gets verse from ESV API and passes it to the parser with a callback
 */
function getVerse(callback){
    var response = "";
    request(verseURL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
            proccessVerse(body,function(err,result){
                if (err){
                    console.log("something went wrong")
                }
                else{
                    callback(false,result);
                }
            });
        }
    });
    return response;
}

/**
 * This function strips out the html tags from the verse and returns plaintext
 */
function proccessVerse(html, callback){
    var response = "";

    response = S(html).stripTags().s //'just some text'
    response = S(response).collapseWhitespace().s;

    callback(false, response);
}