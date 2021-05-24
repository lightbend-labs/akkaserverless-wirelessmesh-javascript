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

const Action = require("@lightbend/akkaserverless-javascript-sdk").Action

const action = new Action(
  "devicecontrol.proto",
  "devicecontrol.DeviceControlService",
  {
    includeDirs: ["./proto"]
  }
);

action.commandHandlers = {
  SendNightlightToggled: sendNightlightToggled,
  CatchOthers: CatchOthers
};

function sendNightlightToggled(nightlightToggled, context) {
  const bearer = 'Bearer ' + nightlightToggled.accessToken;
  fetch("https://api.lifx.com/v1/lights/" + nightlightToggled.deviceId + "/toggle", {
    method: 'POST',
    headers: {
      'Authorization': bearer
    }});

  return {};
}

function CatchOthers(event) {
  return {};
}

module.exports = action;
