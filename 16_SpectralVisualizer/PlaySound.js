window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  // Web Audio API関係
  var audioContext = new AudioContext();    // オーディオコンテキスト
  var analyser = audioContext.createAnalyser();  // アナライザーノード
  analyser.fftSize = 2048;

  var fileReader   = new FileReader;
  var audio = null;  // HTMLのaudioデータ

  // HTML要素 (左側)
  var audioFileButton = document.getElementById('audio-file-button');
  var soundButton = document.getElementById('sound-button');
  var currentTime = document.getElementById('current-time');
  var totalTime = document.getElementById('total-time');
  var rangeVolume = document.getElementById('range-volume');
  var rangePlaybackRate = document.getElementById('range-playback-rate');
  var checkboxLoop = document.getElementById('checkbox-loop');
  var checkboxAudio = document.getElementById('checkbox-audio');

  // HTML要素 (左側)
  var visualizer = document.getElementById('visualizer');
  var canvasContext = visualizer.getContext('2d');

  var renewPlayingTimeInterval;
  var drawAudioInterval;

  // ファイルが選択されたとき
  audioFileButton.addEventListener('change', function(e){
    var file = e.target.files[0];

    // オーディオファイルならセットアップ
    if (!(file instanceof File)) {
      window.alert('Please upload file.');
    } else if (file.type.indexOf('audio') === -1) {
      window.alert('Please upload audio file.');
    } else {
      setupAudio(window.URL.createObjectURL(file));
    }
  });

  // オーディオファイル再生の準備
  var setupAudio = function(src) {
    // audioタグ関連の初期化
    if (audio instanceof HTMLAudioElement) {
      audio.pause();
      audio = null;
      document.getElementById('audio-tag').removeChild(document.getElementById('audio-tag').firstChild);
      document.getElementById('sound-icon').classList.remove("icon-stop");
      document.getElementById('sound-icon').classList.add("icon-start");
    }

    // Audioタグのsrcのセット
    audio = new Audio(src);
    audio.setAttribute('controls', true);
    document.getElementById('audio-tag').appendChild(audio);
    audio.style.display = 'none';

    // Audioの読み込み開始時に発火
    audio.addEventListener('loadstart', function(event) {

      // Audioデータからソースノードの作成
      var source = audioContext.createMediaElementSource(audio);

      // MediaElementAudioSourceNode (Input) -> BiquadFilterNode (Filter) -> Delay (Delay) -> AudioDestinationNode (Output)
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }, false);

    // メタデータ読み込み完了時に発火
    audio.addEventListener("loadedmetadata",function (e){

      // 再生時間の表示
      var minute = Math.floor(audio.duration / 60);
      var secound = Math.floor(audio.duration % 60);
      if (minute < 10) { minute = "0" + minute; }
      if (secound < 10) { secound = "0" + secound; }
      totalTime.textContent = minute + ":" + secound;
    });

    // オーディオ再生時のイベント
    audio.addEventListener('play', function() {
      soundButton.innerHTML = '<span id="sound-icon" class="icon icon-stop"></span>';
    }, false);

    // オーディオ停止時のイベント
    audio.addEventListener('pause', function() {
      soundButton.innerHTML = '<span id="sound-icon" class="icon icon-start"></span>';
    }, false);
  };

  // 現在の再生時間の更新
  var renewPlayingTime = function() {
      var minute = Math.floor(audio.currentTime / 60);
      var secound = Math.floor(audio.currentTime % 60);
      if (minute < 10) { minute = "0" + minute; }
      if (secound < 10) { secound = "0" + secound; }
      currentTime.textContent = minute + ":" + secound;
  }

  // ビジュアライザーの描画
  var drawAudio = function() {
    var width  = visualizer.width;
    var height = visualizer.height;

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

    // 周波数スペクトルの取得
    var spectrums = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(spectrums);

    maxFrequency = spectrums.length * audioContext.sampleRate / analyser.fftSize
    n3kHz = Math.floor(3000 / (maxFrequency / spectrums.length));

    // キャンバスの初期化
    canvasContext.clearRect(0, 0, width, height);　　// 描画データをリセット
    canvasContext.beginPath();                     // 現在のパスをリセット

    for (var i = 0, len = spectrums.length; i < len; i++) {
        var x = Math.floor((i / len) * innerWidth) + paddingLeft;
        var y = Math.floor((1 - (spectrums[i] / 255)) * innerHeight) + paddingTop;

        // スペクトルのパス作成
        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        // 3kHzごとに赤線と時間を描画
        if(i % n3kHz === 0) {
          var text = Math.round(3 * i / n3kHz) + ' kHz';

          // 縦線の描画
          canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
          canvasContext.fillRect(x, paddingTop, 1, innerHeight);

          // 1000Hzごとの周波数の数値を描画
          canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
          canvasContext.font      = '16px "Times New Roman"';
          canvasContext.fillText(text, (x - (canvasContext.measureText(text).width / 2)), (height - 3));
        }
    }

    // スペクトルの描画
    canvasContext.strokeStyle = 'rgba(0, 0, 255, 1.0)';
    canvasContext.lineWidth   = 0.5;
    canvasContext.lineCap     = 'round';
    canvasContext.lineJoin    = 'miter';
    canvasContext.stroke();

    // 横線の描画
    canvasContext.fillStyle = 'rgba(255, 0, 0, 1.0)';
    canvasContext.fillRect(paddingLeft, middle,      innerWidth, 1);
    canvasContext.fillRect(paddingLeft, paddingTop,  innerWidth, 1);
    canvasContext.fillRect(paddingLeft, innerBottom, innerWidth, 1);

    // 振幅の最高値と最低値の描画
    canvasContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
    canvasContext.font      = '16px "Times New Roman"';
    canvasContext.fillText('255', 3, paddingTop);
    canvasContext.fillText('128', 3, middle);
    canvasContext.fillText('  0', 3, innerBottom);

  }

  ////////////////////////////////////////////////
  //                  UI関係                    //
  ///////////////////////////////////////////////

  // START / STOP ボタンが押されたとき
  soundButton.addEventListener('click', function(){
    if (audio instanceof HTMLAudioElement) {
        if (audio.paused) {
            audio.playbackRate = rangePlaybackRate.valueAsNumber;
            audio.loop = checkboxLoop.checked ? true : false;
            audio.play();
            renewPlayingTimeInterval = setInterval(renewPlayingTime, 100);
            rawAudioInterval = setInterval(drawAudio, 100);
        } else {
            audio.pause();
            window.clearInterval(renewPlayingTimeInterval);
            window.clearInterval(drawAudioInterval);
        }
    }
  });

  // Volumeバーが操作されたとき
  rangeVolume.addEventListener('input', function() {
    if (audio instanceof HTMLAudioElement) {
      audio.volume = this.valueAsNumber;
    }
    document.getElementById('output-volume').textContent = this.value;
  });

  // PlaybackRateバーが操作されたとき
  rangePlaybackRate.addEventListener('input', function() {
    if (audio instanceof HTMLAudioElement) {
      //audio.playbackRate.value = this.valueAsNumber;
      audio.playbackRate = this.valueAsNumber;
    }
    document.getElementById('playback-rate').textContent = this.value;
  });

  // ループのチェックボタンが操作されたとき
  checkboxLoop.addEventListener('change', function() {
    audio.loop = this.checked ? true : false;
  });

  // audioのチェックボタンが操作されたとき
  checkboxAudio.addEventListener('change', function() {
    if (audio instanceof HTMLAudioElement) {
      audio.style.display = this.checked ? 'block' : 'none';
    }
  });
}
