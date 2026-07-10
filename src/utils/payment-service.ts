export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Open Razorpay checkout for an order that was already created server-side
// (e.g. rentals, where the server prices the order). Skips order creation.
export const openRazorpayCheckout = async (options: {
  order: { id: string; amount: number; currency: string };
  description: string;
  name?: string;
  email?: string;
  contact?: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    options.onFailure({ message: 'Razorpay SDK failed to load. Are you online?' });
    return;
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    options.onFailure({ message: 'Razorpay key not configured on client' });
    return;
  }

  const paymentObject = new (window as any).Razorpay({
    key: keyId,
    amount: options.order.amount,
    currency: options.order.currency,
    name: 'SnapZeiT',
    description: options.description,
    order_id: options.order.id,
    handler: (response: any) => options.onSuccess(response),
    prefill: { name: options.name, email: options.email, contact: options.contact },
    theme: { color: '#3B82F6' },
  });
  paymentObject.on('payment.failed', (response: any) => options.onFailure(response.error));
  paymentObject.open();
};
