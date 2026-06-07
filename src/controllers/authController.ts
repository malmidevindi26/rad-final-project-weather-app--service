import { UserModel } from "../models/userModel"
import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/token"
import { AuthRequest } from "../middleware/auth"
import mongoose from "mongoose"
import { FavoriteCityModel } from "../models/favoriteModel"

// user registration
export const creatUser = async (req:Request, res:Response) => {
    const {name, email,password} = req.body
    try{
        const exUser = await UserModel.findOne({email})
        if(exUser){
            return res.status(400).json({message:"User Already Exists..!"})
        }

        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password,salt)

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            approved:true
        })

        const savedUser = await newUser.save()

        res.status(201).json({
            message: "User registration successfully..!",
            data: {
                id:savedUser._id,
                name:savedUser.name,
                email: savedUser.email,
                roles: savedUser.roles
            }
        })
    }catch(err){
        console.error(err)
        res.status(500).json({message: "Internal serve error while creating user...!"})
    }
}

// User Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  try {
    const user = await UserModel.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials..!" })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials..!" })
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    res.status(200).json({
      message: "Success",
      data: {
        email: user.email,
        roles: user.roles,
        accessToken,
        refreshToken
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error while login..!" })
  }
}

export const getMyDetails = async (req:AuthRequest, res: Response) =>{
    if(!req.user){
        return res.status(401).json({message: "Unathorixation"})
    }

    const user = await UserModel.findById(req.user.sub).select("-password")
    if(!user){
        return res.status(404).json({message:"User Not Found"})
    }

    res.status(200).json({message: "Ok", data:{ id: user._id, email: user.email, roles: user.roles }})
}

// update profile pic
export const updateProfilePicture = async (req: AuthRequest, res:Response) => {
 
 if(!req.user){
  return res.status(401).json({message:"Unauthorized access"})
 }

  const {profilePicUrl} = req.body

  const userId = req.user.sub // user id coming from middleware

  try{
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {profilePicture: profilePicUrl},
      {new:true}
    ).select("-password")
    if(!updatedUser){
      return res.status(404).json({message: "User not found"})
    }

    res.status(200).json({message: "Profile picture updated successfully", user:updatedUser})
  }catch(err){
    console.error(err)
    res.status(500).json({message: "Failed to update profile picture"})
  }
}

// change password
export const changePassword = async(req:AuthRequest, res:Response) =>{
  if(!req.user){
  return res.status(401).json({message:"Unauthorized access"})
  }

  const {oldPassword, newPassword} = req.body
  const userId = req.user.sub

  if(!oldPassword || !newPassword){
    return res.status(400).json({message: "Both old and new passwords required"})
  }

  try {
    const user = await UserModel.findById(userId)
    if(!user){
      return res.status(404).json({message:"user not found"})
    }

    //compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if(!isMatch){
      return res.status(400).json({message:"Incorrect old password"})
    }

    // save new password as a hash
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save();

    res.status(200).json({message: "Password changes successfully"})
    
  } catch (error) {
    console.error(error)
    res.status(500).json({message: "Failed to change password"})
  }
} 

// delete acc
export const deleteAccount = async (req:AuthRequest, res:Response) => {
  if(!req.user){
  return res.status(401).json({message:"Unauthorized access"})
  }

  const userId = req.user.sub

  // start mongoose session
  const session = await mongoose.startSession()

  try {
    // start transaction
    session.startTransaction()

    // delete fav cities
    await FavoriteCityModel.deleteMany({user:userId}).session(session)

    // delete user acc
    const deleteUser = await UserModel.findByIdAndDelete(userId).session(session)

    if(!deleteUser){
      // Transaction abort, if there is no user
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({message: "User account not found"})
    }

    // commit database if all are success
    await session.commitTransaction()
    session.endSession()
    
    res.status(200).json({
      message: "Account and all associates favorite weather data deleted successfully !"
    })
  } catch (error) {
    // rollback
    await session.abortTransaction()
    session.endSession()

    console.error("Delete account transaction error",error)
    res.status(500).json({message:"Failed to delete account safely, Chnage rolled back"})
  }
}