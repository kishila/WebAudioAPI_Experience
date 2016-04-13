window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext;
  var oscillator = null;
  var isStop = true;

  audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
  var gain = audioContext.createGain();

  document.getElementById('sound_button').addEventListener('click', function(){
    if(isStop){
      oscillator = audioContext.createOscillator();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(0);
      isStop = false;
      document.getElementById('sound_icon').classList.remove("icon-start");
      document.getElementById('sound_icon').classList.add("icon-stop");
    } else {
      oscillator.stop();
      isStop = true;
      document.getElementById('sound_icon').classList.remove("icon-stop");
      document.getElementById('sound_icon').classList.add("icon-start");
    }
  });

  document.getElementById('range-volume').addEventListener('input', function() {
    var min = gain.gain.minValue || 0;
    var max = gain.gain.maxValue || 1;
    if ((this.valueAsNumber >= min) && (this.valueAsNumber <= max)) {
      gain.gain.value = this.valueAsNumber;
      document.getElementById('output-volume').textContent = this.value;
    }
  });
};
