var mongoose = require('mongoose');

// const db = mongoose.connect("mongodb://0.0.0.0:27017/TimesHub",{
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(()=>console.log("Database Connected")).catch((err)=>console.log(err));

mongoose.set('strictQuery', true);

const productSchema = new mongoose.Schema({
    ProductName : {
        type:String,
        required:true
    },
    Description:{
        type:String
    },
    Image:{
        type:Array
    },
    Price:{
        type:Number,
        required:true
    },
    Category:{
        type:String
    },
    Quantity:{
        type : Number,
        required:true
    },
    OfferPrice:{
        type:Number
    },
    carted:{
        type:Boolean,
        default:false
    }

});
const categorySchema = new mongoose.Schema({
    Name:{
        type:String,
        // required:true
    },
    offer:{
        type:Number
    }
});
const subCategorySchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    }
});
const userSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    PhoneNo:{
        type:Number
    },
    Password:{
        type:String,
        required:true,
        
    },
    Wallet:{
        type:Number,
        default:0
    },
    blocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    coupon:{
        type:Array
    }
});
const cartSchema = {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },  
        Quantity: { type: Number, default: 1 },
        Price: { type: Number }
      }
    ],
  };

  const wishListSchema ={
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    wishList:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'product'
            },
            Quantity:{
                type:Number,default:1
            },
            
        }
    ]
  }

  const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    orders:[
        {
            name:String,
            productDetails:Array,
            paymentMethod:String,
            orderStatus:String,
            total:Number,
            totalQuantity:Number,
            shippingAddress:Object,
            paymentMode:String,
            status:{type:Boolean,default:true},
            createdAt:{
              type:Date,
              default:Date.now,
            },
            paymentStatus:{type:String,default:'success'},
    }
    ]
  })

  const addressSchema = {
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    Address:[
        {
            fname:{type:String},
            lname:{type:String},
            street:{type:String},
            apartment:{type:String},
            city:{type:String},
            state:{type:String},
            pincode:{type:Number},
            mobile:{type:Number},
            email:{type:String}
        }
    ]
  }
  const couponSchema ={
    couponName:String,
    expiry:{
        type:Date,
        default:new Date()
    },
    minPurchase:Number,
    discountPercentage:Number,
    maxDiscountValue:Number,
    couponApplied:{
        type:String,
        default:false
    },
    isActive:{
        type:Boolean,
        default:false
    },
    description:String,
    createdAt:{
        type:Date,
        default:new Date()
    }
  }

  const bannerSchema={
    Title:{
        type:String
    },
    Description:{
        type:String
    },
    Link:{
        type:String
    },
    Image:{
        type:String
    }
  }

module.exports ={
    product: mongoose.model("product",productSchema),
    category: mongoose.model("category",categorySchema),
    subCategory:mongoose.model('subCategory',subCategorySchema),
    users:mongoose.model('users',userSchema),
    cart:mongoose.model('cart',cartSchema),
    order:mongoose.model('orders',orderSchema),
    address:mongoose.model('address',addressSchema),
    wishList:mongoose.model('wishList',wishListSchema),
    banner:mongoose.model('banner',bannerSchema),
    coupon:mongoose.model('coupon',couponSchema)
}