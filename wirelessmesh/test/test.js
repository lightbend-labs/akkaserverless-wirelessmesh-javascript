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

/**
 * THIS SECTION SHOULD OPTIMALLY BE BROKEN OUT INTO A TESTKIT FOR REUSE.
 */

import {addCustomerLocation} from '../wirelessmesh.js';

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


// Customer location attributes under test
const customerLocationId = "customerLocationId1";
const accessToken = "someaccesstoken";
const deviceId = "deviceId1";
const room = "living room";

describe("customer location", () => {

  it("should create a customer location", () => {

    const entityState = {
      added: false,
      removed: false,
      accessToken: "",
      devices: []
    };

    const context = jest.fn(event => console.log(event));
    const response = addCustomerLocation(
        {customerLocationId: customerLocationId, accessToken: accessToken},
        entityState,
        context);

    console.log(response);
  });
});
