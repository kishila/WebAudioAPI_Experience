window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var source;
  var audioContext;
  var analyser;
  var fileReader   = new FileReader;

  // HTML要素
  var audioFileButton = document.getElementById('audio-file-button');
  var musicdb = document.getElementById('music-db');
  var visualizer = document.getElementById('visualizer');

  // ファイルが選択されたとき
  audioFileButton.addEventListener('change', function(e){
    fileReader.readAsArrayBuffer(e.target.files[0]);
  });

  // ファイル読み込み完了時の処理
  fileReader.onload = function(){
    // オーディオリソースを解放
    if(audioContext) {
      audioContext.close();
    }

    audioContext = new AudioContext;
    audioContext.decodeAudioData(fileReader.result, successCallback, errorCallback);
  };

  // ファイル読み込み成功時のコールバック
  var successCallback = function(audioBuffer) {
    // 2回目以降のファイル選択
    if(source){
      source.stop();
      source = null;
    }

    // オーディオの再生
    playAudio(audioBuffer);

    // 波形データの記録
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
    drawAudio(visualizer, channelLs, audioContext.sampleRate);

    // デシベルの表示用の繰り返し処理
    analyser.fftSize = 2048;  // The default value
    var intervalid = window.setInterval(function() {
      // Get data for drawing sound wave
      var times = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(times);
      musicdb.textContent = times;
    }, 500);
  };

  // ファイル読み込み失敗時のコールバック
  var errorCallback = function(error) {
    alert("file loading faild")
  }

  // オーディオの再生
  var playAudio = function(audioBuffer) {
    // AudioBufferSourceNodeのインスタンスの作成
    source = audioContext.createBufferSource();

    // AudioBufferをセット
    source.buffer = audioBuffer;

    // オーディオコンテキスト作成
    audioContext.createGain = audioContext.createGain || audioContext.createGainNode;

    // アナライザーノードの構築
    analyser = audioContext.createAnalyser();

    // AudioBufferSourceNode (Input) -> AnalyserNode (Visualization) -> AudioDestinationNode (Output)
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Start audio
    source.start(0);
  };

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

    // 50 msec あたりのサンプリング周波数
    var n50msec = Math.floor(50 * Math.pow(10, -3) * sampleRate);

    // 60 sec あたりのサンプリング周波数
    var n60sec = Math.floor(60 * sampleRate);

    // Clear previous data
    canvasContext.clearRect(0, 0, width, height);

    // Draw audio wave
    canvasContext.beginPath();

    // 波形と60秒単位の枠線の描画
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

  // ビジュアライザーがクリックされたとき
  visualizer.addEventListener('click', function(e) {
    var rect = e.target.getBoundingClientRect();
    var canvasX = e.clientX - Math.floor(rect.left);
    var canvasY = e.clientY - Math.floor(rect.top);
    //console.log("canvasX: " + canvasX);
    //console.log("canvasY: " + canvasY);
  });

  // ビジュアライザー内にマウスが入ったとき
  visualizer.addEventListener('mouseover', function(e) {

  });

  // ビジュアライザー外にマウスが出たとき
  visualizer.addEventListener('mouseout', function(e) {

  });
};
