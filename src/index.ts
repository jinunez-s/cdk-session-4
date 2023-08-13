import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { S3Event } from "aws-lambda";

const snsClient = new SNSClient ({});
const topicArn = process.env.TOPIC_ARN;

async function sendNotification(message: string): Promise<any>{
    console.log(`Sending notification to topic: ${topicArn}`);
    const command = new PublishCommand({
        Message: message,
        TopicArn: topicArn
    })
    const publishResult = await snsClient.send(command);
    console.log(JSON.stringify(publishResult))
}

export async function handler(event: S3Event, context: unknown){
    console.log(JSON.stringify(event));
    const { Records }  = event;
    const  promises = Records.map(({ eventTime, s3: { bucket, object: { key, size } } }) => {
        return sendNotification(`
            New file uploaded at ${eventTime} to the bucket ${bucket}.
            File name: ${key}.
            Size: ${size}.
            `
        )
    });
    await Promise.all(promises)
    console.log(JSON.stringify(promises))
}

