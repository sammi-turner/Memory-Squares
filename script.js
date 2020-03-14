// dom elements
var $instructionsWrap = document.getElementById( 'instructions' );
var $instructions = document.getElementsByTagName( 'h3' )[0];
var $game = document.getElementById( 'game' );
var $info = document.getElementById( 'info' );
var $squares = document.getElementsByClassName( 'square' );
var $action = document.getElementById( 'action-btn' );

/*
 * status can be 
 * 'static' (game not started or over), 
 * 'sequence' (when the sequence is being played), 
 * 'playing' (when the player's turn starts), 
 * 'game over' (when player loses).
 */
var status = 'static';

/**
 * Adjusting squares height
 */
var squareWd = $squares[0].clientWidth;

for ( let i = 0; i < $squares.length; i++ ) {
    $squares[i].style.height = squareWd + 'px';
}

/**
 * 1. Run the game
 */
function gameOn() {
    // clear sequence interval, if still looping
    if ( play ) killSequencePlay();

    // update instructions
    $instructions.innerText = 'Watch and memorize the sequence.';

    // 2. create sequence 
    createSequence();
    // 3. play it on the grid
    playSequence();

    // restart clickCount for non-first games
    clickCount = 0;
}

/**
 * Sequence
 */
var beats = 9;
var seqLength = 4;
var currentSeq = [];
var intervalSpeed = 800;

/**
 * 2. Add random numbers to currentSeq
 */
function createSequence() {
    if ( currentSeq.length === 0 ) {
        // first round; create first sequence
        for ( let i = 0; i < seqLength; i++ ) {
            let rN = Math.floor(Math.random() * beats);
            currentSeq.push(rN);
        }
    } else {
        // sequence exists; add a random number to sequence
        let rN = Math.floor(Math.random() * beats);
        currentSeq.push(rN);
    }
}

/**
 * 3. start playing the sequence
 */
var play;

function playSequence() {
    status = 'sequence';
    let i = 0;
    play = setInterval( function(){
        if ( i < currentSeq.length ) {
            lightSquare( currentSeq[i] );
            i++;
        } else {
            killSequencePlay();
            status = 'playing';
        }
    }, intervalSpeed );
}

/**
 * 3b. toggle active class on squares to 'light' them
 */
function lightSquare( num ) {
    $squares[num].classList.add( 'active' );
    setTimeout( function(){ 
        $squares[num].classList.remove( 'active' ); 
    }, intervalSpeed * 0.8 );
}

/**
 * 3c. Stop the interval loop
 */
function killSequencePlay() {
    clearInterval( play );
    status = 'playing';
    $instructions.innerText = 'Now repeat the sequence.';
}

/**
 * 4. Update score
 */
var $score = document.getElementById( 'score-num' );

function updateScore( isCorrectSquare ) {
    if ( isCorrectSquare ) {
        $scoreStat = parseInt($score.innerText);
        $scoreStat++;
        $score.innerText = $scoreStat;
    } else {
        $score.innerText = 0;
    }
}

/**
 * 5. Update Level
 */
var $level = document.getElementById( 'level-num' );

function updateLevel( levelCleared ) {
    if ( levelCleared ) {
        $levelStat = parseInt($level.innerText);
        $levelStat++;
        $level.innerText = $levelStat;
    } else {
        $level.innerText = 1;
    }
}

/**
 * 6. Update best stats
 */
var $bestLevel = document.getElementById( 'best-level-num' );
var $bestScore = document.getElementById( 'best-score-num' );

function updateBests() {
    // level

    // get current best level, and new best level
    bestLevelStat = parseInt($bestLevel.innerText);
    newLevelStat = parseInt(document.getElementById('level-num').innerText);

    if ( newLevelStat > bestLevelStat ) $bestLevel.innerText = newLevelStat;
    
    // score
    bestScoreStat = parseInt($bestScore.innerText);
    newScoreStat = parseInt(document.getElementById('score-num').innerText);
    
    if ( newScoreStat > bestScoreStat ) $bestScore.innerText = newScoreStat;
}

/**
 * Player clicks a square
 */
// track how many squares have been clicked on this round
let clickCount = 0;

function handleSquareClick( e ) {
    // if square is clicked out of turn, do nothing
    if ( status !== 'playing' ) return false;

    // check which square was clicked and compare if it matches its place in sequence
    var thisId = e.target.id;
    if ( thisId === ('square-' + currentSeq[clickCount]) ) {
        // correct square was clicked

        // make square green for a few milliseconds
        e.target.classList.add('active');
        setTimeout( function(){
            e.target.classList.remove('active');
        }, intervalSpeed * 0.4 );

        // update instructions
        $instructions.innerText = 'Good';
        
        // add a point to score
        updateScore( true );

        // advance click count to keep up with sequence
        clickCount++;
        if ( clickCount == currentSeq.length ) {
            // the player was successful completing the sequence
            updateLevel( true );
            $instructions.innerText = 'Well done, level cleared!';
            gameOn();
        }
        
    } else {
        // wrong square was clicked

        // change square color
        e.target.classList.add('wrong');

        // show player correct square
        var $correction = document.getElementById( 'square-' + currentSeq[clickCount] );
        $correction.classList.add( 'correction' );
        
        // update game status
        status = 'game over';

        // change grid color to indicate game has stopped
        $game.classList.remove( 'playing' );
        $game.classList.add( 'game-over' );
        
        // update action button to prompt restart
        $action.classList.remove( 'game-on' );
        $action.innerText = 'PLAY AGAIN';
        
        // update instructions
        $instructions.innerText = 'Game Over!'
        
        // update high score stats
        updateBests();

        // empty the sequence
        currentSeq = [];
    }
}

// add event to every square
for ( let i = 0; i < $squares.length; i++ ) {
    $squares[i].addEventListener( 'mousedown', function(e){ handleSquareClick(e) });
}

/**
 * Click START
 */
$action.addEventListener( 'click', function(){
    // game status must be static, otherwise do nothing
    if ( status === 'sequence' || status === 'playing' ) return false;

    // update the status
    status = 'sequence';

    // make sure all squares are rid of the 'wrong' class after a game over
    for ( let i = 0; i < $squares.length; i++ ) {
        $squares[i].classList.remove( 'wrong' );
        $squares[i].classList.remove( 'correction' );
    }

    // update action button text and color
    this.innerText = 'GAME ON!';
    this.classList.add( 'game-on' );

    // update grid color; remove game-over class if restarting game
    $game.classList.remove( 'game-over' );
    $game.classList.add( 'playing' );

    // restart stats count
    updateLevel( false );
    updateScore( false );

    // 1. play the sequence
    gameOn();

    return false;
});


// player clicks start button
// sequence is created
// game goes to 'sequence' status
// sequence plays
// when sequence plays, game goes to 'playing' mode; listen for player click
// a square is clicked
    // if correct one is clicked
        // highlight square
        // add point
        // if square was last one in sequence
            // advance level
            // add number to sequence
            // run sequence again
    // else 
        // game goes to 'game over' status
        // sequence is reset
        // stats are reset