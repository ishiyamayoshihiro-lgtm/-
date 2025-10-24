#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import subprocess

print("=" * 50)
print("  三角比小テスト - モード切り替え")
print("=" * 50)
print()

# 現在のモードを確認
with open('config.js', 'r', encoding='utf-8') as f:
    content = f.read()
    if 'TEST_MODE: true' in content:
        current_mode = "テストモード"
    else:
        current_mode = "練習モード"

print(f"現在のモード: {current_mode}")
print()
print("=" * 50)
print("どちらのモードに切り替えますか？")
print("=" * 50)
print()
print("[1] 練習モード（10問ランダム、記録なし）")
print("[2] テストモード（全27問、記録あり）")
print("[3] キャンセル")
print()

choice = input("番号を選択してください (1/2/3): ")

if choice == '1':
    print()
    print("練習モードに切り替えています...")
    new_content = content.replace('TEST_MODE: true', 'TEST_MODE: false')
    with open('config.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✓ 練習モードに変更しました")
    mode_changed = True

elif choice == '2':
    print()
    print("テストモードに切り替えています...")
    new_content = content.replace('TEST_MODE: false', 'TEST_MODE: true')
    with open('config.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("✓ テストモードに変更しました")
    mode_changed = True

elif choice == '3':
    print()
    print("キャンセルしました。")
    input("\nEnterキーを押して終了...")
    exit()

else:
    print()
    print("無効な選択です。")
    input("\nEnterキーを押して終了...")
    exit()

# GitHubにプッシュするか確認
print()
print("=" * 50)
print("GitHubにプッシュしますか？")
print("=" * 50)
print()
print("[Y] はい（GitHub Pagesに反映）")
print("[N] いいえ（後で手動でプッシュ）")
print()

push_choice = input("選択してください (Y/N): ").upper()

if push_choice == 'Y':
    print()
    print("GitHubにプッシュ中...")
    try:
        subprocess.run(['git', 'add', 'config.js'], check=True)
        subprocess.run(['git', 'commit', '-m', 'モード変更'], check=True)
        subprocess.run(['git', 'push'], check=True)
        print()
        print("✓ プッシュ完了！1〜2分後にGitHub Pagesに反映されます。")
    except Exception as e:
        print(f"✗ エラーが発生しました: {e}")
    print()
    input("Enterキーを押して終了...")

else:
    print()
    print("後で以下のコマンドでプッシュしてください:")
    print("  git add config.js")
    print("  git commit -m \"モード変更\"")
    print("  git push")
    print()
    input("Enterキーを押して終了...")
