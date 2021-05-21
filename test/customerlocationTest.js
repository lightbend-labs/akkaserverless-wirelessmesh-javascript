//import { MockEventSourcedEntity } from "./testkit.js";
const MockEventSourcedEntity = require("./testkit");
var chai = require("chai");
var expect = chai.expect;
const myserviceentity = require("../src/customerlocationentity.js");

describe("customerlocationentity", () => {
  const entityId = "entityId";
  const accessToken = "someaccesstoken";
  const email = "me@you.com"
  const deviceId = "deviceId1";
  const room = "living room";

  describe("AddCustomerLocation", () => {
    it("should succeed", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      const result = entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });

      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false, devices: []});
      expect(entity.events).to.deep.equal([{ type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email }]);
    });
  });

  describe("RemoveCustomerLocation", () => {
    it("should succeed", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      const result = entity.handleCommand("RemoveCustomerLocation", { customerLocationId: entityId });
      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: true, devices: []});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email },
        { type: "CustomerLocationRemoved", customerLocationId: entityId }
      ]);
    });
  });

  describe("ActivateDevice", () => {
    it("should succeed", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      const result = entity.handleCommand("ActivateDevice", { customerLocationId: entityId, deviceId: deviceId });
      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false,
        devices: [ { customerLocationId: entityId, deviceId: deviceId, activated: true, room: "", nightlightOn: false }]});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email },
        { type: "DeviceActivated", customerLocationId: entityId, deviceId: deviceId }
      ]);
    });
  });

  describe("RemoveDevice", () => {
    it("should succeed", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      entity.handleCommand("ActivateDevice", { customerLocationId: entityId, deviceId: deviceId });
      const result = entity.handleCommand("RemoveDevice", { customerLocationId: entityId, deviceId: deviceId });
      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false, devices: []});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email },
        { type: "DeviceActivated", customerLocationId: entityId, deviceId: deviceId },
        { type: "DeviceRemoved", customerLocationId: entityId, deviceId: deviceId }
      ]);
    });
  });

  describe("RemoveDevice", () => {
    it("should fail to remove nonexistent device", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      const result = entity.handleCommand("RemoveDevice", { customerLocationId: entityId, deviceId: deviceId });
      expect(result).to.deep.equal({});
      expect(entity.error).to.deep.equal("Device does not exist");
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false, devices: []});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email }
      ]);
    });
  });

  describe("AssignRoom", () => {
    it("should succeed", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      entity.handleCommand("ActivateDevice", { customerLocationId: entityId, deviceId: deviceId });
      const result = entity.handleCommand("AssignRoom", { customerLocationId: entityId, deviceId: deviceId, room: room });
      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false,
        devices: [ { customerLocationId: entityId, deviceId: deviceId, activated: true, room: room, nightlightOn: false }]});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email },
        { type: "DeviceActivated", customerLocationId: entityId, deviceId: deviceId },
        { type: "RoomAssigned", customerLocationId: entityId, deviceId: deviceId, room: room }
      ]);
    });
  });

  describe("ToggleNightlight", () => {
    it("should...", () => {
      const entity = new MockEventSourcedEntity(myserviceentity, entityId);
      entity.handleCommand("AddCustomerLocation", { customerLocationId: entityId, accessToken: accessToken, email: email });
      entity.handleCommand("ActivateDevice", { customerLocationId: entityId, deviceId: deviceId });
      const result = entity.handleCommand("ToggleNightlight", { customerLocationId: entityId, deviceId: deviceId });
      expect(result).to.deep.equal({});
      expect(entity.error).to.be.undefined;
      expect(entity.state).to.deep.equal({ customerLocationId: entityId, accessToken: accessToken, email: email, added: true, removed: false,
        devices: [ { customerLocationId: entityId, deviceId: deviceId, activated: true, room: "", nightlightOn: true }]});
      expect(entity.events).to.deep.equal([
        { type: "CustomerLocationAdded", customerLocationId: entityId, accessToken: accessToken, email: email },
        { type: "DeviceActivated", customerLocationId: entityId, deviceId: deviceId },
        { type: "NightlightToggled", customerLocationId: entityId, deviceId: deviceId, nightlightOn: true }
      ]);
    });
  });
});
