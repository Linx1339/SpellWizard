let playerHP = 500;
let npcHP = 100;
let currentWord = '';
let usedLetters = []; // To track used letters
let selectedCells = []; // To track selected cells for valid word
let currentLevel = 1;
let playerplaylevel = 1;
let recentgameover = false;
let isFirstCellClicked = false;
let ordbokData = null; // Declare ordbokData globally

const resizeOps = () => {
    document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px");
};

resizeOps();
window.addEventListener("resize", resizeOps);


// localStorage.clear();
//localStorage.removeItem('gameState');
window.onload = () => {
    const savedOptions = JSON.parse(localStorage.getItem('gameOptions')) || { enemyBehavior: 'computer', difficultyLevel: 'easy', theme: 'light' };
    applyTheme(savedOptions.theme);
    localStorage.removeItem('ordbok');
    localStorage.removeItem('OrdbokDB');
    localStorage.removeItem('dictionary');
    removeOrdbok();
    //loadDictionary();
    //loadOrdbok();
    loadOptions();
    //localStorage.removeItem('recentWords');
    //loadRecentWords();
};

function initializeLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    const languageFlag = document.getElementById('languageFlag');
    
    // Load saved language or set default to EN
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'EN';
    languageSelect.value = savedLanguage;
    updateLanguageFlag(savedLanguage);
    updateTextContent(savedLanguage);

    // Add event listener for language change
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        localStorage.setItem('selectedLanguage', selectedLanguage);
        updateLanguageFlag(selectedLanguage);
        updateTextContent(selectedLanguage);
    });
}

function updateLanguageFlag(language) {
    const languageFlag = document.getElementById('languageFlag');
    languageFlag.textContent = language === 'EN' ? '🇬🇧' : '🇸🇪';
}

// Add this to your window.onload or initialization code
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSelector();
});

// Change language based on language chose (translate all text to swedish/english)
const translations = {
    EN: {
        continue: "Continue",
        newGame: "New Game",
        options: "Options",
        exit: "Exit",
        clear: "Clear",
        castSpell: "Cast Spell",
        menu: "Menu",
        title: "Spell Heroes"
        
    },
    SE: {
        continue: "Fortsätt",
        newGame: "Nytt Spel",
        options: "Inställningar",
        exit: "Avsluta",
        clear: "Rensa",
        castSpell: "Spela Ord",
        menu: "Meny",
        title: "Stavhjältar"
    }
};
function updateTextContent(language) {
    document.querySelector('h1').textContent = translations[language].title;
    document.querySelector('button[onclick="continueGame()"]').textContent = translations[language].continue;
    document.querySelector('button[onclick="startGame1st()"]').textContent = translations[language].newGame;
    document.querySelector('button[onclick="showOptions()"]').textContent = translations[language].options;
    document.querySelector('button[onclick="exitGame()"]').textContent = translations[language].exit;
    document.getElementById('clearSelectionButton').textContent = translations[language].clear;
    document.getElementById('castSpellButton').textContent = translations[language].castSpell;
    document.getElementById('openMenuButton').textContent = translations[language].menu;
}



function startGame1st() {
    // Reset the game state
    currentLevel = 1;
    playerHP = 500;
    npcHP = 100;
    currentWord = '';
    usedLetters = [];
    selectedCells = [];
    gameBoard = [];
    resetGameBoard();
    updateHP();
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    //localStorage.removeItem('gameState'); // Reset the save state
    console.log('Game state removed'); // Debugging log
    document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
    document.getElementById('wordDisplay').textContent = currentWord;
    recentgameover = false;
    // Save options for the first time, else the npc doesn't know what to do (if no options has ever been set before)
    const enemyBehavior = document.getElementById('enemyBehavior').value;
    const difficultyLevel = document.getElementById('difficultyLevel').value;
    const theme = document.getElementById('theme').value;
    const options = { enemyBehavior, difficultyLevel, theme};
    // Save options to localStorage (or use a file if running in a server environment)
    localStorage.setItem('gameOptions', JSON.stringify(options));
}

// Function to start a new game
function startGame() {
    // Reset the game state
    currentWord = '';
    usedLetters = [];
    selectedCells = [];
    gameBoard = [];
    resetGameBoard();
    updateHP();
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    //localStorage.removeItem('gameState'); // Reset the save state
    console.log('Game state removed'); // Debugging log
    document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
    document.getElementById('wordDisplay').textContent = currentWord;
    recentgameover = false;
}

