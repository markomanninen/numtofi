// Constants for number conversion
const MIN_SUPPORT = 0;
const MAX_SUPPORT = 10**18; // 1 followed by 18 zeros (quintillion)

// Finnish number words
const one_to_ten = [
    '',        // 0 - handled as 'nolla' or empty in constructs
    'yksi',    // 1
    'kaksi',   // 2
    'kolme',   // 3
    'neljä',   // 4
    'viisi',   // 5
    'kuusi',   // 6
    'seitsemän',// 7
    'kahdeksan',// 8
    'yhdeksän',// 9
    'kymmenen' // 10
];

const powers_of_ten = {
    100: 'sata',
    1000: 'tuhat',
    1000000: 'miljoona',
    1000000000: 'miljardi',
    1000000000000: 'biljoona',
    1000000000000000: 'triljoona'
};

// Helper function to convert parts of numbers to text (handles < 1000)
// Mirrors Python's _prefix function
function _prefix(n) {
    if (n < 0 || n >= 1000) return ""; // Should be called with 0-999

    if (n < 11) { // 0-10
        return one_to_ten[n];
    } else if (n < 20) { // 11-19
        return one_to_ten[n - 10] + 'toista';
    } else if (n < 100) { // 20-99
        const tens = Math.floor(n / 10);
        const ones = n % 10;
        // Ensure "kymmentä" is followed by "yksi" etc. correctly, not "kymmentä" if ones is 0.
        return one_to_ten[tens] + 'kymmentä' + (ones > 0 ? one_to_ten[ones] : '');
    } else { // 100-999
        const hundreds = Math.floor(n / 100);
        const remainder = n % 100; // This is the part after "sata" or "X sataa"
        let prefix_str = "";
        if (hundreds === 1) { // 100-199
            prefix_str = 'sata';
        } else { // 200-999
            prefix_str = one_to_ten[hundreds] + 'sataa';
        }
        // Append the rest of the number (e.g., for 123, _prefix(23) is appended to "sata")
        if (remainder > 0) {
            prefix_str += _prefix(remainder); 
        }
        return prefix_str;
    }
}

// Main function to convert number to Finnish text
// Refactored to align with Python's iterative logic
function numberToTextJS(n, spaces = true) {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < MIN_SUPPORT || n >= MAX_SUPPORT) {
        // This error message is for the function's contract, validateAndConvert handles user-facing messages.
        return "Virhe: Internal - Numeron täytyy olla positiivinen kokonaisluku ja pienempi kuin 10^18.";
    }

    if (n === 0) {
        return "nolla";
    }

    let result = "";
    const processingStack = [n]; // Use as a LIFO stack

    // Sort powers_of_ten keys numerically in ascending order to find max_power correctly
    const sorted_power_keys = Object.keys(powers_of_ten).map(Number).sort((a, b) => a - b);

    while (processingStack.length > 0) {
        let current_n = processingStack.pop(); // LIFO
        
        if (current_n === 0 && n !== 0) { // Skip processing for zero remainders that don't add to text
            continue; 
        }

        let segment_text = ""; // Text for current_n
        let remainder_after_max_power = 0; // Store remainder from this iteration if current_n >= 1000

        if (current_n < 1000) {
            segment_text = _prefix(current_n);
            // No remainder_after_max_power for numbers < 1000 in this context
        } else {
            let max_power = 0;
            for (const key_val of sorted_power_keys) {
                if (key_val <= current_n) {
                    max_power = key_val;
                } else {
                    break; 
                }
            }

            const count_of_max_power = Math.floor(current_n / max_power);
            remainder_after_max_power = current_n % max_power; 

            if (count_of_max_power === 1) {
                // "yksi" prefix for larger powers like "miljoona", "miljardi", etc.
                // but not for "sata" or "tuhat", to match test case "yksitriljoona..."
                if (max_power === 100 || max_power === 1000) {
                    segment_text = powers_of_ten[max_power];
                } else { 
                    segment_text = _prefix(1) + powers_of_ten[max_power]; // e.g. "yksi" + "miljoona"
                }
            } else { // count_of_max_power > 1
                let prefix_val = _prefix(count_of_max_power);
                
                // Crucial Python detail for spacing with exact multiples (e.g. "kaksi miljoonaa ")
                if (spaces && remainder_after_max_power === 0 && current_n > 999999 && max_power !== 1000) {
                    prefix_val += " "; 
                }

                let affix = "a"; // Default for partitive: "miljoonaa", "miljardiaa", "sataa"
                if (max_power === 1000) { // tuhat -> "tuhatta" (partitive)
                    affix = "ta";
                }
                segment_text = prefix_val + powers_of_ten[max_power] + affix;
            }
        }

        // Append the processed segment to the main result string
        if (segment_text.length > 0) {
            if (result.length > 0 && spaces && !result.endsWith(" ")) { 
                result += " "; 
            }
            result += segment_text;
        }
        
        // Handle remainder and its specific spacing instruction (Refactoring points 4.1.2, 4.1.3, 4.2.4, 4.2.5)
        if (remainder_after_max_power > 0) {
            // "If remainder_after_max_power > 0 and spaces is true, append a space to result."
            // This space is added AFTER the current segment's text.
            if (spaces && result.length > 0 && !result.endsWith(" ")) {
                 // Check ensures space is meaningful (result has content and doesn't already end with a space from prefix_val)
                result += " ";
            }
            processingStack.push(remainder_after_max_power); // Push remainder AFTER adding the space to result.
        }
    }
    // Final trim as per instruction point 6.
    return result.trim(); 
}

