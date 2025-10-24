// 三角比の問題データ (0°, 30°, 45°, 60°, 90°, 120°, 135°, 150°, 180° の sin, cos, tan)
const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];
const functions = ['sin', 'cos', 'tan'];

// 全27問の問題を生成
const trigProblems = [];
angles.forEach(angle => {
    functions.forEach(func => {
        let answer, displayAnswer;

        if (func === 'sin') {
            switch(angle) {
                case 0: answer = 0; displayAnswer = '0'; break;
                case 30: answer = 0.5; displayAnswer = '1/2'; break;
                case 45: answer = Math.sqrt(2)/2; displayAnswer = '√2/2'; break;
                case 60: answer = Math.sqrt(3)/2; displayAnswer = '√3/2'; break;
                case 90: answer = 1; displayAnswer = '1'; break;
                case 120: answer = Math.sqrt(3)/2; displayAnswer = '√3/2'; break;
                case 135: answer = Math.sqrt(2)/2; displayAnswer = '√2/2'; break;
                case 150: answer = 0.5; displayAnswer = '1/2'; break;
                case 180: answer = 0; displayAnswer = '0'; break;
            }
        } else if (func === 'cos') {
            switch(angle) {
                case 0: answer = 1; displayAnswer = '1'; break;
                case 30: answer = Math.sqrt(3)/2; displayAnswer = '√3/2'; break;
                case 45: answer = Math.sqrt(2)/2; displayAnswer = '√2/2'; break;
                case 60: answer = 0.5; displayAnswer = '1/2'; break;
                case 90: answer = 0; displayAnswer = '0'; break;
                case 120: answer = -0.5; displayAnswer = '-1/2'; break;
                case 135: answer = -Math.sqrt(2)/2; displayAnswer = '-√2/2'; break;
                case 150: answer = -Math.sqrt(3)/2; displayAnswer = '-√3/2'; break;
                case 180: answer = -1; displayAnswer = '-1'; break;
            }
        } else if (func === 'tan') {
            switch(angle) {
                case 0: answer = 0; displayAnswer = '0'; break;
                case 30: answer = 1/Math.sqrt(3); displayAnswer = '√3/3'; break;
                case 45: answer = 1; displayAnswer = '1'; break;
                case 60: answer = Math.sqrt(3); displayAnswer = '√3'; break;
                case 90: answer = null; displayAnswer = 'なし'; break;
                case 120: answer = -Math.sqrt(3); displayAnswer = '-√3'; break;
                case 135: answer = -1; displayAnswer = '-1'; break;
                case 150: answer = -1/Math.sqrt(3); displayAnswer = '-√3/3'; break;
                case 180: answer = 0; displayAnswer = '0'; break;
            }
        }

        trigProblems.push({ angle, func, answer, displayAnswer });
    });
});

// 選択肢のリスト (表示用とLaTeX表記)
const choices = [
    { display: '-√3', latex: '-\\sqrt{3}' },
    { display: '-1', latex: '-1' },
    { display: '-√3/2', latex: '-\\frac{\\sqrt{3}}{2}' },
    { display: '-√2/2', latex: '-\\frac{\\sqrt{2}}{2}' },
    { display: '-1/2', latex: '-\\frac{1}{2}' },
    { display: '-√3/3', latex: '-\\frac{\\sqrt{3}}{3}' },
    { display: '0', latex: '0' },
    { display: '√3/3', latex: '\\frac{\\sqrt{3}}{3}' },
    { display: '1/2', latex: '\\frac{1}{2}' },
    { display: '√2/2', latex: '\\frac{\\sqrt{2}}{2}' },
    { display: '√3/2', latex: '\\frac{\\sqrt{3}}{2}' },
    { display: '1', latex: '1' },
    { display: '√3', latex: '\\sqrt{3}' },
    { display: 'なし', latex: '\\text{なし}' }
];

