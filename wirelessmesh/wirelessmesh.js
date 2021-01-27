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

const EventSourced = require("cloudstate").EventSourced;
const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const pubsub = new PubSub({grpc});

console.log(process.env)

const entity = new EventSourced(
  ["wirelessmeshservice.proto", "wirelessmeshdomain.proto"],
  "wirelessmeshservice.WirelessmeshService",
  {
    persistenceId: "customer-location",
    snapshotEvery: 50,
    includeDirs: ["./"],
    serializeFallbackToJson: true // Enables JSON support for persistence
  }
);

/*
 * Set a callback to create the initial state. This is what is created if there is no
 * snapshot to load.
 *
 * The customerLocationId is the unique entity id
 */
entity.setInitial(customerLocationId => ({
  added: false,
  removed: false,
  accessToken: "",
  devices: []})
);

/*
 * Set a callback to create the behavior given the current state. Since there is no state
 * machine like behavior transitions in this customer location entity.
 *
 * This callback will be invoked after each time that an event is handled to get the current
 * behavior for the current state.
 *
 * @param entityState the last known state of this customer location as defined in the event handlers
 */
entity.setBehavior(entityState => {
  return {
    // Command handlers. The name of the command corresponds to the name of the rpc call.
    commandHandlers: {
      AddCustomerLocation: addCustomerLocation,
      RemoveCustomerLocation: removeCustomerLocation,
      ActivateDevice: activateDevice,
      RemoveDevice: removeDevice,
      AssignRoom: assignRoom,
      ToggleNightlight: toggleNightlight,
      GetCustomerLocation: getCustomerLocation
    },
    // Event handlers. The name of the event corresponds to the value of the type field in the event JSON.
    eventHandlers: {
      CustomerLocationAdded: customerLocationAdded,
      CustomerLocationRemoved: customerLocationRemoved,
      DeviceActivated: deviceActivated,
      DeviceRemoved: deviceRemoved,
      RoomAssigned: roomAssigned,
      NightlightToggled: nightlightToggled
    }
  };
});

/**
 * Publish event to google pubsub.
 * @param event
 * @returns {Promise<void>}
 */
