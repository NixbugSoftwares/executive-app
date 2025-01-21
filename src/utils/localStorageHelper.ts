import CryptoJS from 'crypto-js';
const SECRET_KEY = 'your-secret-key';


async function getItem(key: string): Promise<string | null> {
    try {
      const item = localStorage.getItem(key);
      return item; // Return the item directly
    } catch (error) {
      console.error('Error fetching data from localStorage:', error);
      return null; // Return null in case of error
    }
  }
  
  function storeItem(key: string, item: any): void {
    try {
      const itemString = JSON.stringify(item); // Serialize the item to a string
      localStorage.setItem(key, itemString); // Store the item in localStorage
    } catch (error) {
      console.error('Error storing data in localStorage:', error);
    }
  }
  



// **********************************Encrypt and store data in localStorage************************************************************
async function setEncryptedData(key: string, data: any): Promise<void> {
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString(); // Encrypt the data
      localStorage.setItem(key, encryptedData); // Store the encrypted data in localStorage
    } catch (error) {
      console.log('EncryptedStorage Error:', error);
    }
  }



//************************************************retrive data from EncryptedStorage****************************************************
async function getEncryptedData(key: string): Promise<any | null> {
  try {
    const encryptedData = localStorage.getItem(key); // Retrieve encrypted data from localStorage
    if (!encryptedData) return null;

    // Decrypt the data using CryptoJS
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8); // Convert decrypted bytes to string

    // If decryption is successful and the data is not empty, parse and return it
    return decryptedData ? JSON.parse(decryptedData) : null;
  } catch (error) {
    console.log('EncryptedStorage Error:', error);
    return null;
  }
}



//****************************************************Removing a value from local storage ***********************************************
async function removeStoredItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key); // Remove the item from localStorage
    } catch (error) {
      console.log('Error removing data from localStorage:', error);
    }
  }




//****************************** */ Clearing all previously saved values from localStorage******************************************************
async function clearStorage(): Promise<void> {
    try {
      localStorage.clear(); // Clears all items from localStorage
    } catch (error) {
      console.log('Error clearing localStorage:', error);
    }
  }
  


export default {
    setEncryptedData,
    getEncryptedData,
    removeStoredItem,
    clearStorage,
    getItem,
    storeItem
}
