# Google Cloud Console 設定手順

## GitHub Pages URL
```
https://ishiyamayoshihiro-lgtm.github.io/-/
```

## 設定手順

### 1. Google Cloud Consoleにアクセス
https://console.cloud.google.com/

### 2. プロジェクト選択
画面上部のプロジェクト選択から「**三角比テスト**」を選択

### 3. 認証情報ページに移動
- 左上のハンバーガーメニュー（三本線）をクリック
- 「**APIとサービス**」を選択
- 「**認証情報**」をクリック

### 4. OAuth 2.0 クライアントIDを編集
- 「OAuth 2.0 クライアントID」セクションで以下のクライアントIDをクリック:
  ```
  1081498976325-2cbnp1qvk2u9cnltrc3nk2jkqfgkrbue.apps.googleusercontent.com
  ```

### 5. 承認済みのJavaScript生成元に追加

**既存の設定:**
```
http://localhost:8000
```

**追加するURL:**
```
https://ishiyamayoshihiro-lgtm.github.io
```

注意: 末尾のスラッシュ `/` や パス `/-/` は**付けない**でください。
ドメインのみを追加します。

### 6. 保存
「**保存**」ボタンをクリック

### 7. 設定完了の確認
保存が完了すると、以下の2つのURLが登録されているはずです:
- `http://localhost:8000`
- `https://ishiyamayoshihiro-lgtm.github.io`

---

## 設定後の動作確認

### PCで確認
1. ブラウザで以下のURLにアクセス:
   ```
   https://ishiyamayoshihiro-lgtm.github.io/-/
   ```

2. Googleログインボタンをクリック

3. ログインできることを確認

4. テストを実施して、スプレッドシートに記録されることを確認

### iPadで確認
1. iPadのSafariまたはChromeで以下のURLにアクセス:
   ```
   https://ishiyamayoshihiro-lgtm.github.io/-/
   ```

2. au回線（モバイルデータ）に接続

3. Googleログインして動作確認

---

**作成日: 2025年10月23日**
