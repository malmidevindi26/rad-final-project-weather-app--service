import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { FavoriteModel } from "../models/favoriteModel";

//save
export const addFavorite = async(req:AuthRequest, res:Response) =>{
    const{cityName, note} = req.body

    try {
        const newFavorite = new FavoriteModel({
            cityName,
            note,
            user:req.user.sub  // get user id already logged user (passed by jwt token)
        })

        await newFavorite.save()
        res.status(201).json({message:"City added to favorite!", data:newFavorite})
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Failed to add favorite city"})
    }
}


// get all fav cities

export const getMyFavorite = async (req: AuthRequest, res:Response) => {
    try {
        // get details only logging user
        const favorites = await FavoriteModel.find({user:req.user.sub}).sort({createAt: -1})

        res.status(200).json({message: "Fetched favorite cities successfully", data:favorites})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Failed to fetch favorite cities"})
    }
}


// update
export const updateFavorite = async (req:AuthRequest, res:Response) => {
    const {id} = req.params
    const {note} = req.body

    try {
        const updated = await FavoriteModel.findOneAndUpdate(
            {_id:id, user: req.user.sub},  // check it's yours
            {note},
            {new:true}
        )

        if(!updated){
            return res.status(404).json({message:"city not found or anathorized"})
        }

        res.status(200).json({message:"Favorite updated successfully!", data:updated})
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Failed to update favorite"})
    }
}


// delete
export const deleteFavorite = async (req:AuthRequest, res:Response) =>{
    const { id } = req.params
    try {
        const deleted = await FavoriteModel.findOneAndDelete({_id:id, user:req.user.sub})

        if(!deleted){
            return res.status(404).json({message:"city not founf or unauthorized"})
        }

        res.status(200).json({ message:"city remove from favorite"})
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Faild to delete favorite"})
    }
}