// Reset Game Board (Generate random letters for 7x7 grid)
function resetGameBoard() {
    const language = localStorage.getItem('selectedLanguage') || 'EN';
    gameBoard = [];
    for (let row = 0; row < 7; row++) {
        let rowArray = [];
        for (let col = 0; col < 7; col++) {
            rowArray.push(getRandomLetter(language));
        }
        gameBoard.push(rowArray);
    }
    renderGameBoard();
}

// Add this after the global variables
const ENGLISH_LETTER_WEIGHTS = {
    'E': 12,
    'A': 8,
    'T': 7.5,
    'O': 7.5,
    'I': 6.5,
    'N': 6.5,
    'R': 6.5,
    'S': 5,
    'D': 4,
    'L': 3.5,
    'U': 3.5,
    'C': 3,
    'M': 3,
    'G': 2.5,
    'H': 2.5,
    'K': 2,
    'P': 2,
    'B': 2,
    'F': 2,
    'W': 2,
    'Y': 2,
    'X': 1.5,
    'Z': 1.5,
    'V': 1.5,
    'J': 1,
    'Q': 1
};

const SWEDISH_LETTER_WEIGHTS = {
    'A': 8,
    'R': 8,
    'S': 8,
    'T': 8,
    'E': 7,
    'N': 6,
    'D': 5,
    'I': 5,
    'L': 5,
    'O': 5,
    'G': 3,
    'K': 3,
    'M': 3,
    'U': 3,
    'H': 2,
    'F': 2,
    'V': 2,
    'Ä': 2,
    'B': 2,
    'P': 2,
    'Å': 2,
    'Ö': 2,
    'J': 2,
    'Y': 2,
    'C': 1,
    'X': 1,
    'Z': 1
};

// Replace the existing getRandomLetter function with this new one
function getRandomLetter(language) {
    const LETTER_WEIGHTS = language === 'SE' ? SWEDISH_LETTER_WEIGHTS : ENGLISH_LETTER_WEIGHTS;
    const totalWeight = Object.values(LETTER_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
        if (random < weight) {
            return letter;
        }
        random -= weight;
    }
    
    return 'E'; // Fallback to most common letter
}

