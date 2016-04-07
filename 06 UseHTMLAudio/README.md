## About this project

```txt
HTMLに埋め込まれたAudioタグを入力点とし、音を再生
ローカルのwavファイルを再生するようにしているため、Chromeでは設定をしないと再生されないことに注意
playbackRateはなぜか動作していない

ローカルで動作させているので、MediaElementSourceの作成を順次実行でおこなっている
本来は、Audioの読み込みの開始イベント"loadstart"を使用する場合が多い
```
