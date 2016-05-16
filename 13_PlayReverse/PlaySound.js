window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var originalSource, reverseSource;
  var audioContext = new AudioContext;
  var oscillator = null;
  var fileReader   = new FileReader;

  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(audioBuffer){
      // 2回目以降のファイル選択
      if(originalSource){
        originalSource.stop();
      }

      // AudioBufferSourceNodeのインスタンスの作成
      originalSource = audioContext.createBufferSource();
      reverseSource = audioContext.createBufferSource();

      // オリジナルのオーディオバッファデータをセット
      originalSource.buffer = audioBuffer;

      // 反転したオーディオバッファデータをセット
      if (audioBuffer.numberOfChannels > 1) {
        Array.prototype.reverse.call(audioBuffer.getChannelData(0));
        Array.prototype.reverse.call(audioBuffer.getChannelData(1));
      } else if (audioBuffer.numberOfChannels > 0) {
        Array.prototype.reverse.call(audioBuffer.getChannelData(0));
      }
      reverseSource.buffer = audioBuffer;

      // AudioBufferSourceNode (Input) -> GainNode (Volume) -> AudioDestinationNode (Output)
      originalSource.connect(audioContext.destination);
      reverseSource.connect(audioContext.destination);
    });
  };

  // ファイルが選択されたとき
  document.getElementById('audio-file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  // 再生が押されたとき
  document.getElementById('play').addEventListener('click', function(){
    originalSource.start(0);
  });

  // 逆再生が押されたとき
  document.getElementById('PlayReverse').addEventListener('click', function(){
    reverseSource.start(0);
  });
};
