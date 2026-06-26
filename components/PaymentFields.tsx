"use client";

type PaymentFieldsProps = {
  amount: string;
  setAmount: (value: string) => void;
  paymentStatus: string;
  setPaymentStatus: (value: string) => void;
};

export default function PaymentFields({
  amount,
  setAmount,
  paymentStatus,
  setPaymentStatus,
}: PaymentFieldsProps) {
  return (
    <>
      <input
        type="number"
        placeholder="Montant (€)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
          width: "300px",
        }}
      />

      <select
        value={paymentStatus}
        onChange={(e) => setPaymentStatus(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
        }}
      >
        <option value="non_paye">💸 Non payé</option>
        <option value="paye">✅ Payé</option>
      </select>
    </>
  );
}