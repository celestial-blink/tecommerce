import { model, Schema } from "mongoose";

export interface IProduct {
    _id: Schema.Types.ObjectId,
    name: string;
    description: string;
    price: number;
    quantity: number;
    id_category: Schema.Types.ObjectId,
    id_user: Schema.Types.ObjectId,
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        trim: true,
        required: true,
        default: "Product",
        minlength: 1,
        maxlength: 60
    },
    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 400
    },
    price: {
        type: Number,
        default: 0.00,
        min: 0
    },
    id_category: {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    id_user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: false });

const Product = model("product", productSchema);

export default Product;
