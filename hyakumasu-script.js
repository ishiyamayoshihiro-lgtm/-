// グローバル変数
let userEmail = null;
let userClass = null;
let studentNameMap = {}; // email → {sei, mei, className}
let cachedClasses = null; // クラス一覧キャッシュ
let calculationMode = 'addition';
let topNumbers = [];
let leftNumbers = [];
let answers = {};
let userInputs = {};
let startTime = null;
let endTime = null;
let timerInterval = null;

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const menuScreen = document.getElementById('menuScreen');
const adminScreen = document.getElementById('adminScreen');
const rankingScreen = document.getElementById('rankingScreen');
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
        { theme: 'outline', size: 'large', text: 'signin_with', locale: 'ja' }
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

    if (!userEmail.endsWith('@haguroko.ed.jp')) {
        loginStatus.textContent = 'エラー: @haguroko.ed.jp のアカウントでログインしてください';
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
            fetchStudentClass();
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
document.getElementById('viewRankingBtn').addEventListener('click', showClassRanking);
document.getElementById('backFromRankingBtn').addEventListener('click', backToMenuFromRanking);

document.addEventListener('DOMContentLoaded', () => {
    const manualRetryBtn = document.getElementById('manualRetryBtn');
    if (manualRetryBtn) manualRetryBtn.addEventListener('click', manualRetrySend);
});

// =====================
// 生徒クラス取得
// =====================

async function fetchStudentClass() {
    try {
        const url = `${CONFIG.GAS_WEB_APP_URL}?action=getStudentClass&email=${encodeURIComponent(userEmail)}`;
        const res = await fetch(url, { redirect: 'follow' });
        const result = await res.json();
        if (result.status === 'success' && result.data.className) {
            userClass = result.data.className;
            const btn = document.getElementById('viewRankingBtn');
            btn.classList.remove('hidden');
            document.getElementById('rankingBtnDesc').textContent = `${userClass}のランキングを確認`;
        }
    } catch (e) {
        // クラス未登録の場合はランキングボタンを表示しない
    }
}

// =====================
// 生徒用クラスランキング
// =====================

async function showClassRanking() {
    menuScreen.classList.add('hidden');
    rankingScreen.classList.remove('hidden');
    document.getElementById('rankingClassName').textContent = `${userClass} のランキング`;

    const loadingEl = document.getElementById('rankingLoading');
    const errorEl = document.getElementById('rankingError');
    const contentEl = document.getElementById('rankingContent');
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    contentEl.classList.add('hidden');

    try {
        const url = `${CONFIG.GAS_WEB_APP_URL}?action=getClassRanking&class=${encodeURIComponent(userClass)}`;
        const res = await fetch(url, { redirect: 'follow' });
        const result = await res.json();
        if (result.status === 'success') {
            loadingEl.classList.add('hidden');
            contentEl.classList.remove('hidden');
            renderStudentRanking(result.data);
        } else {
            throw new Error(result.message);
        }
    } catch (e) {
        loadingEl.classList.add('hidden');
        errorEl.textContent = `読み込みに失敗しました: ${e.message}`;
        errorEl.classList.remove('hidden');
    }
}

function renderStudentRanking(ranking) {
    document.getElementById('rankingTotal').textContent = `登録生徒: ${ranking.length}名`;

    const myEntry = ranking.find(r => r.email === userEmail);
    const top5 = ranking.slice(0, 5);
    const isInTop5 = myEntry && myEntry.rank <= 5;

    const rankIcons = ['🥇', '🥈', '🥉', '4位', '5位'];
    let html = `<table class="ranking-table">
        <thead><tr><th>順位</th><th>アカウント</th><th>正解数</th><th>タイム</th></tr></thead>
        <tbody>`;
    top5.forEach((r, i) => {
        const isMe = r.email === userEmail;
        const username = r.email.split('@')[0];
        html += `<tr class="${isMe ? 'my-row' : ''}">
            <td>${rankIcons[i]}</td>
            <td>${username}${isMe ? '<span class="you-label"> ← あなた</span>' : ''}</td>
            <td>${r.correctCount}/${r.totalQuestions}</td>
            <td>${r.timeString}</td>
        </tr>`;
    });
    if (ranking.length === 0) {
        html += '<tr><td colspan="4" style="text-align:center;color:#999;padding:20px">まだデータがありません</td></tr>';
    }
    html += '</tbody></table>';
    document.getElementById('rankingTable').innerHTML = html;

    const myRankEl = document.getElementById('myRank');
    if (myEntry && !isInTop5) {
        const username = myEntry.email.split('@')[0];
        myRankEl.innerHTML = `
            <div class="my-rank-card">
                <p class="my-rank-label">あなたの順位</p>
                <div class="my-rank-number">${myEntry.rank}位</div>
                <p>${username}</p>
                <p>${myEntry.correctCount}/${myEntry.totalQuestions}問 | ${myEntry.timeString}</p>
            </div>`;
    } else if (!myEntry) {
        myRankEl.innerHTML = '<p class="no-rank-msg">まだ受験記録がありません。テストを受けてランキングに入ろう！</p>';
    } else {
        myRankEl.innerHTML = '';
    }
}

function backToMenuFromRanking() {
    rankingScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

// =====================
// テスト処理
// =====================

function showInstructionScreen(mode) {
    calculationMode = mode;
    menuScreen.classList.add('hidden');
    instructionScreen.classList.remove('hidden');
    const instructionTitle = document.getElementById('instructionTitle');
    if (mode === 'addition') instructionTitle.textContent = '足し算モード';
    else if (mode === 'subtraction') instructionTitle.textContent = '引き算モード';
}

function backToMenu() {
    instructionScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

function startTest() {
    topNumbers = generateRandomNumbers(5);
    leftNumbers = generateRandomNumbers(5);
    answers = {};
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const key = `${row}-${col}`;
            if (calculationMode === 'addition') {
                answers[key] = leftNumbers[row] + topNumbers[col];
            } else if (calculationMode === 'subtraction') {
                const num1 = leftNumbers[row] + topNumbers[col];
                answers[key] = num1 - topNumbers[col];
            }
        }
    }
    generateGrid();
    instructionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    startTime = new Date();
    startTimer();
    const firstInput = document.querySelector('.grid-cell input');
    if (firstInput) firstInput.focus();
}

function generateRandomNumbers(count) {
    const numbers = [];
    const used = new Set();
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * 20) + 1;
        if (!used.has(num)) { numbers.push(num); used.add(num); }
    }
    return numbers;
}

