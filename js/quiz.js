// ========================================
// クイズ機能
// ========================================

let quizResults = {
    total: 5,
    correct: 0,
    answered: 0
};

document.addEventListener('DOMContentLoaded', function() {
    initializeQuiz();
});

function initializeQuiz() {
    // クイズオプションのクリックイベント
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
        option.addEventListener('click', handleQuizAnswer);
    });
    
    // リトライボタン
    document.getElementById('retry-quiz-btn').addEventListener('click', retryQuiz);
}

function handleQuizAnswer(event) {
    const option = event.target;
    const quizCard = option.closest('.quiz-card');
    const allOptions = quizCard.querySelectorAll('.quiz-option');
    const feedback = quizCard.querySelector('.quiz-feedback');
    const answer = option.getAttribute('data-answer');
    
    // 既に回答済みの場合は無視
    if (option.classList.contains('disabled')) {
        return;
    }
    
    // すべてのオプションを無効化
    allOptions.forEach(opt => {
        opt.classList.add('disabled');
    });
    
    // 回答数を増やす
    quizResults.answered++;
    
    // 正解・不正解の判定
    if (answer === 'correct') {
        quizResults.correct++;
        option.classList.add('correct');
        feedback.className = 'quiz-feedback show correct';
        feedback.innerHTML = '<strong>✓ 正解！</strong> よくできました！';
    } else {
        option.classList.add('wrong');
        
        // 正解を表示
        allOptions.forEach(opt => {
            if (opt.getAttribute('data-answer') === 'correct') {
                opt.classList.add('correct');
            }
        });
        
        feedback.className = 'quiz-feedback show wrong';
        feedback.innerHTML = '<strong>✗ 不正解</strong> 正解は緑色で表示されています。';
    }
    
    // すべて回答したら結果を表示
    if (quizResults.answered === quizResults.total) {
        setTimeout(showQuizResults, 1000);
    }
}

function showQuizResults() {
    const summary = document.getElementById('quiz-summary');
    const correctCount = document.getElementById('correct-count');
    const message = document.getElementById('quiz-message');
    
    correctCount.textContent = quizResults.correct;
    
    // メッセージを設定
    const percentage = (quizResults.correct / quizResults.total) * 100;
    if (percentage === 100) {
        message.textContent = '🏆 完璧です！バブルソートを完全に理解していますね！';
        message.style.color = 'var(--success-color)';
    } else if (percentage >= 80) {
        message.textContent = '🎉 素晴らしい！よく理解できています！';
        message.style.color = 'var(--success-color)';
    } else if (percentage >= 60) {
        message.textContent = '👍 良い結果です！もう少し復習してみましょう。';
        message.style.color = 'var(--info-color)';
    } else {
        message.textContent = '📚 もう一度学習タブで復習してみましょう！';
        message.style.color = 'var(--warning-color)';
    }
    
    summary.classList.add('show');
    summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function retryQuiz() {
    // 結果をリセット
    quizResults.correct = 0;
    quizResults.answered = 0;
    
    // すべてのクイズカードをリセット
    const quizCards = document.querySelectorAll('.quiz-card');
    quizCards.forEach(card => {
        const options = card.querySelectorAll('.quiz-option');
        const feedback = card.querySelector('.quiz-feedback');
        
        options.forEach(opt => {
            opt.classList.remove('correct', 'wrong', 'disabled');
        });
        
        feedback.classList.remove('show');
    });
    
    // サマリーを非表示
    document.getElementById('quiz-summary').classList.remove('show');
    
    // 最初のクイズにスクロール
    quizCards[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ========================================
// クイズの解説機能（オプション）
// ========================================
const quizExplanations = {
    1: '右から左へ比較を進めると、最初のパスで最小値が左端に移動します。',
    2: 'バブルソートは二重ループ構造のため、最悪計算量はO(n²)になります。',
    3: '右から左への1パスで、[9,5]→[3,7,4,5,9]、[4,5]→変化なし、[7,4]→変化なし、[3,7]→変化なしとなります。',
    4: '配列がすでにソート済みの場合、最適化されたバブルソートでは交換が発生せずに早期終了できます。',
    5: '要素数nの配列では、最大でn-1回のパスが必要です（この場合は5-1=4回）。'
};

function showExplanation(quizNumber) {
    // 将来的な拡張用
    return quizExplanations[quizNumber];
}
