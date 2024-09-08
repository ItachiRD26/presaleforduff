import React, { useState } from 'react';

function CompraTokens() {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleTokenAmountChange = (e) => {
    setTokenAmount(e.target.value);
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div className="CompraTokens">
      <h1>Purchase Tokens</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Token Amount:
          <input type="number" value={tokenAmount} onChange={handleTokenAmountChange} />
        </label>
        <br />
        <label>
          Payment Method:
          <select value={paymentMethod} onChange={handlePaymentMethodChange}>
            <option value="">Select Payment Method</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </label>
        <br />
        <button type="submit">Purchase Tokens</button>
      </form>
    </div>
  );
}

export default CompraTokens;