// Render the Game Board
function renderGameBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = ''; // Clear the board before rendering
    const theme = document.body.className.split('-')[0];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell ' + theme + '-mode';
            cell.textContent = gameBoard[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.onclick = () => {
                const letter = cell.textContent.trim();
                const language = localStorage.getItem('selectedLanguage') || 'EN';
                if (currentWord.length === 0 && letter) {
                    if (language === 'SE') {
                        loadOrdbok(letter); // Load ordbok if language is set to SE
                    } else {
                        loadDictionary(); // Load dictionary if language is set to EN
                    }
                }
                handleLetterClick(row, col);
            };
            boardElement.appendChild(cell);
        }
    }
}
async function waitForDictionaryLoad(language, firstLetter) {
    const maxAttempts = 10;
    const delayMs = 100;
    
    for(let i = 0; i < maxAttempts; i++) {
        if (language === 'SE') {
            if (localStorage.getItem(`ordbok${firstLetter}`)) {
                return true;
            }
        } else {
            if (localStorage.getItem('dictionary')) {
                return true;
            }
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return false;
}
// Handle Letter Click (Player selecting letters for word)
async function handleLetterClick(row, col) {
    const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
    const theme = document.body.className.split('-')[0];

    if (cell.classList.contains('greyed-out')) {
        return;
    }

    if (usedLetters.some(l => l.row === row && l.col === col)) {
        return;
    }

    const letter = gameBoard[row][col];
    currentWord += letter;
    usedLetters.push({ row, col, letter });
    selectedCells.push({ row, col });

    document.getElementById('wordDisplay').textContent = currentWord;
    cell.classList.add('selected');

    // Wait for dictionary to load if this is the first letter
    if (currentWord.length === 1) {
        const language = localStorage.getItem('selectedLanguage') || 'EN';
        const loaded = await waitForDictionaryLoad(language, letter.toUpperCase());
        if (!loaded) {
            console.error('Failed to load dictionary/ordbok data');
            return;
        }
    }
    
    greyOutInvalidLetters();
}

// check all the current letters on the board
function countLettersOnBoard(gameBoard) {
    const letterCount = {};
    for (let row of gameBoard) {
        for (let letter of row) {
            if (letterCount[letter]) {
                letterCount[letter]++;
            } else {
                letterCount[letter] = 1;
            }
        }
    }
    console.log('Letter Count on Board:', letterCount); // Debug log
    return letterCount;
}
// check allwords that can be formed with the current letters on the board
function canFormWord(word, letterCount) {
    const wordLetterCount = {};
    for (let letter of word) {
        if (wordLetterCount[letter]) {
            wordLetterCount[letter]++;
        } else {
            wordLetterCount[letter] = 1;
        }
        if (wordLetterCount[letter] > (letterCount[letter] || 0)) {
            return false;
        }
    }
    return true;
}

//Grey out invalid letters that don't contribute to forming valid words
function greyOutInvalidLetters() {
    const language = localStorage.getItem('selectedLanguage') || 'EN';
    
    // Get dictionary based on first letter if it's the first click
    let dictionary;
    if (currentWord.length === 1) {
        const firstLetter = currentWord[0].toUpperCase();
        if (language === 'SE') {
            dictionary = JSON.parse(localStorage.getItem(`ordbok${firstLetter}`));
        } else {
            dictionary = JSON.parse(localStorage.getItem('dictionary'));
        }
    } else {
        dictionary = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(key => 
            key.startsWith(language === 'SE' ? 'ordbok' : 'dictionary'))));
    }

    console.log('Current dictionary:', dictionary); // Debug log
    
    if (!dictionary || dictionary.length === 0) {
        console.log('Dictionary is empty');
        return;
    }

    // Filter valid words and get valid next letters
    const validWords = dictionary.filter(word => word.startsWith(currentWord));
    console.log('Valid words for current:', validWords); // Debug log

    if (validWords.length === 0) {
        console.log('No valid words start with the current word:', currentWord);
        return;
    }

    const letterCount = countLettersOnBoard(gameBoard);
    const filteredValidWords = validWords.filter(word => canFormWord(word, letterCount));
    const validNextLetters = new Set(filteredValidWords.map(word => word[currentWord.length]));

    console.log('Letter count:', letterCount); // Debug log
    console.log('Filtered valid words:', filteredValidWords); // Debug log
    console.log('Valid next letters:', validNextLetters); // Debug log

    // Grey out invalid letters
    const theme = document.body.className.split('-')[0];
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const letter = gameBoard[row][col];
            const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
            
            // Skip already used letters
            if (usedLetters.some(l => l.row === row && l.col === col)) {
                continue;
            }

            // Grey out if letter is not valid next letter
            if (!validNextLetters.has(letter)) {
                cell.classList.add('greyed-out');
            }
        }
    }
}

function resetGreyedOutLetters() {
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
            if (!usedLetters.some(l => l.row === row && l.col === col)) {
                const theme = document.body.className.split('-')[0];
                cell.className = 'cell ' + theme + '-mode'; // Reset cell class to apply the correct theme
            }
        }
    }
}

// Cast Spell (Check if word is valid)
function castSpell() {
    playerplaylevel = currentLevel;
    if (currentWord.length >= 2) {
        checkWordValidity(currentWord).then(isValid => {
            if (isValid) {
                addWord(currentWord);
                const damage = calculateDamage(currentWord);
                npcHP -= damage;
                updateHP();
                if (npcHP <= 0) {
                    removeOrdbok();
                    localStorage.removeItem('dictionary');
                } else {
                    // Do nothing
                }
                setTimeout(() => {
                    clearSelectedLetters();
                    handlePostTurnAnimation(); // Animate the falling letters
                    resetGreyedOutLetters(); // Reset greyed out letters
                }, 500); // Small delay before clearing letters
            } else {
                alert(`${currentWord} is not a word!`);
                currentWord = ''; // Reset the word
                document.getElementById('wordDisplay').textContent = '';
                usedLetters = []; // Reset used letters
                resetSelectedCells();
                resetGreyedOutLetters(); // Reset greyed out letters
            }
        });
    }

}


// Check if the word is valid using the stored dictionary
async function checkWordValidity(word) {
    const language = localStorage.getItem('selectedLanguage') || 'EN';
    const dictionary = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(key => key.startsWith(language === 'SE' ? 'ordbok' : 'dictionary'))));
    return dictionary.includes(word.toUpperCase());
}

