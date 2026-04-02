export interface Customer {
  id: string
  email: string
  name: string
  phone?: string
}

export function getCurrentCustomer(): Customer | null {
  if (typeof window === 'undefined') return null
  
  try {
    const customerData = sessionStorage.getItem('current_customer')
    if (customerData) {
      return JSON.parse(customerData)
    }
    return null
  } catch (error) {
    console.error('Error getting current customer:', error)
    return null
  }
}

export function setCurrentCustomer(customer: Customer): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem('current_customer', JSON.stringify(customer))
  } catch (error) {
    console.error('Error setting current customer:', error)
  }
}

export function clearCurrentCustomer(): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem('current_customer')
  } catch (error) {
    console.error('Error clearing current customer:', error)
  }
}

export function requireCustomerAuth(): Customer | null {
  const customer = getCurrentCustomer()
  if (!customer) {
    // Redirecionar para login se não estiver autenticado
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.pathname + window.location.search
      window.location.href = `/auth/customer-signin?returnUrl=${encodeURIComponent(currentUrl)}`
    }
    return null
  }
  return customer
}
