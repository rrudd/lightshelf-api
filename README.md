# lightshelf-api
An express based back end for maintaining a library

## Setup
In order to run this project [MongoDB](https://www.mongodb.org/downloads), [node.js and npm](https://nodejs.org/en/download/) need to be installed and working.

Make sure you have an instance of MongoDB running, either locally or through a sevice such as [mLab](https://mlab.com/).

You will also need to set two new environment variables: `LIGHTSHELF_DB` with the url to the MongoDB instance and `LIGHTSHELF_SECRET` with your own secret key for JWT authentication. Alternativelly you can just enter them as strings in `config.js`.

After this, user `npm install` and `npm start` to run the service normally.
