import mongoose from "mongoose";
import { Department } from "./models/Department";
async function test() {
    try {
        await mongoose.connect("mongodb://localhost:27017/hrms");
        console.log("MongoDB Connected");
        const department = await Department.create({
            name: "IT",
            description: "Information Technology",
        });
        console.log("Created:", department);
        await mongoose.disconnect();
    }
    catch (error) {
        console.error(error);
    }
}
test();
