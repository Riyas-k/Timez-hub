const multer = require('multer');

const productStorage =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
});
const editedStorage = multer.diskStorage({
     destination:(req,file,cb)=>{
        cb(null,'public/images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
});

const bannerStorage= multer.diskStorage({
    destination:(req,file,cb)=>{
       cb(null,'public/images')
   },
   filename:(req,file,cb)=>{
       cb(null,file.originalname)
   }
});
const bannerEditedStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
       cb(null,'public/images')
   },
   filename:(req,file,cb)=>{
       cb(null,file.originalname)
   }
});

module.exports={
    uploads:multer({storage:productStorage}).array('file',4),
    editedUploads:multer({storage:editedStorage}).array('file2',4),
    bannerUploads:multer({storage:bannerStorage}).single('image'),
    bannerEditedUploads:multer({storage:bannerEditedStorage}).single('image')
}
