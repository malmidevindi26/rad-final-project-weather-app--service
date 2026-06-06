
import { Document, model, Schema } from "mongoose";

export interface IFavoriteCity extends Document {
    cityName: string
    country: string
    note?: string
    user: Schema.Types.ObjectId // track logged-in user
    isAlertEnabled: boolean
}

const FavoriteSchema = new Schema<IFavoriteCity>(
    {
        cityName: { type: String, required: true },
        country: { type: String, default: "" },
        note: { type: String, default: "" },
        user: { type: Schema.Types.ObjectId, ref: "user_details", required: true },
        isAlertEnabled: {type: Boolean, default:false}
    },
    { timestamps: true }
)

export const FavoriteCityModel = model<IFavoriteCity>("FavoriteCity", FavoriteSchema)