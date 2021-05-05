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

import { should } from 'chai';
import customerlocationentity from "../src/customerlocationentity.js";

// Customer location attributes under test
const customerLocationId = "customerLocationId1";
const accessToken = "someaccesstoken";
const deviceId = "deviceId1";
const room = "living room";

// We mock the context to be passed into our function.
function mockContext() {
    return {
        failures: [],
        events: [],
        fail(failure) {
            this.failures.push(failure);
        },
        emit(event) {
            this.events.push(event);
        },
        reset() {
          this.events = [];
          this.failures = [];
        }
    };
}

// The starting state of the entity.
function defaultState() {
  return {
    added: false,
    removed: false,
    accessToken: "",
    devices: []
  };
}

describe("customer location", () => {

  it("should create a customer location", () => {
    const state = defaultState();
    const context = mockContext();
    console.log(context);

    customerlocationentity.addCustomerLocation(
    {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
    context);

    context.failures.length.should.equal(0);
    context.events.length.should.equal(1);
    context.events[0].type.should.equal("CustomerLocationAdded")
    context.events[0].customerLocationId.should.equal(customerLocationId);
    context.events[0].accessToken.should.equal(accessToken);

    // Send the event and check state is updated.
    customerlocationentity.customerLocationAdded(context.events[0], state);
    state.added.should.equal(true);
    state.removed.should.equal(false);
    state.accessToken.should.equal(accessToken);
  });

  it("should remove a customer location", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
     {customerLocationId: customerLocationId, accessToken: accessToken},
     state,
     context);
    entity.customerLocationAdded(context.events[0], state);

    context.reset();
    entity.removeCustomerLocation(
     {customerLocationId: customerLocationId},
      state,
      context);

    // Send the event and check state is updated.
    entity.customerLocationRemoved(context.events[0], state);
    context.failures.length.should.equal(0);
    state.removed.should.equal(true);
    context.events[0].type.should.equal("CustomerLocationRemoved")
    context.events[0].customerLocationId.should.equal(customerLocationId);

    const response = entity.getCustomerLocation(
      {customerLocationId: customerLocationId},
       state,
       context);

    context.failures.length.should.equal(1);
    context.failures[0].should.equal("customerLocation does not exist")
  });

  it("should activate a device", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
      {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
      context);
    entity.customerLocationAdded(context.events[0], state);

    context.reset();
    entity.activateDevice({customerLocationId: customerLocationId, deviceId, deviceId},
    state,
    context)

    context.failures.length.should.equal(0);
    context.events.length.should.equal(1);
    context.events[0].type.should.equal("DeviceActivated")
    context.events[0].customerLocationId.should.equal(customerLocationId);
    context.events[0].deviceId.should.equal(deviceId);

    // Send the event and check state is updated.
    entity.deviceActivated(context.events[0], state);
    state.devices.length.should.equal(1);
    state.devices[0].customerLocationId.should.equal(customerLocationId);
    state.devices[0].deviceId.should.equal(deviceId);
    state.devices[0].room.should.equal("");
    state.devices[0].nightlightOn.should.equal(false);
  });

  it("should remove a device", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
      {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
      context);
    entity.customerLocationAdded(context.events[0], state);
    context.reset();
    entity.activateDevice({customerLocationId: customerLocationId, deviceId, deviceId},
      state,
      context)
    entity.deviceActivated(context.events[0], state);

    context.reset();
    entity.removeDevice(
      {customerLocationId: customerLocationId, deviceId: deviceId},
      state,
      context);

    context.failures.length.should.equal(0);
    context.events.length.should.equal(1);
    context.events[0].type.should.equal("DeviceRemoved")
    context.events[0].customerLocationId.should.equal(customerLocationId);
    context.events[0].deviceId.should.equal(deviceId);

    // Send the event and check state is updated.
    entity.deviceRemoved(context.events[0], state)
    state.devices.length.should.equal(0);
  });

  it("should assign a room to a device", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
      {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
      context);
    entity.customerLocationAdded(context.events[0], state);
    context.reset();
    entity.activateDevice({customerLocationId: customerLocationId, deviceId, deviceId},
      state,
      context)
    entity.deviceActivated(context.events[0], state);

    context.reset();
    entity.assignRoom(
      {customerLocationId: customerLocationId, deviceId: deviceId, room: room},
      state,
      context);

    context.failures.length.should.equal(0);
    context.events.length.should.equal(1);
    context.events[0].type.should.equal("RoomAssigned")
    context.events[0].customerLocationId.should.equal(customerLocationId);
    context.events[0].deviceId.should.equal(deviceId);
    context.events[0].room.should.equal(room);

    // Send the event and check state is updated.
    entity.roomAssigned(context.events[0], state)
    state.devices.length.should.equal(1);
    state.devices[0].room.should.equal(room);
  });

  it("toggle a device nightlight", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
      {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
      context);
    entity.customerLocationAdded(context.events[0], state);
    context.reset();
    entity.activateDevice({customerLocationId: customerLocationId, deviceId, deviceId},
      state,
      context)
    entity.deviceActivated(context.events[0], state);

    context.reset();
    entity.toggleNightlight(
      {customerLocationId: customerLocationId, deviceId: deviceId},
      state,
      context);

    context.failures.length.should.equal(0);
    context.events.length.should.equal(1);
    context.events[0].type.should.equal("NightlightToggled")
    context.events[0].customerLocationId.should.equal(customerLocationId);
    context.events[0].deviceId.should.equal(deviceId);
    context.events[0].nightlightOn.should.equal(true);

    // Send the event and check state is updated.
    entity.nightlightToggled(context.events[0], state)
    state.devices.length.should.equal(1);
    state.devices[0].nightlightOn.should.equal(true);
  });

  it("should get a customer location", () => {
    const state = defaultState();
    const context = mockContext();
    entity.addCustomerLocation(
      {customerLocationId: customerLocationId, accessToken: accessToken},
      state,
      context);
    entity.customerLocationAdded(context.events[0], state);
    context.reset();
    entity.activateDevice({customerLocationId: customerLocationId, deviceId, deviceId},
      state,
      context)
    entity.deviceActivated(context.events[0], state);

    const response = entity.getCustomerLocation(
      {customerLocationId: customerLocationId},
      state,
      context);

    context.failures.length.should.equal(0);
    response.added.should.equal(true);
    response.removed.should.equal(false);
    response.devices.length.should.equal(1);
    response.accessToken.should.equal(accessToken);
    response.devices[0].customerLocationId.should.equal(customerLocationId);
    response.devices[0].deviceId.should.equal(deviceId);
    response.devices[0].activated.should.equal(true);
    response.devices[0].room.should.equal("");
    response.devices[0].nightlightOn.should.equal(false);
  });

});
