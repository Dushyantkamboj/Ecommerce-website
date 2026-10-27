
import { useState } from "react";
import { userContext } from "./userContext";

const CreateContextProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [cart, setCart] = useState({});
  const [productIds, setproductIds] = useState([]);

  return (
    <userContext.Provider
      value={{
        count,
        setCount,
        cart,
        setCart,
        productIds,
        setproductIds,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export default CreateContextProvider;
