/**
 * Writes a value to localStorage.
 * @param {string} key - The key under which to store the value.
 * @param {*} value - The value to store. Will be stringified before storage.
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage', error);
    }
}

/**
 * Reads a value from localStorage.
 * @param {string} key - The key of the value to retrieve.
 * @returns {*} The parsed value if it exists and is valid JSON, otherwise null.
 */
export function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage', error);
        return null;
    }
}
