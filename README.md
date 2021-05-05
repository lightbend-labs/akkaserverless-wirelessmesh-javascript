# Akka Serverless - Wireless Mesh Example App

A JavaScript-based example app for [Akka Serverless](https://developer.lightbend.com/docs/akka-serverless/)

Features include:

* Customer locations with wireless mesh devices

## What is this example?

To help you get started with Akka Serverless, we've built some example apps that showcase the capabilities of the platform. This example application mimics a company that uses Akka Serverless to keep track of the wireless mesh devices their customers have installed and the devices connected to the meshes.

In this example app you can interact with the devices, assign them to different rooms in the house, and turn them on or off. To make this example even more interactive, you can add an actual nightlight and switch the lights on or off.

We used the following akkaserverless capabilities: event sourced entity (wirelessmeshdomain.CustomerLocationEntity),
using an Action to publish to google pubsub (wirelessmesh.PublishingAction and publishing.proto) and using a View (wirelessmesh.CustomerLocationView and customerlocationview.proto) and finally
an Action to connect to the Lifx bulb (wirelessmesh.ToggleNightlightAction and devicecontrol.proto).

## Prerequisites

To build and deploy this example application, you'll need to have:

* An [Akka Serverless account](https://docs.cloudstate.com/getting-started/lightbend-account.html)
* Node.js v12 or higher installed
* The Docker CLI installed
* A [service account](https://cloud.google.com/docs/authentication/production) that can connect to Google Cloud Pubsub

## Build, Deploy, and Test

### Prepare your Google Cloud Pubsub

Create a Pub/Sub topic called 'wirelessmesh' under your own Google Cloud account.

To connect Akka Serverless to your Google Cloud Pub/Sub you must authenticate using a service account. To create your [service account](https://cloud.google.com/docs/authentication/production#cloud-console). After creating your service account, you need to download the service account key as a JSON file.

Now use the [akkasls](https://developer.lightbend.com/docs/akka-serverless/getting-started/set-up-development-env.html) command-line tool to give Akka Serverless access to your broker:

```
akkasls project set broker --broker-service gcp-pubsub --gcp-project-id testing-pubsub-310212 --gcp-key-file testing-pubsub-310212-fec7d0612927.json
```

### LIFX integration for toggling nightlight

If you have an LIFX bulb and would like it to stand in for a wirelessmesh device and have it light on/off when you toggle the device nightlight, you simply have to:
* Have an operational bulb
* When you create your customer location, be sure to set the access token to the authorizaton token you requested with LIFX.
* When you activate the device in this app, make sure it has the same device id as your bulb.
* More information [here][https://api.developer.lifx.com]

### Build your containers

To build your own container, execute the below commands:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Build a container for the service
docker build . -t $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest
```

of if you prefer `npm`, you can run

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Build a container for the service
npm run dockerbuild
```

### Deploy your container

To deploy the container as a service in Akka Serverless, you'll need to:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Push the containers to a container registry
docker push $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest

## Set your Akka Serverless project name
export AKKASLS_PROJECT=<your project>
akkasls svc deploy wirelessmesh $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest --project $AKKASLS_PROJECT
```

_The above command will deploy your container to your project with the name `wirelessmesh`. If you want to have a different name, you can change that._

### Testing your service

To test using Postman(or curl).
* First install Postman, [found here](https://www.postman.com)
* Assuming you have deployed to akkaserverless and exposed your service to 'winter-mountain-2372.us-east1.apps.akkaserverless.com'...
* Create a Postman POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/add-customer-location' with the json body '{"customer_location_id": "my-first-location", "access_token": "my lifx access token if applicable in alphanumeric"}'

Or using Curl (NOTE: Assume access_token is "abcd1234", you can set it to any alphanumeric):
```
export AS_HOST=winter-mountain-2372.us-east1.apps.akkaserverless.com

curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location", "access_token": "abcd1234"}' https://${AS_HOST}/wirelessmesh/add-customer-location
```
* You should see a response of '200(OK) {}', this will be the response of any POST
* You can now create a GET request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/get-customer-location?customer_location_id=my-first-location'

Or using Curl:
```
curl https://${AS_HOST}/wirelessmesh/get-customer-location?customer_location_id=my-first-location
```
* You should see a json response containing your customer location and no devices.
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/activate-device' with the body '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}'

Or using Curl:
```
curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}' https://${AS_HOST}/wirelessmesh/activate-device
```
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/assign-room' with the body '{"customer_location_id": "my-first-location", "device_id": "my-first-device", "room": "office"}'

Or using Curl:
```
curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location", "device_id": "my-first-device", "room": "office"}' https://${AS_HOST}/wirelessmesh/assign-room
```
* Create a POST requset to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/toggle-nightlight' with the body '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}'

Or using Curl:
```
curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}' https://${AS_HOST}/wirelessmesh/toggle-nightlight
```
* Rerun your get-customer-location request

Or using Curl:
```
curl https://${AS_HOST}/wirelessmesh/get-customer-location?customer_location_id=my-first-location
```
* You should see a json response with your customer location and a collection of your single device with the room assigned and the nightlight on
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/remove-device' with the body '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}'

Or using Curl:
```
curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location", "device_id": "my-first-device"}' https://${AS_HOST}/wirelessmesh/remove-device
```
* You should see a json response no longer containing any devices
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/remove-customer-location' with the body '{"customer_location_id": "my-first-location"}'

Or using Curl:
```
curl -X POST -H "Content-Type: application/json"  --data '{"customer_location_id": "my-first-location"}' https://${AS_HOST}/wirelessmesh/remove-customer-location
```
* Rerun your get-customer-location request and you will see a server error since it no longer exists.

Or using Curl:
```
curl https://${AS_HOST}/wirelessmesh/get-customer-location?customer_location_id=my-first-location
```

## Contributing

We welcome all contributions! [Pull requests](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/issues) first to discuss what you would like to change.

## Support

This project is provided on an as-is basis and is not covered by the Lightbend Support policy.

## License

See the [LICENSE](./LICENSE).
