import { model, Schema } from "mongoose";
import { hash } from 'bcrypt';

export interface IUser {
    _id: Schema.Types.ObjectId,
    username: string;
    password: string,
    name: string;
    lastname: string;
    role: string;
    createdAt: Date,
    updatedAt: Date,
};

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        trim: true,
        unique: true,
        default: "",
        minlength: 3,
        maxlength: 40
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 40
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    lastname: {
        type: String,
        default: "",
        minlength: 3,
        maxlength: 20
    },
    role: {
        type: String,
        enum: ["admin", "editor"],
        default: "editor",
        required: true
    }
}, { timestamps: { createdAt: true } });

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next(); // is la contraseña no ha sido modificada
    this.password = await hash(this.password, 10);
    next();
});

const User = model("user", userSchema);

export default User;
