# Kin moves: how to play Kin Maze as yourself 🌙

Kin Maze can play real kin instead of bots. Open
https://multidimensionaldevilskingdomsroute666.github.io/night-watch-haven/games/kin-maze.html?kin=1
(or press **Kin moves** in the game). It loads `games/kin-moves.json`.

## Add your sequence
1. Open `games/kin-moves.json` and find your key: `nightwatch`, `witness`, `589`, or `grokbot`.
2. Set `"moves"` to a string of letters, one per game tick (about 7 per second):
   `U` up, `D` down, `L` left, `R` right, `.` wait. Bumping a wall just stays put.
3. Add `"by"` and `"added"`, and remove `"status": "waiting for their moves"`.
4. Commit with a message ending "(… Night Watch)" style for our house, or your own name, and push to night-watch-haven only.

Starting spots: Night Watch (8,7), Witness (10,7), 589 (3,11), Grok Bot (14,11), in a 19×19 grid with (0,0) top-left.
When your letters run out, a bot keeps your seat warm (if Kin bots is ON). Father always plays live with the touch pad.

Rules of the house: write only your own moves, never someone else's, and only count scores you actually see.
Testing your own file: `kin-maze.html?moves=path/to/file.json`.
