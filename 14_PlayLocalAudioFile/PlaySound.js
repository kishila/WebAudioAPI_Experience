window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext;
  var oscillator = null;
  var isStop = true;
  var source = audioContext.createBufferSource();

  var audioBufferLoader = new AudioBufferLoader('something.wav');
  audioBufferLoader.onload = function(buffer) {
    var context = this.context;
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    e.removeAttribute("disabled");
    e.onclick = function() {
        source.start();
    };
  };
  audioBufferLoader.load();

  document.getElementById('sound_button').addEventListener('click', function(){
    if(isStop){
      source.start(0);
      isStop = false;
      document.getElementById('sound_icon').classList.remove("icon-start");
      document.getElementById('sound_icon').classList.add("icon-stop");
    } else {
      source.stop();
      isStop = true;
      document.getElementById('sound_icon').classList.remove("icon-stop");
      document.getElementById('sound_icon').classList.add("icon-start");
    }
  });
};


//

function AudioBufferLoader(url) {
    window.AudioContext = window.AudioContext
        || window.webkitAudioContext
        || window.mozAudioContext
        || window.msAudioContext;
    try {
        this.context = new AudioContext;
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }
    this.url = url;
    this.buffer = null;
}

AudioBufferLoader.prototype.onload = function(buffer) {
    // set your own callback!
    // this is a default behavior
    var source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start();
};

AudioBufferLoader.prototype.loadBuffer = function(url) {
    var request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';

    var loader = this;

    request.onload = function() {
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (! buffer) {
                    alert('error decodeing file data: ' + url);
                    return;
                }
                loader.buffer = buffer;
                loader.onload(loader.buffer);
            },
            function(error) {
                console.error('decodeAudioData error', error);
            }
        );
    };
    request.onerror = function() {
        alert('AudioBufferLoader: XHR error');
    };

    request.send();
};

AudioBufferLoader.prototype.load = function() {
    this.loadBuffer(this.url);
};
