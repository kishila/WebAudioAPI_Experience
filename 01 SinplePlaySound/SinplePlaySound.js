window.onload = function(){
  var source, animationId;
  var audioContext = new AudioContext;
  var fileReader   = new FileReader;

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(buffer){
      if(source) {
        source.stop();
      }

      source = audioContext.createBufferSource();

      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    });
  };

  document.getElementById('file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

};
