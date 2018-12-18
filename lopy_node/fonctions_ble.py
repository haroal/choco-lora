from network import Bluetooth


def conn_cb (bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")


def char1_cb_handler(chr):
    #global s
    global to_send, mutex
    events = chr.events()

    if events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(chr.value()))
        with mutex:
            to_send = to_send + [chr.value()]
        print("to_send = {}".format(to_send))
        chr1.value(bytes([False]))

    return(chr.value)
