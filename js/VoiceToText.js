function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function httpPost(theUrl, params)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false );
    xmlHttp.setRequestHeader('Content-Type', 'application/json')
    xmlHttp.setRequestHeader ("Authorization", "2237d40ef462b04c65f0574d3925f188b6250b34");
    xmlHttp.send( "{\"req\":\"" + params + "\"}" );

    xmlHttp.onreadystatechange = function() {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            //console.log(xhr.responseText);
        }
        else if(xhr.readyState === XMLHttpRequest.LOADING) {
            //console.log("loadiiing");
        }
    }
    return xmlHttp.responseText;
}

function launchText(mtext = false) {
    var find = false;
    if (!mtext) { mtext = document.getElementById('result-field').value.replace(/\n/g, " "); }
    if (mtext != "") {

        //remove accents
        mtext = mtext.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

        //List to Array
        var keys = Object.keys(body_parts);

        for (var i = keys.length - 1; i >= 0; i--) {
            if (mtext.indexOf(keys[i].replace('_', ' ')) != -1){
                if (!find) { unsetPains(); find = !find; }
                setPain(keys[i],1,1); //body_part, intensity, sensation
            }
        }
        if (find){
          window.scrollTo(0, 0);
          $('#activated-api').text('Fin de la reconnaissance');
        }
        else{
            $('#activated-api').text('Fin de la reconnaissance - Aucun résultat');
        }
    }
}

function launchProcess() {
    var SpeechRecognition = SpeechRecognition ||
                              webkitSpeechRecognition ||
                              mozSpeechRecognition ||
                              msSpeechRecognition ||
                              oSpeechRecognition;

    var recognition;
    var lastStartedAt;
    var find = false;

    if (!SpeechRecognition) {
        $('#activated-api').text('Pas de reconnaissance vocale disponible');
        alert('Pas de reconnaissance vocale disponible');
    }
    else
    {
        if (recognition && recognition.abort) {
            recognition.abort();
        }
        recognition = new SpeechRecognition();
        //recognition.continuous = true;
        recognition.lang = 'fr-FR';
        recognition.onsoundstart = function() {
            $('#activated-api').text('Démarrage de la reconnaissance');
        };
        recognition.onssoundend = function() {
            $('#activated-api').text('Fin de la reconnaissance');
        };

        recognition.onresult = function (event) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                /* recuperation sous forme de texte */
                var texteReconnu = event.results[i][0].transcript;

        launchText(texteReconnu.toLowerCase());

        $('#result-field').val(texteReconnu);
                var u = new SpeechSynthesisUtterance();
                u.text = texteReconnu;
                u.lang = 'fr-FR';
                /* Set la cadence vocale */
                u.rate = 1.1;
                // speechSynthesis.speak(u);
            }
        };
        recognize();
    }

    function recognize() {
        lastStartedAt = new Date().getTime();
        recognition.start();
    }
}

function launchTextProd() {
    var mtext = document.getElementById('result-field').value.replace(/\n/g, " ");
     if (mtext != "") {
        // GET request to the nlp API.

        human.unsetPains();

        var nlp_ret = JSON.parse(httpPost(document.location.origin + "/api/nlp", mtext.toLowerCase() ));
        var find = false;


        for (var i = 0; i < nlp_ret["body_part"].length; i++) {
            find = true;
            part_find = true;
            human.setPain(nlp_ret["body_part"][i][0],
            nlp_ret["intensity"][i],
            nlp_ret["sensation"][i]);
        }

        if (find){
          window.scrollTo(0, 0);
          $('#activated-api').text('Fin de la reconnaissance');
        }
        else{
            $('#activated-api').text('Fin de la reconnaissance - Aucun rÃ©sultat');
        }
    }
}

function launchProcessProd() {
    var SpeechRecognition = SpeechRecognition ||
                              webkitSpeechRecognition ||
                              mozSpeechRecognition ||
                              msSpeechRecognition ||
                              oSpeechRecognition;

    var recognition;
    var lastStartedAt;
    var find = false;

    if (!SpeechRecognition) {
        $('#activated-api').text('Pas de reconnaissance vocale disponible');
        alert('Pas de reconnaissance vocale disponible');
    }
    else
    {
        if (recognition && recognition.abort) {
            recognition.abort();
        }
        recognition = new SpeechRecognition();
        //recognition.continuous = true;
        recognition.lang = 'fr-FR';
        recognition.onsoundstart = function() {
            $('#activated-api').text('Démarrage de la reconnaissance');
        };
        recognition.onssoundend = function() {
            $('#activated-api').text('Fin de la reconnaissance');
        };

        recognition.onresult = function (event) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                /* recuperation sous forme de texte */
                var texteReconnu = event.results[i][0].transcript;

        // POST request to the nlp API.
        var nlp_ret = JSON.parse(httpPost(document.location.origin + "/api/nlp", texteReconnu.toLowerCase() ));

        human.unsetPains();

        for (var i = 0; i < nlp_ret["body_part"].length; i++) {
            find = true;
            part_find = true;
            human.setPain(nlp_ret["body_part"][i][0],
            nlp_ret["intensity"][i],
            nlp_ret["sensation"][i]);
        }


        if (find) {
        window.scrollTo(0, 0);
            $('#activated-api').text('Fin de la reconnaissance');
        } else {
            $('#activated-api').text('Fin de la reconnaissance - Aucun rÃ©sultat');
        }

        $('#result-field').val(texteReconnu);
                var u = new SpeechSynthesisUtterance();
                u.text = texteReconnu;
                u.lang = 'fr-FR';
                /* Set la cadence vocale */
                u.rate = 1.1;
                // speechSynthesis.speak(u);
            }
        };
        recognize();
    }

    function recognize() {
        lastStartedAt = new Date().getTime();
            recognition.start();
    }
}