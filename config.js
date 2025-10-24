// 設定ファイル
// Google OAuth と Apps Script の設定

const CONFIG = {
    // Google OAuth 2.0 クライアントID
    // Google Cloud Console で取得したクライアントIDをここに設定
    GOOGLE_CLIENT_ID: '1081498976325-2cbnp1qvk2u9cnltrc3nk2jkqfgkrbue.apps.googleusercontent.com',

    // Google Apps Script のWebアプリURL
    // Apps Script をデプロイした後に表示されるURLをここに設定
    GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbz9BsQpyV57A0KaPz8FgeiRTZUceFdqgOrfME3rv2weHXkz5MNyj-DrpXvnT98tq-wn/exec',

    // テストモード設定
    // true: テストモード（結果をスプレッドシートに記録）
    // false: 練習モード（結果を記録しない）
    // この設定は readme.html の管理者パネルから変更できます
    TEST_MODE: true
};
