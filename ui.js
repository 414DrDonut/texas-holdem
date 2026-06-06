/**
 * UI Manager - Handles all UI updates and interactions
 * PREMIUM EDITION: Professional poker interface with enhanced visuals
 */
class UI {
    constructor() {
        this.messageBox = document.getElementById('messageBox');
        this.communityCardsContainer = document.getElementById('communityCards');
        this.playersContainer = document.getElementById('playersContainer');
        this.potAmount = document.getElementById('potAmount');
        this.roundStage = document.getElementById('roundStage');
        this.roundCounter = document.getElementById('roundCounter');
        this.timerDisplay = document.getElementById('timerDisplay');
        
        this.playerActions = document.getElementById('playerActions');
        this.betControl = document.getElementById('betControl');
        this.gameStart = document.getElementById('gameStart');
        
        this.startGameBtn = document.getElementById('startGameBtn');
        this.nextRoundBtn = document.getElementById('nextRoundBtn');
        
        this.foldBtn = document.getElementById('foldBtn');
        this.checkBtn = document.getElementById('checkBtn');
        this.callBtn = document.getElementById('callBtn');
        this.raiseBtn = document.getElementById('raiseBtn');
        this.allInBtn = document.getElementById('allInBtn');
        this.submitBetBtn = document.getElementById('submitBetBtn');
        this.betAmountInput = document.getElementById('betAmount');
        
        this.statsPanel = document.getElementById('statsPanel');
    }

    /**
     * Display a message
     */
    displayMessage(message, type = 'info') {
        this.messageBox.textContent = message;
        this.messageBox.className = 'message-box';
        
        if (type === 'error') {
            this.messageBox.classList.add('error');
        } else if (type === 'success') {
            this.messageBox.classList.add('success');
        } else if (type === 'warning') {
            this.messageBox.classList.add('warning');
        }
    }

