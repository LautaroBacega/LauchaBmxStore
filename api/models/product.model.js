import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "frames",
        "wheels",
        "handlebars",
        "pedals",
        "chains",
        "brakes",
        "seats",
        "grips",
        "pegs",
        "sprockets",
        "tires",
        "accessories",
      ],
    },
    brand: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    specifications: {
      material: String,
      weight: String,
      size: String,
      color: String,
      compatibility: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  { timestamps: true },
)

// Index for search functionality
productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" })

const Product = mongoose.model("Product", productSchema)

export default Product