// Calculate the damage based on the word's letter values
function calculateDamage(word) {
    const language = localStorage.getItem('selectedLanguage') || 'EN';
    const letterValues = language === 'SE' ? { 
        A: 1, B: 4, C: 8, D: 1, E: 1, F: 3, G: 2, H: 2, I: 1, J: 7, K: 2, L: 1, M: 2, N: 1, O: 2, P: 4, R: 1, S: 1, T: 1, U: 4, V: 3, X: 8, Y: 7, Z: 10, Å: 4, Ä: 3, Ö: 4 
        } : { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };
    let wordValue = 0;
    for (let letter of word) {
        wordValue += letterValues[letter.toUpperCase()];
    }
    return wordValue * word.length; // Multiply by word length
}

// Update the HP values on the screen
// Function to update HP display
function updateHP() {
    document.getElementById('playerHP').textContent = `HP: ${playerHP}`;
    document.getElementById('npcHP').textContent = `HP: ${npcHP}`;
    setTimeout(() => {
        if (playerHP <= 0) {
            gameOver();
        } else if (npcHP <= 0) {
            victory();
        }
    }, 500);
}


// Function to clear the selected cells and reset the current word
function clearSelection() {
    // Reset the background color of all cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const theme = document.body.className.split('-')[0];
        cell.className = 'cell ' + theme + '-mode'; // Reset cell class to apply the correct theme
    });

    // Clear selected cells and current word
    selectedCells = [];
    currentWord = '';
    usedLetters = [];
    document.getElementById('wordDisplay').textContent = ''; // Clear the current word display
    
    // Reset first cell click flag
    isFirstCellClicked = false;

    removeDictionary();
    removeOrdbok();
}

// Clear selected letters after a valid word
function clearSelectedLetters() {
    selectedCells.forEach(({ row, col }) => {
        gameBoard[row][col] = ''; // Clear the letter from the game board
    });
    renderGameBoard(); // Re-render the game board to show cleared letters
    usedLetters = []; // Reset used letters for next turn
    resetSelectedCells();
}

// Reset background colors of the selected cells
function resetSelectedCells() {
    selectedCells.forEach(({ row, col }) => {
        const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('selected');
    });
    selectedCells = []; // Reset selected cells
}

function exitGame() {
    if (confirm('Are you sure you want to exit the game?')) {
        window.close();
    }
}

// Player Turn (Handle player's turn logic)
function playerTurn() {
    playerTurn = true; // Set the flag to indicate it's the player's turn


    // Function to handle the post-turn animation (move letters down and generate new ones)
    function handlePostTurnAnimation() {
        setTimeout(() => {
            // Generate new random letters for any empty cells in the top row
            for (let col = 0; col < 7; col++) {
                if (!gameBoard[0][col]) {
                    gameBoard[0][col] = getRandomLetter(); // Generate a new random letter for the empty cell
                }
            }

            // Perform the check 15 times to ensure all letters fall down
            for (let i = 0; i < 15; i++) {
                for (let col = 0; col < 7; col++) {
                    for (let row = 6; row >= 1; row--) {
                        if (!gameBoard[row][col]) {
                            // If the current cell is empty, move the letter from the row above
                            gameBoard[row][col] = gameBoard[row - 1][col];
                            gameBoard[row - 1][col] = ''; // Clear the cell above
                        }
                    }
                }
            }

            // Re-render the game board with updated letters
            renderGameBoard(); // Re-render the game board with the new letters

            // Reset current word and used letters for the next turn
            currentWord = ''; // Reset the word
            document.getElementById('wordDisplay').textContent = ''; // Clear the word display
            usedLetters = []; // Reset used letters
           enemyTurn();
        }, 1000); // Delay of 1 second before the animation
    }
}

