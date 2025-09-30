import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, unique: true },
		description: { type: String, default: "" },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true, collection: "category" }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;


