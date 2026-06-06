import nodemailer from "nodemailer"
import cron from "node-cron"
import { FavoriteCityModel } from "../models/favoriteModel"
import axios from "axios"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY

//create nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
})

// function of sending email
// "*/1 * * * *"
export const startEmailScheduler = () => {
    console.log("SkyAI Weather Email Scheduler Initialized...")

    cron.schedule("0 7 * * *", async () => {
        console.log("Running daily weather email alerts task...")

        try{
            //fetch user deatils when selected favoritw city enable alert
            const alerts = await FavoriteCityModel.find({isAlertEnabled: true}).populate("user")

            if(alerts.length === 0){
                console.log("No users have enabled email alerts today.")
                return
            }

            for(const alert of alerts){
                const user:any = alert.user
                if(!user || !user.email) continue

                try {
                    // get new data from openweather
                    const weatherRes = await axios.get(
                        `https://api.openweathermap.org/data/2.5/weather?q=${alert.cityName}&appid=${OPENWEATHER_API_KEY}&units=metric`
                    )

                    const temp = weatherRes.data.main.temp
                    const desc = weatherRes.data.weather[0].description
                    const humidity = weatherRes.data.main.humidity

                    // html email template
                    const mailOptions = {
            from: `"SkyAI Weather" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `🌤️ Good Morning ${user.name || 'User'}! Your Daily Weather Update for ${alert.cityName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 24px;">🌤️ SkyAI Weather Alert</h1>
                </div>
                <div style="padding: 20px; color: #334155;">
                  <h3>Hello ${user.name || 'there'},</h3>
                  <p>Here is your automated morning weather report for your favorite location:</p>
                  
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h2 style="margin: 0; color: #1e293b;">${alert.cityName}</h2>
                    <h1 style="margin: 10px 0; font-size: 48px; color: #4f46e5;">${temp}°C</h1>
                    <p style="margin: 0; text-transform: capitalize; font-weight: bold;">${desc}</p>
                    <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">💧 Humidity: ${humidity}%</p>
                  </div>

                  <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px;">
                    You received this because you enabled daily alerts for ${alert.cityName}. 
                    To disable this, uncheck the alert toggle in your SkyAI Dashboard.
                  </p>
                </div>
              </div>
            `,
          }

          // send email
          await transporter.sendMail(mailOptions)
          console.log(`📩 Weather Alert Email sent successfully to ${user.email} for ${alert.cityName}`)
                } catch (error) {
                    console.error(` Error processing alert for ${alert.cityName}:`, error)
                }
            }
        }catch(err){
            console.error(" Error fetching alerts from DB:", err)
        }
    })
}