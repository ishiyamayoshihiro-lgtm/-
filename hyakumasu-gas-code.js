/**
 * 25ます計算アプリ - Google Apps Script コード
 */

// POSTリクエストを処理
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'recordResult';

    if (action === 'recordResult') {
      if (!data.email || data.correctCount === undefined || !data.totalQuestions || !data.timeString || !data.mode) {
        return createResponse('error', 'データが不完全です');
      }
      recordResult(data);
      return createResponse('success', '結果を記録しました');
    }
    if (action === 'addClass') {
      if (!data.className) return createResponse('error', 'クラス名が必要です');
      return addClassGas(data.className);
    }
    if (action === 'deleteClass') {
      if (!data.className) return createResponse('error', 'クラス名が必要です');
      return deleteClassGas(data.className);
    }
    if (action === 'addStudent') {
      if (!data.email || !data.className) return createResponse('error', 'メールとクラス名が必要です');
      return addStudentGas(data.email, data.className, data.sei || '', data.mei || '');
    }
    if (action === 'addStudentsBulk') {
      if (!data.students || !Array.isArray(data.students)) return createResponse('error', 'データが不完全です');
      return addStudentsBulkGas(data.students);
    }
    if (action === 'deleteStudent') {
      if (!data.email) return createResponse('error', 'メールが必要です');
      return deleteStudentGas(data.email);
    }
    return createResponse('error', '不明なアクション: ' + action);
  } catch (error) {
    Logger.log('doPost エラー: ' + error.toString());
    return createResponse('error', 'エラーが発生しました: ' + error.toString());
  }
}

// GETリクエストを処理
function doGet(e) {
  const params = e.parameter || {};
  const action = params.action;

  try {
    if (action === 'getResults')       return jsonRes({ status: 'success', data: getAllResults() });
    if (action === 'getClasses')       return jsonRes({ status: 'success', data: getClasses() });
    if (action === 'getStudents')      return jsonRes({ status: 'success', data: getStudents() });
    if (action === 'getStudentClass') {
      if (!params.email) return jsonRes({ status: 'error', message: 'emailが必要です' });
      return jsonRes({ status: 'success', data: { className: getStudentClass(params.email) } });
    }
    if (action === 'getClassRanking') {
      if (!params.class) return jsonRes({ status: 'error', message: 'classが必要です' });
      return jsonRes({ status: 'success', data: getClassRanking(params.class) });
    }
    if (action === 'getAllClassRanking') return jsonRes({ status: 'success', data: getAllClassRankingData() });
    if (action === 'getClassesAndStudents') return jsonRes({ status: 'success', data: { classes: getClasses(), students: getStudents() } });
    if (action === 'getTodayStats')    return jsonRes({ status: 'success', data: getTodayStats() });
  } catch (error) {
    return jsonRes({ status: 'error', message: error.toString() });
  }

  return ContentService.createTextOutput('25ます計算アプリのWebアプリが正常に動作しています。');
}

function jsonRes(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function createResponse(status, message) {
  return jsonRes({ status: status, message: message });
}

// ===============================
// シート管理
// ===============================

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      const range = sheet.getRange(1, 1, 1, headers.length);
      range.setBackground('#28a745');
      range.setFontColor('#ffffff');
      range.setFontWeight('bold');
      range.setHorizontalAlignment('center');
    }
  }
  return sheet;
}

// ===============================
// クラス管理
// ===============================

function getClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('クラス');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
    .map(function(r) { return String(r[0]); }).filter(function(v) { return v; });
}

function addClassGas(className) {
  const classes = getClasses();
  if (classes.indexOf(className) >= 0) return createResponse('error', 'すでに登録されています');
  getOrCreateSheet('クラス', ['クラス名']).appendRow([className]);
  return createResponse('success', 'クラスを追加しました');
}