// Function to handle the enemy's turn
function enemyTurn() {
    // Determine enemy behavior based on selected option
    const enemyBehavior = JSON.parse(localStorage.getItem('gameOptions')).enemyBehavior;
    // Determine difficulty level based on selected option
    const difficultyLevel = JSON.parse(localStorage.getItem('gameOptions')).difficultyLevel;
        let minWordLength, maxWordLength;
        let dmgmodifier;

        switch (difficultyLevel) {
            case 'easy':
            dmgmodifier = 8;
            break;
            case 'medium':
            dmgmodifier = 4;
            break;
            case 'hard':
            dmgmodifier = 2;
            break;
            default:
            dmgmodifier = 8;
        }

    if (!playerTurn || npcHP <= 0 || playerplaylevel != currentLevel) return; // Prevent enemy turn if NPC is dead
    //if (playerTurn = true) return;
    if (enemyBehavior === 'computer') {
        if (!playerTurn || npcHP <= 0) return; // Prevent enemy turn if NPC is dead
        const delay = Math.floor(Math.random() * 1000) + 1000; // Random delay between 1-2 seconds
        setTimeout(() => {
            if (!playerTurn || npcHP <= 0) return; // Prevent enemy turn if NPC is dead

            const action = Math.floor(Math.random() * 3); // Randomly choose action: 0 = row, 1 = column, 2 = both
            let damage = 0;
            let rowToDestroy = -1, colToDestroy = -1;

            
            if (action === 0 || action === 2) {
                // Destroy a random row
                rowToDestroy = Math.floor(Math.random() * 7);
                for (let col = 0; col < 7; col++) {
                    const cell = document.querySelector(`div[data-row="${rowToDestroy}"][data-col="${col}"]`);
                    // Change bg color of cell for enemynpc
                    const theme = document.body.className.split('-')[0];
                    cell.classList.add(`${theme}-mode`, 'enemyselected');
                }
            }

            if (action === 1 || action === 2) {
                // Destroy a random column
                colToDestroy = Math.floor(Math.random() * 7);
                for (let row = 0; row < 7; row++) {
                    const cell = document.querySelector(`div[data-row="${row}"][data-col="${colToDestroy}"]`);
                    // Change bg color of cell for enemynpc
                    const theme = document.body.className.split('-')[0];
                    cell.classList.add(`${theme}-mode`, 'enemyselected'); // Pastel red color
                }
            }

            setTimeout(() => {
                if (!playerTurn || npcHP <= 0) return; // Prevent enemy turn if NPC is dead

                if (rowToDestroy !== -1) {
                    // Destroy the previously selected row
                    for (let col = 0; col < 7; col++) {
                        damage += getLetterDamage(gameBoard[rowToDestroy][col]);
                        gameBoard[rowToDestroy][col] = ''; // Clear the cell
                    }
                }

                if (colToDestroy !== -1) {
                    // Destroy the previously selected column
                    for (let row = 0; row < 7; row++) {
                        damage += getLetterDamage(gameBoard[row][colToDestroy]);
                        gameBoard[row][colToDestroy] = ''; // Clear the cell
                    }
                }
                playerHP -= Math.floor(damage / dmgmodifier); // Deal damage based on difficulty level, x/8 for easy, x/4 for medium, x/2 for hard
                updateHP(); // Update the player's HP display
                renderGameBoard(); // Re-render the game board to show destroyed cells

                // Fill empty cells after the enemy's turn with a slight delay
                setTimeout(() => {
                    fillEmptyCells();

                    // Player gets another turn
                    currentWord = ''; // Reset the word
                    document.getElementById('wordDisplay').textContent = ''; // Clear the word display
                    usedLetters = []; // Reset used letters
                }, 500); // Delay before filling empty cells
            }, 1000); // Delay before destroying cells and dealing damage
            // Call player turn after the post-turn animation
            playerTurn();
        }, delay);
    } 
    if (enemyBehavior === 'player-like') {
        if (!playerTurn || npcHP <= 0) return; // Prevent enemy turn if NPC is dead
        const difficultyLevel = JSON.parse(localStorage.getItem('gameOptions')).difficultyLevel;
        let minWordLength, maxWordLength;

        switch (difficultyLevel) {
            case 'easy':
            minWordLength = 2;
            maxWordLength = 5;
            break;
            case 'medium':
            minWordLength = 3;
            maxWordLength = 7;
            break;
            case 'hard':
            minWordLength = 5;
            maxWordLength = 10; // Assuming 10 is the max word length for hard
            break;
            default:
            minWordLength = 2;
            maxWordLength = 5;
        }

        const randomWordLength = Math.floor(Math.random() * (maxWordLength - minWordLength + 1)) + minWordLength;

        const language = localStorage.getItem('selectedLanguage') || 'EN';
        const dictionary = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(key => key.startsWith(language === 'SE' ? 'ordbok' : 'dictionary'))));
        const validWords = dictionary.filter(word => word.length === randomWordLength);
        const possibleWords = validWords.filter(word => {
            let tempBoard = gameBoard.map(row => row.slice());
            for (let letter of word) {
            let found = false;
            for (let row = 0; row < 7; row++) {
                for (let col = 0; col < 7; col++) {
                if (tempBoard[row][col] === letter) {
                    tempBoard[row][col] = ''; // Mark this letter as used
                    found = true;
                    break;
                }
                }
                if (found) break;
            }
            if (!found) return false;
            }
            return true;
        });

        if (possibleWords.length === 0) {
            console.error('No valid words found on the current board');
            return;
        }

        const selectedWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
        const selectedLetters = [];

        for (let letter of selectedWord) {
            let found = false;
            while (!found) {
                const row = Math.floor(Math.random() * 7);
                const col = Math.floor(Math.random() * 7);
                if (gameBoard[row][col] === letter) {
                    selectedLetters.push({ row, col, letter });
                    gameBoard[row][col] = ''; // Mark this letter as used
                    found = true;
                }
            }
        }

        selectedLetters.forEach(({ row, col }, index) => {
            setTimeout(() => {
                const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                // Change bg color of cell for enemynpc
                const theme = document.body.className.split('-')[0];
                cell.classList.add(`${theme}-mode`, 'enemyselected');

                if (index === selectedLetters.length - 1) {
                    document.getElementById('wordDisplay').textContent = selectedWord; // Display the enemy's word
                    const damage = calculateDamage(selectedWord);
                    addWord(selectedWord);
                    playerHP -= damage;
                    updateHP();

                    setTimeout(() => {
                        selectedLetters.forEach(({ row, col }) => {
                            gameBoard[row][col] = ''; // Clear the letter from the game board
                        });
                        renderGameBoard(); // Re-render the game board to show cleared letters
                        fillEmptyCells(); // Fill empty cells after the enemy's turn
                        // Player gets another turn
                        currentWord = ''; // Reset the word
                        document.getElementById('wordDisplay').textContent = ''; // Clear the word display
                        usedLetters = []; // Reset used letters
                        removeOrdbok();
                        localStorage.removeItem('dictionary'); // remove the dictionary after the enemy's turn
                        playerTurn();
                    }, 2000); // Delay before clearing letters and giving control back to the player
                }
            }, index * 350); // Delay of 500ms between each letter
        });
    }
}

