## About this project

```txt
HTMLに埋め込まれたAudioタグを入力点とし、音を再生
再生するオーディオファイルは、ローカルのものを使用した場合を想定
そのため、Chromeでは設定をしないと再生されない
playbackRateはなぜか動作していない

ローカルファイルを使用するため、MediaElementSourceの作成をloadstartイベント内でなく順次実行
```
