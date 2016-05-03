window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var animationId;
  var audioContext = new AudioContext;
  var oscillator = null;
  var video;
  var isStop = true;
  var source;

  // HTML要素
  var soundButton = document.getElementById('sound_button');
  var rangeVolume = document.getElementById('range-volume');
  var rangePlaybackRate = document.getElementById('range-playback-rate');

  // ビデオの構築
  video = document.getElementById("video");
  video.src = "video/sample.mp4"

  video.addEventListener('play', function(event) {

    // AudioBufferSourceNode (Input) -> GainNode (Volume) -> Analyser(Visualizer) -> AudioDestinationNode (Output)
    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set parameters
    video.playbackRate = rangePlaybackRate.valueAsNumber;
  });

  // ビデオの読み込み完了時の処理
  video.addEventListener('loadedmetadata', function(event) {
    // Create the instance of MediaElementAudioSourceNode
    source = audioContext.createMediaElementSource(video);
    //console.log(source.getChannelData);
  });

  // ゲインノードの構築
  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  // アナライザノードの構築
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 128; // 高速フーリエ変換の分割サイズ

  soundButton.addEventListener('click', function() {
    if(isStop) {
      // Start audio
      video.play();

      isStop = false;
      document.getElementById('sound_icon').classList.remove("icon-start");
      document.getElementById('sound_icon').classList.add("icon-stop");
    } else {
      video.pause();
      video = null;
      source = null;
      isStop = true;
      document.getElementById('sound_icon').classList.remove("icon-stop");
      document.getElementById('sound_icon').classList.add("icon-start");
    }
  });

  rangeVolume.addEventListener('input', function() {
    var min = gain.gain.minValue || 0;
    var max = gain.gain.maxValue || 1;
    if ((this.valueAsNumber >= min) && (this.valueAsNumber <= max)) {
      gain.gain.value = this.valueAsNumber;
      document.getElementById('output-volume').textContent = this.value;
    }
  });

  rangePlaybackRate.addEventListener('input', function() {
    if(video){
      video.playbackRate = this.valueAsNumber;
    }
    document.getElementById('playback-rate').textContent = this.value;
  });
};
