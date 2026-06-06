/**
 * Player Class - Represents a player in Texas Hold'em
 */
class Player {
    constructor(name, startingChips = 1000, isAI = false) {
        this.name = name;
        this.chips = startingChips;
        this.hand = []; // Hole cards
        this.currentBet = 0;
        this.totalBet = 0;
        this.isActive = true; // Still in the game
        this.isFolded = false;
        this.isAllIn = false;
        this.isAI = isAI;
        this.position = null; // 'dealer', 'small_blind', 'big_blind', or null
        this.lastAction = null; // 'fold', 'check', 'call', 'raise', 'all_in', etc.
    }

    /**
     * Add cards to player's hand
     */
    addCards(cards) {
        this.hand = this.hand.concat(cards);
    }

    /**
     * Get hole cards (first 2 cards dealt)
     */
    getHoleCards() {
        return this.hand.slice(0, 2);
    }

    /**
     * Set hole cards
     */
    setHoleCards(cards) {
        this.hand = cards;
    }

    /**
     * Place a bet
     */
    placeBet(amount) {
        const actualBet = Math.min(amount, this.chips);
        this.chips -= actualBet;
        this.currentBet += actualBet;
        this.totalBet += actualBet;
        
        if (this.chips === 0) {
            this.isAllIn = true;
        }
        
        return actualBet;
    }

    /**
     * Check if player can bet
     */
    canBet(amount) {
        return amount <= this.chips && amount > 0;
    }

    /**
     * Fold the hand
     */
    fold() {
        this.isFolded = true;
        this.isActive = false;
        this.lastAction = 'fold';
    }

    /**
     * Check (no bet)
     */
    check() {
        this.lastAction = 'check';
    }

    /**
     * Call a bet
     */
    call(callAmount) {
        const amountNeeded = callAmount - this.currentBet;
        const amountToPay = Math.min(amountNeeded, this.chips);
        this.placeBet(amountToPay);
        this.lastAction = 'call';
    }

    /**
     * Raise a bet
     */
    raise(raiseAmount, minBet = 0) {
        const totalRaise = raiseAmount + minBet;
        if (this.chips >= (totalRaise - this.currentBet)) {
            this.placeBet(totalRaise - this.currentBet);
            this.lastAction = 'raise';
            return true;
        }
        return false;
    }

    /**
     * Go all in
     */
    allIn() {
        this.placeBet(this.chips);
        this.isAllIn = true;
        this.lastAction = 'all_in';
    }

    /**
     * Reset for new round
     */
    resetForNewRound() {
        this.hand = [];
        this.currentBet = 0;
        this.totalBet = 0;
        this.isFolded = false;
        this.isAllIn = false;
        this.lastAction = null;
        this.isActive = this.chips > 0;
    }

    /**
     * Get player status
     */
    getStatus() {
        if (this.isFolded) return 'Folded';
        if (this.isAllIn) return 'All In';
        return 'Active';
    }

    /**
     * Get all info as object
     */
    getInfo() {
        return {
            name: this.name,
            chips: this.chips,
            currentBet: this.currentBet,
            totalBet: this.totalBet,
            isActive: this.isActive,
            isFolded: this.isFolded,
            isAllIn: this.isAllIn,
            hand: this.hand,
            position: this.position,
            lastAction: this.lastAction,
            status: this.getStatus()
        };
    }
}