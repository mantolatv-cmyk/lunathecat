// shared-games.js
// This script dynamically injects the HTML and logic for:
// 1. Listen & Find
// 2. Sentence Builder
// 3. Spelling Scramble
// It expects `vocabulary` and `gameSentences` arrays to be globally defined in the host HTML.

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Tab Buttons
  const tabsContainer = document.getElementById('scenario-tabs') || document.querySelector('.scenario-tabs');
  if (tabsContainer) {
    tabsContainer.insertAdjacentHTML('beforeend', `
      <button class="scenario-tab" data-tab="listen">🔊 Listen & Find</button>
      <button class="scenario-tab" data-tab="sentence">🧱 Build a Sentence</button>
      <button class="scenario-tab" data-tab="scramble">✏️ Spelling Scramble</button>
    `);
  }

  // 2. Inject Tab Panels
  const container = document.querySelector('.scenario-container');
  if (container) {
    container.insertAdjacentHTML('beforeend', `
      <!-- TAB: Listen & Find -->
      <div class="tab-panel" id="tab-listen">
        <div class="game-area" id="listen-game-area" style="text-align: center;">
          <div class="game-score" id="listen-game-score">⭐ Score: <strong>0</strong> / <span>10</span></div>
          <div class="game-progress"><div class="game-progress-bar" id="listen-progress-bar"></div></div>
          
          <div class="listen-scene">
            <div class="listen-instruction" id="listen-feedback">Listen and click the right picture!</div>
            <div class="listen-btn-container">
              <button class="listen-play-btn" id="listen-play-btn" aria-label="Play audio">🔊</button>
            </div>
            <div class="listen-options" id="listen-options">
              <!-- Rendered by JS -->
            </div>
          </div>
        </div>
        
        <div class="game-complete" id="listen-complete" style="display: none; flex-direction: column; align-items: center;">
          <div class="game-complete-emoji">🎧</div>
          <h2 class="game-complete-title">Great Listening!</h2>
          <p class="game-complete-score" id="listen-final-score">You found all the words!</p>
          <div class="game-stars" id="listen-stars">⭐⭐⭐</div>
          <button class="game-replay-btn" id="listen-replay-btn">🔄 Play Again!</button>
        </div>
      </div>

      <!-- TAB: Sentence Builder -->
      <div class="tab-panel" id="tab-sentence">
        <div class="game-area" id="sentence-game-area" style="text-align: center;">
          <div class="game-score" id="sentence-game-score">⭐ Score: <strong>0</strong> / <span>5</span></div>
          <div class="game-progress"><div class="game-progress-bar" id="sentence-progress-bar"></div></div>
          
          <div class="sentence-scene">
            <div class="sentence-hint" id="sentence-hint"></div>
            <div class="sentence-slots" id="sentence-slots"></div>
            <div class="sentence-words" id="sentence-words"></div>
          </div>
        </div>
        
        <div class="game-complete" id="sentence-complete" style="display: none; flex-direction: column; align-items: center;">
          <div class="game-complete-emoji">🧱</div>
          <h2 class="game-complete-title">Great Builder!</h2>
          <p class="game-complete-score" id="sentence-final-score">You built all the sentences!</p>
          <button class="game-replay-btn" id="sentence-replay-btn">🔄 Play Again!</button>
        </div>
      </div>

      <!-- TAB: Spelling Scramble -->
      <div class="tab-panel" id="tab-scramble">
        <div class="game-area" id="scramble-game-area" style="text-align: center;">
          <div class="game-score" id="scramble-game-score">⭐ Score: <strong>0</strong> / <span>5</span></div>
          <div class="game-progress"><div class="game-progress-bar" id="scramble-progress-bar"></div></div>
          
          <div class="scramble-scene">
            <div class="scramble-emoji" id="scramble-emoji">🌟</div>
            <div class="sentence-hint" id="scramble-hint">Word</div>
            <div class="scramble-slots" id="scramble-slots"></div>
            <div class="scramble-letters" id="scramble-letters"></div>
          </div>
        </div>
        
        <div class="game-complete" id="scramble-complete" style="display: none; flex-direction: column; align-items: center;">
          <div class="game-complete-emoji">✏️</div>
          <h2 class="game-complete-title">Super Speller!</h2>
          <p class="game-complete-score" id="scramble-final-score">You spelled everything right!</p>
          <button class="game-replay-btn" id="scramble-replay-btn">🔄 Play Again!</button>
        </div>
      </div>
    `);
  }

  // 3. Bind events for ALL tabs (to cover the newly injected ones)
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    // Remove old listeners by replacing the node or just binding logic
    // Actually, we can just attach the event directly. It might trigger twice for old tabs but that's harmless since it just adds/removes classes.
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const targetPanel = document.getElementById('tab-' + e.currentTarget.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // ==========================================
  // GAME - LISTEN & FIND
  // ==========================================
  let listenGameItems = [];
  let listenIndex = 0;
  let listenScore = 0;
  let listenAnswered = false;
  let currentListenWord = "";
  const listenTotalItems = Math.min(10, vocabulary.length);
  
  const listenPlayBtn = document.getElementById('listen-play-btn');
  const listenOptions = document.getElementById('listen-options');
  const listenFeedback = document.getElementById('listen-feedback');
  const listenGameArea = document.getElementById('listen-game-area');
  const listenComplete = document.getElementById('listen-complete');
  
  function initListenGame() {
    listenGameItems = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, listenTotalItems);
    listenIndex = 0;
    listenScore = 0;
    listenGameArea.style.display = 'block';
    listenComplete.style.display = 'none';
    
    updateListenScore();
    renderListenQuestion();
  }
  
  function updateListenScore() {
    document.getElementById('listen-game-score').innerHTML = `⭐ Score: <strong>${listenScore}</strong> / <span>${listenTotalItems}</span>`;
    document.getElementById('listen-progress-bar').style.width = ((listenIndex / listenTotalItems) * 100) + '%';
  }
  
  function renderListenQuestion() {
    if (listenIndex >= listenTotalItems) {
      listenGameArea.style.display = 'none';
      listenComplete.style.display = 'flex';
      const pct = Math.round((listenScore / listenTotalItems) * 100);
      document.getElementById('listen-final-score').textContent = `You got ${listenScore} out of ${listenTotalItems} correct!`;
      document.getElementById('listen-stars').textContent = pct >= 90 ? '⭐⭐⭐' : pct >= 60 ? '⭐⭐' : '⭐';
      document.getElementById('listen-progress-bar').style.width = '100%';
      return;
    }
    
    listenAnswered = false;
    const targetItem = listenGameItems[listenIndex];
    currentListenWord = targetItem.word;
    listenFeedback.textContent = "Listen and click the right picture!";
    listenFeedback.style.color = "var(--text-primary)";
    
    let options = [targetItem];
    const otherVocab = vocabulary.filter(v => v.word !== targetItem.word);
    const wrongOptions = [...otherVocab].sort(() => Math.random() - 0.5).slice(0, 3);
    options = [...options, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    listenOptions.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'listen-option';
      btn.textContent = opt.emoji;
      btn.addEventListener('click', () => handleListenAnswer(opt, targetItem, btn));
      listenOptions.appendChild(btn);
    });
    
    setTimeout(playListenAudio, 300);
  }
  
  function playListenAudio() {
    if (!currentListenWord) return;
    window.speechSynthesis.cancel();
    listenPlayBtn.classList.add('playing');
    const utterance = new SpeechSynthesisUtterance(currentListenWord);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => listenPlayBtn.classList.remove('playing');
    utterance.onerror = () => listenPlayBtn.classList.remove('playing');
    window.speechSynthesis.speak(utterance);
  }
  
  function handleListenAnswer(selected, correct, btn) {
    if (listenAnswered) return;
    listenAnswered = true;
    const isCorrect = selected.word === correct.word;
    
    Array.from(listenOptions.children).forEach(child => {
      child.style.pointerEvents = 'none';
      if (child.textContent === correct.emoji && !isCorrect) child.classList.add('correct');
    });
    
    if (isCorrect) {
      listenScore++;
      btn.classList.add('correct');
      listenFeedback.textContent = '🎉 Correct! ' + selected.word;
      listenFeedback.style.color = 'var(--green-dark)';
    } else {
      btn.classList.add('wrong');
      listenFeedback.textContent = '❌ Oops! It was ' + correct.word;
      listenFeedback.style.color = '#dc2626';
    }
    updateListenScore();
    setTimeout(() => { listenIndex++; renderListenQuestion(); }, 2000);
  }
  
  if (listenPlayBtn) listenPlayBtn.addEventListener('click', playListenAudio);
  const listenReplayBtn = document.getElementById('listen-replay-btn');
  if (listenReplayBtn) listenReplayBtn.addEventListener('click', initListenGame);
  
  // ==========================================
  // GAME - SENTENCE BUILDER
  // ==========================================
  let sentenceIndex = 0;
  let sentenceScore = 0;
  let sentenceCurrentWords = [];
  let sentenceSlotsFilled = 0;
  let initX, initY;
  
  function initSentenceGame() {
    if (!window.gameSentences || window.gameSentences.length === 0) return;
    sentenceIndex = 0;
    sentenceScore = 0;
    document.getElementById('sentence-game-area').style.display = 'block';
    document.getElementById('sentence-complete').style.display = 'none';
    renderSentence();
  }
  
  function renderSentence() {
    if (sentenceIndex >= window.gameSentences.length) {
      document.getElementById('sentence-game-area').style.display = 'none';
      document.getElementById('sentence-complete').style.display = 'flex';
      return;
    }
    
    const currentSentence = window.gameSentences[sentenceIndex];
    document.getElementById('sentence-hint').textContent = `🇧🇷 Hint: "${currentSentence.pt}"`;
    document.getElementById('sentence-game-score').innerHTML = `⭐ Score: <strong>${sentenceScore}</strong> / <span>${window.gameSentences.length}</span>`;
    document.getElementById('sentence-progress-bar').style.width = ((sentenceIndex / window.gameSentences.length) * 100) + '%';
    
    const words = currentSentence.en.split(' ');
    sentenceCurrentWords = words;
    sentenceSlotsFilled = 0;
    
    const slotsContainer = document.getElementById('sentence-slots');
    slotsContainer.innerHTML = '';
    words.forEach((w, i) => {
      const slot = document.createElement('div');
      slot.className = 'sentence-slot';
      slot.dataset.index = i;
      slot.dataset.word = w.toLowerCase().replace(/[^a-z]/g, '');
      setupSentenceSlot(slot);
      slotsContainer.appendChild(slot);
    });
    
    const wordsContainer = document.getElementById('sentence-words');
    wordsContainer.innerHTML = '';
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    shuffledWords.forEach((w, i) => {
      const wordEl = document.createElement('div');
      wordEl.className = 'sentence-word';
      wordEl.textContent = w;
      wordEl.draggable = true;
      wordEl.dataset.word = w.toLowerCase().replace(/[^a-z]/g, '');
      setupSentenceWord(wordEl);
      wordsContainer.appendChild(wordEl);
    });
  }
  
  let currentSentenceWord = null;
  let currentSentenceClone = null;
  
  function setupSentenceWord(el) {
    el.addEventListener('dragstart', (e) => {
      currentSentenceWord = el;
      e.dataTransfer.setData('text/plain', el.dataset.word);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      currentSentenceWord = null;
      document.querySelectorAll('.sentence-slot').forEach(s => s.classList.remove('drag-over'));
    });
    
    el.addEventListener('touchstart', (e) => {
      currentSentenceWord = el;
      el.classList.add('dragging');
      const touch = e.targetTouches[0];
      const rect = el.getBoundingClientRect();
      initX = touch.clientX - rect.left;
      initY = touch.clientY - rect.top;
      
      el.style.opacity = '0.01';
      currentSentenceClone = el.cloneNode(true);
      currentSentenceClone.id = 'sentence-drag-clone';
      currentSentenceClone.style.position = 'fixed';
      currentSentenceClone.style.left = (touch.clientX - initX) + 'px';
      currentSentenceClone.style.top = (touch.clientY - initY) + 'px';
      currentSentenceClone.style.margin = '0';
      currentSentenceClone.style.pointerEvents = 'none';
      currentSentenceClone.style.opacity = '0.8';
      document.body.appendChild(currentSentenceClone);
    }, {passive: false});
    
    el.addEventListener('touchmove', (e) => {
      if (!currentSentenceWord) return;
      e.preventDefault();
      const touch = e.targetTouches[0];
      if (currentSentenceClone) {
        currentSentenceClone.style.left = (touch.clientX - initX) + 'px';
        currentSentenceClone.style.top = (touch.clientY - initY) + 'px';
      }
      
      document.querySelectorAll('.sentence-slot').forEach(zone => {
        if (zone.classList.contains('filled')) return;
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          zone.classList.add('drag-over');
        } else {
          zone.classList.remove('drag-over');
        }
      });
    }, {passive: false});
    
    el.addEventListener('touchend', (e) => {
      if (!currentSentenceWord) return;
      const touch = e.changedTouches[0];
      if (currentSentenceClone) currentSentenceClone.remove();
      
      currentSentenceWord.style.opacity = '';
      currentSentenceWord.classList.remove('dragging');
      
      let targetZone = null;
      document.querySelectorAll('.sentence-slot').forEach(zone => {
        zone.classList.remove('drag-over');
        if (zone.classList.contains('filled')) return;
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          targetZone = zone;
        }
      });
      if (targetZone) processSentenceDrop(currentSentenceWord, targetZone);
      currentSentenceWord = null;
    });
  }
  
  function setupSentenceSlot(slot) {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!slot.classList.contains('filled')) slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (slot.classList.contains('filled') || !currentSentenceWord) return;
      processSentenceDrop(currentSentenceWord, slot);
    });
  }
  
  function processSentenceDrop(wordEl, slot) {
    if (wordEl.dataset.word === slot.dataset.word) {
      slot.classList.add('filled');
      slot.appendChild(wordEl);
      wordEl.style.pointerEvents = 'none';
      sentenceSlotsFilled++;
      
      if (sentenceSlotsFilled === sentenceCurrentWords.length) {
        sentenceScore++;
        setTimeout(() => { sentenceIndex++; renderSentence(); }, 1500);
      }
    }
  }
  
  const sentenceReplayBtn = document.getElementById('sentence-replay-btn');
  if (sentenceReplayBtn) sentenceReplayBtn.addEventListener('click', initSentenceGame);
  
  // ==========================================
  // GAME - SPELLING SCRAMBLE
  // ==========================================
  let scrambleWords = [];
  let scrambleIndex = 0;
  let scrambleScore = 0;
  let scrambleCurrentLetters = [];
  let scrambleSlotsFilled = 0;
  
  function initScrambleGame() {
    scrambleWords = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, 5);
    scrambleIndex = 0;
    scrambleScore = 0;
    document.getElementById('scramble-game-area').style.display = 'block';
    document.getElementById('scramble-complete').style.display = 'none';
    renderScramble();
  }
  
  function renderScramble() {
    if (scrambleIndex >= scrambleWords.length) {
      document.getElementById('scramble-game-area').style.display = 'none';
      document.getElementById('scramble-complete').style.display = 'flex';
      return;
    }
    
    const currentWord = scrambleWords[scrambleIndex];
    document.getElementById('scramble-emoji').textContent = currentWord.emoji;
    document.getElementById('scramble-hint').textContent = `🇧🇷 Hint: ${currentWord.pt}`;
    document.getElementById('scramble-game-score').innerHTML = `⭐ Score: <strong>${scrambleScore}</strong> / <span>${scrambleWords.length}</span>`;
    document.getElementById('scramble-progress-bar').style.width = ((scrambleIndex / scrambleWords.length) * 100) + '%';
    
    // Ignore spaces for scrambling
    const rawWord = currentWord.word.toUpperCase().replace(/\s/g, '');
    const letters = rawWord.split('');
    scrambleCurrentLetters = letters;
    scrambleSlotsFilled = 0;
    
    const slotsContainer = document.getElementById('scramble-slots');
    slotsContainer.innerHTML = '';
    letters.forEach((l, i) => {
      const slot = document.createElement('div');
      slot.className = 'scramble-slot';
      slot.dataset.index = i;
      slot.dataset.letter = l;
      setupScrambleSlot(slot);
      slotsContainer.appendChild(slot);
    });
    
    const lettersContainer = document.getElementById('scramble-letters');
    lettersContainer.innerHTML = '';
    const shuffledLetters = [...letters].sort(() => Math.random() - 0.5);
    shuffledLetters.forEach((l, i) => {
      const letterEl = document.createElement('div');
      letterEl.className = 'scramble-letter';
      letterEl.textContent = l;
      letterEl.draggable = true;
      letterEl.dataset.letter = l;
      setupScrambleLetter(letterEl);
      lettersContainer.appendChild(letterEl);
    });
  }
  
  let currentScrambleLetter = null;
  let currentScrambleClone = null;
  
  function setupScrambleLetter(el) {
    el.addEventListener('dragstart', (e) => {
      currentScrambleLetter = el;
      e.dataTransfer.setData('text/plain', el.dataset.letter);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('dragging');
      currentScrambleLetter = null;
      document.querySelectorAll('.scramble-slot').forEach(s => s.classList.remove('drag-over'));
    });
    
    el.addEventListener('touchstart', (e) => {
      currentScrambleLetter = el;
      el.classList.add('dragging');
      const touch = e.targetTouches[0];
      const rect = el.getBoundingClientRect();
      initX = touch.clientX - rect.left;
      initY = touch.clientY - rect.top;
      
      el.style.opacity = '0.01';
      currentScrambleClone = el.cloneNode(true);
      currentScrambleClone.id = 'scramble-drag-clone';
      currentScrambleClone.style.position = 'fixed';
      currentScrambleClone.style.left = (touch.clientX - initX) + 'px';
      currentScrambleClone.style.top = (touch.clientY - initY) + 'px';
      currentScrambleClone.style.margin = '0';
      currentScrambleClone.style.pointerEvents = 'none';
      currentScrambleClone.style.opacity = '0.8';
      document.body.appendChild(currentScrambleClone);
    }, {passive: false});
    
    el.addEventListener('touchmove', (e) => {
      if (!currentScrambleLetter) return;
      e.preventDefault();
      const touch = e.targetTouches[0];
      if (currentScrambleClone) {
        currentScrambleClone.style.left = (touch.clientX - initX) + 'px';
        currentScrambleClone.style.top = (touch.clientY - initY) + 'px';
      }
      
      document.querySelectorAll('.scramble-slot').forEach(zone => {
        if (zone.classList.contains('filled')) return;
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          zone.classList.add('drag-over');
        } else {
          zone.classList.remove('drag-over');
        }
      });
    }, {passive: false});
    
    el.addEventListener('touchend', (e) => {
      if (!currentScrambleLetter) return;
      const touch = e.changedTouches[0];
      if (currentScrambleClone) currentScrambleClone.remove();
      
      currentScrambleLetter.style.opacity = '';
      currentScrambleLetter.classList.remove('dragging');
      
      let targetZone = null;
      document.querySelectorAll('.scramble-slot').forEach(zone => {
        zone.classList.remove('drag-over');
        if (zone.classList.contains('filled')) return;
        const rect = zone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
          targetZone = zone;
        }
      });
      if (targetZone) processScrambleDrop(currentScrambleLetter, targetZone);
      currentScrambleLetter = null;
    });
  }
  
  function setupScrambleSlot(slot) {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!slot.classList.contains('filled')) slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      if (slot.classList.contains('filled') || !currentScrambleLetter) return;
      processScrambleDrop(currentScrambleLetter, slot);
    });
  }
  
  function processScrambleDrop(letterEl, slot) {
    if (letterEl.dataset.letter === slot.dataset.letter) {
      slot.classList.add('filled');
      slot.appendChild(letterEl);
      letterEl.classList.add('correct-pos');
      letterEl.style.pointerEvents = 'none';
      scrambleSlotsFilled++;
      
      if (scrambleSlotsFilled === scrambleCurrentLetters.length) {
        scrambleScore++;
        setTimeout(() => { scrambleIndex++; renderScramble(); }, 1500);
      }
    } else {
      letterEl.classList.add('wrong-pos');
      setTimeout(() => letterEl.classList.remove('wrong-pos'), 400);
    }
  }
  
  const scrambleReplayBtn = document.getElementById('scramble-replay-btn');
  if (scrambleReplayBtn) scrambleReplayBtn.addEventListener('click', initScrambleGame);
  
  // Initialize games once the DOM is loaded
  initListenGame();
  initSentenceGame();
  initScrambleGame();
});
