// 三角比の問題データ (0°, 30°, 45°, 60°, 90°, 120°, 135°, 150°, 180° の sin, cos, tan)
const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];
const functions = ['sin', 'cos', 'tan'];

// 値を求める問題（全27問）
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

// 角度を求める問題を生成
const angleProblems = [];
// 各値について、その値を持つ角度を求める問題を作成
const valueMap = {
    'sin': {},
    'cos': {},
    'tan': {}
};

// まず値と角度のマッピングを作成
trigProblems.forEach(p => {
    const key = p.displayAnswer;
    if (!valueMap[p.func][key]) {
        valueMap[p.func][key] = [];
    }
    valueMap[p.func][key].push(p.angle);
});

// 問題を生成（「なし」を除外）
functions.forEach(func => {
    Object.keys(valueMap[func]).forEach(value => {
        // 「なし」の問題は除外（tan 90°）
        if (value === 'なし') {
            return;
        }

        const correctAngles = valueMap[func][value];
        angleProblems.push({
            func: func,
            value: value,
            correctAngles: correctAngles
        });
    });
});

// すべての選択肢のリスト (表示用とLaTeX表記)
const allChoices = [
    { display: '-√3', latex: '-\\sqrt{3}' },
    { display: '-1', latex: '-1' },
    { display: '-√3/2', latex: '-\\frac{\\sqrt{3}}{2}' },
    { display: '-√2/2', latex: '-\\frac{\\sqrt{2}}{2} = -\\frac{1}{\\sqrt{2}}' },
    { display: '-1/2', latex: '-\\frac{1}{2}' },
    { display: '-√3/3', latex: '-\\frac{\\sqrt{3}}{3} = -\\frac{1}{\\sqrt{3}}' },
    { display: '0', latex: '0' },
    { display: '√3/3', latex: '\\frac{\\sqrt{3}}{3} = \\frac{1}{\\sqrt{3}}' },
    { display: '1/2', latex: '\\frac{1}{2}' },
    { display: '√2/2', latex: '\\frac{\\sqrt{2}}{2} = \\frac{1}{\\sqrt{2}}' },
    { display: '√3/2', latex: '\\frac{\\sqrt{3}}{2}' },
    { display: '1', latex: '1' },
    { display: '√3', latex: '\\sqrt{3}' },
    { display: 'なし', latex: '\\text{なし}' }
];

// 各問題で表示する選択肢を決定する関数
function getChoicesForProblem(func, angle) {
    // 値を求めるモードではすべての値の選択肢（14個）を表示
    return allChoices;
}

// 後方互換性のため、結果画面などで使用するchoices変数を保持
const choices = allChoices;

// グローバル変数
let currentQuestionIndex = 0;
let selectedProblems = [];
let userAnswers = [];
let totalQuestions = 27; // 本番用
let selectedChoice = null;
let selectedAngles = []; // 角度問題で選択された角度
let testType = 'value'; // 'value' or 'angle'
let startTime = null;
let endTime = null;
let userEmail = null;
let googleUser = null;

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const menuScreen = document.getElementById('menuScreen');
const valueInstructionScreen = document.getElementById('valueInstructionScreen');
const angleInstructionScreen = document.getElementById('angleInstructionScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const selectValueTestBtn = document.getElementById('selectValueTestBtn');
const selectAngleTestBtn = document.getElementById('selectAngleTestBtn');
const startValueTestBtn = document.getElementById('startValueTestBtn');
const startAngleTestBtn = document.getElementById('startAngleTestBtn');
const backFromValueBtn = document.getElementById('backFromValueBtn');
const backFromAngleBtn = document.getElementById('backFromAngleBtn');
const retryBtn = document.getElementById('retryBtn');
const questionText = document.getElementById('questionText');
const questionNumber = document.getElementById('questionNumber');
const progressFill = document.getElementById('progressFill');
const scoreText = document.getElementById('scoreText');
const scorePercentage = document.getElementById('scorePercentage');
const resultDetails = document.getElementById('resultDetails');
const userEmailDisplay = document.getElementById('userEmail');
const loginStatus = document.getElementById('loginStatus');
const valueChoices = document.getElementById('valueChoices');
const angleChoices = document.getElementById('angleChoices');
const submitAngleBtn = document.getElementById('submitAngleBtn');

// カンニング防止：テストリセット処理（共通関数）
function resetTestForCheating(reason) {
    // テスト中（クイズ画面が表示されている）かチェック
    if (!quizScreen.classList.contains('hidden')) {
        console.log(`カンニング防止: ${reason}`);

        // テストをリセット
        currentQuestionIndex = 0;
        userAnswers = [];
        selectedProblems = [];
        selectedAngles = [];
        selectedChoice = null;
        startTime = null;
        testStartWidth = null;
        testStartHeight = null;

        // クイズ画面を非表示にしてメニュー画面に戻る
        quizScreen.classList.add('hidden');
        menuScreen.classList.remove('hidden');

        // 警告メッセージを表示
        alert(`${reason}のため、テストがリセットされました。`);
    }
}

// カンニング防止：アプリ切り替え検出
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        resetTestForCheating('アプリを切り替えた');
    }
});

