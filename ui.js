/**
 * UI Manager - Handles all UI updates and interactions
 */
class UI {
    constructor() {
        this.messageBox = document.getElementById('messageBox');
        this.communityCardsContainer = document.getElementById('communityCards');
        this.playersContainer = document.getElementById('playersContainer');
        this.potAmount = document.getElementById('potAmount');
        this.roundStage = document.getElementById('roundStage');
        
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
                const cardElement = this.createCardElement(card, false);
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
    renderPlayers(players, currentPlayerIndex) {
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

            const holeCards = player.getHoleCards();
            const holeCardsHTML = holeCards.map(card => 
                this.createCardElement(card, true, true).outerHTML
            ).join('');

            const statusText = player.getStatus();
            const positionBadge = player.position ? `<div class="player-position">${this.getPositionLabel(player.position)}</div>` : '';

            playerElement.innerHTML = `
                <div class="player-name">${player.name}</div>
                ${positionBadge}
                <div class="player-info">
                    <div class="player-info-item">
                        <span class="player-info-label">Chips</span>
                        <span class="player-info-value">$${player.chips}</span>
                    </div>
                    <div class="player-info-item">
                        <span class="player-info-label">Bet</span>
                        <span class="player-info-value">$${player.totalBet}</span>
                    </div>
                </div>
                <div class="player-hand">${holeCardsHTML}</div>
                <div class="player-status">${statusText}</div>
            `;

            this.playersContainer.appendChild(playerElement);
        });
    }

    /**
     * Get human-readable position label
     */
    getPositionLabel(position) {
        const labels = {
            'dealer': '🎰 Dealer',
            'small_blind': 'SB',
            'big_blind': 'BB'
        };
        return labels[position] || position;
    }

    /**
     * Create a card HTML element
     */
    createCardElement(card, isClickable = false, showBack = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${card.suit === '♥' || card.suit === '♦' ? 'heart-diamond' : 'spade-club'}`;
        
        if (showBack) {
            cardDiv.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
            cardDiv.style.border = '2px solid #d4af37';
            cardDiv.style.cursor = 'pointer';
            cardDiv.textContent = '🂠';
            cardDiv.style.fontSize = '2em';
            cardDiv.style.color = '#d4af37';
            cardDiv.style.textShadow = '0 0 8px rgba(212, 175, 55, 0.6)';
        } else {
            const rankDisplay = card.rank;
            const suitDisplay = card.suit;
            const color = (card.suit === '♥' || card.suit === '♦') ? '#e74c3c' : '#000';
            
            cardDiv.style.color = color;
            cardDiv.innerHTML = `
                <span style="font-size: 0.7em;">${rankDisplay}</span>
                <span style="font-size: 1.5em;">${suitDisplay}</span>
                <span style="font-size: 0.7em;">${rankDisplay}</span>
            `;
        }

        return cardDiv;
    }

    /**
     * Update pot display
     */
    updatePot(potAmount) {
        this.potAmount.textContent = `$${potAmount}`;
    }

    /**
     * Update round stage display
     */
    updateRoundStage(stage) {
        const stageNames = {
            'pre-flop': '🎴 Pre-Flop',
            'flop': '🎴 Flop',
            'turn': '🎴 Turn',
            'river': '🎴 River',
            'showdown': '🏆 Showdown'
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
            this.callBtn.textContent = `Call $${callAmount}`;
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
        this.displayMessage('💰 Welcome to the Casino! Game starting...', 'success');
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
        this.displayMessage(`🎉 Game Over! Winner(s): ${winnerNames}!`, 'success');
        this.setActionButtonsEnabled(false);
        this.startGameBtn.style.display = 'inline-block';
        this.startGameBtn.textContent = '🎰 Play Again';
    }

    /**
     * Show showdown results
     */
    showShowdownResults(results) {
        const winnerNames = results.winners.map(w => w.name).join(' & ');
        const pot = results.pot || 0;
        let message = `🏆 ${winnerNames} wins $${pot}!`;
        
        if (results.bestHand) {
            message += ` (${results.bestHand.type})`;
        }
        
        this.displayMessage(message, 'success');
        this.nextRoundBtn.style.display = 'inline-block';
    }
}
