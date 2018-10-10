module.exports = Observer;

function Observer () {
  this.subscribers = []
  
  this.subscribe = function (subscriber) {
    this.subscribers.push(subscriber);
  }
  this.inform = function (event) {
    this.subscribers.forEach(subscriber => subscriber.inform(event));
  }
}