// Function to get the damage value of a letter
function getLetterDamage(letter) {
    if (!letter) return 0;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet.indexOf(letter) + 1; // Damage is based on the position of the letter in the alphabet
}

// Function to fill empty cells after the enemy's turn
function fillEmptyCells() {
    // Generate new random letters for any empty cells in the top row
    for (let col = 0; col < 7; col++) {
        if (!gameBoard[0][col]) {
            gameBoard[0][col] = getRandomLetter(); // Generate a new random letter for the empty cell
        }
    }

    // Perform the check 15 times to ensure all letters fall down
    for (let i = 0; i < 15; i++) {
        for (let col = 0; col < 7; col++) {
            for (let row = 6; row >= 1; row--) {
                if (!gameBoard[row][col]) {
                    // If the current cell is empty, move the letter from the row above
                    gameBoard[row][col] = gameBoard[row - 1][col];
                    gameBoard[row - 1][col] = ''; // Clear the cell above
                }
            }

            // Generate new random letters for any empty cells in the top row again
            for (let col = 0; col < 7; col++) {
                if (!gameBoard[0][col]) {
                    gameBoard[0][col] = getRandomLetter(); // Generate a new random letter for the empty cell
                }
            }
        }
    }

    // Re-render the game board with updated letters
    renderGameBoard(); // Re-render the game board with the new letters
}

// Function to handle the post-turn animation (move letters down and generate new ones)
function handlePostTurnAnimation() {
    setTimeout(() => {
        fillEmptyCells();

        // Reset current word and used letters for the next turn
        currentWord = ''; // Reset the word
        document.getElementById('wordDisplay').textContent = ''; // Clear the word display
        usedLetters = []; // Reset used letters

        // Call enemy turn after the player's turn
        enemyTurn();
    }, 1000); // Delay of 1 second before the animation
}

// Function to handle game over
function gameOver() {
    document.getElementById('finalLevel').innerText = currentLevel;
    localStorage.removeItem('gameState'); // Reset the save state
    console.log('Game state removed on game over'); // Debugging log
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'block';
    removeDictionary();
    removeOrdbok();
    recentgameover = true;
}

// Function to retry the game
function retryGame() {
    playerHP = 500;
    npcHP = 100;
    currentWord = '';
    usedLetters = [];
    selectedCells = [];
    document.getElementById('gameOverScreen').style.display = 'none';
    startGame();
}

