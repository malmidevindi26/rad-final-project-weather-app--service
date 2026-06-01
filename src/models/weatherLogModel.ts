
import { model, Schema, Document, Types } from "mongoose"

export interface IWeatherLog extends Document {
    title: string
    description: string
    cityId: Types.ObjectId  // one-to-many relationship
    user: Types.ObjectId
}

const WeatherLogSchema = new Schema<IWeatherLog>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        cityId: { type: Schema.Types.ObjectId, ref: "FavoriteCity", required: true },
        user: { type: Schema.Types.ObjectId, ref: "user_details", required: true }
    },
    { timestamps: true }
)

export const WeatherLogModel = model<IWeatherLog>("WeatherLog", WeatherLogSchema)