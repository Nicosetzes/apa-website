const mongoose = require("mongoose");

const collection = "face-to-face";

const possibleScoreValues = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

const faceToFaceSchema = new mongoose.Schema(
  {
    playerP1: { type: String, require: true, max: 100 },
    teamP1: { type: String, require: true, max: 100 },
    scoreP1: {
      type: [Number],
      require: true,
      enum: {
        values: possibleScoreValues,
        message: "{VALUE} es un valor inválido",
      },
    },
    playerP2: { type: String, require: true, max: 100 },
    teamP2: { type: String, require: true, max: 100 },
    scoreP2: {
      type: [Number],
      require: true,
      enum: {
        values: possibleScoreValues,
        message: "{VALUE} es un valor inválido",
      },
    },
    outcome: { type: String, require: true, max: 100 },
  },
  { collection }
);

module.exports = mongoose.model(collection, faceToFaceSchema);