// カンニング防止：ウィンドウフォーカス監視
window.addEventListener('blur', () => {
    resetTestForCheating('ウィンドウのフォーカスが外れた');
});

// カンニング防止：画面サイズ変更検出（Split View対策）
let testStartWidth = null;
let testStartHeight = null;
let resizeTimeout = null;

// テスト開始時にサイズを記録する関数
function recordInitialScreenSize() {
    testStartWidth = window.innerWidth;
    testStartHeight = window.innerHeight;
    console.log(`テスト開始時の画面サイズ: ${testStartWidth} x ${testStartHeight}`);
}

window.addEventListener('resize', () => {
    // テスト中のみチェック
    if (!quizScreen.classList.contains('hidden') && testStartWidth !== null) {
        // デバウンス: 連続した発火を防ぐため300ms待つ
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const widthChanged = Math.abs(window.innerWidth - testStartWidth) > 50;
            const heightChanged = Math.abs(window.innerHeight - testStartHeight) > 50;

            console.log(`画面サイズ変更検出: ${window.innerWidth} x ${window.innerHeight} (開始時: ${testStartWidth} x ${testStartHeight})`);

            if (widthChanged || heightChanged) {
                resetTestForCheating('画面サイズが変更された（Split Viewなど）');
                // リセット後はサイズ記録をクリア
                testStartWidth = null;
                testStartHeight = null;
            }
        }, 300);
    }
});

// Google Sign-In初期化
window.onload = function() {
    // メニュー画面の説明をKaTeXでレンダリング
    renderMenuDescriptions();

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
};

// メニュー画面の説明をKaTeXでレンダリング
function renderMenuDescriptions() {
    const valueTestDesc = document.getElementById('valueTestDesc');
    const angleTestDesc = document.getElementById('angleTestDesc');

    if (valueTestDesc) {
        valueTestDesc.innerHTML = '';

        // "sin 30° → " 部分
        const sin30 = document.createElement('span');
        katex.render('\\sin 30^\\circ \\to ', sin30, { throwOnError: false });
        valueTestDesc.appendChild(sin30);

        // "1/2" 部分
        const frac = document.createElement('span');
        katex.render('\\frac{1}{2}', frac, { throwOnError: false });
        valueTestDesc.appendChild(frac);
    }

    if (angleTestDesc) {
        angleTestDesc.innerHTML = '';

        // "sin θ = " 部分
        const sinTheta = document.createElement('span');
        katex.render('\\sin \\theta = ', sinTheta, { throwOnError: false });
        angleTestDesc.appendChild(sinTheta);

        // "1/2" 部分
        const frac = document.createElement('span');
        katex.render('\\frac{1}{2}', frac, { throwOnError: false });
        angleTestDesc.appendChild(frac);

        // " → 30°, 150°" 部分
        const angles = document.createElement('span');
        katex.render(' \\to 30^\\circ, 150^\\circ', angles, { throwOnError: false });
        angleTestDesc.appendChild(angles);
    }
}

