import * as cdk from 'aws-cdk-lib';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class SessionFourStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new sns.Topic(this, 'LabTopic1', { displayName: 'LabTopic', topicName: 'LabTopic1'})
    const emailSuscription = new subscriptions.EmailSubscription("julio.nunez@telusinternational.com")
    const bucket = new s3.Bucket(this, 'MyBucketLab');

    const lambda = new nodejs.NodejsFunction(this, 'MyLambdaFuncLab', {
      entry: './src/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      functionName: 'MyLambdaFuncLab',
      environment: {
        TOPIC_ARN: topic.topicArn
      }
    });

    lambda.role?.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "sts:AssumeRole"
      ],
      resources: ["*"]
    }));

    lambda.role?.addToPrincipalPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "log:CreateLogGroup",
        "logs:CreateLogsStream",
        "logs:PutLogEvents",
        "sns:Publish"
      ],
      resources: ["*"]
    }));

    topic.grantPublish(lambda);
    topic.addSubscription(emailSuscription);
    lambda.addEventSource(new S3EventSource(
      bucket, { 
        events: [ s3.EventType.OBJECT_CREATED_PUT]
      }
    ))
  }
}