window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var source;
  var audioContext = new AudioContext;
  var oscillator = null;
  var fileReader   = new FileReader;

  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(buffer){
      // 2回目以降のファイル選択
      if(source){
        source.stop();
      }

      // AudioBufferSourceNodeのインスタンスの作成
      source = audioContext.createBufferSource();

      // AudioBufferをセット
      source.buffer = buffer;

      // AudioBufferSourceNode (Input) -> GainNode (Volume) -> AudioDestinationNode (Output)
      source.connect(gain);
      gain.connect(audioContext.destination);

      // Set parameters
      source.playbackRate.value = document.getElementById('range-playback-rate').valueAsNumber
      source.loop = document.getElementById('checkbox-loop').checked;

      // Start audio
      source.start(0);
    });
  };

  // ファイルが選択されたとき
  document.getElementById('audio-file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  // Volumeバーが操作されたとき
  document.getElementById('range-volume').addEventListener('input', function() {
    var min = gain.gain.minValue || 0;
    var max = gain.gain.maxValue || 1;
    if ((this.valueAsNumber >= min) && (this.valueAsNumber <= max)) {
      gain.gain.value = this.valueAsNumber;
      document.getElementById('output-volume').textContent = this.value;
    }
  });

  // PlaybackRateバーが操作されたとき
  document.getElementById('range-playback-rate').addEventListener('input', function() {
    if(source){
      source.playbackRate.value = this.valueAsNumber;
    }
    document.getElementById('playback-rate').textContent = this.value;
  });

  // チェックボタンが操作されたとき
  document.getElementById('checkbox-loop').addEventListener('change', function() {
    if(source){
      source.loop = this.checked;
    }
  });
};
