import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Wait for PaymentElement to be ready
  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    // Give PaymentElement time to mount properly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe or Elements not loaded");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/academy/payment-success`,
        },
      });

      if (error) {
        // Payment failed - show error to user
        setErrorMessage(error.message);
        setIsSubmitting(false);
      }
      // If no error, user will be redirected to return_url
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 text-center">
        <p>Loading payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-5">
      <PaymentElement
        options={{
          layout: "tabs"
        }}
      />

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className={`mt-5 w-full rounded border-none px-6 py-3 text-base text-white ${
          isSubmitting
            ? "cursor-not-allowed bg-gray-300"
            : "cursor-pointer bg-accent hover:bg-accent-secondary"
        }`}
      >
        {isSubmitting ? "Processing..." : "Complete Payment"}
      </button>

      {errorMessage && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-error">
          {errorMessage}
        </div>
      )}
    </form>
  );
}

export default CheckoutForm;
