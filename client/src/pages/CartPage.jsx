import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  fetchCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
} from '../api/cart.routes'
import LoadingSpinner from '../components/LoadingSpinner'

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)

  useEffect(() => {
    const getCart = async () => {
      if (!user?.id) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        const response = await fetchCart(user.id)
        if (response?.success && Array.isArray(response.data)) {
          setCartItems(response.data)
        } else {
          setError('Failed to load cart items')
        }
      } catch (err) {
        console.error('Error fetching cart:', err)
        setError(err.message || 'An error occurred while fetching the cart')
      } finally {
        setLoading(false)
      }
    }

    getCart()
  }, [user, navigate])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      setUpdatingId(itemId)
      const response = await updateCartItem(user.id, itemId, Number(newQuantity))
      if (response?.success) {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: Number(newQuantity) } : item
          )
        )
        toast.success('Quantity updated successfully')
      } else {
        toast.error(response?.message || 'Failed to update quantity')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while updating quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Are you sure you want to remove this item?')) return

    try {
      const response = await deleteCartItem(user.id, itemId)
      if (response?.success) {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
        toast.success('Item removed successfully')
      } else {
        toast.error(response?.message || 'Failed to remove item')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while removing item')
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return

    try {
      const response = await clearCart(user.id)
      if (response?.success) {
        setCartItems([])
        toast.success('Cart cleared successfully')
      } else {
        toast.error(response?.message || 'Failed to clear cart')
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while clearing cart')
    }
  }

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * (item.product?.price || 0),
    0
  )

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Your cart is empty</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h2>
          <button
            onClick={handleClearCart}
            className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
          >
            Clear Cart
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4 px-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.image || 'https://via.placeholder.com/80'}
                  alt={item.product?.name || 'Product'}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.product?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{item.product?.category}</p>
                  <p className="text-sm text-gray-600">
                    Price: {item.product?.price} RON
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-16 border rounded-md p-1 text-center"
                  disabled={updatingId === item.id}
                />
                <p className="w-20 text-right font-semibold text-gray-800">
                  {(item.quantity * item.product.price).toFixed(2)} RON
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors duration-200"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          <p className="text-xl font-bold">Total: {totalPrice.toFixed(2)} RON</p>
          <button
            onClick={() => toast.success(`Proceeding to checkout - Total: ${totalPrice.toFixed(2)} RON`)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