function generateGrid() {
    topNumbersContainer.innerHTML = '';
    topNumbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'top-number';
        div.textContent = num;
        topNumbersContainer.appendChild(div);
    });

    gridContent.innerHTML = '';
    userInputs = {};

    for (let row = 0; row < 5; row++) {
        const leftNumberDiv = document.createElement('div');
        leftNumberDiv.className = 'left-number';
        leftNumberDiv.textContent = leftNumbers[row];
        gridContent.appendChild(leftNumberDiv);

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
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
            cellDiv.appendChild(input);
            gridContent.appendChild(cellDiv);
        }
    }
    updateProgress();
}

function handleInput(e) {
    const input = e.target;
    const value = input.value.replace(/[^0-9]/g, '');
    input.value = value;
    const key = input.dataset.key;
    if (value !== '') { userInputs[key] = parseInt(value); input.classList.add('filled'); }
    else { delete userInputs[key]; input.classList.remove('filled'); }
    updateProgress();
}

function handleKeyDown(e) {
    const input = e.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    if (e.key === 'Enter') { e.preventDefault(); moveToNextCell(row, col); }
}

function moveToNextCell(row, col) {
    let nextRow = row, nextCol = col + 1;
    if (nextCol >= 5) { nextCol = 0; nextRow = row + 1; }
    if (nextRow < 5) {
        const nextInput = document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
        if (nextInput) { nextInput.focus(); nextInput.select(); }
    }
}

