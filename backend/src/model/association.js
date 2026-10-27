import { User } from "./user.js";
import { Product } from "./product.js";
import { order } from "./order.js";
import { order_item } from "./orderItem.js";

User.hasMany(order, {
  foreignKey: "user_id",
  as: "orders",
});

order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

order.hasMany(order_item, {
  foreignKey: "order_id",
  as: "items",
});

order_item.belongsTo(order, {
  foreignKey: "order_id",
  as: "order",
});

Product.hasMany(order_item, {
  foreignKey: "product_id",
  as: "orderItems",
});

order_item.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});