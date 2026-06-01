// ========================================
// 手動ソートチャレンジ機能
// ========================================

let challengeArray = [];
let challengeOriginalArray = [];
let selectedIndices = [];
let userSwapCount = 0;
let minSwapCount = 0;
let challengeActive = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeChallenge();
});

function initializeChallenge() {
    document.getElementById('start-challenge-btn').addEventListener('click', startChallenge);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('reset-challenge-btn').addEventListener('click', resetChallenge);
}

// ========================================
// チャレンジ開始
// ========================================
function startChallenge() {
    // ランダムな配列を生成（5-7要素）
    const length = Math.floor(Math.random() * 3) + 5;
    challengeArray = [];
    
    for (let i = 0; i < length; i++) {
        challengeArray.push(Math.floor(Math.random() * 20) + 1);
    }
    
    challengeOriginalArray = [...challengeArray];
    selectedIndices = [];
    userSwapCount = 0;
    challengeActive = true;
    
    // 最小交換回数を計算
    minSwapCount = calculateMinSwaps([...challengeArray]);
    
    // UIを更新
    renderChallengeArray();
    updateChallengeStats();
    hideFeedback();
    
    document.getElementById('start-challenge-btn').textContent = '新しいチャレンジ';
}

// ========================================
// 配列の描画
// ========================================
function renderChallengeArray() {
    const container = document.getElementById('challenge-array');
    container.innerHTML = '';
    
    const maxValue = Math.max(...challengeArray);
    
    challengeArray.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'challenge-bar';
        
        // 高さを計算
        const height = Math.max(40, (value / maxValue) * 120);
        bar.style.height = `${height}px`;
        bar.textContent = value;
        
        // 選択状態
        if (selectedIndices.includes(index)) {
            bar.classList.add('selected');
        }
        
        // ソート済みの位置にある場合
        if (isInCorrectPosition(index)) {
            bar.classList.add('correct-position');
        }
        
        // クリックイベント
        bar.addEventListener('click', () => handleBarClick(index));
        
        container.appendChild(bar);
    });
}

// ========================================
// バーのクリック処理
// ========================================
function handleBarClick(index) {
    if (!challengeActive) {
        showFeedback('hint', 'まず「チャレンジ開始」ボタンをクリックしてください。');
        return;
    }
    
    // ソート済みの要素は選択できない
    if (isInCorrectPosition(index)) {
        return;
    }
    
    if (selectedIndices.length === 0) {
        // 最初の要素を選択
        selectedIndices.push(index);
        renderChallengeArray();
    } else if (selectedIndices.length === 1) {
        const firstIndex = selectedIndices[0];
        
        if (firstIndex === index) {
            // 同じ要素をクリックした場合は選択解除
            selectedIndices = [];
            renderChallengeArray();
        } else if (Math.abs(firstIndex - index) === 1) {
            // 隣接する要素の場合は交換
            swapChallengeElements(firstIndex, index);
        } else {
            // 隣接していない場合はエラー
            showFeedback('hint', '⚠️ バブルソートでは隣接する要素のみ交換できます！');
            selectedIndices = [];
            renderChallengeArray();
        }
    }
}

// ========================================
// 要素の交換
// ========================================
function swapChallengeElements(index1, index2) {
    // 配列の要素を交換
    [challengeArray[index1], challengeArray[index2]] = [challengeArray[index2], challengeArray[index1]];
    
    userSwapCount++;
    selectedIndices = [];
    
    // UIを更新
    renderChallengeArray();
    updateChallengeStats();
    
    // ソート完了チェック
    if (isSorted(challengeArray)) {
        handleChallengeComplete();
    }
}

// ========================================
// 正しい位置にあるかチェック
// ========================================
function isInCorrectPosition(index) {
    const sortedArray = [...challengeOriginalArray].sort((a, b) => a - b);
    return challengeArray[index] === sortedArray[index];
}

// ========================================
// ソート完了チェック
// ========================================
function isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}

// ========================================
// チャレンジ完了処理
// ========================================
function handleChallengeComplete() {
    challengeActive = false;
    
    let message = '🎉 おめでとうございます！配列をソートできました！<br>';
    
    if (userSwapCount === minSwapCount) {
        message += '<strong>完璧です！</strong> 最小交換回数でクリアしました！🏆';
    } else if (userSwapCount <= minSwapCount + 2) {
        message += '<strong>素晴らしい！</strong> とても効率的にソートできました！👍';
    } else if (userSwapCount <= minSwapCount + 5) {
        message += '<strong>よくできました！</strong> もう少し効率化できるかもしれません。';
    } else {
        message += 'クリアしました！次はもっと効率的にソートしてみましょう。';
    }
    
    showFeedback('success', message);
}

// ========================================
// ヒント表示
// ========================================
function showHint() {
    if (!challengeActive) {
        showFeedback('hint', 'まず「チャレンジ開始」ボタンをクリックしてください。');
        return;
    }
    
    // 最初の交換すべきペアを見つける
    for (let i = 0; i < challengeArray.length - 1; i++) {
        if (challengeArray[i] > challengeArray[i + 1]) {
            showFeedback('hint', `💡 ヒント: ${challengeArray[i]} と ${challengeArray[i + 1]} を比較してみましょう。`);
            return;
        }
    }
    
    showFeedback('hint', '配列は既にソート済みです！');
}

// ========================================
// チャレンジリセット
// ========================================
function resetChallenge() {
    if (challengeOriginalArray.length === 0) {
        showFeedback('hint', 'まず「チャレンジ開始」ボタンをクリックしてください。');
        return;
    }
    
    challengeArray = [...challengeOriginalArray];
    selectedIndices = [];
    userSwapCount = 0;
    challengeActive = true;
    
    renderChallengeArray();
    updateChallengeStats();
    hideFeedback();
}

// ========================================
// 統計情報の更新
// ========================================
function updateChallengeStats() {
    document.getElementById('user-swaps').textContent = userSwapCount;
    document.getElementById('min-swaps').textContent = minSwapCount > 0 ? minSwapCount : '-';
}

// ========================================
// フィードバック表示
// ========================================
function showFeedback(type, message) {
    const feedback = document.getElementById('challenge-feedback');
    feedback.className = `challenge-feedback show ${type}`;
    feedback.innerHTML = message;
}

function hideFeedback() {
    const feedback = document.getElementById('challenge-feedback');
    feedback.classList.remove('show');
}

// ========================================
// 最小交換回数の計算
// ========================================
function calculateMinSwaps(arr) {
    let swaps = 0;
    const n = arr.length;
    
    // バブルソートをシミュレート
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swaps++;
            }
        }
    }
    
    return swaps;
}

// ========================================
// ユーティリティ関数
// ========================================
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
