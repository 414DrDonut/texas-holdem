/**
 * Hand Evaluator - Evaluates poker hands in Texas Hold'em
 */
class HandEvaluator {
    /**
     * Evaluate the best 5-card hand from 7 cards
     */
    static evaluateBestHand(holeCards, communityCards) {
        const allCards = holeCards.concat(communityCards);
        const combinations = this.getCombinations(allCards, 5);
        
        let bestHand = null;
        let bestRanking = null;

        for (let combo of combinations) {
            const ranking = this.rankHand(combo);
            if (bestRanking === null || this.compareRankings(ranking, bestRanking) > 0) {
                bestRanking = ranking;
                bestHand = combo;
            }
        }

        return { hand: bestHand, ranking: bestRanking };
    }

    /**
     * Get all combinations of n items from array
     */
    static getCombinations(array, n) {
        if (n === 1) {
            return array.map(item => [item]);
        }

        const combos = [];
        for (let i = 0; i <= array.length - n; i++) {
            const head = array[i];
            const tailtCombos = this.getCombinations(array.slice(i + 1), n - 1);
            for (let combo of tailtCombos) {
                combos.push([head, ...combo]);
            }
        }
        return combos;
    }

    /**
     * Rank a 5-card hand
     * Returns object with type and values for comparison
     */
    static rankHand(hand) {
        const sorted = hand.slice().sort((a, b) => b.rankValue - a.rankValue);
        
        const handType = this.getHandType(sorted);
        const values = sorted.map(card => card.rankValue);
        
        return {
            type: handType.type,
            typeRank: handType.rank,
            values: values
        };
    }

    /**
     * Determine the type of hand
     */
    static getHandType(sorted) {
        const isFlush = this.isFlush(sorted);
        const isStraight = this.isStraight(sorted);
        const pairs = this.getPairs(sorted);

        // Royal Flush (special case of straight flush)
        if (isFlush && isStraight) {
            if (sorted[0].rankValue === 14 && sorted[4].rankValue === 10) {
                return { type: 'Royal Flush', rank: 10 };
            }
            return { type: 'Straight Flush', rank: 9 };
        }

        // Four of a Kind
        if (pairs.fourOfAKind) {
            return { type: 'Four of a Kind', rank: 8 };
        }

        // Full House
        if (pairs.threeOfAKind && pairs.pair) {
            return { type: 'Full House', rank: 7 };
        }

        // Flush
        if (isFlush) {
            return { type: 'Flush', rank: 6 };
        }

        // Straight
        if (isStraight) {
            return { type: 'Straight', rank: 5 };
        }

        // Three of a Kind
        if (pairs.threeOfAKind) {
            return { type: 'Three of a Kind', rank: 4 };
        }

        // Two Pair
        if (pairs.twoPair) {
            return { type: 'Two Pair', rank: 3 };
        }

        // One Pair
        if (pairs.pair) {
            return { type: 'Pair', rank: 2 };
        }

        // High Card
        return { type: 'High Card', rank: 1 };
    }

    /**
     * Check if hand is a flush
     */
    static isFlush(sorted) {
        return sorted.every(card => card.suit === sorted[0].suit);
    }

    /**
     * Check if hand is a straight
     */
    static isStraight(sorted) {
        // Check normal straight
        if (sorted[0].rankValue - sorted[4].rankValue === 4) {
            return true;
        }

        // Check wheel (A-2-3-4-5)
        if (sorted[0].rankValue === 14 && sorted[1].rankValue === 5 && 
            sorted[2].rankValue === 4 && sorted[3].rankValue === 3 && 
            sorted[4].rankValue === 2) {
            return true;
        }

        return false;
    }

    /**
     * Get pair information
     */
    static getPairs(sorted) {
        const rankCounts = {};
        
        for (let card of sorted) {
            rankCounts[card.rankValue] = (rankCounts[card.rankValue] || 0) + 1;
        }

        const counts = Object.values(rankCounts).sort((a, b) => b - a);
        
        return {
            fourOfAKind: counts[0] === 4,
            threeOfAKind: counts[0] === 3,
            pair: counts[0] === 2,
            twoPair: counts[0] === 2 && counts[1] === 2
        };
    }

    /**
     * Compare two hand rankings
     * Returns: 1 if first is better, -1 if second is better, 0 if equal
     */
    static compareRankings(ranking1, ranking2) {
        if (ranking1.typeRank !== ranking2.typeRank) {
            return ranking1.typeRank > ranking2.typeRank ? 1 : -1;
        }

        // Same hand type, compare card values
        for (let i = 0; i < ranking1.values.length; i++) {
            if (ranking1.values[i] !== ranking2.values[i]) {
                return ranking1.values[i] > ranking2.values[i] ? 1 : -1;
            }
        }

        return 0; // Identical hands
    }

    /**
     * Determine winner(s) from multiple players
     */
    static determineWinners(players) {
        let bestRanking = null;
        const winners = [];

        for (let player of players) {
            if (player.isFolded) continue;

            const evaluation = this.evaluateBestHand(player.hand, players.communityCards || []);
            
            if (bestRanking === null) {
                bestRanking = evaluation.ranking;
                winners.push(player);
            } else {
                const comparison = this.compareRankings(evaluation.ranking, bestRanking);
                if (comparison > 0) {
                    bestRanking = evaluation.ranking;
                    winners = [player];
                } else if (comparison === 0) {
                    winners.push(player);
                }
            }
        }

        return winners;
    }
}