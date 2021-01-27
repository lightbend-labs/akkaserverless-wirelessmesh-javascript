// /*
//  * Copyright 2021 Lightbend Inc.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
//
// /**
//  * THIS SECTION SHOULD OPTIMALLY BE BROKEN OUT INTO A TESTKIT FOR REUSE.
//  */
//
// const path = require("path");
// const should = require("chai").should();
// const grpc = require("grpc");
// const protoLoader = require("@grpc/proto-loader");
// const protobuf = require("protobufjs");
// const protobufHelper = require("cloudstate/src/protobuf-helper");
// const AnySupport = require("cloudstate/src/protobuf-any");
//
// const allIncludeDirs = protobufHelper.moduleIncludeDirs.concat([
//   path.join(__dirname, "..", "node_modules", "cloudstate", "proto")
// ]);
//
// const packageDefinition = protoLoader.loadSync(
//   [
//     path.join( __dirname, "..", "node_modules", "cloudstate" ,"proto", "cloudstate", "entity.proto"),
//     path.join( __dirname, "..", "node_modules", "cloudstate" ,"proto", "cloudstate", "event_sourced.proto")
//   ],
//   {
//     //includeDirs: allIncludeDirs
//   });
// const descriptor = grpc.loadPackageDefinition(packageDefinition);
//
// const root = protobufHelper.loadSync([
//   path.join( __dirname, "..", "wirelessmeshservice.proto")
// ], allIncludeDirs);
// const anySupport = new AnySupport(root)
//
// // Start server
// const customerLocationEntity = require("../wirelessmesh.js");
// const CloudState = require("cloudstate").CloudState;
// const server = new CloudState();
// server.addEntity(customerLocationEntity);
//
// let discoveryClient;
// let eventSourcedClient;
//
// let commandId = 0;
//
// function invokeDiscover() {
//   return new Promise((resolve, reject) => {
//     discoveryClient.discover({}, (err, descriptor) => {
//       if (err) {
//         reject(err);
//       } else {
//         descriptor.entities.should.have.lengthOf(1);
//         resolve({
//           proto: descriptor.proto,
//           root: protobuf.Root.fromDescriptor({
//             file: [descriptor.proto]
//           }).resolveAll(),
//           serviceName: descriptor.entities[0].serviceName
//         });
//       }
//     });
//   });
// }
//
// function callAndInit(snapshot) {
//   const call = eventSourcedClient.handle();
//   call.write({
//     init: {
//       serviceName: "wirelessmeshservice.WirelessmeshService",
//       entityKey: customerLocationId,
//       snapshot: snapshot
//     }
//   });
//   return call;
// }
//
// function nextMessage(call) {
//   let done;
//   return new Promise((resolve, reject) => {
//     call.on("data", msg => {
//       done = true;
//       resolve(msg);
//     });
//     call.on("end", () => {
//       if (!done) {
//         reject("Stream finished before next data was received");
//       }
//     });
//   });
// }
//
// function fullNameOf(descriptor) {
//   function namespace(desc) {
//     if (desc.name === "") {
//       return "";
//     } else {
//       return namespace(desc.parent) + desc.name + ".";
//     }
//   }
//   return namespace(descriptor.parent) + descriptor.name;
// }
//
// function stripHostName(url) {
//   const idx = url.indexOf("/");
//   if (url.indexOf("/") >= 0) {
//     return url.substr(idx + 1);
//   } else {
//     // fail?
//     return url;
//   }
// }
//
// function sendCommand(call, name, payload) {
//   const cid = ++commandId;
//   call.write({
//     command: {
//       id: cid,
//       name: name,
//       payload: {
//         value: payload.constructor.encode(payload).finish(),
//         url: "type.googleapis.com/" + fullNameOf(payload.constructor.$type)
//       }
//     }
//   });
//   return nextMessage(call).then(msg => {
//     //console.log("xxxxx->" + JSON.stringify(msg));
//     should.exist(msg.reply);
//     msg.reply.commandId.toNumber().should.equal(cid);
//     should.exist(msg.reply.clientAction.reply);
//     msg.reply.decodedPayload = anySupport.deserialize(msg.reply.clientAction.reply.payload);
//     if (msg.reply.events) {
//       msg.reply.decodedEvents = msg.reply.events.map(event => {
//         return anySupport.deserialize(event);
//       });
//     }
//     return msg.reply;
//   });
// }
//
// function sendEvent(call, sequence, event) {
//   call.write({
//     "event": {
//       sequence: sequence,
//       payload: AnySupport.serialize(event, false, true, true)
//     }
//   })
// }
//
// /**
//  * END TESTKIT SECTION*************************************************
//  */
//
// // Customer location attributes under test
// const customerLocationId = "customerLocationId1";
// const accessToken = "someaccesstoken";
// const deviceId = "deviceId1";
// const room = "living room";
//
// /**
//  * Helper functions
//  */
//
// function addCustomerLocation(call, customerLocationId, accessToken) {
//   return sendCommand(call, "AddCustomerLocation", root.lookupType("wirelessmeshservice.AddCustomerLocationCommand").create({
//       customerLocationId: customerLocationId,
//       accessToken: accessToken
//     }));
// }
//
// function removeCustomerLocation(call, customerLocationId) {
//   return sendCommand(call, "RemoveCustomerLocation", root.lookupType("wirelessmeshservice.RemoveCustomerLocationCommand").create({
//       customerLocationId: customerLocationId
//     }));
// }
//
// function activateDevice(call, customerLocationId, deviceId) {
//   return sendCommand(call, "ActivateDevice", root.lookupType("wirelessmeshservice.ActivateDeviceCommand").create({
//       customerLocationId: customerLocationId,
//       deviceId: deviceId
//     }));
// }
//
// function removeDevice(call, customerLocationId, deviceId) {
//   return sendCommand(call, "RemoveDevice", root.lookupType("wirelessmeshservice.RemoveDeviceCommand").create({
//       customerLocationId: customerLocationId,
//       deviceId: deviceId
//     }));
// }
//
// function assignRoom(call, customerLocationId, deviceId, room) {
//   return sendCommand(call, "AssignRoom", root.lookupType("wirelessmeshservice.AssignRoomCommand").create({
//       customerLocationId: customerLocationId,
//       deviceId: deviceId,
//       room: room
//     }));
// }
//
// function toggleNightlight(call, customerLocationId, deviceId) {
//   return sendCommand(call, "ToggleNightlight", root.lookupType("wirelessmeshservice.ToggleNightlightCommand").create({
//       customerLocationId: customerLocationId,
//       deviceId: deviceId
//     }));
// }
//
// function getCustomerLocation(call, customerLocationId) {
//   return sendCommand(call, "GetCustomerLocation", root.lookupType("wirelessmeshservice.GetCustomerLocationCommand").create({
//       customerLocationId: customerLocationId
//     }));
// }
//
// describe("customer location", () => {
//
//   before("start customer location server", () => {
//     const port = server.start({
//       bindPort: 0
//     });
//     discoveryClient = new descriptor.cloudstate.EntityDiscovery("127.0.0.1:" + port, grpc.credentials.createInsecure());
//     eventSourcedClient = new descriptor.cloudstate.eventsourced.EventSourced("127.0.0.1:" + port, grpc.credentials.createInsecure());
//   });
//
//   after("shutdown customer location server", () => {
//     server.shutdown();
//   });
//
//   it("should create a customer location", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(reply => {
//       should.exist(reply.events);
//       reply.events[0].type_url.should.equal("json.cloudstate.io/CustomerLocationAdded")
//       reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//       reply.decodedEvents[0].accessToken.should.equal(accessToken);
//       should.not.exist(reply.snapshot);
//
//       return getCustomerLocation(call, customerLocationId);
//       }).then(reply => {
// 		    call.end();
//         reply.decodedPayload.added.should.equal(true);
//         reply.decodedPayload.removed.should.equal(false);
//         reply.decodedPayload.accessToken.should.equal(accessToken);
// 		    reply.decodedPayload.devices.should.be.empty;
//       });
//   });
//
//   it("should remove a customer location", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(reply => {
//       return removeCustomerLocation(call, customerLocationId)
//       }).then(reply => {
//         call.end();
//         should.exist(reply.events);
//         reply.events[0].type_url.should.equal("json.cloudstate.io/CustomerLocationRemoved")
//         reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//         should.not.exist(reply.snapshot);
//     });
//   });
//
//   it("should activate a device", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(_ => {
//       return activateDevice(call, customerLocationId, deviceId)
//       }).then(reply => {
//         should.exist(reply.events);
//         reply.events[0].type_url.should.equal("json.cloudstate.io/DeviceActivated")
//         reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//         reply.decodedEvents[0].deviceId.should.equal(deviceId);
//         should.not.exist(reply.snapshot);
//         return getCustomerLocation(call, customerLocationId)
//         .then(reply => {
//           call.end();
//           reply.decodedPayload.devices.length.should.equal(1);
//           reply.decodedPayload.devices[0].customerLocationId.should.equal(customerLocationId);
//           reply.decodedPayload.devices[0].deviceId.should.equal(deviceId);
//           reply.decodedPayload.devices[0].activated.should.equal(true);
//           reply.decodedPayload.devices[0].room.should.equal("");
//           reply.decodedPayload.devices[0].nightlightOn.should.equal(false);
//         });
//     });
//   });
//
//   it("should remove a device", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(_ => {
//       return activateDevice(call, customerLocationId, deviceId)
//       }).then(_ => {
//         return removeDevice(call, customerLocationId, deviceId)
//         .then(reply => {
//           should.exist(reply.events);
//           reply.events[0].type_url.should.equal("json.cloudstate.io/DeviceRemoved")
//           reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//           reply.decodedEvents[0].deviceId.should.equal(deviceId);
//           should.not.exist(reply.snapshot);
//           return getCustomerLocation(call, customerLocationId)
//           .then(reply => {
//             call.end();
//             reply.decodedPayload.devices.length.should.equal(0);
//           });
//         });
//     });
//   });
//
//   it("should assign a room", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(_ => {
//       return activateDevice(call, customerLocationId, deviceId)
//       }).then(_ => {
//         return assignRoom(call, customerLocationId, deviceId, room)
//         .then(reply => {
//           should.exist(reply.events);
//           reply.events[0].type_url.should.equal("json.cloudstate.io/RoomAssigned")
//           reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//           reply.decodedEvents[0].deviceId.should.equal(deviceId);
//           reply.decodedEvents[0].room.should.equal(room);
//           should.not.exist(reply.snapshot);
//           return getCustomerLocation(call, customerLocationId)
//           .then(reply => {
//             call.end();
//             reply.decodedPayload.devices.length.should.equal(1);
//             reply.decodedPayload.devices[0].room.should.equal(room);
//           });
//         });
//     });
//   });
//
//   it("should toggle the nightlight", () => {
//     const call = callAndInit();
//     return addCustomerLocation(call, customerLocationId, accessToken)
//     .then(_ => {
//       return activateDevice(call, customerLocationId, deviceId)
//       }).then(_ => {
//         return toggleNightlight(call, customerLocationId, deviceId)
//         .then(reply => {
//           should.exist(reply.events);
//           reply.events[0].type_url.should.equal("json.cloudstate.io/NightlightToggled")
//           reply.decodedEvents[0].customerLocationId.should.equal(customerLocationId);
//           reply.decodedEvents[0].deviceId.should.equal(deviceId);
//           reply.decodedEvents[0].nightlightOn.should.equal(true);
//           should.not.exist(reply.snapshot);
//           return getCustomerLocation(call, customerLocationId)
//           .then(reply => {
//             call.end();
//             reply.decodedPayload.devices.length.should.equal(1);
//             reply.decodedPayload.devices[0].nightlightOn.should.equal(true);
//           });
//         });
//     });
//   });
//
// });
