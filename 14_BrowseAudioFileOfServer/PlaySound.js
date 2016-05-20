window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext;
  var oscillator = null;
  var isStop = true;
  var seBuffer;

  var xhr = new XMLHttpRequest();
  var url = './mp3/se.mp3';

  xhr.onload = function() {
      if (xhr.status === 200) {
          var arrayBuffer = xhr.response;
          if (arrayBuffer instanceof ArrayBuffer) {
              var successCallback = function(audioBuffer) {
                seBuffer = audioBuffer;
              };

              var errorCallback = function(error) {
                  if (error instanceof Error) {
                      window.alert(error.message);
                  } else {
                      window.alert('Error : "decodeAudioData" method.');
                  }
              };
              audioContext.decodeAudioData(arrayBuffer, successCallback, errorCallback);
          }
      }
  };

  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';  // XMLHttpRequest Level 2
  xhr.send(null);

  document.getElementById('sound_button').addEventListener('click', function(){
    var source = audioContext.createBufferSource();
    source.buffer = seBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  });
}
