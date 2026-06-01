// ========================================
// グローバル変数
// ========================================
let array = [64, 34, 25, 12, 22, 11, 90];
let originalArray = [...array];
let animationSpeed = 500;
let isRunning = false;
let isPaused = false;
let stepMode = false;

// 統計情報
let passCount = 0;
let compareCount = 0;
let swapCount = 0;

// アニメーション制御
let animationTimeout = null;
let sortingGenerator = null;

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeControls();
    renderArray();
    updateStats();
});

// ========================================
// タブ機能
// ========================================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // すべてのタブとコンテンツから active クラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブとコンテンツに active クラスを追加
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// ========================================
// コントロール機能の初期化
// ========================================
function initializeControls() {
    // 配列セットボタン
    document.getElementById('set-array-btn').addEventListener('click', setCustomArray);
    
    // エンターキーで配列セット
    document.getElementById('array-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            setCustomArray();
        }
    });
    
    // 速度スライダー
    const speedSlider = document.getElementById('speed-slider');
    speedSlider.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        document.getElementById('speed-value').textContent = animationSpeed;
    });
    
    // 制御ボタン
    document.getElementById('start-btn').addEventListener('click', startSorting);
    document.getElementById('step-btn').addEventListener('click', stepSorting);
    document.getElementById('pause-btn').addEventListener('click', pauseSorting);
    document.getElementById('reset-btn').addEventListener('click', resetArray);
    
    // クイック配列選択
    document.querySelectorAll('.quick-arrays .btn-small[data-array]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const arrayStr = e.target.getAttribute('data-array');
            document.getElementById('array-input').value = arrayStr;
            setCustomArray();
        });
    });
    
    // ランダム配列生成
    document.getElementById('random-btn').addEventListener('click', generateRandomArray);
}

// ========================================
// 配列の設定と管理
// ========================================
function setCustomArray() {
    if (isRunning) {
        alert('ソート実行中は配列を変更できません');
        return;
    }
    
    const input = document.getElementById('array-input').value;
    const numbers = input.split(',').map(s => s.trim()).filter(s => s !== '');
    
    // 入力検証
    const parsedArray = numbers.map(n => parseInt(n));
    if (parsedArray.some(n => isNaN(n))) {
        alert('有効な数値を入力してください（カンマ区切り）');
        return;
    }
    
    if (parsedArray.length < 2) {
        alert('少なくとも2つの数値を入力してください');
        return;
    }
    
    if (parsedArray.length > 15) {
        alert('配列の要素数は15個以下にしてください');
        return;
    }
    
    array = parsedArray;
    originalArray = [...array];
    resetStats();
    renderArray();
    updateStatus('配列をセットしました');
}

function generateRandomArray() {
    if (isRunning) {
        alert('ソート実行中は配列を変更できません');
        return;
    }
    
    const length = Math.floor(Math.random() * 6) + 5; // 5-10要素
    array = [];
    for (let i = 0; i < length; i++) {
        array.push(Math.floor(Math.random() * 90) + 10); // 10-99の乱数
    }
    
    originalArray = [...array];
    document.getElementById('array-input').value = array.join(', ');
    resetStats();
    renderArray();
    updateStatus('ランダム配列を生成しました');
}

function resetArray() {
    if (isRunning && !isPaused) {
        pauseSorting();
    }
    
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    
    array = [...originalArray];
    isRunning = false;
    isPaused = false;
    stepMode = false;
    sortingGenerator = null;
    
    resetStats();
    renderArray();
    updateStatus('リセットしました');
    updateButtons();
}

// ========================================
// 配列の描画
// ========================================
function renderArray(comparingIndices = [], swappingIndices = [], sortedIndices = []) {
    const container = document.getElementById('visualization');
    container.innerHTML = '';
    
    const maxValue = Math.max(...array);
    const containerHeight = 350;
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // 高さを計算（最小20px、最大containerHeight）
        const height = Math.max(20, (value / maxValue) * containerHeight);
        bar.style.height = `${height}px`;
        
        // 値を表示
        const valueLabel = document.createElement('div');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = value;
        bar.appendChild(valueLabel);
        
        // 状態に応じてクラスを追加
        if (sortedIndices.includes(index)) {
            bar.classList.add('sorted');
        } else if (swappingIndices.includes(index)) {
            bar.classList.add('swapping');
        } else if (comparingIndices.includes(index)) {
            bar.classList.add('comparing');
        }
        
        container.appendChild(bar);
    });
}

// ========================================
// 統計情報の管理
// ========================================
function resetStats() {
    passCount = 0;
    compareCount = 0;
    swapCount = 0;
    updateStats();
}

