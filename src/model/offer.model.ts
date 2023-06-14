import { model, Schema } from "mongoose";

export interface IOffer {
    _id: Schema.Types.ObjectId;
    name: string;
    discount: number;
    type: string;
    id_user: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const offerSchema = new Schema<IOffer>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 1,
        maxlength: 40,
        default: "Offer"
    },
    discount: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    type: {
        type: String,
        required: true,
        default: "soles",
        enum: ["percent", "soles"]
    },
    id_user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true });

const Offer = model("offer", offerSchema);

export default Offer;