// 説明画面の選択肢例をKaTeXでレンダリング
let instructionExamplesRendered = false;
function renderInstructionExamples() {
    // 既にレンダリング済みの場合はスキップ
    if (instructionExamplesRendered) return;

    // 値を求めるモードの例（実際の選択肢と同じ）
    const valueExampleChoices = document.getElementById('valueExampleChoices');
    if (valueExampleChoices && valueExampleChoices.children.length === 0) {
        allChoices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.disabled = true;
            btn.style.cursor = 'default';
            btn.style.opacity = '0.8';

            // 幅を明示的に設定
            btn.style.width = '190px';
            btn.style.minWidth = '190px';
            btn.style.maxWidth = '190px';

            // KaTeXでレンダリング
            katex.render(choice.latex, btn, {
                throwOnError: false,
                displayMode: false
            });

            valueExampleChoices.appendChild(btn);
        });
    }

    // 角度を求めるモードの例
    const angleExamples = [
        { latex: '0^\\circ' },
        { latex: '30^\\circ' },
        { latex: '45^\\circ' },
        { latex: '60^\\circ' },
        { latex: '90^\\circ' },
        { latex: '120^\\circ' },
        { latex: '135^\\circ' },
        { latex: '150^\\circ' },
        { latex: '180^\\circ' }
    ];

    const angleExampleChoices = document.getElementById('angleExampleChoices');
    if (angleExampleChoices && angleExampleChoices.children.length === 0) {
        angleExamples.forEach(example => {
            const span = document.createElement('span');
            span.className = 'example-chip';
            katex.render(example.latex, span, {
                throwOnError: false,
                displayMode: false
            });
            angleExampleChoices.appendChild(span);
        });

        // 送信ボタンも追加
        const submitBtn = document.createElement('button');
        submitBtn.className = 'example-chip example-submit';
        submitBtn.textContent = '送信';
        submitBtn.disabled = true;
        angleExampleChoices.appendChild(submitBtn);
    }

    instructionExamplesRendered = true;
}

// Google ログインのコールバック
function handleCredentialResponse(response) {
    // JWTトークンをデコード
    const credential = parseJwt(response.credential);
    userEmail = credential.email;

    loginStatus.textContent = `ログイン成功: ${userEmail}`;
    loginStatus.style.color = '#28a745';

    // メニュー画面に移動
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
// メニュー画面から説明画面へ
selectValueTestBtn.addEventListener('click', () => showInstructionScreen('value'));
selectAngleTestBtn.addEventListener('click', () => showInstructionScreen('angle'));

// 説明画面からテスト開始
startValueTestBtn.addEventListener('click', () => startQuiz('value'));
startAngleTestBtn.addEventListener('click', () => startQuiz('angle'));

// 説明画面からメニューに戻る
backFromValueBtn.addEventListener('click', backToMenu);
backFromAngleBtn.addEventListener('click', backToMenu);

// その他のボタン
retryBtn.addEventListener('click', resetQuiz);

// 角度選択ボタンのイベントリスナー
document.querySelectorAll('.angle-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleAngleSelection(btn));
});

submitAngleBtn.addEventListener('click', submitAngleAnswer);

// 手動再送信ボタン
document.addEventListener('DOMContentLoaded', () => {
    const manualRetryBtn = document.getElementById('manualRetryBtn');
    if (manualRetryBtn) {
        manualRetryBtn.addEventListener('click', manualRetrySend);
    }
});

// 手動で再送信する関数
async function manualRetrySend() {
    if (!lastSendData) {
        console.error('送信データがありません');
        return;
    }

    console.log('手動再送信を開始します');

    // リトライカウントをリセット
    retryCount = 0;

    // 再送信を実行
    await sendDataWithRetry(lastSendData);
}

