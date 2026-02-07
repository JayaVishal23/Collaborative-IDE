import dotenv from "dotenv";
import pkg from "pg";

dotenv.config(); //We use dotenv for env variables

const { Client } = pkg; //create PostgreSQL client

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err));

export default client;
