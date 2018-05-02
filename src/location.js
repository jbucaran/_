function wrapHistory(keys) {
  return keys.reduce(function(next, key) {
    var fn = history[key]

    // Do not wrap if it's already wrapped
    if(history[key].toString().indexOf(`CustomEvent("pushstate"`) !== -1){
      return function(){};
    }
    
    history[key] = function(data, title, url) {
      fn.call(this, data, title, url)
      dispatchEvent(new CustomEvent("pushstate", { detail: data }))
    }

    return function() {
      history[key] = fn
      next && next()
    }
  }, null)
}

export var location = {
  state: {
    pathname: window.location.pathname,
    previous: window.location.pathname
  },
  actions: {
    go: function(pathname) {
      history.pushState(null, "", pathname)
    },
    set: function(data) {
      return data
    }
  },
  subscribe: function(actions) {
    function handleLocationChange(e) {
      actions.set({
        pathname: window.location.pathname,
        previous: e.detail
          ? (window.location.previous = e.detail)
          : window.location.previous
      })
    }

    var unwrap = wrapHistory(["pushState", "replaceState"])

    addEventListener("pushstate", handleLocationChange)
    addEventListener("popstate", handleLocationChange)
    // Trigger actions.set
    handleLocationChange({detail: null});

    return function() {
      removeEventListener("pushstate", handleLocationChange)
      removeEventListener("popstate", handleLocationChange)
      unwrap()
    }
  }
}
