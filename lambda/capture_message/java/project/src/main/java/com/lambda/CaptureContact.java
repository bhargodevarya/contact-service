package com.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.LambdaRuntime;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.PutObjectResult;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

public class CaptureContact implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    LambdaLogger logger = LambdaRuntime.getLogger();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        logger.log("Received request ".concat(input.toString()));
        APIGatewayProxyResponseEvent apiGatewayProxyResponseEvent = new APIGatewayProxyResponseEvent();
        String requestBody = input.getBody();
        AmazonS3 amazonS3Client = AmazonS3Client.builder().withRegion("us-east-1").build();
        String time = DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(LocalDateTime.now());
        PutObjectResult putObjectResult = amazonS3Client.putObject("dc-contact-bucket",
                "contact_".concat(time).concat(".json"), requestBody);
        apiGatewayProxyResponseEvent.setBody("Created file");
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Headers","Content-Type");
        headers.put("Access-Control-Allow-Origin","*");
        headers.put("Access-Control-Allow-Methods","OPTIONS,POST,GET");
        apiGatewayProxyResponseEvent.setHeaders(headers);
        return apiGatewayProxyResponseEvent;
    }
}
