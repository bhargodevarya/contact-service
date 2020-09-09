console.log("Loading function");

const aws = require("aws-sdk");

const s3 = new aws.S3({});
const sns = new aws.SNS({});

exports.handler = async (event, context) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));

  // Get the object from the event and show its content type
  console.log("Event is ", event);
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const params = {
    Bucket: bucket,
    Key: key,
  };

  console.log("params are", params);

  try {
    const { Body } = await s3.getObject(params).promise();
    const contactObject = JSON.parse(Body.toString())
    console.log("BODY", contactObject);
    const topicArn = "arn:aws:sns:us-east-1:259061874013:Contact_topic";
    const snsPayload = {
      Message: `${contactObject.name} has sent you the message - ${contactObject.message}`,
      Subject: "Contact - ".concat(contactObject.subject),
      TopicArn: topicArn,
    };
    const { MessageId } = await sns.publish(snsPayload).promise();
    console.log("Message sent to topic, messageId is", MessageId)
    // publishTextPromise.then(
    //     function(data) {
    //       console.log(`Message ${snsPayload.Message} send sent to the topic ${snsPayload.TopicArn}`);
    //       console.log("MessageID is " + data.MessageId);
    //     }).catch(
    //       function(err) {
    //       console.error('Error publising to SNS', err, err.stack);
    //     });
  } catch (err) {
    console.log(err);
    const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
    console.log(message);
    throw new Error(message);
  }
};
