# 三角比小テスト - 使い方ガイド

## 完了した設定

✅ Google Cloud Platform設定完了
✅ OAuth 2.0 クライアントID作成完了
✅ Google Apps Script設定完了
✅ スプレッドシート連携完了
✅ 動作テスト成功

---

## 現在の状態

### モード切り替え機能
- **練習モード**: 10問ランダム出題、ログイン不要、結果記録なし
- **テストモード**: 全27問出題、ログイン必須、結果をスプレッドシートに記録
- **切り替え方法**: `モード切替.bat` をダブルクリック（超簡単！）

### 設定済みファイル
- `config.js` - クライアントID、WebアプリURL、モード設定
- Google Apps Script - デプロイ済み
- スプレッドシート - 自動記録設定済み（テストモードのみ）

---

## 使い方（毎回の起動手順）

### GitHub Pages でアクセス（推奨）

**URL**: https://ishiyamayoshihiro-lgtm.github.io/-/

### 1. モードの確認と切り替え

- **練習モード**: 10問ランダム、ログイン不要
- **テストモード**: 全27問、ログイン必須、結果記録

**切り替え方法**:
1. `モード切替.bat` をダブルクリック
2. 番号を選択（1=練習、2=テスト）
3. 「Y」を押してGitHubにプッシュ
4. 1〜2分待つとGitHub Pagesに反映

詳しくは `モード切替方法.md` を参照

### 2. アプリにアクセス

https://ishiyamayoshihiro-lgtm.github.io/-/

- **練習モード**: そのまま開始
- **テストモード**: Googleアカウントでログイン

### 3. テスト実施

生徒にテストを受けさせる

### 4. 結果確認（テストモードのみ）

スプレッドシートで結果を確認:
https://docs.google.com/spreadsheets/d/1tryBWpHzBJzltuSbmZlr1rtwMirGR44xK8H84sgCu7I/edit

---

## モード詳細

### 練習モード
- **問題数**: 10問（ランダム出題）
- **ログイン**: 不要
- **結果記録**: なし
- **選択肢**: √2/2 = 1/√2 併記
- **用途**: 予習・復習

### テストモード
- **問題数**: 全27問
- **ログイン**: 必要（Google）
- **結果記録**: スプレッドシートに自動記録
- **選択肢**: √2/2 = 1/√2 併記
- **用途**: 本番テスト

---

## スプレッドシートの記録内容（テストモードのみ）

以下の情報が自動で記録されます:
- 日時
- メールアドレス
- 正解数
- 総問題数
- 正答率(%)
- 経過時間（秒）
- 経過時間（表示用）

**注意**: 練習モードでは記録されません

---

## トラブルシューティング

### モードが切り替わらない
1. GitHub Pagesの反映を待つ（最大2分）
2. ブラウザのキャッシュをクリア（Ctrl + Shift + R）
3. シークレットモードで確認

### ログイン画面が表示される（練習モードなのに）
1. `config.js` の `TEST_MODE` が `false` になっているか確認
2. GitHub Pagesが更新されているか確認（1〜2分待つ）
3. ブラウザキャッシュをクリア

### スプレッドシートに記録されない
1. **テストモードになっているか確認**
2. Googleアカウントでログインしているか確認
3. ブラウザのコンソール（F12）でエラー確認
4. Apps Scriptのデプロイが「全員」公開になっているか確認

### git push が失敗する
1. `git pull` を先に実行
2. 競合があれば解決してから再度 `push`

---

## 重要なファイル

### 設定ファイル
- `config.js` - クライアントID、WebアプリURL、TEST_MODE設定
- `gas-code-ready.js` - Apps Scriptのコード（スプレッドシートID設定済み）

### モード切り替え
- `モード切替.bat` - ダブルクリックでモード切り替え（Windows用）
- `mode_switch.py` - モード切り替えPythonスクリプト
- `モード切替方法.md` - 詳しい手順説明

