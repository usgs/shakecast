# -*- coding: utf-8 -*-
# pylint: disable=C0111,C0103,R0205

from ..messageconsumer import Consumer, ReconnectingConsumer
from ..env import RABBITMQ_URL

class GroundfailureConsumer(Consumer):
  QUEUE='pdl-ground-failure'

  def on_message(self, _unused_channel, basic_deliver, properties, body):
      print('GROUND_FAILURE RECEIVED CAPTAIN: # %s from %s: %s',
                  basic_deliver.delivery_tag, properties.app_id, body)
      self._channel.basic_ack(basic_deliver.delivery_tag)

def main():
    consumer = ReconnectingConsumer(
      RABBITMQ_URL,
      GroundfailureConsumer
    )
    consumer.run()


if __name__ == '__main__':
    main()
