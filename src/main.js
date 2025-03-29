const words = []
let randomIndex
let targetWord
let guessedLetters
let gameActive = false
let score = 0
let timeRemaining = 300
let timeout

async function loadDictionary(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el diccionario desde ${filePath}: ${response.status}`);
        }
        const text = await response.text();
        const lines = text.trim().split('\n');
        const cleanedWords = lines.map(line => {
            const parts = line.split(','); // Divide la línea por la coma
            if (parts.length > 1) {
                const firstPart = parts[0].trim(); // Toma la primera parte y elimina espacios
                // Eliminar acentos y otros caracteres no deseados (opcional, pero recomendado)
                return firstPart.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-ZñÑ\s]/g, '');
            }
            return ''; // Si la línea está vacía o no tiene coma, devuelve una cadena vacía
        }).filter(word => word !== '' && /^[a-zA-ZñÑ]+$/.test(word)); // Filtra cadenas vacías y no alfabéticas

        return cleanedWords;
    } catch (error) {
        console.error("Error al cargar el diccionario:", error);
        return []; // Devuelve un array vacío en caso de error
    }
}

async function initializeGame() {
    const dictionaryPath = '/dics/diccionario.txt'; // Ruta al archivo de diccionario
    const loadedWords = await loadDictionary(dictionaryPath);
    if (loadedWords.length > 0) {
        words.push(...loadedWords); // Agrega las palabras cargadas al array 'words'
        startGame(); // Inicia el juego solo si se cargaron palabras
        console.log('Palabras cargadas')
    } else {
        console.error("No se cargaron palabras del diccionario. El juego no puede iniciar.");
        // Aquí podrías mostrar un mensaje al usuario indicando el problema
    }
}
console.log(words)

function startGame() {
    randomIndex = Math.floor(Math.random() * words.length);
    targetWord = words[randomIndex];
    guessedLetters = new Array(targetWord.length).fill('_');

    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.textContent = guessedLetters.join(' ');

    const messageElement = document.getElementById('message');
    messageElement.textContent = '';

    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Tiempo restante: ${getFormattedTime(timeRemaining)}`;

    const scoreElement = document.getElementById('scoreValue');
    scoreElement.textContent = score.toString();

    gameActive = true
    console.log(targetWord)
    console.log(wordDisplay)
    console.log(guessedLetters)
    enableInput()
    disableRestartButton()
    startTimer()
   
}

function checkGuess() {
    if (!gameActive) {
        return;
    }

    const guessInput = document.getElementById('guessInput');
    const guess = guessInput.value.toLowerCase();
    guessInput.value = '';

    let correctGuess = false;
    for (let i = 0; i < targetWord.length; i++) {
        if (targetWord[i] === guess) {
          guessedLetters[i] = guess;
          correctGuess = true;
         
        }
    }

    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.textContent = guessedLetters.join(' ');

    if (guessedLetters.join('') === targetWord) {
        score++;
        const scoreElement = document.getElementById('scoreValue');
        scoreElement.textContent = score.toString();
        showResult(`¡Correcto! Has adivinado la palabra: ${targetWord}`);
        timeRemaining = 300

        if (words.length > 1) {
          words.splice(randomIndex, 1);
          targetWord = words[randomIndex];
          guessedLetters = new Array(targetWord.length).fill('_');
          wordDisplay.textContent = guessedLetters.join(' ');
        } else {
          gameActive = false;
          enableRestartButton();
        }
    }   else if (correctGuess) {
        showResult('Correcto!')
    }   else {
        showResult('Quizas la próxima')
    }
    console.log(targetWord)
    console.log(wordDisplay)
    console.log(guessedLetters)
    guessInput.value = ''
}

function showResult(message) {
    const messageElement = document.getElementById('message')
    messageElement.textContent = message
}

function startTimer() {
    const timerElement = document.getElementById('timer');

    timeout = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 60) {
        document.getElementById('timer').classList.toggle('run')
     }

      if (timeRemaining <= 0) {
        clearInterval(timeout);
        showResult('¡Has perdido! Se acabó el tiempo.');
        gameActive = false;
        revealWord();
        enableRestartButton();
        document.getElementById('timer').classList.add('run')
        document.getElementById('guessButton').classList.toggle('unableButton')
      }

      timerElement.textContent = `Tiempo restante: ${getFormattedTime(timeRemaining)}`;
    }, 1000); // 1 segundo (1000 ms)
}

function enableInput() {
    const guessInput = document.getElementById('guessInput')
    guessInput.disabled = false
    guessInput.focus()

     // Agregar el event listener para la tecla Enter
     guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita el comportamiento predeterminado del Enter en formularios
            checkGuess(); // Llama a la función para verificar la adivinanza
        }
    });
}

function restartGame() {
    clearInterval(timeout)
    timeRemaining = 300;
    score = 0
    words.splice(0)
    words.push(words)
    startGame()
    document.getElementById('guessButton').classList.toggle('unableButton')
}

function revealWord() {
    const wordDisplay = document.getElementById('wordDisplay');
    wordDisplay.textContent = targetWord;
}

function enableRestartButton() {
    const restartButton = document.getElementById('restartButton');
    if (restartButton.disabled) {
        restartButton.disabled = false;
        restartButton.classList.toggle('unableButton')
    }
}

function disableRestartButton() {
    const restartButton = document.getElementById('restartButton');
    restartButton.disabled = true;
    restartButton.classList.toggle('unableButton')
}

function getFormattedTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}
window.onload = initializeGame