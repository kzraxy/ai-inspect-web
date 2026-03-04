<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Cache-Control" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" href="<%= BASE_URL + VUE_APP_ASSETS + '/' %>favicon.ico">
    <link rel="stylesheet" href="/static/chainRelateIcon/iconfont.css">
    <!-- <title>海康云眸-AI</title> -->
    <title id="indexUrlTitle"></title>
  </head>
  <body class="dolphin">
    <noscript>
      <strong>We're sorry but new-ai-inspect-web doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app">
      <img src="<%= BASE_URL + VUE_APP_ASSETS + '/' %>loading.gif" style="position: fixed; top: 50%; left: 50%; right: 0; bottom: 0; transform: translate(-50%, -50%)">
    </div>
    <script src="https://www.hik-cloud.com/static/commonjs/uikit/8.1.10/ezuikit.js"></script>
    <script src="/AI-inspect/drawTool-JS/jsPlugin-1.2.0.min.js"></script>
    <script src="https://www.hik-cloud.com/static/commonjs/aliyun-oss-sdk-4.13.2.min.js"></script>
    <script>
      function icoFunc () {
        let type = window.location.href.indexOf('hilaicloud.com') > -1 ? 'yunlai' :''
        document.getElementById('indexUrlTitle').innerHTML = (type === 'yunlai') ? '云莱-AI' : '海康云眸-AI'
      }
      icoFunc()
    </script>
    <%= DEV_INJECT_SCRIPT %>
  </body>
</html>
