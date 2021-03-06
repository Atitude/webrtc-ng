module.exports = MediaStreamService;

//var getScreenMedia = require('getscreenmedia')
var getUserMedia = require('getusermedia');
MediaStreamService.$inject = ['$window', '$q'];



function MediaStreamService($window, $q) {
    var getScreenId = $window.getScreenId;
    var requestedStreams = [];

    var service = {
        getScreenStream: getScreenStream,
        getAudioStream: getAudioStream,
        getVideoStream: getVideoStream,
        flushStreams: flushStreams        
    }

    return service;

    //Solicita que o usuário autorize e seleciona a tela para ser compartilhada
	function getScreenStream() {
        var defered = $q.defer();
        getScreenId(function(error, sourceId, screen_constraints) {
            if (error) {
                defered.reject(error)
            } else {
                getUserMedia(screen_constraints, function(error, stream) {
                    if (error) {
                        defered.reject(error);
                    } else {
                        requestedStreams.push(stream);                        
                        defered.resolve(stream)
                    }
                });
            }
        });

        return defered.promise;
	}	

    //Solicita que o usuário autorize o compartilhamento da webcam
    function getVideoStream() {
        var constraints = {audio: false, video: true};
        var defered = $q.defer();

        getUserMedia(constraints, function(error, stream) {
            if (error) {
                defered.reject(error);
            } else {
                requestedStreams.push(stream);
                defered.resolve(stream);
            }
        });

        return defered.promise;
    }

    //Solicita que o usuário autorize o compartilhamento do audio do microfone
	function getAudioStream(joinStream) {
		var constraints = {audio: true, video:false};
        var defered = $q.defer();

        getUserMedia(constraints, function(error, stream) {
            if (error) {
                defered.reject(error);
            } else {
                requestedStreams.push(stream);
                if (joinStream) {
                    defered.resolve(joinStreams(joinStream, stream));
                } else {
                    defered.resolve(stream);
                }
            }
        });

        return defered.promise;
	}


    //Junta duas streams
    function joinStreams(stream1, stream2) {
        return stream1.addTrack(stream2.getTracks()[0]);
    }    

    //Libera todas as streams requisitadas da memória
    function flushStreams() {
        while(requestedStreams.length) {
            requestedStreams
              .pop()
              .getTracks().forEach(function(stream) {stream.stop()});
        }
    }    

    
}