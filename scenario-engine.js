// ==========================================
// scenario-engine.js
// Shared engine for all Luna scenario pages.
// Auto-initializes modules based on DOM elements present.
// Expects global data arrays: dialogues, vocabulary, gameSentences (optional)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // MODULE: Tab Switching + Mobile Menu
  // ==========================================
  document.querySelectorAll('.scenario-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.scenario-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const targetPanel = document.getElementById('tab-' + tab.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  const menuToggle = document.getElementById('menu-toggle');
  const navMobile = document.getElementById('nav-mobile');
  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMobile.classList.toggle('open');
    });
  }

  // ==========================================
  // MODULE: Dialogue / Story Time
  // ==========================================
  const dialogueContainer = document.getElementById('dialogue-container');
  const dialogueNextBtn = document.getElementById('dialogue-next-btn');
  const dialogueRestartBtn = document.getElementById('dialogue-restart-btn');

  if (dialogueContainer && dialogueNextBtn && typeof dialogues !== 'undefined') {
    let dialogueIndex = 0;

    function renderNextDialogue() {
      if (dialogueIndex >= dialogues.length) {
        dialogueNextBtn.disabled = true;
        dialogueNextBtn.textContent = '✅ Story Complete!';
        if (dialogueRestartBtn) dialogueRestartBtn.classList.add('visible');
        return;
      }
      const d = dialogues[dialogueIndex];
      const bubble = document.createElement('div');
      bubble.className = `dialogue-bubble ${d.speaker}`;
      bubble.innerHTML = `<div class="dialogue-speaker"><span>${d.speaker === 'luna' ? '🐱' : '👧'}</span><span>${d.speaker === 'luna' ? 'Luna the Cat' : 'Little Friend'}</span></div><div class="dialogue-english">${d.en}</div><div class="dialogue-portuguese">🇧🇷 ${d.pt}</div>`;
      bubble.addEventListener('click', () => bubble.classList.toggle('show-pt'));
      dialogueContainer.appendChild(bubble);
      requestAnimationFrame(() => bubble.classList.add('visible'));
      dialogueIndex++;
      bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    dialogueNextBtn.addEventListener('click', renderNextDialogue);

    if (dialogueRestartBtn) {
      dialogueRestartBtn.addEventListener('click', () => {
        dialogueIndex = 0;
        dialogueContainer.innerHTML = '';
        dialogueNextBtn.disabled = false;
        dialogueNextBtn.textContent = 'Next Line →';
        dialogueRestartBtn.classList.remove('visible');
        renderNextDialogue();
      });
    }

    renderNextDialogue();
  }

  // ==========================================
  // MODULE: Vocabulary Grid (Flip Cards)
  // ==========================================
  const vocabGrid = document.getElementById('vocab-grid');

  if (vocabGrid && typeof vocabulary !== 'undefined') {
    vocabulary.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vocab-card';

      // Determine front content based on vocabulary item properties
      let frontExtra = '';
      if (v.sound) frontExtra = `<div class="vocab-hint">${v.sound}</div>`;
      else if (v.letter) frontExtra = `<div class="vocab-hint">tap to flip</div>`;
      else if (v.num) frontExtra = `<div class="vocab-hint">tap to flip</div>`;
      else if (v.hex) frontExtra = `<div class="vocab-hint">tap to flip</div>`;
      else frontExtra = `<div class="vocab-hint">tap to flip</div>`;

      // Determine display word
      let displayWord = v.word;
      if (v.letter) displayWord = `${v.letter} — ${v.word}`;
      else if (v.num) displayWord = `${v.num} — ${v.word}`;

      // Determine front style (for colors scenario)
      let frontStyle = '';
      if (v.hex) frontStyle = ` style="border-bottom: 4px solid ${v.hex}"`;

      // Determine back style (for colors scenario)
      let backStyle = '';
      if (v.hex) backStyle = ` style="background: linear-gradient(135deg, ${v.hex}22, ${v.hex}11); border: 2px solid ${v.hex}44"`;

      card.innerHTML = `<div class="vocab-card-inner"><div class="vocab-card-front"${frontStyle}><div class="vocab-emoji">${v.emoji}</div><div class="vocab-word">${displayWord}</div>${frontExtra}</div><div class="vocab-card-back"${backStyle}><div class="vocab-emoji">${v.emoji}</div><div class="vocab-translation">${v.pt}</div><div class="vocab-back-word">${v.word}</div></div></div>`;
      card.addEventListener('click', () => card.classList.toggle('flipped'));
      vocabGrid.appendChild(card);
    });
  }

  // ==========================================
  // MODULE: Sequential Flashcards
  // ==========================================
  const seqEmoji = document.getElementById('seq-emoji');
  const seqWord = document.getElementById('seq-word');
  const seqTransBtn = document.getElementById('seq-translation-btn');
  const seqTransText = document.getElementById('seq-translation-text');
  const seqPrevBtn = document.getElementById('seq-prev-btn');
  const seqNextBtn = document.getElementById('seq-next-btn');

  if (seqEmoji && seqWord && typeof vocabulary !== 'undefined') {
    let flashcardIndex = 0;

    function renderFlashcard() {
      const v = vocabulary[flashcardIndex];
      seqEmoji.innerHTML = v.emoji;
      
      // Hide the word element initially (we only want emoji + Show English button)
      seqWord.style.display = 'none';

      if (seqTransText) {
        // English word to be revealed
        seqTransText.textContent = `🇺🇸 ${v.word}`;
        seqTransText.classList.remove('visible');
      }
      if (seqTransBtn) {
        seqTransBtn.textContent = "Show English";
        seqTransBtn.style.display = 'block';
      }
      if (seqPrevBtn) seqPrevBtn.disabled = flashcardIndex === 0;
      if (seqNextBtn) seqNextBtn.disabled = flashcardIndex === vocabulary.length - 1;
    }

    if (seqTransBtn) {
      seqTransBtn.addEventListener('click', () => {
        seqTransBtn.style.display = 'none';
        if (seqTransText) seqTransText.classList.add('visible');
      });
    }

    if (seqPrevBtn) {
      seqPrevBtn.addEventListener('click', () => {
        if (flashcardIndex > 0) { flashcardIndex--; renderFlashcard(); }
      });
    }

    if (seqNextBtn) {
      seqNextBtn.addEventListener('click', () => {
        if (flashcardIndex < vocabulary.length - 1) { flashcardIndex++; renderFlashcard(); }
      });
    }

    renderFlashcard();
  }

  // ==========================================
  // MODULE: Feed Luna Game
  // ==========================================
  const feedItemsContainer = document.getElementById('feed-items-container');
  const feedCatEl = document.getElementById('feed-cat');
  const feedGameArea = document.getElementById('feed-game-area');
  const feedComplete = document.getElementById('feed-complete');
  const feedGameScore = document.getElementById('feed-game-score');
  const feedProgressBar = document.getElementById('feed-progress-bar');
  const feedGameFeedback = document.getElementById('feed-game-feedback');
  const feedReplayBtn = document.getElementById('feed-replay-btn');

  if (feedItemsContainer && feedCatEl && typeof vocabulary !== 'undefined') {
    let feedItemsEaten = 0;
    const feedTotalItems = vocabulary.length;
    let feedCurrentDraggingItem = null;

    function initFeedGame() {
      feedItemsEaten = 0;
      feedItemsContainer.innerHTML = '';
      if (feedGameScore) feedGameScore.innerHTML = `⭐ Fed: <strong>0</strong> / <span>${feedTotalItems}</span>`;
      if (feedProgressBar) feedProgressBar.style.width = '0%';
      if (feedGameFeedback) feedGameFeedback.textContent = 'Drag items to feed Luna! 🐱';
      feedCatEl.textContent = '🐱';
      if (feedGameArea) feedGameArea.style.display = 'block';
      if (feedComplete) feedComplete.classList.remove('active');

      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);

      shuffled.forEach(v => {
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = v.emoji;
        item.draggable = true;
        item.dataset.word = v.word;

        // Mouse Events
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', v.emoji);
          setTimeout(() => item.classList.add('feed-dragging'), 0);
          feedCatEl.textContent = '😸';
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('feed-dragging');
          feedCatEl.textContent = '🐱';
          feedCatEl.classList.remove('drag-over');
        });

        // Touch Events for Mobile
        item.addEventListener('touchstart', feedHandleTouchStart, { passive: false });
        item.addEventListener('touchmove', feedHandleTouchMove, { passive: false });
        item.addEventListener('touchend', feedHandleTouchEnd);

        feedItemsContainer.appendChild(item);
      });
    }

    // Drag over cat
    feedCatEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      feedCatEl.classList.add('drag-over');
    });

    feedCatEl.addEventListener('dragleave', () => {
      feedCatEl.classList.remove('drag-over');
    });

    feedCatEl.addEventListener('drop', (e) => {
      e.preventDefault();
      feedCatEl.classList.remove('drag-over');
      const draggingItem = document.querySelector('.feed-item.feed-dragging');
      if (draggingItem) {
        feedEatItem(draggingItem);
      }
    });

    // Touch Support for Mobile
    function feedHandleTouchStart(e) {
      feedCurrentDraggingItem = this;
      this.classList.add('feed-dragging');
      feedCatEl.textContent = '😸';
    }

    function feedHandleTouchMove(e) {
      e.preventDefault();
      const touchLocation = e.targetTouches[0];

      this.style.position = 'absolute';
      this.style.left = touchLocation.pageX - (this.offsetWidth / 2) + 'px';
      this.style.top = touchLocation.pageY - (this.offsetHeight / 2) + 'px';

      const catRect = feedCatEl.getBoundingClientRect();
      if (
        touchLocation.clientX >= catRect.left &&
        touchLocation.clientX <= catRect.right &&
        touchLocation.clientY >= catRect.top &&
        touchLocation.clientY <= catRect.bottom
      ) {
        feedCatEl.classList.add('drag-over');
      } else {
        feedCatEl.classList.remove('drag-over');
      }
    }

    function feedHandleTouchEnd(e) {
      if (!feedCurrentDraggingItem) return;

      const changedTouch = e.changedTouches[0];
      const catRect = feedCatEl.getBoundingClientRect();

      feedCurrentDraggingItem.style.position = '';
      feedCurrentDraggingItem.style.left = '';
      feedCurrentDraggingItem.style.top = '';
      feedCurrentDraggingItem.classList.remove('feed-dragging');
      feedCatEl.textContent = '🐱';
      feedCatEl.classList.remove('drag-over');

      if (
        changedTouch.clientX >= catRect.left &&
        changedTouch.clientX <= catRect.right &&
        changedTouch.clientY >= catRect.top &&
        changedTouch.clientY <= catRect.bottom
      ) {
        feedEatItem(feedCurrentDraggingItem);
      }
      feedCurrentDraggingItem = null;
    }

    function feedEatItem(item) {
      const word = item.dataset.word;
      item.remove();
      feedItemsEaten++;

      feedCatEl.textContent = '😻';
      feedCatEl.classList.add('eating');
      setTimeout(() => {
        feedCatEl.classList.remove('eating');
        feedCatEl.textContent = '🐱';
      }, 500);

      if (feedGameScore) feedGameScore.innerHTML = `⭐ Fed: <strong>${feedItemsEaten}</strong> / <span>${feedTotalItems}</span>`;
      if (feedProgressBar) feedProgressBar.style.width = ((feedItemsEaten / feedTotalItems) * 100) + '%';
      if (feedGameFeedback) feedGameFeedback.textContent = `Yummy ${word}! 😋`;

      if (feedItemsEaten === feedTotalItems) {
        setTimeout(showFeedComplete, 800);
      }
    }

    function showFeedComplete() {
      if (feedGameArea) feedGameArea.style.display = 'none';
      if (feedComplete) feedComplete.classList.add('active');
      if (feedProgressBar) feedProgressBar.style.width = '100%';
    }

    if (feedReplayBtn) {
      feedReplayBtn.addEventListener('click', () => {
        if (feedGameArea) feedGameArea.style.display = 'block';
        if (feedComplete) feedComplete.classList.remove('active');
        initFeedGame();
      });
    }

    initFeedGame();
  }

  // ==========================================
  // MODULE: Matching Pairs Game
  // ==========================================
  const pairsBoard = document.getElementById('pairs-board');
  const pairsComplete = document.getElementById('pairs-complete');
  const pairsReplayBtn = document.getElementById('pairs-replay-btn');

  if (pairsBoard && typeof vocabulary !== 'undefined') {
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let pairsFound = 0;

    function flipCard() {
      if (lockBoard) return;
      if (this === firstCard) return;

      this.classList.add('flipped');

      if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
      }

      secondCard = this;
      checkForMatch();
    }

    function checkForMatch() {
      let isMatch = firstCard.dataset.word === secondCard.dataset.word;

      if (isMatch) {
        disableCards();
        pairsFound++;
        const numPairs = Math.min(12, vocabulary.length);
        if (pairsFound === numPairs) {
          setTimeout(() => {
            pairsBoard.style.display = 'none';
            if (pairsComplete) pairsComplete.style.display = 'flex';
          }, 800);
        }
      } else {
        unflipCards();
      }
    }

    function disableCards() {
      firstCard.removeEventListener('click', flipCard);
      secondCard.removeEventListener('click', flipCard);
      firstCard.classList.add('matched');
      secondCard.classList.add('matched');
      resetBoard();
    }

    function unflipCards() {
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
      }, 1000);
    }

    function resetBoard() {
      [hasFlippedCard, lockBoard] = [false, false];
      [firstCard, secondCard] = [null, null];
    }

    function initPairsGame() {
      pairsBoard.innerHTML = '';
      if (pairsComplete) pairsComplete.style.display = 'none';
      pairsBoard.style.display = 'grid';
      pairsFound = 0;
      hasFlippedCard = false;
      lockBoard = false;
      firstCard = null;
      secondCard = null;

      const numPairs = Math.min(12, vocabulary.length);
      const gameItems = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, numPairs);
      let cards = [];
      gameItems.forEach(item => {
        // Use item.num for numbers scenario, item.emoji otherwise
        const emojiDisplay = item.num
          ? `<div class="pairs-emoji" style="font-size: 4rem; margin: 0; font-family: var(--font-display); color: var(--green-dark);">${item.num}</div>`
          : `<div class="pairs-emoji" style="font-size: 4rem; margin: 0;">${item.emoji}</div>`;
        cards.push({ word: item.word, display: emojiDisplay });
        cards.push({ word: item.word, display: `<div class="pairs-word" style="font-size: 1.8rem; margin: 0;">${item.word}</div>` });
      });
      cards = cards.sort(() => 0.5 - Math.random());

      cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('pairs-card');
        card.dataset.word = item.word;
        card.innerHTML = `
          <div class="pairs-card-inner">
            <div class="pairs-front">${index + 1}</div>
            <div class="pairs-back" style="flex-direction: column; justify-content: center;">${item.display}</div>
          </div>
        `;
        card.addEventListener('click', flipCard);
        pairsBoard.appendChild(card);
      });
    }

    if (pairsReplayBtn) {
      pairsReplayBtn.addEventListener('click', initPairsGame);
    }

    initPairsGame();
  }

});