// グローバル変数
let currentQuestionIndex = 0;
let selectedProblems = [];
let userAnswers = [];
let totalQuestions = 27; // 本番用
let selectedChoice = null;
let startTime = null;
let endTime = null;
let userEmail = null;
let googleUser = null;

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const questionText = document.getElementById('questionText');
const questionNumber = document.getElementById('questionNumber');
const progressFill = document.getElementById('progressFill');
const scoreText = document.getElementById('scoreText');
const scorePercentage = document.getElementById('scorePercentage');
const resultDetails = document.getElementById('resultDetails');
const userEmailDisplay = document.getElementById('userEmail');
const loginStatus = document.getElementById('loginStatus');
const modeInfo = document.getElementById('modeInfo');

// Google Sign-In初期化
window.onload = function() {
    // Google Identity Services の初期化
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });

    // サインインボタンをレンダリング
    google.accounts.id.renderButton(
        document.getElementById('googleSignInBtn'),
        {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'ja'
        }
    );

    // モード情報を更新
    updateModeDisplay();
};

// モード表示を更新
function updateModeDisplay() {
    if (modeInfo) {
        if (CONFIG.TEST_MODE) {
            modeInfo.textContent = '全27問（テストモード - 結果を記録）';
        } else {
            modeInfo.textContent = '10問ランダム（練習モード - 結果は記録されません）';
        }
    }
}

