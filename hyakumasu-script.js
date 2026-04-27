// グローバル変数
let userEmail = null;
let calculationMode = 'addition'; // 'addition', 'subtraction' など
let topNumbers = []; // 上部の数字（横）
let leftNumbers = []; // 左側の数字（縦）
let answers = {}; // 正解のマップ {row-col: answer}
let userInputs = {}; // ユーザーの入力 {row-col: value}
let startTime = null;
let endTime = null;
let timerInterval = null;

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const menuScreen = document.getElementById('menuScreen');
const adminScreen = document.getElementById('adminScreen');
const instructionScreen = document.getElementById('instructionScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const userEmailDisplay = document.getElementById('userEmail');
const loginStatus = document.getElementById('loginStatus');
const selectAdditionBtn = document.getElementById('selectAdditionBtn');
const startTestBtn = document.getElementById('startTestBtn');
const backFromInstructionBtn = document.getElementById('backFromInstructionBtn');
const submitBtn = document.getElementById('submitBtn');
const retryBtn = document.getElementById('retryBtn');
const timerValue = document.getElementById('timerValue');
const progressText = document.getElementById('progressText');
const topNumbersContainer = document.getElementById('topNumbers');
const gridContent = document.getElementById('gridContent');
const scoreText = document.getElementById('scoreText');
const scorePercentage = document.getElementById('scorePercentage');
const timeDisplay = document.getElementById('timeDisplay');
const resultDetails = document.getElementById('resultDetails');

// Google Sign-In初期化
window.onload = function() {
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignInBtn'),
        {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'ja'
        }
    );
};

// 教員アカウント判定（メールのユーザー名部分に数字がなければ教員）
function isTeacherAccount(email) {
    const username = email.split('@')[0];
    return !/\d/.test(username);
}

// Google ログインのコールバック
function handleCredentialResponse(response) {
    const credential = parseJwt(response.credential);
    userEmail = credential.email;

    // ドメイン制限: @haguroko.ed.jp のみ許可
    if (!userEmail.endsWith('@haguroko.ed.jp')) {
        loginStatus.textContent = `エラー: @haguroko.ed.jp のアカウントでログインしてください`;
        loginStatus.style.color = '#dc3545';

        userEmail = null;
        google.accounts.id.disableAutoSelect();
        return;
    }

    loginStatus.textContent = `ログイン成功: ${userEmail}`;
    loginStatus.style.color = '#28a745';

    setTimeout(() => {
        loginScreen.classList.add('hidden');
        if (isTeacherAccount(userEmail)) {
            adminScreen.classList.remove('hidden');
            document.getElementById('adminUserEmail').textContent = `ログイン中: ${userEmail}（教員）`;
            initAdminScreen();
        } else {
            menuScreen.classList.remove('hidden');
            userEmailDisplay.textContent = `ログイン中: ${userEmail}`;
        }
    }, 1000);
}

// JWTトークンをデコード
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// イベントリスナー
selectAdditionBtn.addEventListener('click', () => showInstructionScreen('addition'));
startTestBtn.addEventListener('click', startTest);
backFromInstructionBtn.addEventListener('click', backToMenu);
submitBtn.addEventListener('click', submitAnswers);
retryBtn.addEventListener('click', resetTest);

// 手動再送信ボタン
document.addEventListener('DOMContentLoaded', () => {
    const manualRetryBtn = document.getElementById('manualRetryBtn');
    if (manualRetryBtn) {
        manualRetryBtn.addEventListener('click', manualRetrySend);
    }
});

// 説明画面を表示
function showInstructionScreen(mode) {
    calculationMode = mode;
    menuScreen.classList.add('hidden');
    instructionScreen.classList.remove('hidden');

    // タイトルを設定
    const instructionTitle = document.getElementById('instructionTitle');
    if (mode === 'addition') {
        instructionTitle.textContent = '足し算モード';
    } else if (mode === 'subtraction') {
        instructionTitle.textContent = '引き算モード';
    }
}

// メニュー画面に戻る
function backToMenu() {
    instructionScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

// テスト開始
function startTest() {
    // 数字をランダムに生成（1-20から5個）
    topNumbers = generateRandomNumbers(5);
    leftNumbers = generateRandomNumbers(5);

    // 正解を計算
    answers = {};
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const key = `${row}-${col}`;
            if (calculationMode === 'addition') {
                answers[key] = leftNumbers[row] + topNumbers[col];
            } else if (calculationMode === 'subtraction') {
                // 引き算の場合、大きい数から小さい数を引く
                const num1 = leftNumbers[row] + topNumbers[col];
                const num2 = topNumbers[col];
                answers[key] = num1 - num2;
            }
        }
    }

    // グリッドを生成
    generateGrid();

    // 画面を切り替え
    instructionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    // タイマー開始
    startTime = new Date();
    startTimer();

    // 最初の入力欄にフォーカス
    const firstInput = document.querySelector('.grid-cell input');
    if (firstInput) {
        firstInput.focus();
    }
}

