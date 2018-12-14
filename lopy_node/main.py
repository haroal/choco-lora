from network import Bluetooth
from network import LoRa
import socket
import ubinascii
import struct
import time
import _thread
import select

# Initialize LoRa in LORAWAN mode.
lora = LoRa(mode=LoRa.LORAWAN)

# create an OTA authentication params
dev_eui = ubinascii.unhexlify('70B3D5499C9DE16D') # these settings can be found from TTN
app_eui = ubinascii.unhexlify('70B3D57ED001572E') # these settings can be found from TTN
app_key = ubinascii.unhexlify('8F50858456F7AA41D4FE7E1C4093F58A') # these settings can be found from TTN

# set the 3 default channels to the same frequency (must be before sending the OTAA join request)
lora.add_channel(0, frequency=868100000, dr_min=0, dr_max=5)
lora.add_channel(1, frequency=868100000, dr_min=0, dr_max=5)
lora.add_channel(2, frequency=868100000, dr_min=0, dr_max=5)

# join a network using OTAA
lora.join(activation=LoRa.OTAA, auth=(dev_eui, app_eui, app_key), timeout=0)

# wait until the module has joined the network
while not lora.has_joined():
    time.sleep(2.5)
    print('Not joined yet...')
print("joined")
# remove all the non-default channels
for i in range(3, 16):
    lora.remove_channel(i)

# create a LoRa socket
s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

# set the LoRaWAN data rate
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)

# set acquittement
s.setsockopt(socket.SOL_LORA, socket.SO_CONFIRMED, True)

# make the socket non-blocking
s.setblocking(False)

# mutex to protec variable to_send
mutex = _thread.allocate_lock()
to_send = []

def write_lora():
    while True:
        rliste, wliste, elist = select.select([], [s], [], 0.05)
        if len(wliste) != 0:
            with mutex:
                if len(to_send) != 0:
                    s.send(bytes(to_send[0]))
                    print("sent = {}".format(to_send[0]))
                    del to_send[0]

_thread.start_new_thread(write_lora, to_send)

rx_data = []

bluetooth = Bluetooth()
bluetooth.set_advertisement(name='LoPy', service_uuid=b'1234567890123456')

srv1 = bluetooth.service(uuid=b'1234567890123456', nbr_chars = 2, isprimary=True)

chr1 = srv1.characteristic(uuid=b'ab34567890123456', properties=Bluetooth.PROP_WRITE)
chr2 = srv1.characteristic(uuid=b'cd34567890123456', properties=Bluetooth.PROP_NOTIFY)

def read_lora():
    while True:
        rliste, wliste, elist = select.select([s], [], [], 0.05)
        if len(rliste) != 0:
            rx_data = s.recv(256)
            print("recu {}".format(rx_data))
            chr2.value(rx_data)

_thread.start_new_thread(read_lora, rx_data)

def lora_cb(lora):
    events = lora.events()
    if events & LoRa.RX_PACKET_EVENT:
        print("received")
        stats = lora.stats()
    if events & LoRa.TX_PACKET_EVENT:
        print("sent")
    if events & LoRa.TX_FAILED_EVENT:
        print("failed")

lora.callback(trigger=(LoRa.RX_PACKET_EVENT | LoRa.TX_PACKET_EVENT), handler=lora_cb)



def conn_cb (bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)

bluetooth.advertise(True)

### code



def char1_cb_handler(chr):
    #global s
    global to_send
    events = chr.events()

    if events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(chr.value()))
        with mutex:
            to_send = to_send + [chr.value()]
        print("to_send = {}".format(to_send))

    return(chr.value)

char1_cb = chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT, handler=char1_cb_handler)
