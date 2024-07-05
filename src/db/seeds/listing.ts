import fs from "fs";
import connectDB from "..";
import { Listing } from "../models/listing.models";
import mongoose from "mongoose";

require("dotenv").config();

const seedListings = async () => {
  try {
    // Ensure DB connection
    await connectDB();

    // Read and parse the JSON file
    const data = JSON.parse(
      fs.readFileSync("src/db/seeds/airbnb-listings.json", "utf8")
    );

    // Map JSON data to schema
    const listings = data
      .filter((item: any) => item.xl_picture_url)
      // .slice(0, 30)
      .map((item: any) => ({
        name: item.name,
        description: item.description,
        address: item.street,
        city: item.city,
        state: item.state,
        zipcode: item.zipcode,
        market: item.market,
        smart_location: item.smart_location,
        country: item.country,
        house_rules: item.house_rules,
        listing_image_url: item.xl_picture_url,
        amenities: item.amenities,
        price: item.price * 25,
        review_scores_rating: item.review_scores_rating / 20,
        number_of_reviews: item.number_of_reviews,
        room_type: item.room_type,
        property_type: item.property_type,
        accommodates: item.accommodates,
      }));

    // Insert data into MongoDB
    await Listing.insertMany(listings);
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data: ", error);
  } finally {
    mongoose.connection.close();
  }
};

seedListings();