// ランダムな数字の配列を生成（1-20から重複なしで指定個数）
function generateRandomNumbers(count) {
    const numbers = [];
    const used = new Set();

    while (numbers.length < count) {
        const num = Math.floor(Math.random() * 20) + 1; // 1-20の範囲
        if (!used.has(num)) {
            numbers.push(num);
            used.add(num);
        }
    }

    return numbers;
}

// グリッドを生成
function generateGrid() {
    // 上部の数字を生成
    topNumbersContainer.innerHTML = '';
    topNumbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'top-number';
        div.textContent = num;
        topNumbersContainer.appendChild(div);
    });

    // グリッドコンテンツを生成
    gridContent.innerHTML = '';
    userInputs = {};

    for (let row = 0; row < 5; row++) {
        // 左側の数字
        const leftNumberDiv = document.createElement('div');
        leftNumberDiv.className = 'left-number';
        leftNumberDiv.textContent = leftNumbers[row];
        gridContent.appendChild(leftNumberDiv);

        // 入力セル
        for (let col = 0; col < 5; col++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'grid-cell';

            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'numeric';
            input.pattern = '[0-9]*';
            input.maxLength = 2;
            input.dataset.row = row;
            input.dataset.col = col;
            input.dataset.key = `${row}-${col}`;

            // 入力イベント
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);

            cellDiv.appendChild(input);
            gridContent.appendChild(cellDiv);
        }
    }

    updateProgress();
}

// 入力処理
function handleInput(e) {
    const input = e.target;
    const value = input.value.replace(/[^0-9]/g, ''); // 数字のみ許可
    input.value = value;

    const key = input.dataset.key;
    if (value !== '') {
        userInputs[key] = parseInt(value);
        input.classList.add('filled');
    } else {
        delete userInputs[key];
        input.classList.remove('filled');
    }

    updateProgress();
}

// キーボード操作
function handleKeyDown(e) {
    const input = e.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);

    // Enterキーでも次のマスに移動
    if (e.key === 'Enter') {
        e.preventDefault();
        moveToNextCell(row, col);
    }
    // Tabキーは標準動作のまま（次のフィールドに移動）
}

