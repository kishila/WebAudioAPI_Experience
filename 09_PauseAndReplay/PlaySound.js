window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var source;
  var audioContext = new AudioContext;
  var oscillator = null;
  var fileReader   = new FileReader;

  var isStop = true;
  var replayTime = 0;

  // ゲインノードの構築
  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  // キャンバスの構築
  var canvas        = document.getElementById('visualizer');

  // キャンバスへ描画
  var drawAudio = function(canvas, data, sampleRate) {
    var canvasContext = canvas.getContext('2d');

    var width  = canvas.width;
    var height = canvas.height;

    // 余白の設定
    var paddingTop    = 20;
    var paddingBottom = 20;
    var paddingLeft   = 30;
    var paddingRight  = 30;

    // 波形の描画範囲
    var innerWidth  = width  - paddingLeft - paddingRight;
    var innerHeight = height - paddingTop  - paddingBottom;
    var innerBottom = height - paddingBottom;
    var middle = (innerHeight / 2) + paddingTop;

    // Sampling period
    var period = 1 / sampleRate;

    // This value is the number of samples during 50 msec
    var n50msec = Math.floor(50 * Math.pow(10, -3) * sampleRate);

    // This value is the number of samples during 60 sec
    var n60sec = Math.floor(60 * sampleRate);

    // Clear previous data
    canvasContext.clearRect(0, 0, width, height);

    // Draw audio wave
    canvasContext.beginPath();

    for (var i = 0, len = data.length; i < len; i++) {
      // 50 msec ?
      if ((i % n50msec) === 0) {
        var x = Math.floor((i / len) * innerWidth) + paddingLeft;
        var y = Math.floor(((1 - data[i]) / 2) * innerHeight) + paddingTop;

        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }
      }

      // 60 sec ?
      if ((i % n60sec) === 0) {
        var sec  = i * period;  // index -> time
        var text = Math.floor(sec) + ' sec';

        // Draw grid (X)
        canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
        canvasContext.fillRect(x, paddingTop, 1, innerHeight);

        // Draw text (X)
        canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
        canvasContext.font      = '16px "Times New Roman"';
        canvasContext.fillText(text, (x - (canvasContext.measureText(text).width / 2)), (height - 3));
      }
    }

    canvasContext.strokeStyle = 'rgba(0, 0, 255, 1.0)';
    canvasContext.lineWidth   = 0.5;
    canvasContext.lineCap     = 'round';
    canvasContext.lineJoin    = 'miter';
    canvasContext.stroke();

    // Draw grid (Y)
    canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
    canvasContext.fillRect(paddingLeft, middle,      innerWidth, 1);
    canvasContext.fillRect(paddingLeft, paddingTop,  innerWidth, 1);
    canvasContext.fillRect(paddingLeft, innerBottom, innerWidth, 1);

    // Draw text (Y)
    canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
    canvasContext.font      = '16px "Times New Roman"';
    canvasContext.fillText(' 1.00', 3, paddingTop);
    canvasContext.fillText(' 0.00', 3, middle);
    canvasContext.fillText('-1.00', 3, innerBottom);
  };

////

var successCallback = function(audioBuffer) {
  // 2回目以降のファイル選択
  if(source){
    source.stop();
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
  source.start(0, replayTime);
  isStop = false;
  document.getElementById('sound_icon').classList.remove("icon-start");
  document.getElementById('sound_icon').classList.add("icon-stop");

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

  // キャンバスの描画
  drawAudio(canvas, channelLs, audioContext.sampleRate);
};

var errorCallback = function(error) {

};


////


  // ファイル読み込み完了時の処理
  fileReader.onload = function(){


    audioContext.decodeAudioData(fileReader.result, successCallback, errorCallback);
  };





  // ファイルが選択されたとき
  document.getElementById('audio-file').addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  // START / STOP ボタンが押されたとき
  document.getElementById('sound_button').addEventListener('click', function(){
    if(isStop){
      audioContext.decodeAudioData(fileReader.result, successCallback, errorCallback);
    } else {
      replayTime = audioContext.currentTime;
      source.stop();
      isStop = true;
      document.getElementById('sound_icon').classList.remove("icon-stop");
      document.getElementById('sound_icon').classList.add("icon-start");
    }
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

  document.getElementById('checkbox-loop').addEventListener('change', function() {
    if(source){
      source.loop = this.checked;
    }
  });
};
