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
const View = require("@lightbend/akkaserverless-javascript-sdk").View;

const entity = new View(
  ["customerlocationview.proto"],
  "customerlocationview.CustomerLocationByEmailService",
  {
    viewId: "customer-location-view"
  }
);

view.setUpdateHandlers({
    "UpdateCustomerLocation": updateCustomerLocation
});

function updateUser(customerLocationAdded, previousViewState, ctx) {
    return {
        "customerLocationId": customerLocationAdded.customerLocationId,
        "email": customerLocationAdded.email
    };
}

module.exports = view;
