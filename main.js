/**
 * Main Application - Orchestrates game and UI
 */
class PokerApp {
    constructor() {
        this.game = new Game();
        this.ui = new UI();
        this.isPlayerTurn = false;
        this.gameActive = false;
        
        this.setupEventListeners();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Game control buttons
        this.ui.startGameBtn.addEventListener('click', () => this.startNewGame());
        this.ui.nextRoundBtn.addEventListener('click', () => this.nextRound());

        // Player action buttons
        this.ui.foldBtn.addEventListener('click', () => this.handleFold());
        this.ui.checkBtn.addEventListener('click', () => this.handleCheck());
        this.ui.callBtn.addEventListener('click', () => this.handleCall());
        this.ui.raiseBtn.addEventListener('click', () => this.handleRaise());
        this.ui.allInBtn.addEventListener('click', () => this.handleAllIn());
        this.ui.submitBetBtn.addEventListener('click', () => this.handleSubmitBet());

        // Bet input enter key
        this.ui.betAmountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmitBet();
            }
        });
    }

    /**
     * Start a new game
     */
    startNewGame() {
        this.game.initializeGame(['You', 'AI 1', 'AI 2', 'AI 3']);
        this.ui.resetGame();
        this.nextRound();
    }

    /**
     * Start next round
     */
    nextRound() {
        if (!this.game.startNewRound()) {
            this.ui.displayMessage('Game over! Not enough players remaining.', 'error');
            this.ui.showGameOver([]);
            return;
        }

        this.gameActive = true;
        this.updateUI();
        this.processGameRound();
    }

    /**
     * Process entire game round
     */
    async processGameRound() {
        while (this.gameActive && this.game.gameState !== 'showdown') {
            const currentPlayer = this.game.getCurrentPlayer();

            if (!currentPlayer) {
                this.game.endBettingRound();
                this.updateUI();
                continue;
            }

            if (currentPlayer.isAI) {
                // AI turn
                await this.processAITurn(currentPlayer);
            } else {
                // Human player turn
                this.ui.displayMessage(`Your turn! Max bet: $${this.game.getMaxBetThisRound()}`, 'info');
                this.ui.updateActionButtons(this.game);
                this.isPlayerTurn = true;
                return; // Wait for player input
            }

            this.updateUI();
        }

        // Handle showdown
        if (this.game.gameState === 'showdown') {
            this.handleShowdown();
        }
    }

    /**
     * Process AI player turn
     */
    async processAITurn(aiPlayer) {
        // Simple AI logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for realism

        const maxBet = this.game.getMaxBetThisRound();
        const difference = maxBet - aiPlayer.currentBet;

        // 50% chance to fold if needs to call
        if (difference > 0 && Math.random() < 0.3) {
            this.game.playerFold();
            this.ui.displayMessage(`${aiPlayer.name} folded.`, 'info');
        }
        // Call
        else if (difference > 0) {
            this.game.playerCall();
            this.ui.displayMessage(`${aiPlayer.name} called $${difference}.`, 'info');
        }
        // Check
        else {
            this.game.playerCheck();
            this.ui.displayMessage(`${aiPlayer.name} checked.`, 'info');
        }
    }

    /**
     * Handle showdown
     */
    handleShowdown() {
        const results = this.game.evaluateHands();
        this.game.distributeWinnings(results.winners);
        
        this.ui.displayMessage(
            `${results.winners.map(w => w.name).join(' & ')} wins!`,
            'success'
        );
        
        this.ui.nextRoundBtn.style.display = 'inline-block';
        this.gameActive = false;
        this.ui.setActionButtonsEnabled(false);
        this.updateUI();
    }

    /**
     * Handle player fold
     */
    handleFold() {
        if (!this.isPlayerTurn) return;
        
        this.game.playerFold();
        this.ui.displayMessage('You folded.', 'warning');
        this.isPlayerTurn = false;
        this.continueGameRound();
    }

    /**
     * Handle player check
     */
    handleCheck() {
        if (!this.isPlayerTurn) return;
        
        const maxBet = this.game.getMaxBetThisRound();
        const player = this.game.getCurrentPlayer();

        if (player.currentBet !== maxBet) {
            this.ui.displayMessage('You cannot check with an outstanding bet!', 'error');
            return;
        }

        this.game.playerCheck();
        this.ui.displayMessage('You checked.', 'info');
        this.isPlayerTurn = false;
        this.continueGameRound();
    }

    /**
     * Handle player call
     */
    handleCall() {
        if (!this.isPlayerTurn) return;
        
        const maxBet = this.game.getMaxBetThisRound();
        const player = this.game.getCurrentPlayer();
        const callAmount = maxBet - player.currentBet;

        this.game.playerCall();
        this.ui.displayMessage(`You called $${callAmount}.`, 'info');
        this.isPlayerTurn = false;
        this.continueGameRound();
    }

    /**
     * Handle player raise
     */
    handleRaise() {
        if (!this.isPlayerTurn) return;
        
        const raiseAmountStr = this.ui.betAmountInput.value;
        if (!raiseAmountStr || isNaN(raiseAmountStr)) {
            this.ui.displayMessage('Enter a valid raise amount!', 'error');
            return;
        }

        const raiseAmount = parseInt(raiseAmountStr);
        const player = this.game.getCurrentPlayer();
        const maxBet = this.game.getMaxBetThisRound();
        const totalRaise = maxBet + raiseAmount;

        if (!player.canBet(totalRaise - player.currentBet)) {
            this.ui.displayMessage('Insufficient chips!', 'error');
            return;
        }

        if (this.game.playerRaise(raiseAmount, maxBet)) {
            this.ui.displayMessage(`You raised by $${raiseAmount}.`, 'info');
            this.ui.betAmountInput.value = '';
            this.isPlayerTurn = false;
            this.continueGameRound();
        } else {
            this.ui.displayMessage('Invalid raise!', 'error');
        }
    }

    /**
     * Handle player all in
     */
    handleAllIn() {
        if (!this.isPlayerTurn) return;
        
        const player = this.game.getCurrentPlayer();
        const chips = player.chips;

        this.game.playerAllIn();
        this.ui.displayMessage(`You went all in with $${chips}!`, 'warning');
        this.isPlayerTurn = false;
        this.continueGameRound();
    }

    /**
     * Handle custom bet submission
     */
    handleSubmitBet() {
        if (!this.isPlayerTurn) return;
        
        const betAmount = parseInt(this.ui.betAmountInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            this.ui.displayMessage('Enter a valid bet amount!', 'error');
            return;
        }

        const player = this.game.getCurrentPlayer();
        if (betAmount > player.chips) {
            this.ui.displayMessage('Insufficient chips!', 'error');
            return;
        }

        // Treat as a raise if there's already a bet
        const maxBet = this.game.getMaxBetThisRound();
        if (betAmount <= maxBet) {
            this.ui.displayMessage('Bet must be higher than current bet!', 'error');
            return;
        }

        const raiseAmount = betAmount - maxBet;
        if (this.game.playerRaise(raiseAmount, maxBet)) {
            this.ui.displayMessage(`You raised by $${raiseAmount}.`, 'info');
            this.ui.betAmountInput.value = '';
            this.isPlayerTurn = false;
            this.continueGameRound();
        }
    }

    /**
     * Continue game round after player action
     */
    async continueGameRound() {
        this.updateUI();
        await this.processGameRound();
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        const state = this.game.getGameState();
        
        this.ui.renderCommunityCards(this.game.communityCards);
        this.ui.renderPlayers(this.game.players, this.game.currentPlayerIndex);
        this.ui.updatePot(this.game.pot);
        this.ui.updateRoundStage(this.game.gameState);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pokerApp = new PokerApp();
});