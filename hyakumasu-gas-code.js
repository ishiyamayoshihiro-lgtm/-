/**
 * 百ます計算アプリ - Google Apps Script コード
 *
 * このコードをGoogle Spreadsheetの「拡張機能」→「Apps Script」にコピー＆ペーストしてください
 *
 * 設定手順:
 * 1. Google Spreadsheetを新規作成（例: 「百ます計算_結果記録」）
 * 2. 「拡張機能」→「Apps Script」を開く
 * 3. このコードをコピー＆ペースト
 * 4. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
 *    - 説明: 百ます計算アプリ
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 * 5. デプロイをクリックし、表示されたWebアプリのURLをコピー
 * 6. そのURLを hyakumasu-config.js の GAS_WEB_APP_URL に設定
 */

// WebアプリへのPOSTリクエストを処理
function doPost(e) {
  try {
    // リクエストボディをパース
    const data = JSON.parse(e.postData.contents);

    // データの検証
    if (!data.email || !data.correctCount || !data.totalQuestions || !data.timeString || !data.mode) {
      return createResponse('error', 'データが不完全です');
    }

    // Spreadsheetに記録
    recordResult(data);

    return createResponse('success', '結果を記録しました');
  } catch (error) {
    Logger.log('エラー: ' + error.toString());
    return createResponse('error', 'エラーが発生しました: ' + error.toString());
  }
}

// GETリクエストを処理（テスト用）
function doGet(e) {
  return ContentService.createTextOutput('百ます計算アプリのWebアプリが正常に動作しています。');
}

// Spreadsheetに結果を記録
function recordResult(data) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName('結果記録');

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = spreadsheet.insertSheet('結果記録');

    // ヘッダー行を作成
    const headers = [
      '送信日時',
      'メールアドレス',
      'モード',
      '正解数',
      '問題数',
      '正解率(%)',
      '経過時間',
      '経過秒数'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行のスタイル設定
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#667eea');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    // 列幅を自動調整
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  // データを追加
  const timestamp = new Date();
  const percentage = Math.round((data.correctCount / data.totalQuestions) * 100);

  const row = [
    timestamp,
    data.email,
    data.mode,
    data.correctCount,
    data.totalQuestions,
    percentage,
    data.timeString,
    data.elapsedSeconds
  ];

  sheet.appendRow(row);

  // データ行のスタイル設定
  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange(lastRow, 1, 1, row.length);

  // 正解率に応じて色分け
  if (percentage === 100) {
    dataRange.setBackground('#d4edda'); // 緑
  } else if (percentage >= 80) {
    dataRange.setBackground('#fff3cd'); // 黄色
  } else if (percentage >= 60) {
    dataRange.setBackground('#fff3cd'); // 黄色
  } else {
    dataRange.setBackground('#f8d7da'); // 赤
  }

  // タイムスタンプの列を日付形式にフォーマット
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');

  // 正解率の列をパーセント形式にフォーマット
  sheet.getRange(lastRow, 6).setNumberFormat('0"%"');

  // 中央揃え
  dataRange.setHorizontalAlignment('center');

  // ログに記録
  Logger.log(`結果を記録しました: ${data.email} - ${data.mode} - ${data.correctCount}/${data.totalQuestions} (${percentage}%) - ${data.timeString}`);
}

// レスポンスを作成
function createResponse(status, message) {
  const response = {
    status: status,
    message: message
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 追加機能: 統計情報を取得
 * この関数は、Spreadsheetに記録されたデータから統計情報を計算します
 */
function getStatistics(email) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('結果記録');

  if (!sheet) {
    return null;
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // 特定のユーザーのデータのみフィルタ
  const userRows = rows.filter(row => row[1] === email);

  if (userRows.length === 0) {
    return null;
  }

  // 統計計算
  const totalTests = userRows.length;
  const averageScore = userRows.reduce((sum, row) => sum + row[5], 0) / totalTests;
  const averageTime = userRows.reduce((sum, row) => sum + row[7], 0) / totalTests;
  const bestScore = Math.max(...userRows.map(row => row[5]));
  const bestTime = Math.min(...userRows.map(row => row[7]));

  return {
    totalTests: totalTests,
    averageScore: Math.round(averageScore),
    averageTime: Math.round(averageTime),
    bestScore: bestScore,
    bestTime: bestTime
  };
}

/**
 * 追加機能: ランキングを取得
 * この関数は、全ユーザーのランキングを計算します
 */
function getRanking(mode) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('結果記録');

  if (!sheet) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);

  // モードでフィルタ（指定がある場合）
  const filteredRows = mode ? rows.filter(row => row[2] === mode) : rows;

  // ユーザーごとにベストスコアを集計
  const userBest = {};

  filteredRows.forEach(row => {
    const email = row[1];
    const score = row[5];
    const time = row[7];

    if (!userBest[email] ||
        score > userBest[email].score ||
        (score === userBest[email].score && time < userBest[email].time)) {
      userBest[email] = {
        email: email,
        score: score,
        time: time
      };
    }
  });

  // 配列に変換してソート（スコア降順、同スコアなら時間昇順）
  const ranking = Object.values(userBest).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.time - b.time;
  });

  return ranking;
}
