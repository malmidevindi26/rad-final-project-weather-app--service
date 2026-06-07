import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5*1024*1024
    },
    fileFilter:(req, file, cb) => {
        // only fetch image
        if(file.mimetype.startsWith("image/")){
            cb(null, true)
        }else{
            cb(new Error("Only image file are allowed") as any, false)
        }
    },
})