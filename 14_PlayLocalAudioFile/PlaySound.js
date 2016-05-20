window.onload = function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var audioContext = new AudioContext;
  var oscillator = null;
  var isStop = true;

  document.getElementById('sound_button').addEventListener('click', function(){
    if(isStop){
      oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
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
};
