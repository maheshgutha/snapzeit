
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

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!keyId || keyId === "rzp_test_YOUR_KEY_ID") {
    alert('Razorpay Key ID is not configured in .env file.');
    return;
  }

  const razorpayOptions = {
    key: keyId,
    amount: options.amount * 100, // Razorpay expects amount in paise
    currency: options.currency,
    name: "OraSnap",
    description: options.description,
    handler: function (response: any) {
      options.onSuccess(response);
    },
    prefill: {
      name: options.name,
      email: options.email,
      contact: options.contact,
    },
    notes: {
      address: "OraSnap Corporate Office",
    },
    theme: {
      color: "#3B82F6", // Consistent with your blue theme
    },
  };

  const paymentObject = new (window as any).Razorpay(razorpayOptions);
  paymentObject.on('payment.failed', function (response: any) {
    options.onFailure(response.error);
  });
  paymentObject.open();
};
