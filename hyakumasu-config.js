// 百ます計算アプリ - 設定ファイル
// Google OAuth と Apps Script の設定

const CONFIG = {
    // Google OAuth 2.0 クライアントID
    // Google Cloud Console で取得したクライアントIDをここに設定してください
    // 設定手順:
    // 1. https://console.cloud.google.com/ にアクセス
    // 2. 新しいプロジェクトを作成
    // 3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuthクライアントID」
    // 4. アプリケーションの種類: ウェブアプリケーション
    // 5. 承認済みのJavaScript生成元: GitHub Pagesのドメインを追加
    // 6. 作成されたクライアントIDをコピーして以下に貼り付け
    GOOGLE_CLIENT_ID: '157623957800-ite4opki5vg511jcfms6ct61rnf2b7fj.apps.googleusercontent.com',

    // Google Apps Script のWebアプリURL
    // Apps Script をデプロイした後に表示されるURLをここに設定してください
    // 設定手順:
    // 1. Google Spreadsheetを新規作成
    // 2. 「拡張機能」→「Apps Script」を開く
    // 3. hyakumasu-gas-code.js の内容をコピー＆ペースト
    // 4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
    // 5. 「次のユーザーとして実行」: 自分
    // 6. 「アクセスできるユーザー」: 全員
    // 7. デプロイされたURLをコピーして以下に貼り付け
    GAS_WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzuzS_MSmimaTq7u1uEWXxyys2D4ETRrUDoTq1E8NRvG-q3NYpxHhTfLGkoDWRgAVM6Xw/exec'
};
