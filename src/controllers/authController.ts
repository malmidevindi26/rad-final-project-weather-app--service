import { UserModel } from "../models/userModel"
import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/token"
import { AuthRequest } from "../middleware/auth"

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