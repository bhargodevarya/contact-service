const AWS = require("aws-sdk");
const fs = require("fs");

AWS.config.update({ region: "us-east-1" });

exports.handler = async (event, context) => {
  // Create S3 service object
  s3 = new AWS.S3();

//   const contactObj = {
//     who: "Demo",
//     subject: "Dummy text",
//     message: "This is is test",
//   };

  const incomingContact = JSON.parse(event.body)

  const contactStrObject = JSON.stringify(incomingContact);

  const fileRef = "contact_".concat(Date.now().toString()).concat(".json");

  fs.writeFile(fileRef, contactStrObject, (err, data) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Success");
      var uploadParams = { Bucket: "dc-contact-bucket", Key: "", Body: "" };

      // Configure the file stream and obtain the upload parameters
      var fileStream = fs.createReadStream(fileRef);
      fileStream.on("error", function (err) {
        console.log("File Error", err);
      });
      uploadParams.Body = fileStream;
      var path = require("path");
      uploadParams.Key = path.basename(fileRef);

      //call S3 to retrieve upload file to specified bucket
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        }
        if (data) {
          console.log("Upload Success", data.Location);
        }
        fs.exists(fileRef, (res) => {
          if (res) {
            fs.unlink(fileRef, (err) => {
              if (err) {
                console.log("Error while deleting", err);
              } else {
                console.log("Deleted", fileRef);
              }
            });
          }
        });
      });
    }
  });
};
