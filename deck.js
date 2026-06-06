/**
 * Deck Class - Manages card deck for Texas Hold'em
 */
class Deck {
    constructor() {
        this.suits = ['♠', '♥', '♦', '♣'];
        this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cards = [];
        this.initialize();
    }

    /**
     * Initialize a fresh deck
     */
    initialize() {
        this.cards = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.cards.push({
                    rank: rank,
                    suit: suit,
                    rankValue: this.getRankValue(rank),
                    suitValue: this.getSuitValue(suit)
                });
            }
        }
        this.shuffle();
    }

    /**
     * Get numeric value for rank
     */
    getRankValue(rank) {
        const rankMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return rankMap[rank];
    }

    /**
     * Get numeric value for suit
     */
    getSuitValue(suit) {
        const suitMap = { '♠': 4, '♥': 3, '♦': 2, '♣': 1 };
        return suitMap[suit];
    }

    /**
     * Get suit color
     */
    getSuitColor(suit) {
        return (suit === '♥' || suit === '♦') ? 'red' : 'black';
    }

    /**
     * Get suit class for styling
     */
    getSuitClass(suit) {
        const suitMap = { '♠': 'spade', '♥': 'heart', '♦': 'diamond', '♣': 'club' };
        return suitMap[suit];
    }

    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Draw a single card from deck
     */
    drawCard() {
        if (this.cards.length === 0) {
            console.warn('Deck is empty, initializing new deck');
            this.initialize();
        }
        return this.cards.pop();
    }

    /**
     * Draw multiple cards
     */
    drawCards(count) {
        const drawnCards = [];
        for (let i = 0; i < count; i++) {
            drawnCards.push(this.drawCard());
        }
        return drawnCards;
    }

    /**
     * Get remaining cards count
     */
    getRemainingCards() {
        return this.cards.length;
    }

    /**
     * Reset deck
     */
    reset() {
        this.initialize();
    }

    /**
     * Convert card to display string
     */
    cardToString(card) {
        return `${card.rank}${card.suit}`;
    }

    /**
     * Get all cards in string format
     */
    getAllCardsString() {
        return this.cards.map(card => this.cardToString(card));
    }
}