async function publish(event) {
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

/**
 * This is the command handler for adding a customer location as defined in protobuf
 * @param addCustomerLocationCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.addCustomerLocation = function(addCustomerLocationCommand, entityState, ctx) {
  // Validate that the the command has not already been handled, i.e. not yet added.
  if (entityState.added) {
    ctx.fail("Customer location already added");
  }
  else {
    // Create the event.    
    const customerLocationAdded = {
      type: "CustomerLocationAdded",
      customerLocationId: addCustomerLocationCommand.customerLocationId,
      accessToken: addCustomerLocationCommand.accessToken
    };
    // Emit the event.
    ctx.emit(customerLocationAdded);
    publish(customerLocationAdded);
    return {};
  }
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

/**
 * This is the event handler for adding a customer location. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param customerLocationAdded the event previously emitted in the command handler, now safely stored
 * @param entityState the current state
 */
entity.customerLocationAdded = function(customerLocationAdded, entityState) {
  entityState.added = true;
  entityState.accessToken = customerLocationAdded.accessToken;

  // And return the new state.
  return entityState;
}

/**
 * This is the command handler for removing a customer location as defined in protobuf.
 * @param removeCustomerLocationCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.removeCustomerLocation = function(removeCustomerLocationCommand, entityState, ctx) {
  if (!entityState.added) {
    ctx.fail("Customer location does not exist");
  }
  else if (entityState.removed) {
    ctx.fail("Customer location already removed");
  }
  else {
    // Create the event.    
    const customerLocationRemoved = {
      type: "CustomerLocationRemoved",
      customerLocationId: removeCustomerLocationCommand.customerLocationId
    };
    // Emit the event.
    ctx.emit(customerLocationRemoved);
    publish(customerLocationRemoved);
    return {};
  }
}

/**
 * This is the event handler for removing a customer location. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param customerLocationRemoved the event previously emitted in the command handler, now safely stored
 * @param entityState the current state to be updated
 */
entity.customerLocationRemoved = function(customerLocationRemoved, entityState) {
  entityState.removed = true;

  // Return the new state.
  return entityState;
}

/**
 * This is the command handler for activating a wirelessmesh device as defined in protobuf.
 * @param activateDeviceCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.activateDevice = function(activateDeviceCommand, entityState, ctx) {
  if (entityState.removed) {
    ctx.fail("customerLocation does not exist");
  }
  else {
    const existing = entityState.devices.find(device => {
      return device.deviceId === activateDeviceCommand.deviceId;
    });

    if (existing) {
      ctx.fail("Device already activated");
    }
    else {
      // Create the event.    
      const deviceActivated = {
        type: "DeviceActivated",
        customerLocationId: activateDeviceCommand.customerLocationId,
        deviceId: activateDeviceCommand.deviceId
      };
      // Emit the event.
      ctx.emit(deviceActivated);
      publish(deviceActivated);
      return {};
    }
  }
}

/**
 * This is the event handler for activating a wirelessmesh device. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param deviceActivated the event previously emitted in the command handler, now safely stored
 * @param entityState the current state to be updated
 */
entity.deviceActivated = function(deviceActivated, entityState) {
  const device = {
    deviceId: deviceActivated.deviceId,
    customerLocationId: deviceActivated.customerLocationId,
    activated: true,
    nightlightOn: false,
    room: ""
  };

  entityState.devices.push(device);

  //console.log("deviceActivated location " + deviceActivated.customerLocationId + "->" + JSON.stringify(entityState.devices));

  // Return the new state.
  return entityState;
}

/**
 * This is the command handler for removing a wirelessmesh device as defined in protobuf
 * @param removeDeviceCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.removeDevice = function(removeDeviceCommand, entityState, ctx) {
  if (!entityState.added || entityState.removed) {
    ctx.fail("customerLocation does not exist");
  }
  else {
    const existing = entityState.devices.find(device => {
      return device.deviceId === removeDeviceCommand.deviceId;
    });

    if (!existing) {
      ctx.fail("Device does not exist");
    }
    else {
      // Create the event.    
        const deviceRemoved = {
        type: "DeviceRemoved",
        customerLocationId: removeDeviceCommand.customerLocationId,
        deviceId: removeDeviceCommand.deviceId
      };
      // Emit the event.
      ctx.emit(deviceRemoved);
      publish(deviceRemoved);
      return {};
    }
  }
}

/**
 * This is the event handler for removing a wirelessmesh device. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param deviceRemoved the event previously emitted in the command handler, now safely stored
 * @param entityState the current state to be updated
 */
entity.deviceRemoved = function(deviceRemoved, entityState) {
  entityState.devices = entityState.devices.filter(device => {
    return device.deviceId !== deviceRemoved.deviceId;
  })

  // Return the new state.
  return entityState;
}

/**
 * This is the command handler for assigning a wirelessmesh device to a room as defined in protobuf.
 * @param assignRoomCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.assignRoom =function(assignRoomCommand, entityState, ctx) {
  if (!entityState.added || entityState.removed) {
    ctx.fail("customerLocation does not exist");
  }
  else {
    const existing = entityState.devices.find(device => {
      return device.deviceId === assignRoomCommand.deviceId;
    });

    if (!existing) {
      ctx.fail("Device does not exist");
    }
    else {
      // Create the event.    
      const roomAssigned = {
        type: "RoomAssigned",
        customerLocationId: assignRoomCommand.customerLocationId,
        deviceId: assignRoomCommand.deviceId,
        room: assignRoomCommand.room
      };
      // Emit the event.
      ctx.emit(roomAssigned);
      publish(roomAssigned);
      return {};
    }
  }
}

/**
 * This is the event handler for assigning a wirelessmesh device to a room. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param roomAssigned the event previously emitted in the command handler, now safely stored
 * @param entityState the current state to be updated
 */
entity.roomAssigned = function(roomAssigned, entityState) {
  const existing = entityState.devices.find(device => {
    return device.deviceId === roomAssigned.deviceId;
  });

  existing.room = roomAssigned.room;

  // Return the new state.
  return entityState;
}

/**
 * This is the command handler for toggling the wirelessmesh device nightlight as defined in protobuf.
 * @param toggleNightlightCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.toggleNightlight = function(toggleNightlightCommand, entityState, ctx) {
  if (!entityState.added || entityState.removed) {
    ctx.fail("customerLocation does not exist");
  }
  else {
    const existing = entityState.devices.find(device => {
      return device.deviceId === toggleNightlightCommand.deviceId;
    });

    if (!existing) {
      ctx.fail("Device does not exist");
    }
    else {
      const nightlightToggled = {
        type: "NightlightToggled",
        customerLocationId: toggleNightlightCommand.customerLocationId,
        deviceId: toggleNightlightCommand.deviceId,
        nightlightOn: !existing.nightlightOn
      };

      // Emit the event.
      ctx.emit(nightlightToggled);
      publish(nightlightToggled);
      return {};
    }
  }
}

/**
 * This is the event handler for toggling the wirelessmesh device nightlight. It is here we update current state due to
 * successful storage to the eventlog.
 *
 * @param nightlightToggled the event previously emitted in the command handler, now safely stored
 * @param entityState the current state to be updated
 */
entity.nightlightToggled = function(nightlightToggled, entityState) {
  const existing = entityState.devices.find(device => {
    return device.deviceId === nightlightToggled.deviceId;
  });

  existing.nightlightOn = nightlightToggled.nightlightOn;

  // Return the new state.
  return entityState;
}

/**
 * This is the command handler geting the current state of the devices as defined in protobuf.
 * @param getCustomerLocationCommand the command message from protobuf
 * @param entityState the current state
 * @param ctx the application context
 * @return Empty (unused)
 */
entity.getCustomerLocation = function(getCustomerLocationCommand, entityState, ctx) {
  if (entityState.removed || !entityState.added) {
    ctx.fail("customerLocation does not exist");
  }
  else {
    return entityState;
  }
}

// Export the entity
module.exports = entity;
