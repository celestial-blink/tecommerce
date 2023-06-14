import { model, Schema } from "mongoose";

export interface IOnOffer {
    _id: Schema.Types.ObjectId;
    id_product: Schema.Types.ObjectId;
    id_offer: Schema.Types.ObjectId;
    expired: Boolean;
    expired_in?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const onOfferSchema = new Schema<IOnOffer>({
    id_product: {
        type: String,
        required: true,
        ref: "product"
    },
    id_offer: {
        type: String,
        required: true,
        ref: "offer"
    },
    expired: {
        type: Boolean,
        default: true
    },
    expired_in: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true });

const OnOffer = model("on_offer", onOfferSchema);

export default OnOffer;
