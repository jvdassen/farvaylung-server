module.exports = Observer;

function Observer () {
  this.subscribers = []
  
  Observer.prototype.subscribe = function (subscriber) {
    this.subscribers.push(subscriber);
  }
  Observer.prototype.inform = function (event) {
    this.subscribers.forEach(subscriber => subscriber.inform(event));
  }
}
