import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp') //callback first param null, second where to store files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  

  export const upload=multer({
    storage,
  })


  //middleware to upload and store files