function updateProgress() {
    const filledCount = Object.keys(userInputs).length;
    progressText.textContent = `入力済み: ${filledCount}/25`;
    submitBtn.disabled = filledCount < 25;
}

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function submitAnswers() {
    endTime = new Date();
    stopTimer();
    let correctCount = 0;
    const inputs = document.querySelectorAll('.grid-cell input');
    inputs.forEach(input => {
        const key = input.dataset.key;
        const correctAnswer = answers[key];
        const userAnswer = userInputs[key];
        if (userAnswer === correctAnswer) {
            correctCount++;
            input.classList.add('correct'); input.classList.remove('incorrect');
        } else {
            input.classList.add('incorrect'); input.classList.remove('correct');
        }
        input.disabled = true;
    });
    setTimeout(() => showResult(correctCount), 2000);
}

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
    sendResultToSpreadsheet(correctCount, 25, elapsedSeconds, timeString, calculationMode);
    showDetailedResults();
}

function showDetailedResults() {
    resultDetails.innerHTML = '';
    const gridContainer = document.createElement('div');
    gridContainer.className = 'result-grid-container';
    const gridWrapper = document.createElement('div');
    gridWrapper.className = 'result-grid-wrapper';

    const cornerCell = document.createElement('div');
    cornerCell.className = 'result-corner-cell';
    gridWrapper.appendChild(cornerCell);

    const topNumbersDiv = document.createElement('div');
    topNumbersDiv.className = 'result-top-numbers';
    topNumbers.forEach(num => {
        const div = document.createElement('div');
        div.className = 'result-top-number';
        div.textContent = num;
        topNumbersDiv.appendChild(div);
    });
    gridWrapper.appendChild(topNumbersDiv);

    const gridContent = document.createElement('div');
    gridContent.className = 'result-grid-content';

    for (let row = 0; row < 5; row++) {
        const leftNumberDiv = document.createElement('div');
        leftNumberDiv.className = 'result-left-number';
        leftNumberDiv.textContent = leftNumbers[row];
        gridContent.appendChild(leftNumberDiv);

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

    const legend = document.createElement('div');
    legend.className = 'result-legend';
    legend.innerHTML = `
        <div class="legend-item"><div class="legend-box result-correct">10</div><span>正解</span></div>
        <div class="legend-item"><div class="legend-box result-incorrect">5</div><span>不正解</span></div>`;
    resultDetails.appendChild(legend);
}

// =====================
// 送信処理
// =====================

let sendStatus = 'idle';
let retryCount = 0;
const MAX_RETRY = 3;
const RETRY_INTERVAL = 3000;
let lastSendData = null;

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
            statusIcon.textContent = '⏳'; statusText.textContent = '結果を送信中...';
            statusElement.classList.remove('hidden');
            if (retryBtn) { retryBtn.classList.add('hidden'); retryBtn.style.display = 'none'; }
            break;
        case 'retrying':
            statusElement.className = 'send-status retrying';
            statusIcon.textContent = '🔄'; statusText.textContent = `再送信中... (${retryCount}/${MAX_RETRY})`;
            statusElement.classList.remove('hidden');
            if (retryBtn) { retryBtn.classList.add('hidden'); retryBtn.style.display = 'none'; }
            break;
        case 'success':
            statusElement.className = 'send-status success';
            statusIcon.textContent = '✓'; statusText.textContent = '送信完了';
            statusElement.classList.remove('hidden');
            if (retryBtn) { retryBtn.classList.add('hidden'); retryBtn.style.display = 'none'; }
            break;
        case 'failed':
            statusElement.className = 'send-status failed';
            statusIcon.textContent = '✗'; statusText.textContent = `送信に失敗しました${message ? ': ' + message : ''}`;
            statusElement.classList.remove('hidden');
            if (retryBtn) { retryBtn.classList.remove('hidden'); retryBtn.style.display = 'block'; }
            break;
        default:
            statusElement.classList.add('hidden');
            if (retryBtn) { retryBtn.classList.add('hidden'); retryBtn.style.display = 'none'; }
    }
}

async function manualRetrySend() {
    if (!lastSendData) return;
    retryCount = 0;
    await sendDataWithRetry(lastSendData);
}

