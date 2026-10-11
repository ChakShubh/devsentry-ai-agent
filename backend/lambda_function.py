import json
import os
import uuid
import boto3

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='ap-southeast-2')
dynamodb = boto3.resource('dynamodb')

TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'DevSentrySessions')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    # Handle preflight OPTIONS requests for CORS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "POST,OPTIONS"
            },
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    try:
        body = json.loads(event.get('body', '{}'))
        prompt = body.get('prompt', '').strip()

        if not prompt:
            return {
                'statusCode': 400,
                'headers': {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
                'body': json.dumps({'error': 'Prompt is required'})
            }

        session_id = str(uuid.uuid4())[:8]

        # Use Amazon Nova Micro (Active model ID that bypasses legacy retirement blocks)
        model_id = "amazon.nova-micro-v1:0"
        
        native_request = {
            "schemaVersion": "messages-v1",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": f"You are DevSentry AI, a professional cloud architecture and security reviewer. Review this user query/snippet with concise technical clarity and helpful humor: {prompt}"
                        }
                    ]
                }
            ],
            "inferenceConfig": {
                "max_new_tokens": 500,
                "temperature": 0.7
            }
        }

        # Invoke Bedrock Model
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps(native_request)
        )
        
        model_response = json.loads(response['body'].read())
        
        # Extract text response safely for Nova models
        agent_reply = model_response.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', 'Review completed successfully.')

        # Safe DynamoDB write
        try:
            table.put_item(
                Item={
                    'SessionID': session_id,
                    'UserPrompt': prompt,
                    'AgentResponse': agent_reply
                }
            )
        except Exception as db_err:
            print(f"Warning: DynamoDB put_item failed: {str(db_err)}")

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST,OPTIONS",
                "Content-Type": "application/json"
            },
            'body': json.dumps({
                'response': agent_reply,
                'sessionId': session_id
            })
        }

    except Exception as e:
        print(f"CRITICAL LAMBDA ERROR: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            'body': json.dumps({
                'error': 'Internal Server Error',
                'details': str(e)
            })
        }