    /**
     * Render community cards
     */
    renderCommunityCards(communityCards) {
        const container = document.getElementById('communityCards');
        container.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < communityCards.length) {
                const card = communityCards[i];
                const cardElement = this.createCardElement(card, false, false);
                cardElement.style.animation = `cardFlip 0.6s ease-out ${i * 0.1}s`;
                container.appendChild(cardElement);
            } else {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'card-slot empty';
                container.appendChild(emptySlot);
            }
        }
    }

    /**
     * Render player seats
     */
    renderPlayers(players, currentPlayerIndex, isPlayerYou = false) {
        this.playersContainer.innerHTML = '';
        
        players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player-seat';
            
            if (index === currentPlayerIndex && !player.isFolded && player.isActive) {
                playerElement.classList.add('active');
            }
            
            if (player.isFolded) {
                playerElement.classList.add('folded');
            }
            
            if (player.isAllIn) {
                playerElement.classList.add('all-in');
            }

            // Only show own cards to player, hide opponent cards
            const isCurrentPlayer = (index === 0);
            const holeCards = player.getHoleCards();
            const holeCardsHTML = holeCards.map((card, cardIndex) => 
                this.createCardElement(card, true, !isCurrentPlayer, cardIndex).outerHTML
            ).join('');

            const statusText = player.getStatus();
            const positionBadge = player.position ? `<div class="player-position">${this.getPositionLabel(player.position)}</div>` : '';
            const winRate = player.winRate ? `<div class="player-win-rate">Win: ${player.winRate}%</div>` : '';

            playerElement.innerHTML = `
                <div class="player-avatar">${this.getPlayerAvatar(player.name)}</div>
                <div class="player-name">${player.name}</div>
                ${positionBadge}
                <div class="player-info">
                    <div class="player-info-item">
                        <span class="player-info-label">Stack</span>
                        <span class="player-info-value">$${player.chips}</span>
                    </div>
                    <div class="player-info-item">
                        <span class="player-info-label">Bet</span>
                        <span class="player-info-value">$${player.totalBet}</span>
                    </div>
                </div>
                <div class="player-hand">${holeCardsHTML}</div>
                ${winRate}
                <div class="player-status">${statusText}</div>
            `;

            this.playersContainer.appendChild(playerElement);
        });
    }

    /**
     * Get player avatar emoji
     */
    getPlayerAvatar(name) {
        const avatars = {
            'You': '🎰',
            'AI 1': '🤖',
            'AI 2': '🦾',
            'AI 3': '🎲'
        };
        return avatars[name] || '👤';
    }

    /**
     * Get human-readable position label
     */
    getPositionLabel(position) {
        const labels = {
            'dealer': '🎰 DEALER',
            'small_blind': 'SB',
            'big_blind': 'BB'
        };
        return labels[position] || position;
    }

    /**
     * Create a card HTML element
     */
    createCardElement(card, isHoleCard = false, showBack = false, cardIndex = 0) {
        const cardDiv = document.createElement('div');
        const isRed = card.suit === '♥' || card.suit === '♦';
        cardDiv.className = `card ${isRed ? 'red' : 'black'}`;
        
        if (showBack) {
            // Card back design
            cardDiv.classList.add('card-back');
            cardDiv.style.background = 'linear-gradient(135deg, #1a3a7a 0%, #2d5fa3 50%, #1a3a7a 100%)';
            cardDiv.style.border = '2px solid #d4af37';
            cardDiv.style.cursor = 'default';
            cardDiv.innerHTML = `<div class="card-back-pattern">🎴</div>`;
        } else {
            // Face-up card
            const rankDisplay = card.rank;
            const suitDisplay = card.suit;
            const color = isRed ? '#e74c3c' : '#000';
            
            cardDiv.style.color = color;
            cardDiv.innerHTML = `
                <div class="card-corner top-left">
                    <span style="font-size: 0.7em;">${rankDisplay}</span>
                    <span style="font-size: 0.9em;">${suitDisplay}</span>
                </div>
                <span style="font-size: 2em;">${suitDisplay}</span>
                <div class="card-corner bottom-right">
                    <span style="font-size: 0.9em;">${suitDisplay}</span>
                    <span style="font-size: 0.7em;">${rankDisplay}</span>
                </div>
            `;
        }

        return cardDiv;
    }

    /**
     * Update pot display
     */
    updatePot(potAmount) {
        this.potAmount.textContent = `$${potAmount.toLocaleString()}`;
    }

    /**
     * Update round counter
     */
    updateRoundCounter(roundNumber) {
        if (this.roundCounter) {
            this.roundCounter.textContent = `Round ${roundNumber}`;
        }
    }

    /**
     * Update round stage display
     */
    updateRoundStage(stage) {
        const stageNames = {
            'pre-flop': '🎴 PRE-FLOP',
            'flop': '🎴 FLOP',
            'turn': '🎴 TURN',
            'river': '🎴 RIVER',
            'showdown': '🏆 SHOWDOWN'
        };
        this.roundStage.textContent = stageNames[stage] || stage;
    }

    /**
     * Enable/disable action buttons
     */
    setActionButtonsEnabled(enabled) {
        this.foldBtn.disabled = !enabled;
        this.checkBtn.disabled = !enabled;
        this.callBtn.disabled = !enabled;
        this.raiseBtn.disabled = !enabled;
        this.allInBtn.disabled = !enabled;
    }

    /**
     * Update action buttons based on game state
     */
    updateActionButtons(game) {
        const player = game.getCurrentPlayer();
        const maxBet = game.getMaxBetThisRound();
        
        if (!player || game.gameState === 'showdown' || !player.isActive) {
            this.setActionButtonsEnabled(false);
            return;
        }

        this.setActionButtonsEnabled(true);

        // Update button texts and labels
        if (player.currentBet === maxBet) {
            this.checkBtn.disabled = false;
            this.callBtn.disabled = true;
        } else {
            this.checkBtn.disabled = true;
            this.callBtn.disabled = false;
            const callAmount = maxBet - player.currentBet;
            this.callBtn.textContent = `CALL $${callAmount}`;
        }

        // Update raise button
        const raiseAmount = maxBet - player.currentBet + game.minBet;
        if (player.chips > raiseAmount) {
            this.raiseBtn.disabled = false;
        } else {
            this.raiseBtn.disabled = true;
        }
    }

    /**
     * Reset UI for new game
     */
    resetGame() {
        this.displayMessage('💰 Welcome to Premium Poker! Game starting...', 'success');
        this.renderCommunityCards([]);
        this.betAmountInput.value = '';
        this.setActionButtonsEnabled(false);
        this.startGameBtn.style.display = 'none';
        this.nextRoundBtn.style.display = 'none';
    }

    /**
     * Show game over screen
     */
    showGameOver(winners) {
        let winnerNames = winners.map(w => w.name).join(', ');
        this.displayMessage(`🎉 GAME OVER - Winner(s): ${winnerNames}!`, 'success');
        this.setActionButtonsEnabled(false);
        this.startGameBtn.style.display = 'inline-block';
        this.startGameBtn.textContent = '🎰 NEW GAME';
    }

    /**
     * Show showdown results
     */
    showShowdownResults(results) {
        const winnerNames = results.winners.map(w => w.name).join(' & ');
        const pot = results.pot || 0;
        let message = `🏆 ${winnerNames} WINS $${pot.toLocaleString()}!`;
        
        if (results.bestHand) {
            message += ` (${results.bestHand.type})`;
        }
        
        this.displayMessage(message, 'success');
        this.nextRoundBtn.style.display = 'inline-block';
    }

    /**
     * Update statistics panel
     */
    updateStats(players, currentPlayerIndex) {
        if (!this.statsPanel) return;
        
        const player = players[currentPlayerIndex];
        if (!player) return;
        
        const totalHandsPlayed = player.handsPlayed || 0;
        const handsWon = player.handsWon || 0;
        const winRate = totalHandsPlayed > 0 ? Math.round((handsWon / totalHandsPlayed) * 100) : 0;
        
        this.statsPanel.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Hands Played:</span>
                <span class="stat-value">${totalHandsPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Hands Won:</span>
                <span class="stat-value">${handsWon}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Win Rate:</span>
                <span class="stat-value">${winRate}%</span>
            </div>
        `;
    }
}
