window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var source, animationId;;
  var audioContext = new AudioContext;
  var oscillator = null;
  var fileReader   = new FileReader;

  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;

  var canvas        = document.getElementById('visualizer');
  var canvasContext = canvas.getContext('2d');
  canvas.setAttribute('width', analyser.frequencyBinCount * 10);

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(buffer){
      // 2回目以降のファイル選択
      if(source){
        source.stop();
        cancelAnimationFrame(animationId)
      }

      // AudioBufferSourceNodeのインスタンスの作成
      source = audioContext.createBufferSource();

      // AudioBufferをセット
      source.buffer = buffer;

      // AudioBufferSourceNode (Input) -> GainNode (Volume) -> Analyser(Visualizer) -> AudioDestinationNode (Output)
      source.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioContext.destination);

      // Set parameters
      source.playbackRate.value = document.getElementById('range-playback-rate').valueAsNumber
      source.loop = document.getElementById('checkbox-loop').checked;

      // Start audio
      source.start(0);

      animationId = requestAnimationFrame(render);
    });
  };

  render = function(){
    var spectrums = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(spectrums);
　
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0, len=spectrums.length; i<len; i++){
      canvasContext.fillRect(i*10, 0, 5, spectrums[i]);
    }

    animationId = requestAnimationFrame(render);
  };

  document.getElementById('audio-file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  document.getElementById('range-volume').addEventListener('input', function() {
    var min = gain.gain.minValue || 0;
    var max = gain.gain.maxValue || 1;
    if ((this.valueAsNumber >= min) && (this.valueAsNumber <= max)) {
      gain.gain.value = this.valueAsNumber;
      document.getElementById('output-volume').textContent = this.value;
    }
  });

  document.getElementById('range-playback-rate').addEventListener('input', function() {
    if(source){
      source.playbackRate.value = this.valueAsNumber;
    }
    document.getElementById('playback-rate').textContent = this.value;
  });

  document.getElementById('checkbox-loop').addEventListener('change', function() {
    if(source){
      source.loop = this.checked;
    }
  });
};
