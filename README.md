# Texas Hold'em Poker Game

A complete web-based Texas Hold'em poker game built with vanilla JavaScript, HTML, and CSS. Play against AI opponents with full game mechanics including betting, hand evaluation, and pot distribution.

## Features

- **Full Texas Hold'em Rules**: Pre-flop, flop, turn, river, and showdown stages
- **AI Opponents**: Play against computer-controlled players with simple decision-making
- **Hand Evaluation**: Automatic hand ranking and winner determination (supports all poker hand types)
- **Blind System**: Small blind and big blind positions that rotate
- **Betting Mechanics**: Check, call, raise, fold, and all-in options
- **Pot Management**: Automatic pot tracking and distribution to winners
- **Responsive UI**: Dynamic player seat updates and game state displays
- **Game History**: Track rounds and chip stacks

## Game Rules

### Hand Rankings (Highest to Lowest)
1. Royal Flush - A-K-Q-J-10, same suit
2. Straight Flush - Five consecutive cards of same suit
3. Four of a Kind - Four cards of same rank
4. Full House - Three of a kind plus a pair
5. Flush - Five cards of same suit
6. Straight - Five consecutive cards
7. Three of a Kind - Three cards of same rank
8. Two Pair - Two different pairs
9. One Pair - Two cards of same rank
10. High Card - No other hand

### Game Flow
1. **Pre-Flop**: Deal 2 hole cards to each player, blinds posted, first betting round
2. **Flop**: Deal 3 community cards, betting round
3. **Turn**: Deal 1 community card, betting round
4. **River**: Deal 1 community card, final betting round
5. **Showdown**: Remaining players reveal hands, winner takes pot

### Positions
- **Dealer**: Button, last to act in most rounds
- **Small Blind**: Posts half the minimum bet
- **Big Blind**: Posts full minimum bet

## How to Play

1. Open `index.html` in your web browser
2. Click "Start New Game" to begin
3. You'll be dealt 2 hole cards (visible to you only)
4. Take actions based on your hand:
   - **Fold**: Leave the current hand
   - **Check**: Pass without betting (if no outstanding bet)
   - **Call**: Match the current bet
   - **Raise**: Increase the bet
   - **All In**: Bet all remaining chips
5. After each betting round, the next stage is revealed
6. After the river, remaining players' hands are evaluated
7. Winner takes the pot and advances to next round
8. Game continues until one player remains

## Project Structure

```
texas-holdem/
├── index.html          # Main HTML file
├── styles.css          # Game styling
├── deck.js            # Deck class and card management
├── player.js          # Player class and player logic
├── hand-evaluator.js  # Hand ranking and evaluation
├── game.js            # Core game logic
├── ui.js              # UI management and rendering
├── main.js            # Application orchestrator
└── README.md          # This file
```

## File Descriptions

### deck.js
- **Deck Class**: Manages the card deck
- Creates and shuffles standard 52-card deck
- Handles card drawing and deck reset
- Provides card properties (rank, suit, values)

### player.js
- **Player Class**: Represents individual players
- Manages player chips, hand, and position
- Tracks betting information (current bet, total bet)
- Handles player state (folded, all-in, active)

### hand-evaluator.js
- **HandEvaluator Class**: Evaluates and ranks poker hands
- Generates all 5-card combinations from 7 cards
- Ranks hands by type and high cards
- Determines winner(s) from multiple players

### game.js
- **Game Class**: Core game logic and state management
- Manages game flow through different rounds
- Handles betting actions and pot management
- Manages player positions and blind posting
- Controls game progression from deal to showdown

### ui.js
- **UI Class**: Handles all interface updates
- Renders community cards and player seats
- Manages button states and messages
- Updates game information displays

### main.js
- **PokerApp Class**: Orchestrates the application
- Connects UI interactions to game logic
- Manages AI player turns
- Controls game flow and round progression
- Handles player input validation

## Game Statistics

- **Starting Chips**: 1,000 per player
- **Small Blind**: 10
- **Big Blind**: 20
- **Players**: 1 human + 3 AI opponents
- **Max Rounds**: Until 1 player remains

## How to Extend

### Add More Players
Edit `main.js` line with `initializeGame()`:
```javascript
this.game.initializeGame(['You', 'AI 1', 'AI 2', 'AI 3', 'AI 4', 'AI 5']);
```

### Adjust Starting Chips
In `player.js` constructor:
```javascript
constructor(name, startingChips = 5000, isAI = false)
```

### Improve AI Strategy
Edit `processAITurn()` in `main.js` to add more complex decision logic based on:
- Hand strength
- Pot odds
- Position at table
- Opponent behavior

### Add Bet Limits
Modify `playerRaise()` in `game.js` to enforce:
- Minimum bet increments
- Maximum raise limits
- Table limits

## Browser Compatibility

- Chrome/Chromium
- Firefox
- Safari
- Edge
- Any modern browser with ES6 support

## Future Enhancements

- [ ] Save/load game state
- [ ] Multiplayer online support
- [ ] Advanced AI with hand history analysis
- [ ] Sound effects and animations
- [ ] Customizable table themes
- [ ] Tournament mode
- [ ] Hand statistics and replay
- [ ] Player profile system

## License

Open source - Feel free to modify and use!

## Credits

Built with vanilla JavaScript, HTML5, and CSS3. No external dependencies required!

---

**Ready to play? Open `index.html` in your browser and start playing!**