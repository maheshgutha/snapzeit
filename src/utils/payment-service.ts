
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

export const initiatePayment = async (options: {
  amount: number;
  currency: string;
  name: string;
  description: string;
  email: string;
  contact: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  // Create an order on the server to get a secure order_id
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const createOrderResp = await fetch(`${apiBase}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: options.amount, currency: options.currency })
    });

    const result = await createOrderResp.json();
    if (createOrderResp.status !== 200 || !result.data) {
      console.error('Failed to create Razorpay order', result.error || result);
      options.onFailure(result.error || { message: 'Order creation failed' });
      return;
    }

    const order = result.data;
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      options.onFailure({ message: 'Razorpay key not configured on client' });
      return;
    }

    const razorpayOptions = {
      key: keyId,
      amount: order.amount, // already in smallest currency unit (paise)
      currency: order.currency,
      name: 'OraSnap',
      description: options.description,
      order_id: order.id,
      handler: function (response: any) {
        options.onSuccess(response);
      },
      prefill: {
        name: options.name,
        email: options.email,
        contact: options.contact,
      },
      notes: {
        address: 'OraSnap Corporate Office',
      },
      theme: { color: '#3B82F6' },
    };

    const paymentObject = new (window as any).Razorpay(razorpayOptions);
    paymentObject.on('payment.failed', function (response: any) {
      options.onFailure(response.error);
    });
    paymentObject.open();
  } catch (err) {
    console.error('initiatePayment error:', err);
    options.onFailure(err);
  }
};
