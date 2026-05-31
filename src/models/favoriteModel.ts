import { Document, model, Schema } from "mongoose";

export interface IFavorite extends Document{
    cityName:string
    note?: string
    user:Schema.Types.ObjectId    //track login user
}

const FavoriteSchema = new Schema<IFavorite>(
    {
        cityName: {type:String, required:true},
        note: {type:String, default: ""},
        user: {type: Schema.Types.ObjectId, ref:"User", required:true}
    },
    {timestamps:true}
)

export const FavoriteModel = model<IFavorite>("Favorite", FavoriteSchema)