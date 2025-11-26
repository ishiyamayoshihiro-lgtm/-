# 百ます計算アプリ

足し算の百ます計算を行い、結果をGoogle Spreadsheetに記録するWebアプリケーションです。

## 主な機能

- ✅ Googleアカウントでログイン
- ✅ 0〜9の数字を使った足し算（100問）
- ✅ テキスト入力方式
- ✅ タイマー機能（自動計測）
- ✅ 結果をGoogle Spreadsheetに自動保存
- ✅ 詳細な結果表示（間違えた問題の確認）
- ✅ レスポンシブデザイン（PC・タブレット・スマホ対応）

## ファイル構成

```
百ます計算/
├── hyakumasu-index.html       # メインHTMLファイル
├── hyakumasu-style.css        # スタイルシート
├── hyakumasu-script.js        # JavaScriptコード
├── hyakumasu-config.js        # 設定ファイル（要編集）
├── hyakumasu-gas-code.js      # Google Apps Scriptコード
└── HYAKUMASU_README.md        # このファイル
```

## セットアップ手順

### ステップ1: Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: 「百ます計算アプリ」など
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuthクライアントID」を選択
5. アプリケーションの種類: **ウェブアプリケーション**
6. 承認済みのJavaScript生成元に以下を追加:
   - `http://localhost` (ローカルテスト用)
   - `https://ishiyamayoshihiro-lgtm.github.io` (GitHub Pages用、実際のURLに変更)
7. 作成されたクライアントIDをコピー

### ステップ2: Google Spreadsheet と Apps Script の設定

1. Google Spreadsheetを新規作成
   - 例: 「百ます計算_結果記録」
2. 「拡張機能」→「Apps Script」を開く
3. `hyakumasu-gas-code.js` の内容をすべてコピー＆ペースト
4. 「デプロイ」→「新しいデプロイ」を選択
5. 種類を選択で「ウェブアプリ」を選択
6. 設定:
   - 説明: 百ます計算アプリ
   - **次のユーザーとして実行**: 自分
   - **アクセスできるユーザー**: 全員
7. 「デプロイ」をクリック
8. 表示されたWebアプリのURLをコピー

### ステップ3: config.js の編集

`hyakumasu-config.js` を開いて、以下の2つの値を設定:

```javascript
const CONFIG = {
    // ステップ1でコピーしたクライアントID
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',

    // ステップ2でコピーしたWebアプリのURL
    GAS_WEB_APP_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
};
```

### ステップ4: GitHub にアップロード（GitHub Pages使用の場合）

1. GitHubに新しいリポジトリを作成
2. すべてのファイルをアップロード:
   ```bash
   git init
   git add hyakumasu-*
   git commit -m "Initial commit: 百ます計算アプリ"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. リポジトリの設定で GitHub Pages を有効化
   - Settings → Pages → Source: main branch
4. 数分後、`https://YOUR_USERNAME.github.io/YOUR_REPO/hyakumasu-index.html` でアクセス可能

### ステップ5: ローカルでテスト（オプション）

ローカルサーバーを起動してテスト:

```bash
# Pythonを使用する場合
python -m http.server 8000

# Node.jsを使用する場合
npx http-server
```

ブラウザで `http://localhost:8000/hyakumasu-index.html` を開く

## 使い方

1. **ログイン**: Googleアカウントでログイン
2. **モード選択**: 「足し算」を選択
3. **説明確認**: ルールと操作方法を確認
4. **テスト開始**: 「テスト開始」をクリックするとタイマーが自動スタート
5. **問題解答**: 各マスに答えを入力（Tab / Enter で次のマスへ移動）
6. **提出**: すべて入力したら「提出する」をクリック
7. **結果確認**: 正解数、経過時間、間違えた問題を確認
8. **記録**: 結果が自動的にGoogle Spreadsheetに保存されます

## 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (Vanilla)
- **認証**: Google Identity Services (OAuth 2.0)
- **バックエンド**: Google Apps Script
- **データベース**: Google Spreadsheet
- **ホスティング**: GitHub Pages (推奨)

## カスタマイズ

### 引き算モードを追加する場合

1. `hyakumasu-index.html` の引き算ボタンのコメントを解除:
   ```html
   <button id="selectSubtractionBtn" class="btn-menu">
       <div class="menu-btn-title">引き算</div>
       <div class="menu-btn-desc">0〜18の引き算 100問</div>
   </button>
   ```

2. `hyakumasu-script.js` にイベントリスナーを追加:
   ```javascript
   const selectSubtractionBtn = document.getElementById('selectSubtractionBtn');
   selectSubtractionBtn.addEventListener('click', () => showInstructionScreen('subtraction'));
   ```

3. 引き算の計算ロジックは既に実装済みです

### 数字の範囲を変更する場合

`hyakumasu-script.js` の `generateRandomNumbers()` 関数を編集:

```javascript
function generateRandomNumbers(count) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 20)); // 0-19に変更
    }
    return numbers;
}
```

## トラブルシューティング

### ログインできない

- Google Cloud Console で承認済みのJavaScript生成元が正しく設定されているか確認
- ブラウザのキャッシュをクリア
- シークレットモードで試す

### 結果が保存されない

- Google Apps Script のデプロイ設定を確認:
  - 「次のユーザーとして実行」が「自分」になっているか
  - 「アクセスできるユーザー」が「全員」になっているか
- `hyakumasu-config.js` の `GAS_WEB_APP_URL` が正しいか確認
- ブラウザの開発者ツールでエラーを確認

### グリッドが正しく表示されない

- ブラウザの互換性を確認（Chrome, Firefox, Safari, Edge の最新版推奨）
- CSS Grid をサポートしているか確認
- レスポンシブデザインのため、画面サイズを調整

## ライセンス

© 2025 IshiyamaYoshihiro

## 開発者向けメモ

- 将来の拡張: 割り算モード、掛け算モード
- ランキング機能（GASの `getRanking()` 関数を活用）
- 統計機能（GASの `getStatistics()` 関数を活用）
- タイムアタックモード
- 難易度設定（数字の範囲変更）
