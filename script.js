// script.js

document.getElementById('cipherButton').addEventListener('click', function() {
    const inputText = document.getElementById('cipherInput').value;
    const outputText = caesarCipher(inputText, 3); // Shift by 3 (you can change this)
    document.getElementById('cipherOutput').textContent = outputText;
});

function caesarCipher(text, shift) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char.match(/[a-z]/i)) {
            const code = text.charCodeAt(i);
            let shiftedCode;
            if (char === char.toUpperCase()) {
                shiftedCode = ((code - 65 + shift) % 26 + 26) % 26 + 65; // Handle wrap-around for uppercase
            } else {
                shiftedCode = ((code - 97 + shift) % 26 + 26) % 26 + 97; // Handle wrap-around for lowercase
            }
            char = String.fromCharCode(shiftedCode);
        }
        result += char;
    }
    return result;
}
