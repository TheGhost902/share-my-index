(function () {
    let socket = new WebSocket(`ws://${window.location.host}/ws`)
    socket.onopen = () => console.log('WS: open')
    socket.onmessage = () => {
        socket.close(1000)
        location.reload(true)
    }
})()