// データ送信のコア処理（リトライロジックを分離）
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

            // まずCORSありで試行
            try {
                const response = await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                // レスポンスを確認
                const result = await response.json();

                if (result.status === 'success') {
                    console.log('結果を送信しました（CORS対応）');
                    updateSendStatus('success');
                    return true;
                } else {
                    throw new Error(result.message || '送信失敗');
                }
            } catch (corsError) {
                // CORSエラーの場合、no-corsモードで再試行
                console.log('CORS対応送信失敗、no-corsモードで再試行:', corsError);

                await fetch(CONFIG.GAS_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                // no-corsモードではレスポンスが読めないため、送信成功と見なす
                console.log('結果を送信しました（no-corsモード）');
                updateSendStatus('success');
                return true;
            }
        } catch (error) {
            console.error(`送信試行 ${retryCount + 1} 失敗:`, error);
            retryCount++;

            if (retryCount < MAX_RETRY) {
                // リトライ
                console.log(`${RETRY_INTERVAL/1000}秒後に再試行します...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
                return attemptSend();
            } else {
                // 最大リトライ回数に達した
                console.error('最大リトライ回数に達しました');
                updateSendStatus('failed', '再試行回数超過');
                return false;
            }
        }
    }

    await attemptSend();
}

// 説明画面を表示
function showInstructionScreen(type) {
    // 説明画面の選択肢例をKaTeXでレンダリング（初回のみ）
    renderInstructionExamples();

    menuScreen.classList.add('hidden');
    if (type === 'value') {
        valueInstructionScreen.classList.remove('hidden');
    } else {
        angleInstructionScreen.classList.remove('hidden');
    }
}

// メニュー画面に戻る
function backToMenu() {
    valueInstructionScreen.classList.add('hidden');
    angleInstructionScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

// テスト開始
function startQuiz(type) {
    testType = type;

    // テストタイプに応じて全問題を選択
    let allProblems;
    if (testType === 'value') {
        // 値を求める: 全27問
        allProblems = shuffleArray([...trigProblems]);
    } else {
        // 角度を求める: 全26問（「なし」を除外済み）
        allProblems = shuffleArray([...angleProblems]);
    }

    selectedProblems = allProblems; // 全問題を出題
    totalQuestions = allProblems.length; // 実際の問題数を設定
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedAngles = [];
    startTime = new Date(); // 開始時刻を記録

    // カンニング防止: テスト開始時の画面サイズを記録
    recordInitialScreenSize();

    // 説明画面を非表示にしてクイズ画面を表示
    valueInstructionScreen.classList.add('hidden');
    angleInstructionScreen.classList.add('hidden');
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
    questionNumber.textContent = `問題 ${currentQuestionIndex + 1}/${totalQuestions}`;

    // まず両方を非表示にする
    valueChoices.classList.add('hidden');
    angleChoices.classList.add('hidden');

    if (testType === 'value') {
        // 値を求める問題
        valueChoices.classList.remove('hidden');

        // 問題文をKaTeXでレンダリング
        questionText.innerHTML = '';
        const mathSpan = document.createElement('span');
        katex.render(`\\${problem.func} ${problem.angle}^\\circ`, mathSpan, {
            throwOnError: false,
            displayMode: false
        });
        questionText.appendChild(mathSpan);
        questionText.appendChild(document.createTextNode(' の値を求めなさい'));

        selectedChoice = null;

        // この問題で必要な選択肢のみを取得
        const validChoices = getChoicesForProblem(problem.func, problem.angle);

        // 選択肢ボタンを動的に生成
        valueChoices.innerHTML = '';
        validChoices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.dataset.value = choice.display;

            // 幅を明示的に設定
            btn.style.width = '190px';
            btn.style.minWidth = '190px';
            btn.style.maxWidth = '190px';

            // KaTeXでレンダリング
            katex.render(choice.latex, btn, {
                throwOnError: false,
                displayMode: false
            });

            btn.onclick = () => selectChoice(choice.display);
            valueChoices.appendChild(btn);
        });
    } else {
        // 角度を求める問題
        angleChoices.classList.remove('hidden');

        // 問題文をKaTeXでレンダリング
        questionText.innerHTML = '';
        const mathSpan1 = document.createElement('span');
        katex.render(`\\${problem.func} \\theta = `, mathSpan1, {
            throwOnError: false,
            displayMode: false
        });
        questionText.appendChild(mathSpan1);

        // 値を表示
        const choice = choices.find(c => c.display === problem.value);
        const mathSpan2 = document.createElement('span');
        katex.render(choice ? choice.latex : problem.value, mathSpan2, {
            throwOnError: false,
            displayMode: false
        });
        questionText.appendChild(mathSpan2);
        questionText.appendChild(document.createTextNode(' となる角度θを求めなさい'));

        // 角度選択をリセット
        selectedAngles = [];
        const angleBtns = document.querySelectorAll('.angle-btn');
        angleBtns.forEach(btn => {
            btn.classList.remove('selected');
        });
        submitAngleBtn.disabled = true;
    }

    // プログレスバー更新
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
}

// 選択肢を選択（値を求める問題）
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

    // iPadなどのタッチデバイスでボタンの状態が残らないようにする
    // 強制的にすべての状態をリセット
    const allChoiceBtns = document.querySelectorAll('.choice-btn');
    allChoiceBtns.forEach(btn => {
        btn.blur(); // フォーカスを外す
        btn.classList.remove('selected'); // 選択状態をクリア
        // スタイルを強制的にリセット
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.transform = '';
    });

    // アクティブな要素からフォーカスを外す
    if (document.activeElement) {
        document.activeElement.blur();
    }

    // bodyにフォーカスを移す
    document.body.focus();

    // すぐに次の問題へ
    currentQuestionIndex++;

    if (currentQuestionIndex < totalQuestions) {
        showQuestion();
    } else {
        showResult();
    }
}

// 角度選択をトグル
function toggleAngleSelection(btn) {
    const angle = parseInt(btn.dataset.angle);

    if (selectedAngles.includes(angle)) {
        // 選択解除
        selectedAngles = selectedAngles.filter(a => a !== angle);
        btn.classList.remove('selected');
    } else {
        // 選択（最大2つまで）
        if (selectedAngles.length < 2) {
            selectedAngles.push(angle);
            btn.classList.add('selected');
        }
    }

    // 送信ボタンの有効/無効を切り替え
    submitAngleBtn.disabled = selectedAngles.length === 0;
}

// 角度の回答を送信
function submitAngleAnswer() {
    const problem = selectedProblems[currentQuestionIndex];

    // 回答が正しいかチェック（順序は問わず、要素が一致すればOK）
    const sortedUserAnswer = [...selectedAngles].sort((a, b) => a - b);
    const sortedCorrectAnswer = [...problem.correctAngles].sort((a, b) => a - b);
    const isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);

    userAnswers.push({
        problem: problem,
        userAnswer: selectedAngles.slice(), // コピーを保存
        isCorrect: isCorrect
    });

    // iPadなどのタッチデバイスでボタンの状態が残らないようにする
    // 強制的にすべての状態をリセット
    const allAngleBtns = document.querySelectorAll('.angle-btn');
    allAngleBtns.forEach(btn => {
        btn.blur(); // フォーカスを外す
        btn.classList.remove('selected'); // 選択状態をクリア
        // スタイルを強制的にリセット
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.transform = '';
    });

    // 送信ボタンのフォーカスも外してスタイルをリセット
    submitAngleBtn.blur();
    submitAngleBtn.style.backgroundColor = '';
    submitAngleBtn.style.borderColor = '';
    submitAngleBtn.style.transform = '';

    // アクティブな要素からフォーカスを外す
    if (document.activeElement) {
        document.activeElement.blur();
    }

    // bodyにフォーカスを移す
    document.body.focus();

    // 次の問題へ
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
    scorePercentage.textContent = `${percentage}% (${timeString})`;

    // 結果をGoogle Spreadsheetに送信
    sendResultToSpreadsheet(correctCount, totalQuestions, elapsedTime, timeString, testType);

    // 詳細結果を表示
    resultDetails.innerHTML = '';
    userAnswers.forEach((answer, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${answer.isCorrect ? 'correct' : 'incorrect'}`;

        const questionDiv = document.createElement('div');
        questionDiv.className = 'result-item-question';
        questionDiv.textContent = `問${index + 1}: `;

        if (testType === 'value') {
            // 値を求める問題
            const mathSpan = document.createElement('span');
            katex.render(`\\${answer.problem.func} ${answer.problem.angle}^\\circ`, mathSpan, {
                throwOnError: false,
                displayMode: false
            });
            questionDiv.appendChild(mathSpan);

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
        } else {
            // 角度を求める問題
            const mathSpan1 = document.createElement('span');
            katex.render(`\\${answer.problem.func} \\theta = `, mathSpan1, {
                throwOnError: false,
                displayMode: false
            });
            questionDiv.appendChild(mathSpan1);

            const choice = choices.find(c => c.display === answer.problem.value);
            const mathSpan2 = document.createElement('span');
            katex.render(choice ? choice.latex : answer.problem.value, mathSpan2, {
                throwOnError: false,
                displayMode: false
            });
            questionDiv.appendChild(mathSpan2);

            const answerDiv = document.createElement('div');
            answerDiv.className = 'result-item-answer';

            // 正解を表示
            const correctAnglesStr = answer.problem.correctAngles.map(a => `${a}°`).join(', ');
            answerDiv.textContent = `正解: ${correctAnglesStr} | あなたの答え: `;

            // ユーザーの答えを表示
            const userAnglesStr = answer.userAnswer.map(a => `${a}°`).join(', ');
            const userAnswerSpan = document.createElement('span');
            userAnswerSpan.className = answer.isCorrect ? '' : 'user-wrong';
            userAnswerSpan.textContent = userAnglesStr;
            answerDiv.appendChild(userAnswerSpan);

            // 結果マークを追加
            const markSpan = document.createElement('span');
            markSpan.textContent = answer.isCorrect ? ' ✓' : ' ✗';
            answerDiv.appendChild(markSpan);

            resultItem.appendChild(questionDiv);
            resultItem.appendChild(answerDiv);
        }

        resultDetails.appendChild(resultItem);
    });
}

