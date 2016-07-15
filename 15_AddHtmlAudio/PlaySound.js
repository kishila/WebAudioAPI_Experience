window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();
  var fileReader   = new FileReader;

  var audio = null;  // audioデータ

  // HTML要素
  var audioFileButton = document.getElementById('audio-file-button');
  var soundButton = document.getElementById('sound-button');
  var rangeVolume = document.getElementById('range-volume');
  var rangePlaybackRate = document.getElementById('range-playback-rate');
  var checkboxLoop = document.getElementById('checkbox-loop');
  var checkboxAudio = document.getElementById('checkbox-audio');
  var currentTime = document.getElementById('current-time');
  var totalTime = document.getElementById('total-time');

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
      //totalTime.textContent = audio.duration;
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

      // Create the instance of MediaElementAudioSourceNode
      var source = audioContext.createMediaElementSource(audio);

      // MediaElementAudioSourceNode (Input) -> BiquadFilterNode (Filter) -> Delay (Delay) -> GainNode (Master Volume) -> AudioDestinationNode (Output)
      source.connect(audioContext.destination);
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
            var renewPlayingTimeInterval = setInterval(renewPlayingTime, 1000/60);
        } else {
            audio.pause();
            clearInterval(renewPlayingTimeInterval);
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
