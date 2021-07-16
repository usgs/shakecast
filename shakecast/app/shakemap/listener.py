# -*- coding: utf-8 -*-
# pylint: disable=C0111,C0103,R0205

import json

from ..messageconsumer import Consumer, ReconnectingConsumer
from ..env import RABBITMQ_URL
from .ingest import main as ingest

class ShakemapConsumer(Consumer):
  QUEUE='pdl-shakemap'

  def on_message(self, _unused_channel, basic_deliver, properties, body):
      print(f'SHAKEMAP RECEIVED: # {basic_deliver.delivery_tag}: {body}')

      product = json.loads(body)
      ingest(product)

      self._channel.basic_ack(basic_deliver.delivery_tag)

def main():
    consumer = ReconnectingConsumer(
      RABBITMQ_URL,
      ShakemapConsumer
    )
    consumer.run()


if __name__ == '__main__':
    main()