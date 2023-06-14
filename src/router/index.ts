import type { Express } from "express";
import auth from "./api/auth.router";
import category from "./api/category.router";
import image from "./api/image.router";
import offer from "./api/offer.router";
import onoffer from "./api/onoffer.router";
import product from "./api/product.router";
import user from "./api/user.router";

export const routerApi = (server: Express) => {
    server.use(auth);
    server.use(category);
    server.use(image);
    server.use(offer);
    server.use(onoffer);
    server.use(product);
    server.use(user);
}
