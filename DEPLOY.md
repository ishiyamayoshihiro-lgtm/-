# GitHub Pagesへのデプロイ手順

## 準備

### 必要なもの
- GitHubアカウント（無料）
- Gitがインストールされていること

## 手順

### 1. GitHubアカウントの作成（未作成の場合）
https://github.com にアクセスして無料アカウントを作成

### 2. 新しいリポジトリを作成
1. GitHubにログイン
2. 右上の「+」→「New repository」
3. リポジトリ名: `trigonometry-test`（または任意の名前）
4. 公開設定: **Public**（GitHub Pages無料版はPublicのみ）
5. 「Create repository」をクリック

### 3. ローカルでGitリポジトリを初期化

PowerShellまたはコマンドプロンプトで:

```powershell
cd "E:\マイドライブ\DB\App\三角比小テスト"

# Gitリポジトリ初期化
git init

# ファイルを追加
git add index.html script.js style.css config.js README.md 今後の予定.md .gitignore

# 最初のコミット
git commit -m "Initial commit: 三角比小テスト"

# メインブランチの名前を設定
git branch -M main

# GitHubリポジトリを追加（YOUR_USERNAMEを実際のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/trigonometry-test.git

# GitHubにプッシュ
git push -u origin main
```

### 4. GitHub Pagesを有効化

1. GitHubのリポジトリページにアクセス
2. 「Settings」タブをクリック
3. 左メニューから「Pages」を選択
4. Source: 「Deploy from a branch」
5. Branch: 「main」を選択、フォルダは「/ (root)」
6. 「Save」をクリック

数分待つと、以下のようなURLでアクセス可能になります:
```
https://YOUR_USERNAME.github.io/trigonometry-test/
```

### 5. Google Cloud ConsoleでURLを承認

1. Google Cloud Console にアクセス
   https://console.cloud.google.com/

2. プロジェクト「三角比テスト」を選択

3. 左メニュー → 「APIとサービス」 → 「認証情報」

4. OAuth 2.0 クライアントIDをクリック

5. 「承認済みのJavaScript生成元」に以下を追加:
   ```
   https://YOUR_USERNAME.github.io
   ```

6. 「承認済みのリダイレクトURI」に以下を追加:
   ```
   https://YOUR_USERNAME.github.io/trigonometry-test/
   ```

7. 「保存」をクリック

### 6. 動作確認

1. ブラウザで GitHub Pages のURL にアクセス
2. Googleログインが正常に動作するか確認
3. テストを実施して、スプレッドシートに記録されるか確認

### 7. iPadで確認

1. iPadのSafariまたはChromeで GitHub Pages のURL にアクセス
2. au回線（モバイルデータ）で接続
3. 正常に動作することを確認

## トラブルシューティング

### ログインエラーが出る場合
- Google Cloud Consoleで正しいURLを追加したか確認
- URLは `https://` で始まっているか確認
- 変更が反映されるまで数分待つ

### ページが表示されない場合
- GitHub Pagesの設定が正しいか確認
- デプロイに数分かかることがあるので待つ
- URLのスペルミスがないか確認

### スプレッドシートに記録されない場合
- ブラウザのコンソール（F12）でエラー確認
- `config.js` の設定が正しいか確認

## ファイル更新時の手順

ファイルを変更した後:

```powershell
git add .
git commit -m "変更内容の説明"
git push
```

数分後、GitHub Pagesに反映されます。

## 注意事項

- `.gitignore` により、機密情報（認証情報など）は自動的に除外されます
- `config.js` には公開情報（クライアントID）のみが含まれるため、GitHubに公開しても問題ありません
- リポジトリをPublicにするため、誰でもコードを見ることができます（ただし、実行には正しいGoogleアカウントが必要）

---

**作成日: 2025年10月23日**
