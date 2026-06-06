import { Request, Response } from "express"
import { WeatherLogModel } from "../models/weatherLogModel"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY 

export const getWeatherData = async (req: Request, res: Response) => {
  const { city } = req.query

  if (!city) {
    return res.status(400).json({ message: "City name is required..!" })
  }

  try {
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
    )

    const weatherData = {
      city: weatherRes.data.name,
      country: weatherRes.data.sys.country,
      temp: weatherRes.data.main.temp,
      feels_like: weatherRes.data.main.feels_like,
      humidity: weatherRes.data.main.humidity,
      description: weatherRes.data.weather[0].description,
      icon: weatherRes.data.weather[0].icon
    }

    try {
      await WeatherLogModel.create({
        cityName: weatherData.city,
        temp: weatherData.temp,
        humidity: weatherData.humidity,
        description: weatherData.description,
        title: `Weather in ${weatherData.city}`
      })
      console.log(`Weather log saved successfully for ${weatherData.city}`)
    } catch (logErr) {
      console.error("Failed to create weather log in DB:", logErr)
    }

    let aiRecommendations = { lifestyle: "", outfit: "" }

    if (GOOGLE_API_KEY) {
      try {
        const promptText = `
          The current weather in ${weatherData.city}, ${weatherData.country} is ${weatherData.temp}°C with ${weatherData.description}. 
          The humidity is ${weatherData.humidity}% and it feels like ${weatherData.feels_like}°C.
          Based on this, give two brief recommendations for a user living there:
          1. A lifestyle/health tip.
          2. An outfit/clothing suggestion.
          Return the output ONLY as a valid JSON object with keys "lifestyle" and "outfit". Do not include markdown or backticks.
        `

       const aiResponse = await axios.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
          {
            contents: [
              {
                parts: [{ text: promptText }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 1000,
              responseMimeType: "application/json" 
            }
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": GOOGLE_API_KEY
            }
          }
        )

        let aiText =
          aiResponse.data?.candidates?.[0]?.content?.[0]?.text ||
          aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          ""

        console.log("RAW AI TEXT RECEIVED:", aiText)

        if (aiText) {
       
          //cleaning json becouse if gemini gives wrong text or json tags
          const jsonMatch = aiText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            aiText = jsonMatch[0]
            aiRecommendations = JSON.parse(aiText)
          } else {
            throw new Error("No valid JSON structure found in AI response")
          }
        }
      } catch (aiError) {
        console.error("Gemini Axios Error:", aiError)
        // set default recommendation , if crash app
        aiRecommendations = {
          lifestyle: `Weather is ${weatherData.description}. Take care when planning outdoor activities!`,
          outfit: weatherData.temp > 25 ? "Wear light cotton clothes to stay cool." : "A light jacket or layered clothing would be nice."
        }
      }
    }

    const weatherLogs = await WeatherLogModel.find({ cityName: weatherData.city }).sort({ timestamp: 1 })

    res.status(200).json({
      message: "Success",
      data: {
        ...weatherData,
        ai: aiRecommendations,
        logs: weatherLogs
      }
    })

  } catch (err: any) {
    console.error(err)
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "City not found..!" })
    }
    res.status(500).json({ message: "Error fetching weather data" })
  }
}