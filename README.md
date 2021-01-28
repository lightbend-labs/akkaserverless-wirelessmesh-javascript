# Akka Serverless - Wireless Mesh Example App

A JavaScript-based example app for [Akka Serverless](https://developer.lightbend.com/docs/akka-serverless/)

Features include:

* Customer locations with wireless mesh devices
* Connectivity to Google Cloud Pubsub

## What is this example?

To help you get started with Akka Serverless, we've built some example apps that showcase the capabilities of the platform. This example application mimics a company that uses Akka Serverless to keep track of the wireless mesh devices their customers have installed and the devices connected to the meshes.

In this example app you can interact with the devices, assign them to different rooms in the house, and turn them on or off. To make this example even more interactive, you can add an actual nightlight and switch the lights on or off. 

## Prerequisites

To build and deploy this example application, you'll need to have:

* An [Akka Serverless account](https://docs.cloudstate.com/getting-started/lightbend-account.html)
* Node.js v12 or higher installed
* The Docker CLI installed
* A [service account](https://cloud.google.com/docs/authentication/production) that can connect to Google Cloud Pubsub

## Build, Deploy, and Test

### Prepare your Google Cloud Pubsub

To connect to Google Cloud Pubsub, the easiest method is authenticate using a service account. To create your [service account](https://cloud.google.com/docs/authentication/production#cloud-console). After creating your service account, you need to download the service account key as a JSON file called `mycreds.json`. Put this file in the folder containing your javascript code, in the case of this sample, the wirelessmesh folder.

Next, you'll need to build a base image that contains the `mycreds.json` file and sets the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the service account key. You can build the docker image with by running:

To publish events to google pubsub locally, use the 'export PUBLISH_EVENTS=ON' environment variable. Make sure to add this environment variable when you deply to akka serverless if you want to publish to google.

examples to set local variables for testing (macos):
* export GOOGLE_APPLICATION_CREDENTIALS='/Users/memyselfandI/Downloads/mycreds.json'
* export PUBLISH_EVENTS='ON'

Be sure to set those 2 during your akkaserverless deploy as well.

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

To test using Postman.
* First install Postman, [found here](https://www.postman.com)
* Assuming you have deployed to akkaserverless and exposed your service to 'winter-mountain-2372.us-east1.apps.akkaserverless.com'...
* Create a Postman POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/add-customer-location' with the json body '{"customerLocationId": "my-first-location", "accessToken": "my lifx access token if applicable"}'
* You should see a response of '200(OK) {}', this will be the response of any POST
* You can now create a GET request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/get-customer-location?customerLocationId=my-first-location'
* You should see a json response containing your customer location and no devices.
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/activate-device' with the body '{"customerLocationId": "my-first-location", "deviceId": "my-first-device"}'
* Create a POST requset to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/assign-room' with the body '{"customerLocationId": "my-first-location", "deviceId": "my-first-device", "room": "office"}'
* Create a POST requset to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/toggle-nightlight' with the body '{"customerLocationId": "my-first-location", "deviceId": "my-first-device"}'
* Rerun your get-customer-location request
* You should see a json response with your customer location and a collection of your single device with the room assigned and the nightlight on
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/remove-device' with the body '{"customerLocationId": "my-first-location", "deviceId": "my-first-device"}'
* You should see a json response no longer containing any devices
* Create a POST request to 'https://winter-mountain-2372.us-east1.apps.akkaserverless.com/wirelessmesh/remove-customer-location' with the body '{"customerLocationId": "my-first-location"}'
* Rerun your get-customer-location request and you will see a server error since it no longer exists.

## Contributing

We welcome all contributions! [Pull requests](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/issues) first to discuss what you would like to change.

## Support

This project is provided on an as-is basis and is not covered by the Lightbend Support policy.

## License

See the [LICENSE](./LICENSE).