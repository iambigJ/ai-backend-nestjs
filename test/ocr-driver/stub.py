import pika
import json

example_backend_message = {
    "documentId": "2c378287-8225-4b8c-849f-1075d4371f7a",
    "fileType": "image", # type: 'image' | 'pdf'
    "filename": "test.jpg",
    "directory": "general/ea1429c3-f5e8-4fbd-8aac-31e857990e7f/2c378287-8225-4b8c-849f-1075d4371f7a",
    "ocrOptions": {
        "language": "persian", # type: 'persian' | 'english'
        "extractTables": False, # type: boolean
        "documentStructure": False, # type: boolean
        "textWithImage": False, # type: boolean
        "docType": "national_card" # type: 'national_card' | 'passport' | 'bank_card'| 'birth_certificate' | 'driving_license'| 'car_certificate' | null
    }
}

def stub(data):
    filename: str = data['filename']
    directory: str = data['directory']
    wordUri = f'{directory}/{filename}.docx'
    outImageUri = f'{directory}/{filename}.jpg'
    txtUri = f'{directory}/{filename}.txt'
    jsonUri = f'{directory}/{filename}.json'
    with open(f'storage/{wordUri}', 'w') as file:
        # inputFile = open(data['fileUri']);
        # file.write(inputFile.read())
        pass
    with open(f'storage/{outImageUri}', 'w') as file:
        # inputFile = open(f'storage/{data["fileUri"]}');
        # file.write(inputFile.read())
        pass
    with open(f'storage/{txtUri}', 'w') as file:
        file.write("This Is A dummy test")
        pass
    with open(f'storage/{jsonUri}', 'w') as file:
        file.write('{"test":"1"}')
        pass
    # example of response message 
    return {
        "documentId": data['documentId'],
        "wordUri": wordUri,
        "outImageUri": outImageUri,
        "txtUri": txtUri,
        "jsonUri": jsonUri,
    }

def on_request(ch, method, properties, body):
    data = json.loads(body)
    
    print(f"Received task: ")
    result = stub(data)
    print(f"Completed task")

    ch.basic_publish(
        exchange='',
        routing_key='result_queue',
        properties=pika.BasicProperties(
            correlation_id=properties.correlation_id
        ),
        body=json.dumps(result)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)
credentials = pika.PlainCredentials('root', 'root')
parameters = pika.ConnectionParameters('localhost',
                                       5672,
                                       '/',
                                       credentials)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()
channel.queue_declare(queue='task_queue', durable=True)
channel.queue_declare(queue='result_queue', durable=True)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='task_queue', on_message_callback=on_request)

print("Worker is waiting for tasks. To exit, press CTRL+C")
channel.start_consuming()