// 送信状態を管理する変数
let sendStatus = 'idle'; // 'idle', 'sending', 'success', 'retrying', 'failed'
let retryCount = 0;
const MAX_RETRY = 3;
const RETRY_INTERVAL = 3000; // 3秒ごとにリトライ
let lastSendData = null; // 最後に送信しようとしたデータを保持

// 送信状態を更新してUIに反映
function updateSendStatus(status, message = '') {
    sendStatus = status;
    const statusElement = document.getElementById('sendStatus');
    const statusIcon = document.getElementById('sendStatusIcon');
    const statusText = document.getElementById('sendStatusText');
    const retryBtn = document.getElementById('manualRetryBtn');

    if (!statusElement) return;

    // デバッグ用ログ
    console.log('updateSendStatus:', status, 'ボタン存在:', !!retryBtn);

    // ステータスに応じてアイコンとテキストを更新
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
            // ずっと表示したままにする
            break;
        case 'failed':
            statusElement.className = 'send-status failed';
            statusIcon.textContent = '✗';
            statusText.textContent = `送信に失敗しました${message ? ': ' + message : ''}`;
            statusElement.classList.remove('hidden');
            // 手動再送信ボタンを表示
            if (retryBtn) {
                retryBtn.classList.remove('hidden');
                retryBtn.style.display = 'block';
                console.log('手動再送信ボタンを表示しました');
            } else {
                console.error('手動再送信ボタンが見つかりません');
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

// 結果をGoogle Spreadsheetに送信（リトライ機能付き）
async function sendResultToSpreadsheet(correctCount, totalQuestions, elapsedSeconds, timeString, testType) {
    if (!userEmail) {
        console.error('ユーザーがログインしていません');
        updateSendStatus('failed', 'ログインしていません');
        return;
    }

    // テストタイプを日本語に変換
    const testTypeName = testType === 'value' ? '値を求める' : '角度を求める';

    const data = {
        email: userEmail,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        elapsedSeconds: elapsedSeconds,
        timeString: timeString,
        testType: testTypeName
    };

    // 送信データを保存（手動再送信用）
    lastSendData = data;

    // データ送信を実行
    await sendDataWithRetry(data);
}

// リセット
function resetQuiz() {
    resultScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    currentQuestionIndex = 0;
    userAnswers = [];
    selectedProblems = [];
    selectedAngles = [];

    // 送信状態をリセット
    sendStatus = 'idle';
    retryCount = 0;
    lastSendData = null;

    // 送信状態表示を非表示にする
    const statusElement = document.getElementById('sendStatus');
    const retryBtn = document.getElementById('manualRetryBtn');
    if (statusElement) statusElement.classList.add('hidden');
    if (retryBtn) {
        retryBtn.classList.add('hidden');
        retryBtn.style.display = 'none';
    }
}
