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

const path = require("path");
const should = require("chai").should();
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const protobuf = require("protobufjs");
const protobufHelper = require("cloudstate/src/protobuf-helper");
const AnySupport = require("cloudstate/src/protobuf-any");

const allIncludeDirs = protobufHelper.moduleIncludeDirs.concat([
  path.join(__dirname, "..", "node_modules", "cloudstate", "proto")
]);

const packageDefinition = protoLoader.loadSync(
  [
    path.join( __dirname, "..", "node_modules", "cloudstate" ,"proto", "cloudstate", "entity.proto"),
    path.join( __dirname, "..", "node_modules", "cloudstate" ,"proto", "cloudstate", "event_sourced.proto")
  ],
  {
    //includeDirs: allIncludeDirs
  });
const descriptor = grpc.loadPackageDefinition(packageDefinition);

const root = protobufHelper.loadSync([
  path.join( __dirname, "..", "wirelessmeshservice.proto")
], allIncludeDirs);
const anySupport = new AnySupport(root)

// Start server
const customerLocationEntity = require("../wirelessmesh.js");
const CloudState = require("cloudstate").CloudState;
const server = new CloudState();
server.addEntity(customerLocationEntity);

let discoveryClient;
let eventSourcedClient;

let commandId = 0;

function invokeDiscover() {
  return new Promise((resolve, reject) => {
    discoveryClient.discover({}, (err, descriptor) => {
      if (err) {
        reject(err);
      } else {
        descriptor.entities.should.have.lengthOf(1);
        resolve({
          proto: descriptor.proto,
          root: protobuf.Root.fromDescriptor({
            file: [descriptor.proto]
          }).resolveAll(),
          serviceName: descriptor.entities[0].serviceName
        });
      }
    });
  });
}

function callAndInit(snapshot) {
  const call = eventSourcedClient.handle();
  call.write({
    init: {
      serviceName: "wirelessmeshservice.WirelessmeshService",
      entityKey: customerLocationId,
      snapshot: snapshot
    }
  });
  return call;
}

function nextMessage(call) {
  let done;
  return new Promise((resolve, reject) => {
    call.on("data", msg => {
      done = true;
      resolve(msg);
    });
    call.on("end", () => {
      if (!done) {
        reject("Stream finished before next data was received");
      }
    });
  });
}

function fullNameOf(descriptor) {
  function namespace(desc) {
    if (desc.name === "") {
      return "";
    } else {
      return namespace(desc.parent) + desc.name + ".";
    }
  }
  return namespace(descriptor.parent) + descriptor.name;
}

function stripHostName(url) {
  const idx = url.indexOf("/");
  if (url.indexOf("/") >= 0) {
    return url.substr(idx + 1);
  } else {
    // fail?
    return url;
  }
}

function sendCommand(call, name, payload) {
  const cid = ++commandId;
  call.write({
    command: {
      id: cid,
      name: name,
      payload: {
        value: payload.constructor.encode(payload).finish(),
        url: "type.googleapis.com/" + fullNameOf(payload.constructor.$type)
      }
    }
  });
  return nextMessage(call).then(msg => {
    should.exist(msg.reply);
    msg.reply.commandId.toNumber().should.equal(cid);
    should.exist(msg.reply.clientAction.reply);
    msg.reply.decodedPayload = anySupport.deserialize(msg.reply.clientAction.reply.payload);
    if (msg.reply.events) {
      msg.reply.decodedEvents = msg.reply.events.map(event => {
        return anySupport.deserialize(event);
      });
    }
    return msg.reply;
  });
}

function sendEvent(call, sequence, event) {
  call.write({
    "event": {
      sequence: sequence,
      payload: AnySupport.serialize(event, false, true, true)
    }
  })
}

function addCustomerLocation(call, command) {
  return sendCommand(call, "AddCustomerLocation", root.lookupType("wirelessmeshservice.AddCustomerLocationCommand").create(command));
}

function addCustomerLocation(call, command) {
  return sendCommand(call, "AddCustomerLocation", root.lookupType("wirelessmeshservice.AddCustomerLocationCommand").create(command));
}

function activateDevice(call, command) {
  return sendCommand(call, "ActivateDevice", root.lookupType("wirelessmeshservice.ActivateDeviceCommand").create(command));
}

function assignRoom(call, command) {
  return sendCommand(call, "AssignRoom", root.lookupType("wirelessmeshservice.AssignRoomCommand").create(command));
}

function getDevices(call, customerLocationId) {
  return sendCommand(call, "GetDevices", root.lookupType("wirelessmeshservice.GetDevicesCommand").create(customerLocationId));
}

const customerLocationId = "customerLocationId1";
const accessToken = "someaccesstoken";
const deviceId = "deviceId1";

describe("customer location", () => {

  before("start customer location server", () => {
    const port = server.start({
      bindPort: 0
    });
    console.log("descriptor", descriptor);
    discoveryClient = new descriptor.cloudstate.EntityDiscovery("127.0.0.1:" + port, grpc.credentials.createInsecure());
    eventSourcedClient = new descriptor.cloudstate.eventsourced.EventSourced("127.0.0.1:" + port, grpc.credentials.createInsecure());
  });

  after("shutdown customer location server", () => {
    server.shutdown();
  });

  it("should create a customer location", () => {
    const call = callAndInit();
    return addCustomerLocation(call, {
      customerLocationId: customerLocationId,
      accessToken: accessToken
    })
    .then(reply => {
      should.exist(reply.events);
      reply.events[0].type_url.should.equal("json.cloudstate.io/CustomerLocationAdded")
      reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
      reply.decodedEvents[0].accessToken.should.equal(accessToken);
      should.not.exist(reply.snapshot);
      call.end();
    });
  });

  it("should accept CustomerLocatedAdded event", () => {
    const call = callAndInit();
    sendEvent(call, 1, {
      type: "CustomerLocationAdded",
      customerLocationId: customerLocationId,
      accessToken: accessToken
    });
  });

  it("should activate a device", () => {
    const call = callAndInit();
    return activateDevice(call, {
      customerLocationId: customerLocationId,
      deviceId: deviceId
    })
    .then(reply => {
      should.exist(reply.events);
      should.not.exist(reply.snapshot);
      reply.events[0].type_url.should.equal("json.cloudstate.io/DeviceActivated")
      reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
      reply.decodedEvents[0].deviceId.should.equal(deviceId);
      call.end();
    });
  });

  it("should get devices", () => {
    const call = callAndInit();
    return getDevices(call, {
      customerLocationId: customerLocationId
    })
    .then(reply => {
      reply.decodedPayload.device.should.be.empty;
      call.end();
    });
  });

  // it("should assign a room to a device", () => {
  //   const call = callAndInit();
  //   return assignRoom(call, {
  //     customerLocationId: customerLocationId,
  //     deviceId: deviceId,
  //     room: "living room"
  //   })
  //   .then(reply => {
  //     should.exist(reply.events);
  //     should.not.exist(reply.snapshot);
  //     reply.events[0].type_url.should.equal("json.cloudstate.io/RoomAssigned")
  //     reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
  //     reply.decodedEvents[0].deviceId.should.equal(deviceId);
  //     reply.decodedEvents[0].room.should.equal("living room");
  //     call.end();
  //   });
  // });


});
