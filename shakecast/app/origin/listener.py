# -*- coding: utf-8 -*-
# pylint: disable=C0111,C0103,R0205

import json

from ..messageconsumer import Consumer, ReconnectingConsumer
from ..env import RABBITMQ_URL
from .ingest import main as ingest

class OriginConsumer(Consumer):
  QUEUE='pdl-origin'

  def on_message(self, _unused_channel, basic_deliver, properties, body):
      print(f'ORIGIN RECEIVED: # {basic_deliver.delivery_tag}: {body}')

      message = json.loads(body)
      ingest(message)

      self._channel.basic_ack(basic_deliver.delivery_tag)

def main():
    consumer = ReconnectingConsumer(
      RABBITMQ_URL,
      OriginConsumer
    )
    consumer.run()


if __name__ == '__main__':
    main()