import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import UserRegister from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./layout/Layout";
import ProtectedRoutes from "./component/ProtectedRoutes";
import { Navigate } from "react-router-dom";
import AddProduct from "./component/Addproduct";
import Updateproduct from "./component/Updateproduct";
// import Adminregister from "./pages/Adminregister";
import Products from "./pages/Products";
import CreateContextProvider from "./context/CreateContext";
import Login from "./pages/Login";
import UserDetails from "./pages/userDetails";
import UserProfile from "./pages/UserProfile";
// import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import PaymentSuccessful from "./pages/PaymentSuccessful";
import PurchaseHistory from "./pages/PurchaseHistory";
import AdminPurchaseHistory from "./pages/AdminPurchaseHistory";
import CreateCoupon from "./pages/CreateCoupon";

function App() {
  return (
    <>
      <CreateContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/adminlogin" element={<AdminLogin />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/adminregister" element={<Adminregister />} /> */}
            {/* <Route path="/register" element={<userRegister />} /> */}
            <Route path="/register" element={<UserRegister />} />

            <Route path="/" element={<Products />} />
            <Route path="/userprofile" element={<UserProfile />} />
            {/* <Route path="/productdetails" element={<ProductDetails />} /> */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/paymentsuccessful" element={<PaymentSuccessful />} />
            <Route path="/purchasehistory" element={<PurchaseHistory />} />


            <Route element={<ProtectedRoutes />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/addproduct" element={<AddProduct />} />
                <Route path="/updateproduct/:id" element={<Updateproduct />} />
                <Route path='/userdetails' element={<UserDetails />} />
                <Route path='/adminpurchasehistory' element={<AdminPurchaseHistory />} />
                <Route path="/createcoupon" element={<CreateCoupon />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CreateContextProvider>
    </>
  );
}

export default App;
