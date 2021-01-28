/*
 * Copyright 2021 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {PubSub} = require('@google-cloud/pubsub');

function eventPublisher() {

  // Check if publishing is on or off.
  let publishOn = process.env.PUBLISH_EVENTS && process.env.PUBLISH_EVENTS === "ON"

  return {
    /**
     * Publish event to google pubsub.
     * @param event
     * @returns {Promise<void>}
     */
    async publish(event) {
      if (publishOn === true) {
        const pubSubClient = new PubSub();
        const dataBuffer = Buffer.from(JSON.stringify(event));
        const topicName = "wirelessmesh";

        try {
          const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
          console.log(`Message ${messageId} published.`);
        } catch (error) {
          console.error(`Received error while publishing: ${error.message}`);
          process.exitCode = 1;
        }
      }
    },
  };
}

module.exports = eventPublisher();
