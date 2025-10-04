import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ["user", "admin"], default: "user", index: true },
		phone: { type: String, trim: true },
		customerStatus: { 
			type: String, 
			enum: ["active", "inactive", "premium", "gold", "bronze"], 
			default: "active",
			index: true 
		},
		address: {
			street: { type: String, trim: true },
			city: { type: String, trim: true },
			province: { type: String, trim: true },
			zipCode: { type: String, trim: true },
			country: { type: String, trim: true, default: "Sri Lanka" },
			phone: { type: String, trim: true }
		},
	},
	{ timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
	return {
		id: this._id,
		name: this.name,
		email: this.email,
		role: this.role,
		phone: this.phone,
		customerStatus: this.customerStatus,
		address: this.address,
		createdAt: this.createdAt,
		updatedAt: this.updatedAt,
	};
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;