// Function to handle victory
function victory() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('victoryScreen').style.display = 'block';
    document.getElementById('mainMenu').style.display = 'none';
    // make sure the enemy doesn't start upon entering the next level!
    removeDictionary();
    removeOrdbok();
    setTimeout(() => {
        if (npcHP <= 0) {
            playerTurn();
        } else {
            enemyTurn();
        }
    }, 100);
}
// Function to proceed to the next level
function nextLevel() {
    currentLevel++;
    npcHP = 100 + (currentLevel - 1) * 25; // Increase NPC HP with each level
    currentWord = '';
    usedLetters = [];
    selectedCells = [];
    document.getElementById('victoryScreen').style.display = 'none';

    // Heal the player every 5th level, up to a maximum of 500 HP
    if (currentLevel % 5 === 0) {
        playerHP = Math.min(playerHP + 100, 500);
    }

    startGame();
}

// Function to exit to the main menu
function exitToMainMenu() {
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('optionsScreen').style.display = 'none'; // Ensure options screen is hidden
    document.getElementById('mainMenu').style.display = 'block';
    if (recentgameover == false) {
        saveGameState();
    } else {
        // Do nothing
    }
    removeDictionary();
    removeOrdbok();
}

function exitToMainMenuFromOptions() {
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('optionsScreen').style.display = 'none'; // Ensure options screen is hidden
    document.getElementById('mainMenu').style.display = 'block';
    //saveGameState();
}




// Options Menu
// Show the options screen
function showOptions() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('optionsScreen').style.display = 'block';
    
    //loadOptions(); // Load the saved options
}

// Save the options to a file
function saveOptions() {
    const enemyBehavior = document.getElementById('enemyBehavior').value;
    const difficultyLevel = document.getElementById('difficultyLevel').value;
    const theme = document.getElementById('theme').value;
    const options = { enemyBehavior, difficultyLevel, theme };

    console.log('Saving options:', options); // Debugging line

    localStorage.setItem('gameOptions', JSON.stringify(options));

    applyTheme(theme);
    exitToMainMenuFromOptions(); // Go back to the main menu
}

// Load the options from a file
function loadOptions() {
    const savedOptions = JSON.parse(localStorage.getItem('gameOptions')) || { enemyBehavior: 'computer', difficultyLevel: 'easy', theme: 'light' };

    console.log('Loaded options:', savedOptions); // Debugging line

    document.getElementById('enemyBehavior').value = savedOptions.enemyBehavior;
    document.getElementById('difficultyLevel').value = savedOptions.difficultyLevel;
    document.getElementById('theme').value = savedOptions.theme;

    // Apply the theme immediately after loading options
    // applyTheme(savedOptions.theme); // Comment out to prevent theme from changing when loading options
}

// Apply the selected theme
function applyTheme(theme) {
    document.body.className = theme + '-mode';
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell ' + theme + '-mode';
    });
}




// Save the current game state
function saveGameState() {
    //document.getElementById('optionsScreen').style.display = 'none'; // prevents the options menu from showing when pressing back inside the options menu
    const gameState = {
        gameBoard,
        currentLevel,
        playerHP,
        npcHP,
        selectedCells,
        currentWord
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
    console.log('Game state saved:', gameState); // Debugging log
}

// Load the saved game state
function loadGameState() {
    const savedGameState = JSON.parse(localStorage.getItem('gameState'));
    if (savedGameState) {
        gameBoard = savedGameState.gameBoard;
        currentLevel = savedGameState.currentLevel;
        playerHP = savedGameState.playerHP;
        npcHP = savedGameState.npcHP;
        selectedCells = savedGameState.selectedCells;
        currentWord = savedGameState.currentWord;
        renderGameBoard();
        updateHP();
        document.getElementById('levelDisplay').textContent = `Level: ${currentLevel}`;
        document.getElementById('wordDisplay').textContent = currentWord;
        console.log('Game state loaded:', savedGameState); // Debugging log
    } else {
        alert('No current save state.');
    }
}

// Function to continue the game
function continueGame() {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
        loadGameState();
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('gameOverScreen').style.display = 'none';
    } else {
        alert('No current save state.');
    }
}

// Exit to the main menu and save the game state WHILE IN A GAME
function openMenu() {
    saveGameState();
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('mainMenu').style.display = 'block';
}


// ADD PLAYED WORDS TO ARRAY AND ALLOW FOR DISPLAY OF DEFINITION

let recentWords = [];

function addWord(word) {
    if (recentWords.length >= 8) {
        recentWords.shift(); // Remove the first word
    }
    recentWords.push(word); // Add the new word
    saveRecentWords(); // Save to localStorage
    console.log('Recent Words:', recentWords);
    displayRecentWords();
}

// Add these functions after recentWords array declaration
function saveRecentWords() {
    localStorage.setItem('recentWords', JSON.stringify(recentWords));
}

