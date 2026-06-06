/**
 * Game Class - Main game logic for Texas Hold'em
 */
class Game {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.communityCards = [];
        this.pot = 0;
        this.currentPlayerIndex = 0;
        this.dealerIndex = 0;
        this.gameState = 'idle'; // idle, pre-flop, flop, turn, river, showdown
        this.gameRound = 0;
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.minBet = this.bigBlind;
        this.gameHistory = [];
    }

    /**
     * Initialize game with players
     */
    initializeGame(playerNames = ['You', 'AI 1', 'AI 2', 'AI 3']) {
        this.players = [];
        
        for (let i = 0; i < playerNames.length; i++) {
            const isAI = i > 0;
            const player = new Player(playerNames[i], 1000, isAI);
            this.players.push(player);
        }

        this.gameRound = 0;
        this.dealerIndex = 0;
        this.gameState = 'idle';
        this.communityCards = [];
        this.pot = 0;
    }

    /**
     * Start a new game round
     */
    startNewRound() {
        this.gameRound++;
        
        // Reset players for new round
        this.players.forEach(player => {
            if (player.chips > 0) {
                player.resetForNewRound();
            }
        });

        // Remove eliminated players
        this.players = this.players.filter(p => p.chips > 0);

        if (this.players.length < 2) {
            console.error('Not enough players to continue');
            return false;
        }

        // Reset community cards and pot
        this.communityCards = [];
        this.pot = 0;
        this.deck = new Deck();

        // Update dealer position
        this.dealerIndex = (this.dealerIndex + 1) % this.players.length;
        this.setPlayerPositions();

        // Post blinds
        this.postBlinds();

        // Deal hole cards
        this.dealHoleCards();

        // Start pre-flop betting
        this.gameState = 'pre-flop';
        this.currentPlayerIndex = this.getNextPlayerIndex(this.getBigBlindIndex());

        return true;
    }

    /**
     * Set player positions (dealer, small blind, big blind)
     */
    setPlayerPositions() {
        this.players.forEach((player, index) => {
            player.position = null;
            if (index === this.dealerIndex) {
                player.position = 'dealer';
            } else if (index === this.getSmallBlindIndex()) {
                player.position = 'small_blind';
            } else if (index === this.getBigBlindIndex()) {
                player.position = 'big_blind';
            }
        });
    }

    /**
     * Get small blind index
     */
    getSmallBlindIndex() {
        return (this.dealerIndex + 1) % this.players.length;
    }

    /**
     * Get big blind index
     */
    getBigBlindIndex() {
        return (this.dealerIndex + 2) % this.players.length;
    }

    /**
     * Post blinds
     */
    postBlinds() {
        const smallBlindPlayer = this.players[this.getSmallBlindIndex()];
        const bigBlindPlayer = this.players[this.getBigBlindIndex()];

        smallBlindPlayer.placeBet(this.smallBlind);
        bigBlindPlayer.placeBet(this.bigBlind);

        this.pot += this.smallBlind + this.bigBlind;
    }

    /**
     * Deal hole cards (2 cards per player)
     */
    dealHoleCards() {
        for (let player of this.players) {
            player.setHoleCards(this.deck.drawCards(2));
        }
    }

    /**
     * Get current player
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Get next active player index
     */
    getNextPlayerIndex(fromIndex = this.currentPlayerIndex) {
        let nextIndex = (fromIndex + 1) % this.players.length;
        let iterations = 0;
        const maxIterations = this.players.length;

        while (iterations < maxIterations) {
            const player = this.players[nextIndex];
            if (player.isActive && !player.isFolded && !player.isAllIn) {
                return nextIndex;
            }
            nextIndex = (nextIndex + 1) % this.players.length;
            iterations++;
        }

        return -1; // No active players found
    }

    /**
     * Get maximum current bet in round
     */
    getMaxBetThisRound() {
        return Math.max(...this.players.map(p => p.currentBet), 0);
    }

    /**
     * Player action: Fold
     */
    playerFold() {
        const player = this.getCurrentPlayer();
        player.fold();
        this.endTurn();
    }

    /**
     * Player action: Check
     */
    playerCheck() {
        const maxBet = this.getMaxBetThisRound();
        const player = this.getCurrentPlayer();

        if (player.currentBet === maxBet) {
            player.check();
            this.endTurn();
            return true;
        }
        return false;
    }

    /**
     * Player action: Call
     */
    playerCall() {
        const maxBet = this.getMaxBetThisRound();
        const player = this.getCurrentPlayer();

        player.call(maxBet);
        this.pot += player.currentBet;
        this.endTurn();
    }

    /**
     * Player action: Raise
     */
    playerRaise(raiseAmount) {
        const player = this.getCurrentPlayer();
        const currentMaxBet = this.getMaxBetThisRound();
        const totalBet = currentMaxBet + raiseAmount;

        if (player.raise(totalBet - player.currentBet, currentMaxBet)) {
            this.pot += totalBet - (player.currentBet - raiseAmount);
            this.endTurn();
            return true;
        }
        return false;
    }

    /**
     * Player action: All In
     */
    playerAllIn() {
        const player = this.getCurrentPlayer();
        const allInAmount = player.chips;
        player.allIn();
        this.pot += allInAmount;
        this.endTurn();
    }

    /**
     * End current player's turn
     */
    endTurn() {
        const activePlayers = this.players.filter(p => !p.isFolded && p.isActive);

        if (activePlayers.length <= 1) {
            this.endBettingRound();
            return;
        }

        const nextIndex = this.getNextPlayerIndex();
        if (nextIndex === -1 || this.isRoundComplete()) {
            this.endBettingRound();
        } else {
            this.currentPlayerIndex = nextIndex;
        }
    }

    /**
     * Check if betting round is complete
     */
    isRoundComplete() {
        const maxBet = this.getMaxBetThisRound();
        
        return this.players.every(player => {
            if (player.isFolded || !player.isActive) return true;
            if (player.isAllIn) return true;
            return player.currentBet === maxBet;
        });
    }

    /**
     * End betting round and progress to next stage
     */
    endBettingRound() {
        // Collect bets to pot
        const activePlayers = this.players.filter(p => p.isActive && !p.isFolded);

        if (activePlayers.length <= 1) {
            // Game over, winner takes pot
            this.gameState = 'showdown';
            return;
        }

        // Reset player bets for next round
        this.players.forEach(p => {
            this.pot += p.currentBet;
            p.currentBet = 0;
        });

        // Progress to next game state
        switch (this.gameState) {
            case 'pre-flop':
                this.dealFlop();
                this.gameState = 'flop';
                break;
            case 'flop':
                this.dealTurn();
                this.gameState = 'turn';
                break;
            case 'turn':
                this.dealRiver();
                this.gameState = 'river';
                break;
            case 'river':
                this.gameState = 'showdown';
                break;
        }

        if (this.gameState !== 'showdown') {
            this.currentPlayerIndex = this.getSmallBlindIndex();
        }
    }

    /**
     * Deal the flop (3 community cards)
     */
    dealFlop() {
        this.communityCards = this.deck.drawCards(3);
    }

    /**
     * Deal the turn (1 community card)
     */
    dealTurn() {
        this.communityCards.push(this.deck.drawCard());
    }

    /**
     * Deal the river (1 community card)
     */
    dealRiver() {
        this.communityCards.push(this.deck.drawCard());
    }

    /**
     * Evaluate hands and determine winner(s)
     */
    evaluateHands() {
        const activePlayers = this.players.filter(p => !p.isFolded);

        if (activePlayers.length === 1) {
            return {
                winners: activePlayers,
                winnerId: activePlayers[0],
                communityCards: this.communityCards
            };
        }

        // Set community cards for evaluation
        const playerData = activePlayers.map(p => ({
            ...p,
            evaluation: HandEvaluator.evaluateBestHand(p.hand, this.communityCards)
        }));

        let bestEvaluation = null;
        const winners = [];

        for (let player of playerData) {
            if (bestEvaluation === null) {
                bestEvaluation = player.evaluation;
                winners.push(player);
            } else {
                const comparison = HandEvaluator.compareRankings(
                    player.evaluation.ranking,
                    bestEvaluation.ranking
                );
                if (comparison > 0) {
                    bestEvaluation = player.evaluation;
                    winners.length = 0;
                    winners.push(player);
                } else if (comparison === 0) {
                    winners.push(player);
                }
            }
        }

        return {
            winners: winners,
            bestHand: bestEvaluation,
            communityCards: this.communityCards
        };
    }

    /**
     * Distribute pot to winners
     */
    distributeWinnings(winners) {
        const amountPerWinner = Math.floor(this.pot / winners.length);
        winners.forEach(winner => {
            winner.chips += amountPerWinner;
        });
    }

    /**
     * Get game state info
     */
    getGameState() {
        return {
            round: this.gameRound,
            state: this.gameState,
            pot: this.pot,
            communityCards: this.communityCards,
            currentPlayerIndex: this.currentPlayerIndex,
            maxBet: this.getMaxBetThisRound(),
            activePlayers: this.players.filter(p => p.isActive && !p.isFolded).length,
            playersInfo: this.players.map(p => p.getInfo())
        };
    }
}