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
// Mirrors Python's number_to_text function structure
function numberToTextJS(n, spaces = true) {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < MIN_SUPPORT || n >= MAX_SUPPORT) {
        return "Virhe: Numeron täytyy olla positiivinen kokonaisluku ja pienempi kuin 10^18.";
    }

    if (n === 0) {
        return "nolla";
    }

    let result_parts = []; // Store parts of the number text, will be joined later
    const processingStack = [n]; // Stack to manage number parts to process

    // Memoize sorted_power_values as it doesn't change
    const sorted_power_values = Object.keys(powers_of_ten).map(Number).sort((a, b) => b - a); // Sort descending to find max_power easily

    while (processingStack.length > 0) {
        let current_n = processingStack.shift(); // Process from left (largest part first) - like a queue here

        if (current_n < 1000) {
            result_parts.push(_prefix(current_n));
        } else {
            let max_power = 0;
            // Find the largest power of ten that fits into current_n
            for (const power_val of sorted_power_values) { // Iterate from largest (triljoona) down
                if (power_val <= current_n) {
                    max_power = power_val;
                    break; 
                }
            }

            const count_of_max_power = Math.floor(current_n / max_power); // e.g., 2 for 2 million
            const remainder_after_max_power = current_n % max_power; // e.g., 345678 for 12345678

            let current_segment = "";
            if (count_of_max_power === 1) {
                current_segment = powers_of_ten[max_power]; // "miljoona", "tuhat"
            } else {
                let prefix_for_power = _prefix(count_of_max_power); // "kaksi"
                
                // Python's specific space addition for exact multiples like "kaksi miljoonaa "
                // `if spaces and remainder_after_max_power == 0 and current_n > 999999 and max_power != 1000 : prefix_for_power += " "`
                if (spaces && remainder_after_max_power === 0 && current_n > 999999 && max_power !== 1000) {
                    prefix_for_power += " "; 
                }

                let affix = "a"; // Default for "miljoonaa", "miljardiaa"
                if (max_power === 1000) { // "tuhatta"
                    affix = "ta";
                }
                current_segment = prefix_for_power + powers_of_ten[max_power] + affix;
            }
            result_parts.push(current_segment);

            if (remainder_after_max_power > 0) {
                processingStack.push(remainder_after_max_power); // Add remainder for further processing
            }
        }
    }

    // Join the parts with spaces if required
    return result_parts.join(spaces ? " " : "").trim();
}

// Event listener setup
document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('numberInput');
    const convertButton = document.getElementById('convertButton');
    const resultDiv = document.getElementById('result');

    if (convertButton && numberInput && resultDiv) {
        convertButton.addEventListener('click', () => {
            const inputValue = numberInput.value.trim();

            if (inputValue === "") {
                resultDiv.textContent = ""; // Clear result if input is empty
                return;
            }

            // Validate input: must be a string representing a non-negative integer.
            // Python version handles positive integers; 0 is "nolla".
            if (!/^\d+$/.test(inputValue)) { // Allows only digits, no negative sign here based on MIN_SUPPORT=0
                 resultDiv.textContent = "Virhe: Syötä positiivinen kokonaisluku (esim. 123).";
                 return;
            }

            const number = parseInt(inputValue, 10);

            // Check if parseInt failed (e.g. for extremely large strings not fitting JS int limits before MAX_SUPPORT)
            // or if the number is outside the supported range of numberToTextJS.
            if (isNaN(number)) { // Should not happen if regex passed, but as a safeguard
                 resultDiv.textContent = "Virhe: Syötetty arvo ei ole kelvollinen numero.";
                 return;
            }
            
            // Call the conversion function (which has its own range validation)
            const finnishText = numberToTextJS(number, true); // Default to spaces = true
            resultDiv.textContent = finnishText;
        });
    } else {
        console.error("Error: One or more HTML elements (numberInput, convertButton, result) not found.");
        if(resultDiv) resultDiv.textContent = "Virhe: Sivun tarvittavia osia ei löytynyt.";
    }
});
