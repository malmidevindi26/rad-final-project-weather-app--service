import { Request,Response } from "express"
import { AuthRequest } from "../middleware/auth"
import { FavoriteCityModel } from "../models/favoriteModel"
import { WeatherLogModel } from "../models/weatherLogModel"
import { Types } from "mongoose";

// 1. SAVE CITY TO FAVORITES
export const addFavorite = async (req: AuthRequest, res: Response) => {
    const { cityName, country } = req.body

    try {
        const newFavorite = new FavoriteCityModel({
            cityName,
            country,
            user: req.user.sub as any 
        })

        await newFavorite.save()
        res.status(201).json({ message: "City added to favorite!", data: newFavorite })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to add favorite city" })
    }
}

// 2. GET ALL FAV CITIES FOR LOGGED IN USER
export const getMyFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const favorites = await FavoriteCityModel.find({ 
            user: req.user?.sub 
        } as any).sort({ createdAt: -1 });

        res.status(200).json({ message: "Fetched favorite cities successfully", data: favorites });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch favorite cities" });
    }
}
// 💡 FAVORITE CITY UPDATE (NOTE UPDATE)
export const updateFavorite = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { note } = req.body

    try {
        const updated = await FavoriteCityModel.findOneAndUpdate(
            { _id: id as any, user: req.user.sub as any },
            { note },
            { new: true }
        )

        if (!updated) {
            return res.status(404).json({ message: "City not found or unauthorized" })
        }

        res.status(200).json({ message: "Favorite updated successfully!", data: updated })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to update favorite" })
    }
}

// 3. DELETE CITY & AUTOMATICALLY CASCADE DELETE RELATED LOGS
export const deleteFavorite = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await FavoriteCityModel.findOneAndDelete({ 
            _id: id,
            user: req.user?.sub
        } as any);

        if (!deleted) {
            return res.status(404).json({ message: "City not found or unauthorized" });
        }
        
        await WeatherLogModel.deleteMany({ cityId: id } as any); 

        res.status(200).json({ message: "City and its related logs removed from favorites!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete favorite" });
    }
}

// 4. ADD A WEATHER LOG ENTRY TO SPECIFIC SAVED CITY
export const addWeatherLog = async (req: AuthRequest, res: Response) => {
    const { title, description, cityId } = req.body

    try {
        const newLog = new WeatherLogModel({
            title,
            description,
            cityId: cityId as any, 
            user: req.user.sub as any
        })

        await newLog.save()
        res.status(201).json({ message: "Weather log entry created successfully!", data: newLog })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to create weather log entry" })
    }
}

// 5. GET ALL LOG ENTRIES FOR A SPECIFIC CITY
export const getLogsByCity = async (req: AuthRequest, res: Response) => {
    const { cityId } = req.params;
    try {
        const logs = await WeatherLogModel.find({
            cityId: cityId,
            user: req.user?.sub
        } as any).sort({ createdAt: -1 }); // 
        
        res.status(200).json({ message: "Fetched city weather logs successfully", data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch weather logs" });
    }
}
// 6. EDIT A SPECIFIC WEATHER LOG ENTRY
export const updateWeatherLog = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const { title, description } = req.body

    try {
        const updatedLog = await WeatherLogModel.findOneAndUpdate(
            { 
                _id: id as any, 
                user: req.user.sub as any 
            },
            { title, description },
            { returnDocument: 'after' }
        )

        if (!updatedLog) {
            return res.status(404).json({ message: "Weather log entry not found or unauthorized" })
        }

        res.status(200).json({ message: "Weather log updated successfully!", data: updatedLog })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to update weather log" })
    }
}

// 7. DELETE WEATHER LOG ENTRY
export const deleteWeatherLog = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    try {
        const deletedLog = await WeatherLogModel.findOneAndDelete({ 
            _id: id as any, 
            user: req.user.sub as any 
        })

        if (!deletedLog) {
            return res.status(404).json({ message: "Weather log entry not found" })
        }

        res.status(200).json({ message: "Weather log entry deleted successfully!" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Failed to delete weather log entry" })
    }
}

// toggle email alert for favorite city
export const toggleCityAlert = async (req: Request, res:Response) => {
    const {id} = req.params;

    try {
        const favorite = await FavoriteCityModel.findById(id);
        if(!favorite){
            return res.status(404).json({message: "Favorite city not found"});
        }

        favorite.isAlertEnabled = !favorite.isAlertEnabled;
        await favorite.save();

        return res.status(200).json({
            message: "Alert status updated successfully",
            data: favorite
        })
    } catch (error) {
        return res.status(500).json({message: "Error updating alert status"})
    }
}