### 管理用ファイル
- `readme.html` - 使い方とリンク集（ブラウザで開ける）
- `OAuthクライアント.txt` - クライアントIDとシークレット
- `Spreadsheet.txt` - スプレッドシートURL
- `デプロイ.txt` - WebアプリURL
- `GitHub.txt` - GitHubリポジトリ情報

### アプリファイル
- `index.html` - アプリのHTML
- `style.css` - デザイン（4列グリッド、値の大きさ順レイアウト）
- `script.js` - 機能とロジック（モード切り替え対応、KaTeX数式表示）

---

## Google Cloud Platform情報

### プロジェクト名
三角比テスト

### OAuth 2.0 クライアントID
1081498976325-2cbnp1qvk2u9cnltrc3nk2jkqfgkrbue.apps.googleusercontent.com

### 承認済みのJavaScript生成元
- http://localhost:8000
- https://ishiyamayoshihiro-lgtm.github.io

※すでにGitHub Pages用URLを追加済みです。

---

## セキュリティ注意事項

- クライアントIDは公開情報なので漏れても問題ありません
- ただし、クライアントシークレットは秘密情報です（今回は使用していません）
- スプレッドシートの共有設定に注意してください
- 個人アカウントで設定したので、そのアカウントでログインしてください

---

## 今後の拡張

### モードを切り替えたい場合
`モード切替.bat` をダブルクリックするだけ！
詳しくは `モード切替方法.md` を参照

### 問題を追加する場合
`script.js` の `trigProblems` 配列に問題を追加

### デザインを変更する場合
`style.css` を編集

### 新しい環境にデプロイする場合
1. 全ファイルを新環境にアップロード
2. Google Cloud Consoleで新URLを「承認済みのJavaScript生成元」に追加
3. 新URLでアクセス

---

## サポート連絡先

問題が発生した場合:
1. `モード切替方法.md` のトラブルシューティングを参照
2. ブラウザコンソール（F12）でエラー確認
3. `readme.html` をブラウザで開いてリンク集を確認
4. Google Apps Scriptの実行ログを確認

---

## リンク集

- **GitHub Pages**: https://ishiyamayoshihiro-lgtm.github.io/-/
- **GitHubリポジトリ**: https://github.com/ishiyamayoshihiro-lgtm/-
- **スプレッドシート**: https://docs.google.com/spreadsheets/d/1tryBWpHzBJzltuSbmZlr1rtwMirGR44xK8H84sgCu7I/edit
- **Google Apps Script**: https://script.google.com/home/projects/1ZGq7vGzSq3ZAV-KqKqLI-dUZfTKGNaVmXJhX-DXlN5O4_RbY4Q_5yDf8
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=trigonometric-test-439408

---

---

## 更新履歴

### 2025年10月26日
- ✨ 問題文をTeX表記（KaTeX）で美しく表示（例: sin(0°) → $\sin 0^\circ$）
- ✨ テスト結果画面の問題文もTeX表記に対応
- ✨ 選択肢を値の大きさ順に並べる4列レイアウトに変更
  - 1段目: -1, 0, 1, なし
  - 2段目: -√3, -√3/3, √3/3, √3
  - 3段目: -√3/2, -1/2, 1/2, √3/2
  - 4段目: -√2/2, √2/2（3段目の間に配置）
- 🔧 モード切替.batの修正（pythonコマンド→pyコマンド、不要なpause削除）

### 2025年10月24日
- ✅ 練習/テストモード切り替え機能実装
- ✅ モード切替.bat追加（ワンクリックで切替可能）

### 2025年10月23日
- 🎉 初版リリース
- ✅ Google OAuth 2.0認証実装
- ✅ Google Apps Script連携完了
- ✅ GitHub Pages公開

---

**作成日: 2025年10月23日**
**最終更新: 2025年10月26日**
**状態: 練習/テストモード切り替え対応・TeX数式表示対応 ✓**
