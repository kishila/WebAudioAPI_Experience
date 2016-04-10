window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var animationId;
  var audioContext = new AudioContext;
  var oscillator = null;
  var audio;
  var isStop = true;

  // ゲインノードの構築
  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  // アナライザノードの構築
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 128; // 高速フーリエ変換の分割サイズ

  // キャンバスの構築
  var canvas        = document.getElementById('visualizer');
  var canvasContext = canvas.getContext('2d');
  canvas.setAttribute('width', analyser.frequencyBinCount * 10);

  document.getElementById('sound_button').addEventListener('click', function() {
    if(isStop) {
      audio= document.getElementById("audio");

      audio.addEventListener('play', function(event) {
        // Create the instance of MediaElementAudioSourceNode
        var source = audioContext.createMediaElementSource(audio);

        // AudioBufferSourceNode (Input) -> GainNode (Volume) -> Analyser(Visualizer) -> AudioDestinationNode (Output)
        source.connect(gain);
        gain.connect(analyser);
        analyser.connect(audioContext.destination);

        // Set parameters
        audio.playbackRate = document.getElementById('range-playback-rate').valueAsNumber;
      });

      // Start audio
      audio.play();

      // Animation
      animationId = requestAnimationFrame(render);

      isStop = false;
      document.getElementById('sound_icon').classList.remove("icon-start");
      document.getElementById('sound_icon').classList.add("icon-stop");
    } else {
      audio.pause();
      audio = null;
      cancelAnimationFrame(animationId)
      isStop = true;
      document.getElementById('sound_icon').classList.remove("icon-stop");
      document.getElementById('sound_icon').classList.add("icon-start");
    }
  });

  render = function(){
    var spectrums = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(spectrums);
　
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for(var i=0, len=spectrums.length; i<len; i++){
      canvasContext.fillRect(i*10, 0, 5, spectrums[i]);
    }

    animationId = requestAnimationFrame(render);
  };

  document.getElementById('range-volume').addEventListener('input', function() {
    var min = gain.gain.minValue || 0;
    var max = gain.gain.maxValue || 1;
    if ((this.valueAsNumber >= min) && (this.valueAsNumber <= max)) {
      gain.gain.value = this.valueAsNumber;
      document.getElementById('output-volume').textContent = this.value;
    }
  });

  document.getElementById('range-playback-rate').addEventListener('input', function() {
    if(audio){
      audio.playbackRate = this.valueAsNumber;
    }
    document.getElementById('playback-rate').textContent = this.value;
  });
};
