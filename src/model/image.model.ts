import { model, Schema } from "mongoose";

export interface IImage {
    _id: Schema.Types.ObjectId,
    id_product: Schema.Types.ObjectId,
    url: string;
    position: number;
}

const imageSchema = new Schema<IImage>({
    id_product: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "product"
    },
    url: {
        type: String,
        trim: true,
        required: true,
        default: "-",
        minlength: 1
    },
    position: {
        type: Number,
        required: true,
        default: 0,
        minlength: 1
    }
}, { timestamps: false });

const Image = model("image", imageSchema);

export default Image;