async function sendDataWithRetry(data) {
    retryCount = 0;
    async function attemptSend() {
        try {
            if (retryCount === 0) updateSendStatus('sending');
            else updateSendStatus('retrying');
            try {
                const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (result.status === 'success') { updateSendStatus('success'); return true; }
                else throw new Error(result.message || '送信失敗');
            } catch (corsError) {
                await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST', mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                updateSendStatus('success'); return true;
            }
        } catch (error) {
            retryCount++;
            if (retryCount < MAX_RETRY) {
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                return attemptSend();
            } else {
                updateSendStatus('failed', '再試行回数超過'); return false;
            }
        }
    }
    await attemptSend();
}

async function sendResultToSpreadsheet(correctCount, totalQuestions, elapsedSeconds, timeString, mode) {
    if (!userEmail) { updateSendStatus('failed', 'ログインしていません'); return; }
    const modeName = mode === 'addition' ? '足し算' : '引き算';
    const data = { email: userEmail, correctCount, totalQuestions, elapsedSeconds, timeString, mode: modeName };
    lastSendData = data;
    await sendDataWithRetry(data);
}

function resetTest() {
    resultScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    topNumbers = []; leftNumbers = []; answers = {}; userInputs = {};
    startTime = null; endTime = null;
    sendStatus = 'idle'; retryCount = 0; lastSendData = null;
    const statusElement = document.getElementById('sendStatus');
    const retryBtnEl = document.getElementById('manualRetryBtn');
    if (statusElement) statusElement.classList.add('hidden');
    if (retryBtnEl) { retryBtnEl.classList.add('hidden'); retryBtnEl.style.display = 'none'; }
}

// =====================
// 管理画面（教員用）
// =====================

let adminData = [];
let currentAdminTab = 'all';

function initAdminScreen() {
    document.getElementById('tabAllRecords').addEventListener('click', () => switchAdminTab('all'));
    document.getElementById('tabByStudent').addEventListener('click', () => switchAdminTab('students'));
    document.getElementById('tabClassMgmt').addEventListener('click', () => switchAdminTab('classMgmt'));
    document.getElementById('tabStudentReg').addEventListener('click', () => switchAdminTab('studentReg'));
    document.getElementById('tabClassRanking').addEventListener('click', () => switchAdminTab('classRanking'));
    document.getElementById('applyFilterBtn').addEventListener('click', applyAdminFilter);
    document.getElementById('resetFilterBtn').addEventListener('click', resetAdminFilter);
    document.getElementById('adminRefreshBtn').addEventListener('click', refreshCurrentTab);
    document.getElementById('addClassBtn').addEventListener('click', addClassHandler);
    document.getElementById('addStudentBtn').addEventListener('click', addStudentHandler);
    document.getElementById('studentFilterClass').addEventListener('change', loadStudentList);
    loadAdminData();
}

async function preloadClasses() {
    try {
        const result = await adminGet('getClasses');
        cachedClasses = result.data;
    } catch (e) {
        // 失敗してもタブ切り替え時に再取得するので問題なし
    }
}

async function loadStudentNameMap() {
    try {
        const result = await adminGet('getStudents');
        studentNameMap = {};
        result.data.forEach(s => {
            studentNameMap[s.email] = { sei: s.sei, mei: s.mei, className: s.className };
        });
    } catch (e) {}
}

// クラスと生徒を1リクエストで取得（GASコールドスタート対策）
async function loadClassesAndStudents() {
    try {
        const result = await adminGet('getClassesAndStudents');
        cachedClasses = result.data.classes;
        studentNameMap = {};
        result.data.students.forEach(s => {
            studentNameMap[s.email] = { sei: s.sei, mei: s.mei, className: s.className };
        });
        // タブに関わらず常に描画（非表示でも裏で更新しておく）
        renderClassList(cachedClasses);
        updateClassSelects(cachedClasses);
        if (adminData.length > 0) renderAdminTable(adminData);
    } catch (e) {}
}

function getDisplayName(email) {
    const info = studentNameMap[email];
    if (info && (info.sei || info.mei)) return `${info.sei} ${info.mei}`.trim();
    return email.split('@')[0];
}

