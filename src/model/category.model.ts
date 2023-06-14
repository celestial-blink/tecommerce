import { model, Schema } from "mongoose";

export interface ICategory {
    _id: Schema.Types.ObjectId,
    name: string;
    description: string;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        trim: true,
        unique: true,
        default: "Category",
        minlength: 1,
        maxlength: 40
    },
    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 200
    }
}, { timestamps: false });

const Category = model("category", categorySchema);

export default Category;
