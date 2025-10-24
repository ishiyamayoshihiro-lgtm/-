@echo off
chcp 65001 >nul
echo ========================================
echo   三角比小テスト - モード切り替え
echo ========================================
echo.
echo 現在のモードを確認中...
findstr "TEST_MODE:" config.js
echo.
echo ========================================
echo どちらのモードに切り替えますか？
echo ========================================
echo.
echo [1] 練習モード（10問ランダム、記録なし）
echo [2] テストモード（全27問、記録あり）
echo [3] キャンセル
echo.
choice /c 123 /n /m "番号を選択してください (1/2/3): "

if errorlevel 3 goto :cancel
if errorlevel 2 goto :test_mode
if errorlevel 1 goto :practice_mode

:practice_mode
echo.
echo 練習モードに切り替えています...
powershell -Command "(Get-Content config.js) -replace 'TEST_MODE: true', 'TEST_MODE: false' | Set-Content config.js"
echo ✓ 練習モードに変更しました
goto :push

:test_mode
echo.
echo テストモードに切り替えています...
powershell -Command "(Get-Content config.js) -replace 'TEST_MODE: false', 'TEST_MODE: true' | Set-Content config.js"
echo ✓ テストモードに変更しました
goto :push

:push
echo.
echo ========================================
echo GitHubにプッシュしますか？
echo ========================================
echo.
echo [Y] はい（GitHub Pagesに反映）
echo [N] いいえ（後で手動でプッシュ）
echo.
choice /c YN /n /m "選択してください (Y/N): "

if errorlevel 2 goto :skip_push
if errorlevel 1 goto :do_push

:do_push
echo.
echo GitHubにプッシュ中...
git add config.js
git commit -m "モード変更"
git push
echo.
echo ✓ プッシュ完了！1〜2分後にGitHub Pagesに反映されます。
echo.
pause
exit

:skip_push
echo.
echo 後で以下のコマンドでプッシュしてください:
echo   git add config.js
echo   git commit -m "モード変更"
echo   git push
echo.
pause
exit

:cancel
echo.
echo キャンセルしました。
echo.
pause
exit
