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

var squareWd = $squares[0].clientWidth;

for ( let i = 0; i < $squares.length; i++ ) {
    $squares[i].style.height = squareWd + 'px';
}

function gameOn() {
    if ( play ) killSequencePlay();
    $instructions.innerText = 'Watch and memorize the sequence.';
    createSequence();
    playSequence();
    clickCount = 0;
}

var beats = 9;
var seqLength = 4;
var currentSeq = [];
var intervalSpeed = 800;

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

function lightSquare( num ) {
    $squares[num].classList.add( 'active' );
    setTimeout( function(){ 
        $squares[num].classList.remove( 'active' ); 
    }, intervalSpeed * 0.8 );
}

function killSequencePlay() {
    clearInterval( play );
    status = 'playing';
    $instructions.innerText = 'Now repeat the sequence.';
}

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

var $bestLevel = document.getElementById( 'best-level-num' );
var $bestScore = document.getElementById( 'best-score-num' );

function updateBests() {
    bestLevelStat = parseInt($bestLevel.innerText);
    newLevelStat = parseInt(document.getElementById('level-num').innerText);
    if ( newLevelStat > bestLevelStat ) $bestLevel.innerText = newLevelStat;
    bestScoreStat = parseInt($bestScore.innerText);
    newScoreStat = parseInt(document.getElementById('score-num').innerText);
    if ( newScoreStat > bestScoreStat ) $bestScore.innerText = newScoreStat;
}

let clickCount = 0;

function handleSquareClick( e ) {
    if ( status !== 'playing' ) return false;
    var thisId = e.target.id;
    if ( thisId === ('square-' + currentSeq[clickCount]) ) {
        e.target.classList.add('active');
        setTimeout( function(){
            e.target.classList.remove('active');
        }, intervalSpeed * 0.4 );

        $instructions.innerText = 'Good';
        updateScore( true );

        clickCount++;
        if ( clickCount == currentSeq.length ) {
            // the player was successful completing the sequence
            updateLevel( true );
            $instructions.innerText = 'Well done, level cleared!';
            gameOn();
        }
        
    } else {
        e.target.classList.add('wrong');

        var $correction = document.getElementById( 'square-' + currentSeq[clickCount] );
        $correction.classList.add( 'correction' );

        status = 'game over';

        $game.classList.remove( 'playing' );
        $game.classList.add( 'game-over' );

        $action.classList.remove( 'game-on' );
        $action.innerText = 'PLAY AGAIN';

        $instructions.innerText = 'Game Over!'

        updateBests();

        currentSeq = [];
    }
}

for ( let i = 0; i < $squares.length; i++ ) {
    $squares[i].addEventListener( 'mousedown', function(e){ handleSquareClick(e) });
}

$action.addEventListener( 'click', function(){
    if ( status === 'sequence' || status === 'playing' ) return false;

    status = 'sequence';

    for ( let i = 0; i < $squares.length; i++ ) {
        $squares[i].classList.remove( 'wrong' );
        $squares[i].classList.remove( 'correction' );
    }

    this.innerText = 'GAME ON!';
    this.classList.add( 'game-on' );

    $game.classList.remove( 'game-over' );
    $game.classList.add( 'playing' );

    updateLevel( false );
    updateScore( false );

    gameOn();

    return false;
});