// 次のセルに移動
function moveToNextCell(row, col) {
    let nextRow = row;
    let nextCol = col + 1;

    if (nextCol >= 5) {
        nextCol = 0;
        nextRow = row + 1;
    }

    if (nextRow < 5) {
        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

// 進捗更新
function updateProgress() {
    const filledCount = Object.keys(userInputs).length;
    progressText.textContent = `入力済み: ${filledCount}/25`;

    // すべて入力されたら提出ボタンを有効化
    submitBtn.disabled = filledCount < 25;
}

// タイマー開始
function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// タイマー停止
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 回答を提出
function submitAnswers() {
    endTime = new Date();
    stopTimer();

    // 採点
    let correctCount = 0;
    const inputs = document.querySelectorAll('.grid-cell input');

    inputs.forEach(input => {
        const key = input.dataset.key;
        const correctAnswer = answers[key];
        const userAnswer = userInputs[key];

        if (userAnswer === correctAnswer) {
            correctCount++;
            input.classList.add('correct');
            input.classList.remove('incorrect');
        } else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
        }

        // 入力を無効化
        input.disabled = true;
    });

    // 結果画面に移動
    setTimeout(() => {
        showResult(correctCount);
    }, 2000);
}

// 結果を表示
function showResult(correctCount) {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeString = `${minutes}分${seconds}秒`;

    const percentage = Math.round((correctCount / 25) * 100);

    scoreText.textContent = `${correctCount}/25`;
    scorePercentage.textContent = `${percentage}%`;
    timeDisplay.textContent = timeString;

    // Spreadsheetに結果を送信
    sendResultToSpreadsheet(correctCount, 25, elapsedSeconds, timeString, calculationMode);

    // 詳細結果を表示
    showDetailedResults();
}

// 詳細結果を表示（5×5グリッド形式）
function showDetailedResults() {
    resultDetails.innerHTML = '';

    // グリッドコンテナを作成
    const gridContainer = document.createElement('div');
    gridContainer.className = 'result-grid-container';

    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'result-grid-wrapper';

    // 左上の空白セル
    const cornerCell = document.createElement('div');
    cornerCell.className = 'result-corner-cell';
    gridWrapper.appendChild(cornerCell);

    // 上部の数字（横の数字）
    const topNumbersDiv = document.createElement('div');
    topNumbersDiv.className = 'result-top-numbers';
    topNumbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'result-top-number';
        div.textContent = num;
        topNumbersDiv.appendChild(div);
    });
    gridWrapper.appendChild(topNumbersDiv);

    // グリッドコンテンツ
    const gridContent = document.createElement('div');
    gridContent.className = 'result-grid-content';

    for (let row = 0; row < 5; row++) {
        // 左側の数字
        const leftNumberDiv = document.createElement('div');
        leftNumberDiv.className = 'result-left-number';
        leftNumberDiv.textContent = leftNumbers[row];
        gridContent.appendChild(leftNumberDiv);

        // 各セル
        for (let col = 0; col < 5; col++) {
            const key = `${row}-${col}`;
            const correctAnswer = answers[key];
            const userAnswer = userInputs[key];
            const isCorrect = userAnswer === correctAnswer;

            const cellDiv = document.createElement('div');
            cellDiv.className = `result-cell ${isCorrect ? 'result-correct' : 'result-incorrect'}`;
            cellDiv.textContent = userAnswer !== undefined ? userAnswer : '-';
            cellDiv.title = `${leftNumbers[row]} + ${topNumbers[col]} = ${correctAnswer}\nあなたの答え: ${userAnswer !== undefined ? userAnswer : '未入力'}`;

            gridContent.appendChild(cellDiv);
        }
    }

    gridWrapper.appendChild(gridContent);
    gridContainer.appendChild(gridWrapper);
    resultDetails.appendChild(gridContainer);

    // 凡例を追加
    const legend = document.createElement('div');
    legend.className = 'result-legend';
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-box result-correct">10</div>
            <span>正解</span>
        </div>
        <div class="legend-item">
            <div class="legend-box result-incorrect">5</div>
            <span>不正解</span>
        </div>
    `;
    resultDetails.appendChild(legend);
}

// 送信状態を管理する変数
let sendStatus = 'idle';
let retryCount = 0;
const MAX_RETRY = 3;
const RETRY_INTERVAL = 3000;
let lastSendData = null;

// 送信状態を更新してUIに反映
function updateSendStatus(status, message = '') {
    sendStatus = status;
    const statusElement = document.getElementById('sendStatus');
    const statusIcon = document.getElementById('sendStatusIcon');
    const statusText = document.getElementById('sendStatusText');
    const retryBtn = document.getElementById('manualRetryBtn');

    if (!statusElement) return;

    switch(status) {
        case 'sending':
            statusElement.className = 'send-status sending';
            statusIcon.textContent = '⏳';
            statusText.textContent = '結果を送信中...';
            statusElement.classList.remove('hidden');
            if (retryBtn) {
                retryBtn.classList.add('hidden');
                retryBtn.style.display = 'none';
            }
            break;
        case 'retrying':
            statusElement.className = 'send-status retrying';
            statusIcon.textContent = '🔄';
            statusText.textContent = `再送信中... (${retryCount}/${MAX_RETRY})`;
            statusElement.classList.remove('hidden');
            if (retryBtn) {
                retryBtn.classList.add('hidden');
                retryBtn.style.display = 'none';
            }
            break;
        case 'success':
            statusElement.className = 'send-status success';
            statusIcon.textContent = '✓';
            statusText.textContent = '送信完了';
            statusElement.classList.remove('hidden');
            if (retryBtn) {
                retryBtn.classList.add('hidden');
                retryBtn.style.display = 'none';
            }
            break;
        case 'failed':
            statusElement.className = 'send-status failed';
            statusIcon.textContent = '✗';
            statusText.textContent = `送信に失敗しました${message ? ': ' + message : ''}`;
            statusElement.classList.remove('hidden');
            if (retryBtn) {
                retryBtn.classList.remove('hidden');
                retryBtn.style.display = 'block';
            }
            break;
        default:
            statusElement.classList.add('hidden');
            if (retryBtn) {
                retryBtn.classList.add('hidden');
                retryBtn.style.display = 'none';
            }
    }
}

// 手動で再送信する関数
async function manualRetrySend() {
    if (!lastSendData) {
        console.error('送信データがありません');
        return;
    }

    console.log('手動再送信を開始します');
    retryCount = 0;
    await sendDataWithRetry(lastSendData);
}

// データ送信のコア処理（リトライロジック）
async function sendDataWithRetry(data) {
    retryCount = 0;

    async function attemptSend() {
        try {
            if (retryCount === 0) {
                updateSendStatus('sending');
            } else {
                updateSendStatus('retrying');
            }

            console.log(`送信試行 ${retryCount + 1}/${MAX_RETRY}:`, data);

            try {
                const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.status === 'success') {
                    console.log('結果を送信しました（CORS対応）');
                    updateSendStatus('success');
                    return true;
                } else {
                    throw new Error(result.message || '送信失敗');
                }
            } catch (corsError) {
                console.log('CORS対応送信失敗、no-corsモードで再試行:', corsError);

                await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                console.log('結果を送信しました（no-corsモード）');
                updateSendStatus('success');
                return true;
            }
        } catch (error) {
            console.error(`送信試行 ${retryCount + 1} 失敗:`, error);
            retryCount++;

            if (retryCount < MAX_RETRY) {
                console.log(`${RETRY_INTERVAL/1000}秒後に再試行します...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                return attemptSend();
            } else {
                console.error('最大リトライ回数に達しました');
                updateSendStatus('failed', '再試行回数超過');
                return false;
            }
        }
    }

    await attemptSend();
}