// Event listener setup
document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const convertButton = document.getElementById('convertButton');
    const resultDiv = document.getElementById('result');

    if (!numberInput || !convertButton || !resultDiv) {
        console.error("Error: Essential HTML elements (numberInput, convertButton, or resultDiv) not found.");
        if(resultDiv) resultDiv.textContent = "Virhe: Sivun tarvittavia osia ei löytynyt."; // Attempt to show error on page
        return;
    }

    function validateAndConvert() {
        const inputValue = numberInput.value.trim();

        if (inputValue === "") {
            resultDiv.textContent = ""; // Clear result if input is empty
            return;
        }

        // Validate if the input is a non-negative integer string
        if (!/^\d+$/.test(inputValue)) {
            resultDiv.textContent = "Invalid input: Please enter a whole number.";
            return;
        }

        // Parse the string to an integer.
        // Using BigInt for parsing to correctly handle numbers up to MAX_SUPPORT before comparison.
        // Number() or parseInt() can lose precision for very large numbers.
        let number;
        try {
            number = BigInt(inputValue);
        } catch (e) {
            resultDiv.textContent = "Invalid input: Number is too large to parse.";
            return;
        }
        
        // Check if the number is within MIN_SUPPORT and MAX_SUPPORT
        // numberToTextJS expects a Number type, so we convert back after range check if valid.
        // MAX_SUPPORT is 10^18, so valid numbers are 0 to 10^18 - 1.
        if (number < MIN_SUPPORT || number >= BigInt(MAX_SUPPORT)) {
            const maxDisplay = (BigInt(MAX_SUPPORT) - BigInt(1)).toLocaleString('en-US'); // For "999,..."
            resultDiv.textContent = `Number out of range (${MIN_SUPPORT} - ${maxDisplay}).`;
            return;
        }

        // Convert BigInt to Number for numberToTextJS, as it's within safe integer limits now
        const numberAsJSNumber = Number(number);

        try {
            // Call the conversion function
            const finnishText = numberToTextJS(numberAsJSNumber, true); // Default to spaces = true
            resultDiv.textContent = finnishText;
        } catch (e) {
            // This might catch errors from numberToTextJS if any slip through primary validation
            console.error("Error during conversion:", e);
            resultDiv.textContent = "Error during conversion. Please check the number.";
        }
    }

    // Attach event listeners
    convertButton.addEventListener('click', validateAndConvert);
    numberInput.addEventListener('input', validateAndConvert);

});
