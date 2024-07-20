import multer from "multer";
import path from "path";

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("here");
    
    console.log("file from multer page", file);
    cb(null, path.join(__dirname, '../../public'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: Storage });

export default upload;