function refreshCurrentTab() {
    if (currentAdminTab === 'all' || currentAdminTab === 'students') loadAdminData();
    else if (currentAdminTab === 'classMgmt') loadClassList();
    else if (currentAdminTab === 'studentReg') loadStudentList();
    else if (currentAdminTab === 'classRanking') loadAllClassRanking();
}

function switchAdminTab(tab) {
    currentAdminTab = tab;
    const tabMap = { all: 'tabAllRecords', students: 'tabByStudent', classMgmt: 'tabClassMgmt', studentReg: 'tabStudentReg', classRanking: 'tabClassRanking' };
    Object.values(tabMap).forEach(id => document.getElementById(id).classList.remove('active'));
    document.getElementById(tabMap[tab]).classList.add('active');

    document.getElementById('adminDataSection').classList.toggle('hidden', tab !== 'all' && tab !== 'students');
    document.getElementById('adminClassSection').classList.toggle('hidden', tab !== 'classMgmt');
    document.getElementById('adminStudentSection').classList.toggle('hidden', tab !== 'studentReg');
    document.getElementById('adminRankingSection').classList.toggle('hidden', tab !== 'classRanking');

    if (tab === 'all' || tab === 'students') renderAdminTable(getFilteredData());
    else if (tab === 'classMgmt') loadClassList();
    else if (tab === 'studentReg') loadStudentList();
    else if (tab === 'classRanking') loadAllClassRanking();
}

