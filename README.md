# 三角比小テスト - 使い方ガイド

## 完了した設定

✅ Google Cloud Platform設定完了
✅ OAuth 2.0 クライアントID作成完了
✅ Google Apps Script設定完了
✅ スプレッドシート連携完了
✅ 動作テスト成功

---

## 現在の状態

### 問題数
- **現在: 3問（試運転）**
- **本番: 27問に変更可能**

### 設定済みファイル
- `config.js` - クライアントIDとWebアプリURL設定済み
- Google Apps Script - デプロイ済み
- スプレッドシート - 自動記録設定済み

---

## 使い方（毎回の起動手順）

### 1. ローカルサーバーを起動

コマンドプロンプトまたはPowerShellで:

```powershell
cd "G:\マイドライブ\DB\App\三角比小テスト"
python -m http.server 8000
```

### 2. ブラウザで開く

http://localhost:8000

### 3. Googleアカウントでログイン

個人のGmailアカウント（設定に使ったアカウント）でログイン

### 4. テスト実施

生徒にテストを受けさせる

### 5. 結果確認

スプレッドシートで結果を確認:
https://docs.google.com/spreadsheets/d/1tryBWpHzBJzltuSbmZlr1rtwMirGR44xK8H84sgCu7I/edit

---

## 本番運用（27問に変更）

### script.js の75行目を変更:

**現在（試運転）:**
```javascript
let totalQuestions = 3; // 試運転用（本番は27問）
```

**本番:**
```javascript
let totalQuestions = 27; // 本番用
```

### index.html の20行目を変更:

**現在:**
```html
<p>試運転: 3問 (本番は27問)</p>
```

**本番:**
```html
<p>全27問</p>
```

---

## スプレッドシートの記録内容

以下の情報が自動で記録されます:
- 日時
- メールアドレス
- 正解数
- 総問題数
- 正答率(%)
- 経過時間（秒）
- 経過時間（表示用）

---

## トラブルシューティング

### ログインボタンが表示されない
1. `config.js` のクライアントIDが正しいか確認
2. ブラウザのコンソール（F12）でエラー確認
3. `http://localhost:8000` でアクセスしているか確認

### スプレッドシートに記録されない
1. ブラウザのコンソールでエラー確認
2. Apps Scriptのデプロイが「全員」公開になっているか確認
3. Google Apps Script実行ログを確認

### サーバーが起動しない
1. Pythonがインストールされているか確認: `python --version`
2. ポート8000が使用中でないか確認
3. 別のポートを試す: `python -m http.server 8080`

---

## 重要なファイル

### 設定ファイル
- `config.js` - クライアントIDとWebアプリURL（編集済み）
- `gas-code-ready.js` - Apps Scriptのコード（スプレッドシートID設定済み）

### 保存した情報
- `OAuthクライアント.txt` - クライアントIDとシークレット
- `Spreadsheet.txt` - スプレッドシートURL
- `デプロイ.txt` - WebアプリURL

### アプリファイル
- `index.html` - アプリのHTML
- `style.css` - デザイン
- `script.js` - 機能とロジック

---

## Google Cloud Platform情報

### プロジェクト名
三角比テスト

### OAuth 2.0 クライアントID
1081498976325-2cbnp1qvk2u9cnltrc3nk2jkqfgkrbue.apps.googleusercontent.com

### 承認済みのJavaScript生成元
http://localhost:8000

※本番環境（Webサーバー）にデプロイする場合は、Google Cloud Consoleで本番URLを追加する必要があります。

---

## セキュリティ注意事項

- クライアントIDは公開情報なので漏れても問題ありません
- ただし、クライアントシークレットは秘密情報です（今回は使用していません）
- スプレッドシートの共有設定に注意してください
- 個人アカウントで設定したので、そのアカウントでログインしてください

---

## 今後の拡張

### Web サーバーにデプロイする場合
1. 全ファイルをWebサーバーにアップロード
2. Google Cloud Consoleで本番URLを「承認済みのJavaScript生成元」に追加
3. 本番URLでアクセス

### 問題を追加する場合
`script.js` の `trigProblems` 配列に問題を追加

### デザインを変更する場合
`style.css` を編集

---

## サポート連絡先

問題が発生した場合:
1. ブラウザコンソール（F12）でエラー確認
2. `SETUP.md` の詳細手順を参照
3. Google Apps Scriptの実行ログを確認

---

**作成日: 2025年10月23日**
**最終更新: 2025年10月23日**
**状態: 動作確認済み ✓**