// 結果をGoogle Spreadsheetに送信
async function sendResultToSpreadsheet(correctCount, totalQuestions, elapsedSeconds, timeString, mode) {
    if (!userEmail) {
        console.error('ユーザーがログインしていません');
        updateSendStatus('failed', 'ログインしていません');
        return;
    }

    const modeName = mode === 'addition' ? '足し算' : '引き算';

    const data = {
        email: userEmail,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        elapsedSeconds: elapsedSeconds,
        timeString: timeString,
        mode: modeName
    };

    lastSendData = data;
    await sendDataWithRetry(data);
}

// =====================
// 管理画面（教員用）
// =====================

let adminData = [];
let currentAdminTab = 'all';

function initAdminScreen() {
    document.getElementById('tabAllRecords').addEventListener('click', () => switchAdminTab('all'));
    document.getElementById('tabByStudent').addEventListener('click', () => switchAdminTab('students'));
    document.getElementById('applyFilterBtn').addEventListener('click', applyAdminFilter);
    document.getElementById('resetFilterBtn').addEventListener('click', resetAdminFilter);
    document.getElementById('adminRefreshBtn').addEventListener('click', loadAdminData);
    loadAdminData();
}

function switchAdminTab(tab) {
    currentAdminTab = tab;
    document.getElementById('tabAllRecords').classList.toggle('active', tab === 'all');
    document.getElementById('tabByStudent').classList.toggle('active', tab === 'students');
    renderAdminTable(getFilteredData());
}

async function loadAdminData() {
    const loadingEl = document.getElementById('adminLoading');
    const tableContainer = document.getElementById('adminTableContainer');
    const errorEl = document.getElementById('adminError');

    loadingEl.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
        const url = `${CONFIG.GAS_WEB_APP_URL}?action=getResults`;
        const response = await fetch(url, { redirect: 'follow' });
        const result = await response.json();

        if (result.status === 'success') {
            adminData = result.data;
            loadingEl.classList.add('hidden');
            tableContainer.classList.remove('hidden');
            renderAdminStats(adminData);
            renderAdminTable(adminData);
        } else {
            throw new Error(result.message || '不明なエラー');
        }
    } catch (error) {
        loadingEl.classList.add('hidden');
        errorEl.textContent = `データの読み込みに失敗しました: ${error.message}`;
        errorEl.classList.remove('hidden');
    }
}