async function loadAdminData() {
    const loadingEl = document.getElementById('adminLoading');
    const tableContainer = document.getElementById('adminTableContainer');
    const errorEl = document.getElementById('adminError');
    loadingEl.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    errorEl.classList.add('hidden');

    try {
        const result = await adminGet('getResults');
        adminData = result.data;
        loadingEl.classList.add('hidden');
        tableContainer.classList.remove('hidden');
        renderAdminStats(adminData);
        renderAdminTable(adminData);
        // GASが温まった後にクラス・生徒を1リクエストで取得
        loadClassesAndStudents();
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
        <div class="admin-stat-card"><div class="admin-stat-value">${totalTests}</div><div class="admin-stat-label">総受験回数</div></div>
        <div class="admin-stat-card"><div class="admin-stat-value">${uniqueStudents}</div><div class="admin-stat-label">受験者数</div></div>
        <div class="admin-stat-card"><div class="admin-stat-value">${avgScore}%</div><div class="admin-stat-label">平均正解率</div></div>
        <div class="admin-stat-card"><div class="admin-stat-value">${perfectRate}%</div><div class="admin-stat-label">満点率</div></div>`;
}

function renderAdminTable(data) {
    const thead = document.getElementById('adminTableHead');
    const tbody = document.getElementById('adminTableBody');
    const countEl = document.getElementById('adminRecordCount');

    if (currentAdminTab === 'all') {
        countEl.textContent = `${data.length}件`;
        thead.innerHTML = '<tr><th>日時</th><th>生徒</th><th>モード</th><th>正解数</th><th>正解率</th><th>タイム</th></tr>';
        tbody.innerHTML = data.map(row => {
            const cls = scoreClass(row.percentage);
            return `<tr><td>${row.timestamp}</td><td class="student-name">${getDisplayName(row.email)}</td><td>${row.mode}</td><td>${row.correctCount}/${row.totalQuestions}</td><td><span class="score-badge ${cls}">${row.percentage}%</span></td><td>${row.timeString}</td></tr>`;
        }).join('');
    } else {
        const studentMap = {};
        data.forEach(row => {
            const email = row.email;
            if (!studentMap[email]) studentMap[email] = { email, count: 0, latestDate: '', bestScore: 0, bestTime: Infinity, totalScore: 0 };
            const s = studentMap[email];
            s.count++; s.totalScore += row.percentage;
            if (row.percentage > s.bestScore || (row.percentage === s.bestScore && row.elapsedSeconds < s.bestTime)) {
                s.bestScore = row.percentage; s.bestTime = row.elapsedSeconds;
            }
            if (!s.latestDate || row.timestamp > s.latestDate) s.latestDate = row.timestamp;
        });
        const students = Object.values(studentMap).sort((a, b) => b.bestScore - a.bestScore || a.bestTime - b.bestTime);
        countEl.textContent = `${students.length}名`;
        thead.innerHTML = '<tr><th>生徒</th><th>受験回数</th><th>最高正解率</th><th>平均正解率</th><th>最速タイム</th><th>最終受験日</th></tr>';
        tbody.innerHTML = students.map(s => {
            const avg = Math.round(s.totalScore / s.count);
            const bt = s.bestTime === Infinity ? '-' : `${Math.floor(s.bestTime / 60)}分${String(s.bestTime % 60).padStart(2, '0')}秒`;
            const cls = scoreClass(s.bestScore);
            return `<tr><td class="student-name">${getDisplayName(s.email)}</td><td>${s.count}回</td><td><span class="score-badge ${cls}">${s.bestScore}%</span></td><td>${avg}%</td><td>${bt}</td><td>${s.latestDate}</td></tr>`;
        }).join('');
    }
}

function scoreClass(pct) {
    if (pct === 100) return 'score-perfect';
    if (pct >= 80) return 'score-good';
    if (pct >= 60) return 'score-ok';
    return 'score-poor';
}

// =====================
// クラス管理
// =====================

function renderClassList(classes) {
    const listEl = document.getElementById('classList');
    if (classes.length === 0) {
        listEl.innerHTML = '<p style="color:#999;padding:10px;">クラスが登録されていません</p>';
    } else {
        listEl.innerHTML = classes.map(cls => `
            <div class="admin-list-item">
                <span>${cls}</span>
                <button class="btn-admin-delete" onclick="deleteClassHandler('${cls}')">削除</button>
            </div>`).join('');
    }
    updateClassSelects(classes);
    cachedClasses = classes;
}

async function loadClassList() {
    const listEl = document.getElementById('classList');

    // キャッシュがあれば即表示
    if (cachedClasses !== null) {
        renderClassList(cachedClasses);
    } else {
        listEl.innerHTML = '<p style="color:#666;padding:10px;">読み込み中...</p>';
    }

    // 裏で最新データを取得して更新
    try {
        const result = await adminGet('getClasses');
        renderClassList(result.data);
    } catch (e) {
        if (cachedClasses === null) {
            listEl.innerHTML = '<p style="color:red;padding:10px;">読み込みに失敗しました。<button onclick="loadClassList()" style="margin-left:8px;padding:4px 10px;background:#28a745;color:white;border:none;border-radius:4px;cursor:pointer;">再試行</button></p>';
        }
    }
}

function updateClassSelects(classes) {
    ['newStudentClass', 'studentFilterClass'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const defaultOpt = id === 'studentFilterClass' ? '<option value="">全クラス</option>' : '<option value="">クラスを選択</option>';
        select.innerHTML = defaultOpt + classes.map(cls => `<option value="${cls}">${cls}</option>`).join('');
    });
}

async function addClassHandler() {
    const input = document.getElementById('newClassName');
    const className = input.value.trim();
    if (!className) return;
    const msgEl = document.getElementById('classMgmtMsg');
    try {
        const result = await adminPost({ action: 'addClass', className });
        if (result.status === 'success') {
            input.value = '';
            cachedClasses = null; // キャッシュをクリアして再取得
            showAdminMsg(msgEl, result.message, 'success');
            loadClassList();
        } else {
            showAdminMsg(msgEl, result.message, 'error');
        }
    } catch (e) {
        showAdminMsg(msgEl, '追加に失敗しました', 'error');
    }
}

async function deleteClassHandler(className) {
    if (!confirm(`「${className}」を削除しますか？`)) return;
    try {
        const result = await adminPost({ action: 'deleteClass', className });
        if (result.status === 'success') { cachedClasses = null; loadClassList(); }
        else alert(result.message);
    } catch (e) { alert('削除に失敗しました'); }
}

// =====================
// 生徒登録
// =====================

async function loadStudentList() {
    // キャッシュ優先でクラスセレクトを更新（なければGASから取得）
    if (cachedClasses !== null) {
        updateClassSelects(cachedClasses);
    } else {
        try {
            const classResult = await adminGet('getClasses');
            cachedClasses = classResult.data;
            updateClassSelects(cachedClasses);
        } catch (e) {}
    }

    const listEl = document.getElementById('studentList');
    const filterClass = document.getElementById('studentFilterClass').value;
    listEl.innerHTML = '<p style="color:#666;padding:10px;">読み込み中...</p>';
    try {
        const result = await adminGet('getStudents');
        let students = result.data;
        if (filterClass) students = students.filter(s => s.className === filterClass);
        if (students.length === 0) {
            listEl.innerHTML = '<p style="color:#999;padding:10px;">生徒が登録されていません</p>';
        } else {
            listEl.innerHTML = `<table class="admin-table" style="margin-top:0;border-radius:0;">
                <thead><tr><th>姓</th><th>名</th><th>クラス</th><th>メールアドレス</th><th>操作</th></tr></thead>
                <tbody>${students.map(s => `
                    <tr>
                        <td>${s.sei || '-'}</td>
                        <td>${s.mei || '-'}</td>
                        <td>${s.className}</td>
                        <td style="font-size:0.85em;color:#666;">${s.email}</td>
                        <td><button class="btn-admin-delete" onclick="deleteStudentHandler('${s.email}')">削除</button></td>
                    </tr>`).join('')}
                </tbody>
            </table>`;
        }
    } catch (e) {
        listEl.innerHTML = '<p style="color:red;padding:10px;">読み込みに失敗しました</p>';
    }
}

function parsePastedColumn(text) {
    return text.split(/[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0);
}

async function addStudentHandler() {
    const emailsText = document.getElementById('newStudentEmails').value;
    const seiText = document.getElementById('newStudentSei').value;
    const meiText = document.getElementById('newStudentMei').value;
    const className = document.getElementById('newStudentClass').value;
    const msgEl = document.getElementById('studentMgmtMsg');

    const emails = parsePastedColumn(emailsText);
    const seis = parsePastedColumn(seiText);
    const meis = parsePastedColumn(meiText);

    if (emails.length === 0) { showAdminMsg(msgEl, 'メールアドレスを入力してください', 'error'); return; }
    if (!className) { showAdminMsg(msgEl, 'クラスを選択してください', 'error'); return; }

    const students = emails.map((email, i) => ({
        email,
        className,
        sei: seis[i] || '',
        mei: meis[i] || ''
    }));

    try {
        const result = await adminPost({ action: 'addStudentsBulk', students });
        if (result.status === 'success') {
            document.getElementById('newStudentEmails').value = '';
            document.getElementById('newStudentSei').value = '';
            document.getElementById('newStudentMei').value = '';
            showAdminMsg(msgEl, result.message, 'success');
            loadStudentList();
            loadStudentNameMap();
        } else {
            showAdminMsg(msgEl, result.message, 'error');
        }
    } catch (e) {
        showAdminMsg(msgEl, '登録に失敗しました', 'error');
    }
}

async function deleteStudentHandler(email) {
    if (!confirm(`「${email}」を削除しますか？`)) return;
    try {
        const result = await adminPost({ action: 'deleteStudent', email });
        if (result.status === 'success') loadStudentList();
        else alert(result.message);
    } catch (e) { alert('削除に失敗しました'); }
}

// =====================
// クラス別ランキング（管理）
// =====================

async function loadAllClassRanking() {
    const loadingEl = document.getElementById('rankingLoadingAdmin');
    const contentEl = document.getElementById('allClassRankingContent');
    const todayCard = document.getElementById('todayStatsCard');
    loadingEl.classList.remove('hidden');
    contentEl.classList.add('hidden');
    todayCard.classList.add('hidden');

    try {
        const [rankingResult, todayResult] = await Promise.all([
            adminGet('getAllClassRanking'),
            adminGet('getTodayStats')
        ]);

        loadingEl.classList.add('hidden');

        if (todayResult.data && todayResult.data.hasData) {
            renderTodayStats(todayResult.data);
            todayCard.classList.remove('hidden');
        }

        renderAllClassRanking(rankingResult.data);
        contentEl.classList.remove('hidden');
    } catch (e) {
        loadingEl.textContent = '読み込みに失敗しました';
    }
}

function renderTodayStats(data) {
    const card = document.getElementById('todayStatsCard');
    const topIndiv = data.individualTop;
    const topClass = data.topClass;

    let indivHtml = 'データなし';
    if (topIndiv) {
        const min = Math.floor(topIndiv.elapsedSeconds / 60);
        const sec = String(topIndiv.elapsedSeconds % 60).padStart(2, '0');
        indivHtml = `<strong>${topIndiv.className}</strong>（${getDisplayName(topIndiv.email)}）　${topIndiv.correctCount}/${topIndiv.totalQuestions}問・${min}分${sec}秒`;
    }

    let classHtml = 'データなし';
    if (topClass) {
        const min = Math.floor(topClass.avgTime / 60);
        const sec = String(topClass.avgTime % 60).padStart(2, '0');
        classHtml = `<strong>${topClass.className}</strong>（平均正解数：${topClass.avgCorrect}問、平均解答時間：${min}分${sec}秒）`;
    }

    const classTableRows = data.classStats.map((s, i) => {
        const min = Math.floor(s.avgTime / 60);
        const sec = String(s.avgTime % 60).padStart(2, '0');
        return `<tr>
            <td>${i === 0 ? '🏆 ' : ''}${s.className}</td>
            <td>${s.count}人</td>
            <td>${s.avgCorrect}問</td>
            <td>${min}分${sec}秒</td>
        </tr>`;
    }).join('');

    card.innerHTML = `
        <div class="today-stats-header">
            <h3>今日のクラス対抗（${data.date}）</h3>
            <span class="today-attempts">受験回数: ${data.totalAttempts}回</span>
        </div>
        <div class="today-stats-rows">
            <div class="today-stat-row"><span class="today-stat-label">個人トップ</span><span class="today-stat-value">${indivHtml}</span></div>
            <div class="today-stat-row"><span class="today-stat-label">組別トップ</span><span class="today-stat-value">${classHtml}</span></div>
        </div>
        ${data.classStats.length > 1 ? `
        <div class="today-class-table">
            <table class="admin-table">
                <thead><tr><th>クラス</th><th>受験人数</th><th>平均正解数</th><th>平均タイム</th></tr></thead>
                <tbody>${classTableRows}</tbody>
            </table>
        </div>` : ''}`;
}

function renderAllClassRanking(rankingData) {
    const container = document.getElementById('allClassRankingContent');
    const classes = Object.keys(rankingData);
    if (classes.length === 0) {
        container.innerHTML = '<p style="color:#999;padding:20px;">クラスが登録されていません。まずクラス管理タブでクラスを追加してください。</p>';
        return;
    }
    container.innerHTML = classes.map(cls => {
        const ranking = rankingData[cls];
        const rows = ranking.length === 0
            ? '<tr><td colspan="4" style="text-align:center;color:#999;padding:15px;">受験データなし</td></tr>'
            : ranking.map(r => `<tr>
                <td>${r.rank}</td>
                <td>${getDisplayName(r.email)}</td>
                <td>${r.correctCount}/${r.totalQuestions}</td>
                <td>${r.timeString}</td>
            </tr>`).join('');
        return `
            <div class="class-ranking-card">
                <h3 class="class-ranking-title">${cls}　<span style="font-size:0.8em;font-weight:normal;">${ranking.length}名登録</span></h3>
                <table class="admin-table">
                    <thead><tr><th>順位</th><th>生徒</th><th>正解数</th><th>タイム</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }).join('');
}

// =====================
// 共通ユーティリティ
// =====================

async function adminGet(action, params = {}) {
    const query = new URLSearchParams({ action, ...params }).toString();
    const url = `${CONFIG.GAS_WEB_APP_URL}?${query}`;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 800));
        try {
            const res = await fetch(url, { redirect: 'follow' });
            const result = await res.json();
            if (result.status !== 'success') throw new Error(result.message);
            return result;
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
}

async function adminPost(data) {
    const res = await fetch(CONFIG.GAS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
    });
    return await res.json();
}

function showAdminMsg(el, message, type) {
    el.textContent = message;
    el.className = `admin-msg ${type}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}
