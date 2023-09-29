const mongoose = require("mongoose");

const schema = new mongoose.Schema({

  criteriaList: [
    {
      stt: String, // Số thứ tự
      criteria: String, // Tiêu đề
      content: [
        {
          text: String,
          maxScore:Number,

        }
      ],
     
    },
  ],
  
});

schema.set("timestamps", true);

module.exports = mongoose.model("training_point", schema);
