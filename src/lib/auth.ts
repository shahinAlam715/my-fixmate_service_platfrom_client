import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("fixmateusers");

export const auth = betterAuth({
     emailAndPassword: { 
    enabled: true, 
      minPasswordLength: 6,
  }, 
  database: mongodbAdapter(db, {
    client,
  }),
     user: {
    additionalFields: {
      role: {
        type: ["customer", "technician", "admin"],
        required: false,
        input: true,
        defaultValue: "customer",
      },
      phone: {
        type: "string",
        required: false,
      },
      area: {
        type: "string",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
});