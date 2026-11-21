import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URL as string);
const db = client.db("fixmateusers");

export const auth = betterAuth({
     emailAndPassword: { 
    enabled: true, 
      minPasswordLength: 6,
  }, 
  socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },

   trustedOrigins: [
    "http://localhost:3000",
    "https://my-fixmate-service-platfrom-client.vercel.app",           
  ],

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

   plugins: [
        jwt(), 
    ],
    session:{
      cookieCache:{
        enabled: true,
        strategy: "jwt",
        maxAge: 7 * 24 * 60 *60
      }
    }
});