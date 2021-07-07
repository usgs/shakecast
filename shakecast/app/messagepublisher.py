import pika

import env


def publish_message(msg, queue_name):
	connection = pika.BlockingConnection(
		pika.ConnectionParameters(host=env.RABBITMQ_HOST)
  )
	channel = connection.channel()

	channel.queue_declare(queue=queue_name)

	channel.basic_publish(exchange='', routing_key=queue_name, body=msg)
	print(" [x] Sent ", msg)
	connection.close()
