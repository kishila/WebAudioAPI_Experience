window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var source;
  var audioContext = new AudioContext;
  var oscillator = null;
  var fileReader   = new FileReader;

  // ゲインノードの構築
  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  // キャンバスの構築
  var canvas        = document.getElementById('visualizer');
  var canvasContext = canvas.getContext('2d');

  fileReader.onload = function(){
    // オーディオデータのでコード成功時
    var successCallback = function(audioBuffer) {
      // 2回目以降のファイル選択
      if(source){
        source.stop();
        source = null;
      }

      // AudioBufferSourceNodeのインスタンスの作成
      source = audioContext.createBufferSource();

      // AudioBufferをセット
      source.buffer = audioBuffer;

      // AudioBufferSourceNode (Input) -> GainNode (Volume) -> AudioDestinationNode (Output)
      source.connect(gain);
      gain.connect(audioContext.destination);

      // パラメータの設定
      source.playbackRate.value = document.getElementById('range-playback-rate').valueAsNumber
      source.loop = document.getElementById('checkbox-loop').checked;

      // Start audio
      source.start(0);

      // 波形データ用の配列
      var channelLs = new Float32Array(audioBuffer.length);
      var channelRs = new Float32Array(audioBuffer.length);
      // ステレオかモノラルかをチャンネル数で判別
      if (audioBuffer.numberOfChannels > 1) {
        channelLs.set(audioBuffer.getChannelData(0));
        channelRs.set(audioBuffer.getChannelData(1));
      } else if (audioBuffer.numberOfChannels > 0) {
        channelLs.set(audioBuffer.getChannelData(0));
      } else {
        window.alert('The number of channels is invalid.');
        return;
      }

      var width  = canvas.width;
      var height = canvas.height;

      // Sampling period
      var period = 1 / audioContext.sampleRate;

      // 50m秒間隔の割合を取得
      var n50msec = Math.floor(50 * Math.pow(10, -3) * audioContext.sampleRate);

      // キャンバスの初期化
      canvasContext.clearRect(0, 0, width, height);

      // 現在のパスをリセット
      canvasContext.beginPath();

      // 音の波形の描画
      for (var i = 0, len = channelLs.length; i < len; i++) {
        // 50 msec ?
        if ((i % n50msec) === 0) {
            var x = (i / len) * width;
            var y = ((1 - channelLs[i]) / 2) * height;
            if (i === 0) {
            canvasContext.moveTo(x, y);
          } else {
            canvasContext.lineTo(x, y);
          }
        }
      }
      canvasContext.stroke();
    }

    // オーディオデータのでコード失敗時
    var errorCallback = function(error) {
      alert(error);
    }

    audioContext.decodeAudioData(fileReader.result, successCallback, errorCallback);
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
