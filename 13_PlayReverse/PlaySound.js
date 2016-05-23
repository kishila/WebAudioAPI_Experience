window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var originalSource, reverseSource;
  var originalBuffer, reverseBuffer;
  var audioContext = new AudioContext;
  var fileReader   = new FileReader;

  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  fileReader.onload = function(){
    audioContext.decodeAudioData(fileReader.result, function(audioBuffer){
      // 2回目以降のファイル選択
      if(originalSource){
        originalSource.stop();
      } else if (reverseSource) {
        reverseSource.stop();
      }

      // オリジナルのオーディオバッファデータをセット
      originalBuffer = audioBuffer;

      // 反転したオーディオバッファデータをセット
      if (audioBuffer.numberOfChannels > 1) {
        Array.prototype.reverse.call(audioBuffer.getChannelData(0));
        Array.prototype.reverse.call(audioBuffer.getChannelData(1));
      } else if (audioBuffer.numberOfChannels > 0) {
        Array.prototype.reverse.call(audioBuffer.getChannelData(0));
      }
      reverseBuffer = audioBuffer;
    });
  };

  // ファイルが選択されたとき
  document.getElementById('audio-file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  // 再生が押されたとき
  document.getElementById('play').addEventListener('click', function(){

    // AudioBufferSourceNodeのインスタンスの作成
    originalSource = audioContext.createBufferSource();
    originalSource.buffer = originalBuffer;

    // AudioBufferSourceNode (Input) -> AudioDestinationNode (Output)
    originalSource.connect(audioContext.destination);
    originalSource.start(0);
  });

  // 逆再生が押されたとき
  document.getElementById('PlayReverse').addEventListener('click', function(){
    // AudioBufferSourceNodeのインスタンスの作成
    reverseSource = audioContext.createBufferSource();
    reverseSource.buffer = reverseBuffer;

    // AudioBufferSourceNode (Input) -> AudioDestinationNode (Output)
    reverseSource.connect(audioContext.destination);
    reverseSource.start(0);
  });
};
