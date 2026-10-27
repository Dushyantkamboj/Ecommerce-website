import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from 'js-cookie';
import { useEffect,useState } from "react";
import {
  Check,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ReceiptText,
  CreditCard,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

const PaymentSuccessful = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const[orderId,setorderId]=useState()
  const[totalAmount,settotalAmount]=useState()

  const token=Cookies.get('accessToken')

  // Optional details passed from checkout
  const order = location.state?.order || {};
//   const orderId = order.order_id || order.id || "Confirmed";
//   const totalAmount = order.total_amount ?? order.totalAmount ?? 0;
  const paymentMethod = order.payment_method || "Online Payment";

  const paymentDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleResult=async()=>{
    try {
        const response=await axios.get('http://localhost:3000/api_v1/product/listproductdetails',
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        )

        // console.log('response:',response);

        const result=response.data.data;

        console.log('result:',result);

       setorderId(result.id)

       settotalAmount(result.total_amount)


        
    } catch (error) {
        
        console.log('error:',error);
    }
  }

  useEffect(() => {
    handleResult()
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Success icon */}
        <div className="mb-7 flex justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-green-100 sm:h-36 sm:w-36">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-200 sm:h-28 sm:w-28">
              <Check
                className="h-16 w-16 text-white sm:h-20 sm:w-20"
                strokeWidth={3.5}
              />
            </div>

            <span className="absolute -right-1 top-4 h-3 w-3 rounded-full bg-green-400" />
            <span className="absolute -left-2 top-12 h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="absolute bottom-4 -right-2 h-3 w-3 rounded-full bg-emerald-400" />
            <span className="absolute bottom-2 left-3 h-2 w-2 rounded-full bg-green-300" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-9 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold uppercase tracking-widest text-green-700">
              Payment Confirmed
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-green-800 sm:text-4xl">
            Payment Successful!
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-gray-500">
            Thank you for your purchase. Your payment has been processed
            successfully. Your order is confirmed!
          </p>
        </div>

        {/* Order details */}
        <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm">
          <div className="border-b border-green-100 bg-green-50/70 px-6 py-5">
            <h2 className="text-lg font-bold text-gray-800">
              Order Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Keep these details for your records.
            </p>
          </div>

          <div className="divide-y divide-gray-100 px-6">
            <DetailRow
              icon={<ReceiptText />}
              label="Order ID"
              value={`#${orderId}`}
            />

            <DetailRow
              icon={<CreditCard />}
              label="Payment Method"
              value={paymentMethod}
            />

            <DetailRow
              icon={<CalendarDays />}
              label="Payment Date"
              value={paymentDate}
            />

            <DetailRow
              icon={<IndianRupee />}
              label="Total Amount"
              value={`₹${Number(totalAmount).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              highlight
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 font-semibold text-white shadow-md shadow-green-100 transition hover:bg-green-700 active:scale-[0.98]"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate("/purchasehistory", { replace: true })}
            className="rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:border-green-300 hover:bg-green-50"
          >
            View Purchase History
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Thank you for shopping with us!
        </p>
      </div>
    </div>
  );
};

const DetailRow = ({ icon, label, value, highlight = false }) => {
  return (
    <div className="flex items-center gap-4 py-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p
          className={`mt-1 break-words font-semibold ${
            highlight
              ? "text-xl text-green-700"
              : "text-gray-800"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessful;