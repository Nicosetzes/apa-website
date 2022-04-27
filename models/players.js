const mongoose = require("mongoose");

const collection = "human-players";

const playersSchema = new mongoose.Schema(
    {
        name: { type: String, require: true, max: 100 },
        losingStreak: { type: Number, require: true, max: 100 },
        winningStreak: { type: Number, require: true, max: 100 },
        championships: { type: Array, require: true },
        lastFiveMatches: { type: Array, require: true },
    },
    { collection: collection }
);

module.exports = mongoose.model(collection, playersSchema);