function deleteClassGas(className) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('クラス');
  if (!sheet) return createResponse('error', 'クラスシートが存在しません');
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === className) { sheet.deleteRow(i + 1); return createResponse('success', '削除しました'); }
  }
  return createResponse('error', 'クラスが見つかりません');
}

// ===============================
// 生徒管理
// ===============================

function getStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('生徒登録');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const numCols = Math.min(Math.max(sheet.getLastColumn(), 2), 4);
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, numCols).getValues()
    .filter(function(r) { return r[0]; })
    .map(function(r) { return { email: String(r[0] || ''), className: String(r[1] || ''), sei: String(r[2] || ''), mei: String(r[3] || '') }; });
}

function getStudentClass(email) {
  const students = getStudents();
  for (let i = 0; i < students.length; i++) {
    if (students[i].email === email) return students[i].className;
  }
  return null;
}

function addStudentGas(email, className, sei, mei) {
  const sheet = getOrCreateSheet('生徒登録', ['メールアドレス', 'クラス名', '姓', '名']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === email) {
      sheet.getRange(i + 1, 2, 1, 3).setValues([[className, sei || '', mei || '']]);
      return createResponse('success', 'クラスを更新しました');
    }
  }
  sheet.appendRow([email, className, sei || '', mei || '']);
  return createResponse('success', '生徒を登録しました');
}

function addStudentsBulkGas(students) {
  const sheet = getOrCreateSheet('生徒登録', ['メールアドレス', 'クラス名', '姓', '名']);
  const data = sheet.getDataRange().getValues();
  const emailToRow = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) emailToRow[String(data[i][0])] = i + 1;
  }
  let added = 0, updated = 0;
  students.forEach(function(s) {
    if (!s.email) return;
    if (emailToRow[s.email]) {
      sheet.getRange(emailToRow[s.email], 2, 1, 3).setValues([[s.className, s.sei || '', s.mei || '']]);
      updated++;
    } else {
      sheet.appendRow([s.email, s.className, s.sei || '', s.mei || '']);
      added++;
    }
  });
  return createResponse('success', added + '名追加、' + updated + '名更新しました');
}

function deleteStudentGas(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('生徒登録');
  if (!sheet) return createResponse('error', '生徒登録シートが存在しません');
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][0]) === email) { sheet.deleteRow(i + 1); return createResponse('success', '削除しました'); }
  }
  return createResponse('error', '生徒が見つかりません');
}

// ===============================
// 結果データ
// ===============================

function getAllResults() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('結果記録');
  if (!sheet || sheet.getLastRow() <= 1) return [];
  return sheet.getDataRange().getValues().slice(1).map(function(row) {
    return {
      timestamp: row[0] ? Utilities.formatDate(new Date(row[0]), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm') : '',
      email: String(row[1] || ''),
      mode: String(row[2] || ''),
      correctCount: Number(row[3] || 0),
      totalQuestions: Number(row[4] || 0),
      percentage: Number(row[5] || 0),
      timeString: String(row[6] || ''),
      elapsedSeconds: Number(row[7] || 0)
    };
  }).reverse();
}