// Google ログインのコールバック
function handleCredentialResponse(response) {
    // JWTトークンをデコード
    const credential = parseJwt(response.credential);
    userEmail = credential.email;

    loginStatus.textContent = `ログイン成功: ${userEmail}`;
    loginStatus.style.color = '#28a745';

    // スタート画面に移動
    setTimeout(() => {
        loginScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
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
startBtn.addEventListener('click', startQuiz);
retryBtn.addEventListener('click', resetQuiz);

// テスト開始
function startQuiz() {
    // モードに応じて問題数を設定
    let questionCount;
    if (CONFIG.TEST_MODE) {
        questionCount = 27; // テストモード: 全27問
    } else {
        questionCount = 10; // 練習モード: 10問ランダム
    }

    const allProblems = shuffleArray([...trigProblems]);
    selectedProblems = allProblems.slice(0, questionCount);
    totalQuestions = questionCount; // 実際の問題数を設定
    currentQuestionIndex = 0;
    userAnswers = [];
    startTime = new Date(); // 開始時刻を記録

    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    showQuestion();
}

// 配列をシャッフル
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 問題を表示
function showQuestion() {
    const problem = selectedProblems[currentQuestionIndex];
    questionText.textContent = `${problem.func}(${problem.angle}°) の値を求めなさい`;
    questionNumber.textContent = `問題 ${currentQuestionIndex + 1}/${totalQuestions}`;
    selectedChoice = null;

    // 選択肢ボタンをリセットしてKaTeXで数式をレンダリング
    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach((btn, index) => {
        btn.classList.remove('selected', 'correct', 'incorrect');
        btn.disabled = false;

        const choice = choices[index];
        btn.dataset.value = choice.display;

        // KaTeXでレンダリング
        btn.innerHTML = '';
        katex.render(choice.latex, btn, {
            throwOnError: false,
            displayMode: false
        });

        btn.onclick = () => selectChoice(choice.display);
    });

    // プログレスバー更新
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
}

// 選択肢を選択
function selectChoice(value) {
    selectedChoice = value;

    // 回答を記録
    const problem = selectedProblems[currentQuestionIndex];
    const isCorrect = checkAnswer(selectedChoice, problem.answer, problem.displayAnswer);

    userAnswers.push({
        problem: problem,
        userAnswer: selectedChoice,
        isCorrect: isCorrect
    });

    // すぐに次の問題へ
    currentQuestionIndex++;

    if (currentQuestionIndex < totalQuestions) {
        showQuestion();
    } else {
        showResult();
    }
}

// 答えを正規化(文字列から数値に変換)
function normalizeAnswer(input) {
    // 「なし」の場合はnullを返す
    if (input === 'なし') {
        return null;
    }

    // √の処理
    let normalized = input.replace(/√2/g, Math.sqrt(2).toString());
    normalized = normalized.replace(/√3/g, Math.sqrt(3).toString());

    // 分数の処理 (例: 1/2 → 0.5)
    if (normalized.includes('/')) {
        const parts = normalized.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            return numerator / denominator;
        }
    }

    // 通常の数値として評価
    return parseFloat(normalized);
}


// 答えをチェック
function checkAnswer(userInput, correctValue, correctDisplay) {
    // 選択肢の表示文字列と正解の表示文字列が一致するかチェック
    if (userInput === correctDisplay) {
        return true;
    }

    // 数値として比較(nullの場合も考慮)
    if (correctValue === null && userInput === 'なし') {
        return true;
    }

    const userNormalized = normalizeAnswer(userInput);
    const epsilon = 0.01;

    if (correctValue === null || userNormalized === null) {
        return correctValue === userNormalized;
    }

    return Math.abs(userNormalized - correctValue) < epsilon;
}


// 結果を表示
function showResult() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    // 終了時刻を記録して経過時間を計算
    endTime = new Date();
    const elapsedTime = Math.floor((endTime - startTime) / 1000); // 秒単位
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeString = `${minutes}分${seconds}秒`;

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    scoreText.textContent = `${correctCount}/${totalQuestions}`;

    // モードに応じて表示を変更
    if (CONFIG.TEST_MODE) {
        scorePercentage.textContent = `${percentage}% (${timeString})`;
    } else {
        scorePercentage.textContent = `${percentage}% (${timeString}) - 練習モード`;
    }

    // 結果をGoogle Spreadsheetに送信（テストモードのみ）
    sendResultToSpreadsheet(correctCount, totalQuestions, elapsedTime, timeString);

    // 詳細結果を表示
    resultDetails.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

        const questionDiv = document.createElement('div');
        questionDiv.className = 'result-item-question';
        questionDiv.textContent = `問${index + 1}: ${answer.problem.func}(${answer.problem.angle}°)`;

        const answerDiv = document.createElement('div');
        answerDiv.className = 'result-item-answer';

        // 正解のLaTeX表記を取得
        const correctChoice = choices.find(c => c.display === answer.problem.displayAnswer);
        const userChoice = choices.find(c => c.display === answer.userAnswer);

        // 正解部分をレンダリング
        const correctSpan = document.createElement('span');
        correctSpan.textContent = '正解: ';
        const correctMath = document.createElement('span');
        correctMath.className = 'math-inline';
        if (correctChoice) {
            katex.render(correctChoice.latex, correctMath, { throwOnError: false });
        } else {
            correctMath.textContent = answer.problem.displayAnswer;
        }

        // ユーザーの答え部分をレンダリング
        const userSpan = document.createElement('span');
        userSpan.textContent = ' | あなたの答え: ';
        const userMath = document.createElement('span');
        userMath.className = answer.isCorrect ? 'math-inline' : 'math-inline user-wrong';
        if (userChoice) {
            katex.render(userChoice.latex, userMath, { throwOnError: false });
        } else {
            userMath.textContent = answer.userAnswer;
        }

        // 結果マークを追加
        const markSpan = document.createElement('span');
        markSpan.textContent = answer.isCorrect ? ' ✓' : ' ✗';

        answerDiv.appendChild(correctSpan);
        answerDiv.appendChild(correctMath);
        answerDiv.appendChild(userSpan);
        answerDiv.appendChild(userMath);
        answerDiv.appendChild(markSpan);

        resultItem.appendChild(questionDiv);
        resultItem.appendChild(answerDiv);
        resultDetails.appendChild(resultItem);
    });
}

// 結果をGoogle Spreadsheetに送信
async function sendResultToSpreadsheet(correctCount, totalQuestions, elapsedSeconds, timeString) {
    // テストモードが無効の場合は送信しない
    if (!CONFIG.TEST_MODE) {
        console.log('練習モードのため、結果を送信しませんでした');
        return;
    }

    if (!userEmail) {
        console.error('ユーザーがログインしていません');
        return;
    }

    const data = {
        email: userEmail,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        elapsedSeconds: elapsedSeconds,
        timeString: timeString
    };

    try {
        const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Google Apps Scriptの制約により必要
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('結果を送信しました（テストモード）');
    } catch (error) {
        console.error('結果の送信に失敗しました:', error);
    }
}

// リセット
function resetQuiz() {
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedProblems = [];
}
