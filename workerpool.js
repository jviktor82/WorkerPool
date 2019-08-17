var WorkerPool;

WorkerPool = (function() {
  WorkerPool.FEED   = "WORKER_FEED";
  WorkerPool.ERROR  = "WORKER_ERROR";
  WorkerPool.RESULT = "WORKER_RESULT";
  
  function WorkerPool() {
    this.numWorker = 5;
    this.numWorking= 0;
    this.arrFreeWorkers = [];
    this.myMap = new Map();
    this.funcWorkerBody = "";
  }
  
  function addNewWorkerToPool()
  {
    var worker = new Worker(URL.createObjectURL(new Blob(["("+this.funcWorkerBody.toString()+")()"], {type: 'text/javascript'})));
    if (typeof this.initData !== "undefined")
    {
      worker.postMessage(this.initData);
    }
    this.arrFreeWorkers.push(worker);

    var pool = this;
    
    worker.onmessage = function(event) {
      pool.numWorking--;
      var handler = pool.myMap.get(WorkerPool.RESULT);
      if (typeof handler !== "undefined")
      {
        setTimeout(function(){ handler(event.data); }, 0);
      }
      if (addToFreeWorkers.call(pool, worker)) /* try to add to the Pool */
      {
        setTimeout(function(){ needFeed.call(pool); }, 0);
      }
      else
      {
        this.terminate(); /* denied to add: terminate the thread */
      }
    };

    worker.onerror = function(event) {
      var handler = myMap.get(WorkerPool.ERROR);
      if (typeof handler !== "undefined")
      {
        setTimeout(function(){ handler(event); }, 0);
      }
      addNewWorkerToPool.call(pool);
      this.terminate();
    };
  }
  
  function buildEngine()
  {
    this.arrFreeWorkers = [];
    for (var i=1; i <= this.numWorker; i++)
    {
      addNewWorkerToPool.call(this);
    }
  }
  
  function addToFreeWorkers(worker)
  {
    if (this.numWorker > (this.arrFreeWorkers.length + this.numWorking))
    {
      this.arrFreeWorkers.push(worker);
      return true;
    }
    return false;
  }
  
  function needFeed()
  {
    var handler = this.myMap.get(WorkerPool.FEED);
    if (typeof handler !== "undefined" && this.arrFreeWorkers.length > 0)
    {
      setTimeout(handler, 0);
    }
  }
  
  /**
    @param body: function
  */
  WorkerPool.prototype.setWorkerBody = function(func)
  {
    this.funcWorkerBody = func;
  };
  
  WorkerPool.prototype.setWorkerNum = function(num)
  {
    this.numWorker = num;
  };
  
  WorkerPool.prototype.setWorkerInitData = function(data)
  {
    this.initData = data;
  };

  /**
    @param eventName: WorkerPool.FEED, WorkerPool.RESULT, WorkerPool.ERROR
    @param handler  : function()
  */
  WorkerPool.prototype.on = function(eventName, handler) {
    this.myMap.set(eventName, handler);
  };

  WorkerPool.prototype.start = function() {
    buildEngine.call(this);
    var numFreeWorker = this.arrFreeWorkers.length;
    for (var i = 1; i <= numFreeWorker; i++) {
      needFeed.call(this);
    }
  };
  
  WorkerPool.prototype.feed = function(item) {
    var worker = this.arrFreeWorkers.pop();
    if (typeof worker !== "undefined")
    {
      this.numWorking++;
      worker.postMessage(item);
    } else if (typeof this.myMap.get(WorkerPool.ERROR) !== "undefined")
    {
      var handler = this.myMap.get(WorkerPool.ERROR);
      setTimeout(function() { handler(item);}, 0);
    }
  };
  
  WorkerPool.prototype.getWorkersStat = function() {
    return { 'free' : this.arrFreeWorkers.length, 'all' : this.numWorker };
  };
  
  WorkerPool.prototype.clearPool = function() {
    this.arrFreeWorkers.forEach(function(worker)
    {
      worker.terminate();
    });
    this.arrFreeWorkers = [];
  };
  
  WorkerPool.prototype.addWorker = function() {
    this.numWorker++;
    addNewWorkerToPool.call(this);
    needFeed.call(this);
  };
  
  WorkerPool.prototype.removeWorker = function() {
    if (this.numWorker > 1)
    {
      this.numWorker--;
    }
  };

  return WorkerPool;

})();