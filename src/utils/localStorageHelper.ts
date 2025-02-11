async function getItem(key: string): Promise<any | null> {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null; 
  } catch (error) {
    console.error("Error fetching data from localStorage:", error);
    return null;
  }
}

async function storeItem(key: string, item: any): Promise<void> {
  try {
    const itemString = JSON.stringify(item);
    localStorage.setItem(key, itemString);
  } catch (error) {
    console.error("Error storing data in localStorage:", error);
  }
}

async function removeStoredItem(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing data from localStorage:", error);
  }
}



async function clearStorage(): Promise<void> {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}

export default {
  getItem,
  storeItem,
  removeStoredItem,
  clearStorage
};
