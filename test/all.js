/**
 * Created by zach on 4/8/16.
 */
// if test function expects second named argument it will be executed
// in async mode and test will be complete only after callback is called
"use strict";
var testSpeechletJSON = {
    "session": {
        "sessionId": "SessionId.692b5842-5ee8-4d71-aac3-f4113024b6e6",
        "application": {
            "applicationId": "amzn1.echo-sdk-ams.app.df5f12dd-7b97-4d8f-b835-ff4a2297bd0b"
        },
        "user": {
            "userId": "amzn1.account.AEL3UWRIJ2MYBZKAVPZJ72K3IJZA"
        },
        "new": true
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "EdwRequestId.be17ec26-b9b3-4f62-b38c-244079d9e7dc",
        "timestamp": "2016-04-08T15:12:46Z",
        "intent": {
            "name": "GetVOTD",
            "slots": {}
        }
    },
    "version": "1.0"
}
// using nodejs's build in asserts that throw on failure
var assert = require('assert');
exports['test esv api connection'] = function(){
    var http = require('http');
    var google = http.createClient(80, 'www.jeditoolkit.com')
    var request = google.request('GET', '/', {'host': 'www.jeditoolkit.com'})
    request.end()
    request.on('response', function (response) {
        assert.equal(response.statusCode, 302, 'must redirect') // will log result
        response.setEncoding('utf8')
        response.on('data', function (chunk) {
            assert.notEqual(chunk, 'helo world', 'must be something more inteligent')
            done() // telling test runner that we're done with this test
        })
    })

}
exports['test that stops execution on first failure'] = function() {
    assert.equal(2 + 2, 4, 'assert fails and test execution stop here')
    assert.equal(3 + 2, 5, 'will never pass this since test failed above')
}

if (module == require.main) require('test').run(exports)