function recordResult(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('結果記録');
  if (!sheet) {
    sheet = ss.insertSheet('結果記録');
    const headers = ['送信日時', 'メールアドレス', 'モード', '正解数', '問題数', '正解率(%)', '経過時間', '経過秒数'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const hr = sheet.getRange(1, 1, 1, headers.length);
    hr.setBackground('#667eea'); hr.setFontColor('#ffffff'); hr.setFontWeight('bold'); hr.setHorizontalAlignment('center');
    for (let i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
  }
  const pct = Math.round((data.correctCount / data.totalQuestions) * 100);
  const row = [new Date(), data.email, data.mode, data.correctCount, data.totalQuestions, pct, data.timeString, data.elapsedSeconds];
  sheet.appendRow(row);
  const lastRow = sheet.getLastRow();
  const dr = sheet.getRange(lastRow, 1, 1, row.length);
  dr.setBackground(pct === 100 ? '#d4edda' : pct >= 80 ? '#fff3cd' : pct >= 60 ? '#fff3cd' : '#f8d7da');
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss');
  sheet.getRange(lastRow, 6).setNumberFormat('0"%"');
  dr.setHorizontalAlignment('center');
}

// ===============================
// ランキング
// ===============================

function getClassRanking(className) {
  const students = getStudents().filter(function(s) { return s.className === className; });
  if (students.length === 0) return [];
  const emailSet = {};
  students.forEach(function(s) { emailSet[s.email] = true; });

  const best = {};
  getAllResults().forEach(function(r) {
    if (!emailSet[r.email]) return;
    const p = best[r.email];
    if (!p || r.correctCount > p.correctCount || (r.correctCount === p.correctCount && r.elapsedSeconds < p.elapsedSeconds)) {
      best[r.email] = r;
    }
  });

  return Object.values(best)
    .sort(function(a, b) { return b.correctCount !== a.correctCount ? b.correctCount - a.correctCount : a.elapsedSeconds - b.elapsedSeconds; })
    .map(function(r, i) {
      return { rank: i + 1, email: r.email, correctCount: r.correctCount, totalQuestions: r.totalQuestions,
               elapsedSeconds: r.elapsedSeconds, timeString: r.timeString, percentage: r.percentage };
    });
}

function getAllClassRankingData() {
  const result = {};
  getClasses().forEach(function(cls) { result[cls] = getClassRanking(cls); });
  return result;
}

function getTodayStats() {
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd');
  const todayResults = getAllResults().filter(function(r) { return r.timestamp.startsWith(today); });
  if (todayResults.length === 0) return { hasData: false };

  const emailToClass = {};
  getStudents().forEach(function(s) { emailToClass[s.email] = s.className; });

  const withClass = todayResults.map(function(r) {
    return Object.assign({}, r, { className: emailToClass[r.email] || null });
  }).filter(function(r) { return r.className; });
  if (withClass.length === 0) return { hasData: false };

  // 個人トップ（その日の最良1回）
  const individualTop = withClass.reduce(function(best, r) {
    if (!best || r.correctCount > best.correctCount || (r.correctCount === best.correctCount && r.elapsedSeconds < best.elapsedSeconds)) return r;
    return best;
  }, null);

  // 生徒ごとにその日のベスト1回を集計
  const bestPerStudent = {};
  withClass.forEach(function(r) {
    const p = bestPerStudent[r.email];
    if (!p || r.correctCount > p.correctCount || (r.correctCount === p.correctCount && r.elapsedSeconds < p.elapsedSeconds)) {
      bestPerStudent[r.email] = r;
    }
  });

  // クラスごとの平均
  const classStats = {};
  Object.values(bestPerStudent).forEach(function(r) {
    if (!classStats[r.className]) classStats[r.className] = { count: 0, totalCorrect: 0, totalSeconds: 0 };
    classStats[r.className].count++;
    classStats[r.className].totalCorrect += r.correctCount;
    classStats[r.className].totalSeconds += r.elapsedSeconds;
  });

  const statsArray = Object.keys(classStats).map(function(cls) {
    const s = classStats[cls];
    return { className: cls, count: s.count, avgCorrect: Math.round(s.totalCorrect / s.count * 100) / 100, avgTime: Math.round(s.totalSeconds / s.count) };
  }).sort(function(a, b) { return b.avgCorrect !== a.avgCorrect ? b.avgCorrect - a.avgCorrect : a.avgTime - b.avgTime; });

  return {
    hasData: true,
    date: today,
    totalAttempts: withClass.length,
    individualTop: individualTop ? {
      email: individualTop.email, className: individualTop.className,
      correctCount: individualTop.correctCount, totalQuestions: individualTop.totalQuestions,
      timeString: individualTop.timeString, elapsedSeconds: individualTop.elapsedSeconds
    } : null,
    topClass: statsArray[0] || null,
    classStats: statsArray
  };
}
