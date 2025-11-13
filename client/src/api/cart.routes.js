import axiosAuth from "../axios/axiosAuth";

/**
 *  Obține toate produsele din coșul unui user
 */
export const fetchCart = async (userId) => {
  try {
    const response = await axiosAuth.get(`cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return error.response?.data;
  }
};

/**
 *  Adaugă un produs în coș
 */
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await axiosAuth.post(`cart/${userId}`, {
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product to cart:", error);
    return error.response?.data;
  }
};

/**
 *  Actualizează cantitatea unui produs din coș
 */
export const updateCartItem = async (userId, cartItemId, quantity) => {
  try {
    const response = await axiosAuth.put(`cart/${userId}/${cartItemId}`, {
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    return error.response?.data;
  }
};

/**
 *  Șterge un produs din coș
 */
export const deleteCartItem = async (userId, cartItemId) => {
  try {
    const response = await axiosAuth.delete(`cart/${userId}/${cartItemId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return error.response?.data;
  }
};

/**
 *  Golește complet coșul
 */
export const clearCart = async (userId) => {
  try {
    const response = await axiosAuth.delete(`cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return error.response?.data;
  }
};
