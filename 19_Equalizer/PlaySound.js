window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext();
  var fileReader   = new FileReader;

  var audio = null;  // audioデータ

  // HTML要素
  var range1 = document.getElementById('range1');
  var range2 = document.getElementById('range2');
  var range3 = document.getElementById('range3');
  var range4 = document.getElementById('range4');
  var range5 = document.getElementById('range5');
  var range6 = document.getElementById('range6');
  var range7 = document.getElementById('range7');
  var range8 = document.getElementById('range8');
  var range9 = document.getElementById('range9');
  var range10 = document.getElementById('range10');
  var db1 = document.getElementById('db1');
  var db2 = document.getElementById('db2');
  var db3 = document.getElementById('db3');
  var db4 = document.getElementById('db4');
  var db5 = document.getElementById('db5');
  var db6 = document.getElementById('db6');
  var db7 = document.getElementById('db7');
  var db8 = document.getElementById('db8');
  var db9 = document.getElementById('db9');
  var db10 = document.getElementById('db10');
  var audio = document.getElementById('audio');

  // 定数
  var NUM_BANDS = 10;
  var peakings  = new Array(NUM_BANDS);
  var frequency = 31.25;

  audio.addEventListener('play', function(event) {
        // ピーキングフィルタ×10作成
        for (var i = 0; i < NUM_BANDS; i++) {
          var peaking = audioContext.createBiquadFilter();
          if (i !== 0) {
              frequency *= 2;
          }
          peaking.type            = (typeof peaking.type === 'string') ? 'peaking' : 5;
          peaking.frequency.value = frequency;
          peaking.Q.value         = 2;
          peaking.gain.value      = 0;  // The defaul value
          peakings[i] = peaking;
        }

        // ソースをピーキングにコネクト
        var source = audioContext.createMediaElementSource(audio);

        source.connect(peakings[0]);
        peakings.forEach(function(peaking, index) {
          if (index < (NUM_BANDS - 1)) {
              peaking.connect(peakings[index + 1]);
          } else {
              peaking.connect(audioContext.destination);
          }
        });
  });


  document.getElementById('range1').addEventListener('input', function() {
    if(peakings[0]) {
      peakings[0].gain.value = this.valueAsNumber;
    }
    db1.textContent = this.value;
  });
  document.getElementById('range2').addEventListener('input', function() {
    if(peakings[1]) {
      peakings[1].gain.value = this.valueAsNumber;
    }
    db2.textContent = this.value;
  });
  document.getElementById('range3').addEventListener('input', function() {
    if(peakings[2]) {
      peakings[2].gain.value = this.valueAsNumber;
    }
    db3.textContent = this.value;
  });
  document.getElementById('range4').addEventListener('input', function() {
    if(peakings[3]) {
      peakings[3].gain.value = this.valueAsNumber;
    }
    db4.textContent = this.value;
  });
  document.getElementById('range5').addEventListener('input', function() {
    if(peakings[4]) {
      peakings[4].gain.value = this.valueAsNumber;
    }
    db5.textContent = this.value;
  });
  document.getElementById('range6').addEventListener('input', function() {
    if(peakings[5]) {
      peakings[5].gain.value = this.valueAsNumber;
    }
    db6.textContent = this.value;
  });
  document.getElementById('range7').addEventListener('input', function() {
    if(peakings[6]) {
      peakings[6].gain.value = this.valueAsNumber;
    }
    db7.textContent = this.value;
  });
  document.getElementById('range8').addEventListener('input', function() {
    if(peakings[7]) {
      peakings[7].gain.value = this.valueAsNumber;
    }
    db8.textContent = this.value;
  });
  document.getElementById('range9').addEventListener('input', function() {
    if(peakings[8]) {
      peakings[8].gain.value = this.valueAsNumber;
    }
    db9.textContent = this.value;
  });
  document.getElementById('range10').addEventListener('input', function() {
    if(peakings[9]) {
      peakings[9].gain.value = this.valueAsNumber;
    }
    db10.textContent = this.value;
  });
}
