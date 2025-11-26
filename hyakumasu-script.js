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

// Google ログインのコールバック
function handleCredentialResponse(response) {
    const credential = parseJwt(response.credential);
    userEmail = credential.email;

    loginStatus.textContent = `ログイン成功: ${userEmail}`;
    loginStatus.style.color = '#28a745';

    setTimeout(() => {
        loginScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');
        userEmailDisplay.textContent = `ログイン中: ${userEmail}`;
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
    // 数字をランダムに生成（0-9）
    topNumbers = generateRandomNumbers(10);
    leftNumbers = generateRandomNumbers(10);

    // 正解を計算
    answers = {};
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
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

// ランダムな数字の配列を生成
function generateRandomNumbers(count) {
    const numbers = [];
    for (let i = 0; i < count; i++) {
        numbers.push(Math.floor(Math.random() * 10));
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

    for (let row = 0; row < 10; row++) {
        // 左側の数字
        const leftNumberDiv = document.createElement('div');
        leftNumberDiv.className = 'left-number';
        leftNumberDiv.textContent = leftNumbers[row];
        gridContent.appendChild(leftNumberDiv);

        // 入力セル
        for (let col = 0; col < 10; col++) {
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

    if (nextCol >= 10) {
        nextCol = 0;
        nextRow = row + 1;
    }

    if (nextRow < 10) {
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
    progressText.textContent = `入力済み: ${filledCount}/100`;

    // すべて入力されたら提出ボタンを有効化
    submitBtn.disabled = filledCount < 100;
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

    const percentage = Math.round((correctCount / 100) * 100);

    scoreText.textContent = `${correctCount}/100`;
    scorePercentage.textContent = `${percentage}%`;
    timeDisplay.textContent = timeString;

    // Spreadsheetに結果を送信
    sendResultToSpreadsheet(correctCount, 100, elapsedSeconds, timeString, calculationMode);

    // 詳細結果を表示
    showDetailedResults();
}

// 詳細結果を表示
function showDetailedResults() {
    resultDetails.innerHTML = '';

    let incorrectCount = 0;
    const maxDisplay = 20; // 最大20件まで表示

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const key = `${row}-${col}`;
            const correctAnswer = answers[key];
            const userAnswer = userInputs[key];

            if (userAnswer !== correctAnswer && incorrectCount < maxDisplay) {
                incorrectCount++;

                const resultItem = document.createElement('div');
                resultItem.className = 'result-item incorrect';

                const questionDiv = document.createElement('div');
                questionDiv.className = 'result-item-question';

                if (calculationMode === 'addition') {
                    questionDiv.textContent = `問: ${leftNumbers[row]} + ${topNumbers[col]}`;
                } else if (calculationMode === 'subtraction') {
                    questionDiv.textContent = `問: ${leftNumbers[row]} - ${topNumbers[col]}`;
                }

                const answerDiv = document.createElement('div');
                answerDiv.className = 'result-item-answer';
                answerDiv.innerHTML = `正解: ${correctAnswer} | あなたの答え: <span class="user-wrong">${userAnswer !== undefined ? userAnswer : '未入力'}</span>`;

                resultItem.appendChild(questionDiv);
                resultItem.appendChild(answerDiv);
                resultDetails.appendChild(resultItem);
            }
        }
    }

    if (incorrectCount === 0) {
        const perfectDiv = document.createElement('div');
        perfectDiv.className = 'result-item correct';
        perfectDiv.innerHTML = '<div class="result-item-question">🎉 すべて正解です！</div>';
        resultDetails.appendChild(perfectDiv);
    } else if (incorrectCount === maxDisplay) {
        const moreDiv = document.createElement('div');
        moreDiv.className = 'result-item';
        moreDiv.innerHTML = `<div class="result-item-question">※ 間違いが多いため、最初の${maxDisplay}件のみ表示しています</div>`;
        resultDetails.appendChild(moreDiv);
    }
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