function updateStats() {
    document.getElementById('pass-count').textContent = passCount;
    document.getElementById('compare-count').textContent = compareCount;
    document.getElementById('swap-count').textContent = swapCount;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateButtons() {
    const startBtn = document.getElementById('start-btn');
    const stepBtn = document.getElementById('step-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (isRunning && !isPaused) {
        startBtn.disabled = true;
        stepBtn.disabled = true;
        pauseBtn.disabled = false;
    } else if (isRunning && isPaused) {
        startBtn.disabled = false;
        stepBtn.disabled = false;
        pauseBtn.disabled = true;
    } else {
        startBtn.disabled = false;
        stepBtn.disabled = false;
        pauseBtn.disabled = true;
    }
}

// ========================================
// ソートアルゴリズム（ジェネレータ関数）
// 右から左へ比較を進める
// ========================================
function* bubbleSortGenerator() {
    const n = array.length;
    const sortedIndices = [];
    
    for (let i = 0; i < n - 1; i++) {
        passCount++;
        updateStats();
        updateStatus(`パス ${passCount} 実行中...`);
        
        let swapped = false;
        
        // 右から左へ比較を進める
        for (let j = n - 1; j > i; j--) {
            // 比較
            compareCount++;
            updateStats();
            
            yield {
                type: 'compare',
                indices: [j - 1, j],
                sortedIndices: [...sortedIndices]
            };
            
            if (array[j - 1] > array[j]) {
                // 交換
                swapCount++;
                updateStats();
                swapped = true;
                
                yield {
                    type: 'swap',
                    indices: [j - 1, j],
                    sortedIndices: [...sortedIndices]
                };
                
                // 実際に配列を交換
                [array[j - 1], array[j]] = [array[j], array[j - 1]];
                
                yield {
                    type: 'swapped',
                    indices: [j - 1, j],
                    sortedIndices: [...sortedIndices]
                };
            }
        }
        
        // このパスで最初の要素がソート完了（小さい値が左に沈む）
        sortedIndices.push(i);
        
        yield {
            type: 'pass-complete',
            indices: [],
            sortedIndices: [...sortedIndices]
        };
        
        // 最適化: 交換が発生しなかった場合は完了
        if (!swapped) {
            // 残りの要素もソート済み
            for (let k = i + 1; k < n; k++) {
                if (!sortedIndices.includes(k)) {
                    sortedIndices.push(k);
                }
            }
            break;
        }
    }
    
    // 最後の要素もソート済み
    if (!sortedIndices.includes(n - 1)) {
        sortedIndices.push(n - 1);
    }
    
    yield {
        type: 'complete',
        indices: [],
        sortedIndices: [...sortedIndices]
    };
}

// ========================================
// ソート実行制御
// ========================================
function startSorting() {
    if (isRunning && isPaused) {
        // 再開
        isPaused = false;
        updateStatus('ソート再開...');
        updateButtons();
        continueAnimation();
    } else {
        // 新規開始
        isRunning = true;
        isPaused = false;
        stepMode = false;
        sortingGenerator = bubbleSortGenerator();
        updateStatus('ソート開始...');
        updateButtons();
        continueAnimation();
    }
}

function stepSorting() {
    if (!isRunning) {
        // ステップモード開始
        isRunning = true;
        stepMode = true;
        sortingGenerator = bubbleSortGenerator();
        updateStatus('ステップモード');
        updateButtons();
    }
    
    if (!isPaused) {
        isPaused = true;
        updateButtons();
    }
    
    // 1ステップ実行
    executeStep();
}

function pauseSorting() {
    isPaused = true;
    updateStatus('一時停止中');
    updateButtons();
    
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
}

function continueAnimation() {
    if (isPaused || !isRunning) {
        return;
    }
    
    executeStep();
}

function executeStep() {
    const result = sortingGenerator.next();
    
    if (result.done) {
        // ソート完了
        isRunning = false;
        isPaused = false;
        stepMode = false;
        updateStatus('ソート完了！');
        updateButtons();
        renderArray([], [], result.value.sortedIndices);
        return;
    }
    
    const { type, indices, sortedIndices } = result.value;
    
    switch (type) {
        case 'compare':
            renderArray(indices, [], sortedIndices);
            break;
        case 'swap':
            renderArray([], indices, sortedIndices);
            break;
        case 'swapped':
            renderArray([], [], sortedIndices);
            break;
        case 'pass-complete':
            renderArray([], [], sortedIndices);
            break;
        case 'complete':
            renderArray([], [], sortedIndices);
            updateStatus('ソート完了！');
            isRunning = false;
            updateButtons();
            return;
    }
    
    // 自動モードの場合は次のステップを実行
    if (!stepMode && !isPaused) {
        animationTimeout = setTimeout(() => {
            continueAnimation();
        }, animationSpeed);
    }
}

// ========================================
// ユーティリティ関数
// ========================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
