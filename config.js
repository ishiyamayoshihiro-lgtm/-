// 設定ファイル
// Google OAuth と Apps Script の設定

const CONFIG = {
    // Google OAuth 2.0 クライアントID
    // Google Cloud Console で取得したクライアントIDをここに設定
    GOOGLE_CLIENT_ID: '1081498976325-2cbnp1qvk2u9cnltrc3nk2jkqfgkrbue.apps.googleusercontent.com',

    // Google Apps Script のWebアプリURL
    // Apps Script をデプロイした後に表示されるURLをここに設定
    GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbz9BsQpyV57A0KaPz8FgeiRTZUceFdqgOrfME3rv2weHXkz5MNyj-DrpXvnT98tq-wn/exec',

    // ========================================
    // モード切り替え（ここを変更するだけ！）
    // ========================================
    // true: テストモード（全27問、結果を記録）
    // false: 練習モード（10問ランダム、結果を記録しない）
    //
    // 変更手順:
    // 1. この行の true を false に変更（または false を true に）
    // 2. ファイルを保存
    // 3. GitHubにプッシュ（git add config.js && git commit -m "モード変更" && git push）
    // 4. 1〜2分待つとGitHub Pagesに反映されます
    // ========================================
    TEST_MODE: true
};
