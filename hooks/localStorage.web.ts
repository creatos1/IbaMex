
const useStorage = () => {
  const getItem = async (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  };

  const setItem = async (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error al guardar datos:', error);
      return false;
    }
  };

  const removeItem = async (key: string) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar datos:', error);
      return false;
    }
  };

  return { getItem, setItem, removeItem };
};

export default useStorage;
