var bullmq = require('bullmq');
var IORedis = require('ioredis');

//Public
function BackgroundQueue(databaseObject) {
    this._databaseObject = databaseObject;
    this._queue = undefined;
};

/**
 * Creates a new queue for reading the sources in the background of the application
 */
BackgroundQueue.prototype.createQueue = function createQueue() {
    this._queue = new bullmq.Queue('source');
}

/**
 * Fills the queue with the configured sources
 */
BackgroundQueue.prototype.fillQueue = async function fillQueue() {
    if (!this._queue) {
        throw new Error("Please create the queue first with \"createQueue()\"");
    }

    // Add the queue entries hard coded at the moment without any configuration
    // TODO: Create a configuration file/configuration for the queue entries
    // TODO: Create a job scheduler which populates the queue. This needs to be refactored as soon as possible!!!!

    // TODO: Add this code as soon as possible when the Ui is ready at some point
    /*await this._queue.add('NewsBot', {
        module: "newsBot"
    }, {repeat: {every: 60000}});*/
    /*await this._queue.upsertJobScheduler('NewsBot', 
    {
        every: 120000
    },
    {
        data: {module: "newsBot"}
    });*/
}

/**
 * Starts the created queue and executes the logic of the modules put into the queue
 */
BackgroundQueue.prototype.startQueue = function startQueue() {
    // Create a connection to the redis cache for keeping track of the workers and their tasks/status
    var redisConnection = new IORedis({ maxRetriesPerRequest: null });

    // Create a new worker for reading the sources
    var worker = new bullmq.Worker(
      'source',
      async job => {
        // Call the module which was provided via the data definition
        var sourceModule = require('../source/' + job.data.module);
        var sourceModuleObject = new sourceModule();
        sourceModuleObject.readSource(this._databaseObject);
      },
      { connection: redisConnection },
    );

    // Log when the job finished or faild
    worker.on('completed', job => {
        console.log(`${job.id} has completed!`);
    });
      
    worker.on('failed', (job, err) => {
        console.log(`${job.id} has failed with ${err.message}`);
    });
}

module.exports = BackgroundQueue;