function loadRecentWords() {
    const savedWords = localStorage.getItem('recentWords');
    if (savedWords) {
        recentWords = JSON.parse(savedWords);
    }
}

async function fetchWordDetails(word) {
    const language = localStorage.getItem('selectedLanguage') || 'EN';
    let apiUrl;

    if (language === 'SE') {
        // apiUrl = `https://api.ord.se/ord/${word}`;
    } else {
        apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            return {
                word: word,
                meanings: [{ definitions: [{ definition: 'Definition not available' }] }]
            };
        }

        if (language === 'SE') {
            const data = await response.json();
            // Standardize Swedish API response to match English API format
            return {
                word: word,
                meanings: [{
                    definitions: [{
                        definition: data.meaning || 'Definition not available'
                    }]
                }]
            };
        } else {
            const data = await response.json();
            if (!Array.isArray(data) || !data[0]?.meanings) {
                return {
                    word: word,
                    meanings: [{ definitions: [{ definition: 'Definition not available' }] }]
                };
            }
            return data[0]; // Return first entry for English API
        }
    } catch (error) {
        console.error('Failed to fetch word details:', error);
        return {
            word: word,
            meanings: [{ definitions: [{ definition: 'Error fetching definition' }] }]
        };
    }
}

async function displayRecentWords() {
    loadRecentWords();
    const recentWordsContainer = document.getElementById('recentWordsContainer');
    recentWordsContainer.innerHTML = ''; // Clear previous content

    // Reverse the recentWords array to display the most recent word first
    const reversedWords = [...recentWords].reverse();

    for (const word of reversedWords) {
        const wordDetails = await fetchWordDetails(word);

        const wordElement = document.createElement('div');
        wordElement.classList.add('word-item');

        const wordTitle = document.createElement('h3');
        wordTitle.textContent = word;
        wordElement.appendChild(wordTitle);

        if (wordDetails) {
            const definitions = wordDetails.meanings[0].definitions.slice(0, 3); // Get up to 3 definitions
            definitions.forEach((definitionObj, index) => {
                const definition = document.createElement('p');
                definition.textContent = `Definition ${index + 1}: ${definitionObj.definition}`;
                wordElement.appendChild(definition);
            });
        } else {
            const definition = document.createElement('p');
            definition.textContent = '<No Definition Found / Error>';
            wordElement.appendChild(definition);
        }

        recentWordsContainer.appendChild(wordElement);
    }
}

// makes recent word screen always scroll to the top when opened
function showRecentWordsScreen() {
    displayRecentWords();
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('recentWordsScreen').style.display = 'block';
    document.getElementById('recentWordsContainer').scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('recentWordsButton').addEventListener('click', () => {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('recentWordsScreen').style.display = 'block';
    });

    document.getElementById('backButton').addEventListener('click', () => {
        console.log('Back button clicked'); // Debugging statement
        document.getElementById('recentWordsScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
    });
});

// Load the dictionary from the dictionary.txt file and store it in localStorage
function loadDictionary() {
    if (!localStorage.getItem('dictionary')) {
        try {
            localStorage.setItem('dictionary', JSON.stringify(dictionary));
        } catch (e) {
            console.error('Failed to save dictionary to localStorage:', e);
        }
    }
}

function loadOrdbok(letter) {
    if (!letter) {
        console.error('No letter provided to loadOrdbok');
        return;
    }

    letter = letter.toUpperCase();
    console.log(`Loading ordbok for letter: ${letter}`);

    // Create script element
    const script = document.createElement('script');
    script.src = `ordbok/ordbok-${letter}.js`;

    script.onload = () => {
        try {
            const ordbokData = window.ordboks[letter];
            if (ordbokData) {
                localStorage.setItem(`ordbok${letter}`, JSON.stringify(ordbokData));
                console.log(`Ordbok data for letter ${letter} loaded successfully`);
            } else {
                console.error(`No ordbok data found for letter ${letter}`);
            }
        } catch (e) {
            console.error(`Failed to save ordbok to localStorage for letter ${letter}:`, e);
        }
    };

    script.onerror = () => {
        console.error(`Failed to load ordbok file for letter ${letter}`);
    };

    document.head.appendChild(script);
}
function removeOrdbok() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ';
    for (const letter of letters) {
        localStorage.removeItem(`ordbok${letter}`);
    }
    console.log('All ordbok data removed from localStorage');
}

function removeDictionary() {
    localStorage.removeItem('dictionary');
}