function getFilteredData() {
    const mode = document.getElementById('filterMode').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    return adminData.filter(row => {
        if (mode && row.mode !== mode) return false;
        if (dateFrom || dateTo) {
            const rowDate = row.timestamp.substring(0, 10).replace(/\//g, '-');
            if (dateFrom && rowDate < dateFrom) return false;
            if (dateTo && rowDate > dateTo) return false;
        }
        return true;
    });
}

function applyAdminFilter() {
    const filtered = getFilteredData();
    renderAdminStats(filtered);
    renderAdminTable(filtered);
    document.getElementById('adminTableContainer').classList.remove('hidden');
}

function resetAdminFilter() {
    document.getElementById('filterMode').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    renderAdminStats(adminData);
    renderAdminTable(adminData);
}

function renderAdminStats(data) {
    const statsEl = document.getElementById('adminStats');
    const uniqueStudents = new Set(data.map(r => r.email)).size;
    const totalTests = data.length;
    const perfectCount = data.filter(r => r.percentage === 100).length;
    const perfectRate = totalTests > 0 ? Math.round((perfectCount / totalTests) * 100) : 0;
    const avgScore = totalTests > 0 ? Math.round(data.reduce((s, r) => s + r.percentage, 0) / totalTests) : 0;

    statsEl.innerHTML = `
        <div class="admin-stat-card">
            <div class="admin-stat-value">${totalTests}</div>
            <div class="admin-stat-label">総受験回数</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-value">${uniqueStudents}</div>
            <div class="admin-stat-label">受験者数</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-value">${avgScore}%</div>
            <div class="admin-stat-label">平均正解率</div>
        </div>
        <div class="admin-stat-card">
            <div class="admin-stat-value">${perfectRate}%</div>
            <div class="admin-stat-label">満点率</div>
        </div>
    `;
}

function renderAdminTable(data) {
    const thead = document.getElementById('adminTableHead');
    const tbody = document.getElementById('adminTableBody');
    const countEl = document.getElementById('adminRecordCount');

    if (currentAdminTab === 'all') {
        countEl.textContent = `${data.length}件`;
        thead.innerHTML = `<tr>
            <th>日時</th><th>生徒</th><th>モード</th><th>正解数</th><th>正解率</th><th>タイム</th>
        </tr>`;
        tbody.innerHTML = data.map(row => {
            const student = row.email.split('@')[0];
            const cls = scoreClass(row.percentage);
            return `<tr>
                <td>${row.timestamp}</td>
                <td class="student-name">${student}</td>
                <td>${row.mode}</td>
                <td>${row.correctCount}/${row.totalQuestions}</td>
                <td><span class="score-badge ${cls}">${row.percentage}%</span></td>
                <td>${row.timeString}</td>
            </tr>`;
        }).join('');
    } else {
        const studentMap = {};
        data.forEach(row => {
            const email = row.email;
            if (!studentMap[email]) {
                studentMap[email] = { email, count: 0, latestDate: '', bestScore: 0, bestTime: Infinity, totalScore: 0 };
            }
            const s = studentMap[email];
            s.count++;
            s.totalScore += row.percentage;
            if (row.percentage > s.bestScore || (row.percentage === s.bestScore && row.elapsedSeconds < s.bestTime)) {
                s.bestScore = row.percentage;
                s.bestTime = row.elapsedSeconds;
            }
            if (!s.latestDate || row.timestamp > s.latestDate) s.latestDate = row.timestamp;
        });

        const students = Object.values(studentMap).sort((a, b) => b.bestScore - a.bestScore || a.bestTime - b.bestTime);
        countEl.textContent = `${students.length}名`;
        thead.innerHTML = `<tr>
            <th>生徒</th><th>受験回数</th><th>最高正解率</th><th>平均正解率</th><th>最速タイム</th><th>最終受験日</th>
        </tr>`;
        tbody.innerHTML = students.map(s => {
            const avg = Math.round(s.totalScore / s.count);
            const bt = s.bestTime === Infinity ? '-' : `${Math.floor(s.bestTime / 60)}分${String(s.bestTime % 60).padStart(2, '0')}秒`;
            const cls = scoreClass(s.bestScore);
            return `<tr>
                <td class="student-name">${s.email.split('@')[0]}</td>
                <td>${s.count}回</td>
                <td><span class="score-badge ${cls}">${s.bestScore}%</span></td>
                <td>${avg}%</td>
                <td>${bt}</td>
                <td>${s.latestDate}</td>
            </tr>`;
        }).join('');
    }
}

function scoreClass(pct) {
    if (pct === 100) return 'score-perfect';
    if (pct >= 80) return 'score-good';
    if (pct >= 60) return 'score-ok';
    return 'score-poor';
}

// テストをリセット
function resetTest() {
    resultScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');

    // 変数をリセット
    topNumbers = [];
    leftNumbers = [];
    answers = {};
    userInputs = {};
    startTime = null;
    endTime = null;

    // 送信状態をリセット
    sendStatus = 'idle';
    retryCount = 0;
    lastSendData = null;

    const statusElement = document.getElementById('sendStatus');
    const retryBtn = document.getElementById('manualRetryBtn');
    if (statusElement) statusElement.classList.add('hidden');
    if (retryBtn) {
        retryBtn.classList.add('hidden');
        retryBtn.style.display = 'none';
    }
}
