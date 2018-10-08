module.exports = Observer;

function Observer () {
  this.subscribers = []
  
  this.subscribe = function (subscriber) {
    this.subscribers.push(subscriber);
  }
  this.inform(event) {
    this.subscribers.forEach(subscriber => subscriber.inform(event));
  }
}
