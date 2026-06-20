
import { model, Schema, Document, Types } from "mongoose"

export interface IWeatherLog extends Document {
    title: string
    description: string
    cityName: string
    temp:number
    humidity:number
    cityId?: Types.ObjectId  // one-to-many relationship
    user?: Types.ObjectId
}

const WeatherLogSchema = new Schema<IWeatherLog>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        cityName: { type: String, required: true },  
        temp: { type: Number, required: true },      
        humidity: { type: Number, required: true },  
        cityId: { type: Schema.Types.ObjectId, ref: "FavoriteCity" },
        user: { type: Schema.Types.ObjectId, ref: "user_details" }
    },
    { timestamps: true }
)

export const WeatherLogModel = model<IWeatherLog>("WeatherLog", WeatherLogSchema)