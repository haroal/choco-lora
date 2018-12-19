from network import Bluetooth
from network import LoRa
from machine import Timer
import socket
import ubinascii
import struct
import time
import _thread
import select
#from fonctions_lora import *
#from fonctions_ble import *

def uuid2bytes(uuid):
    uuid = uuid.encode().replace(b'-',b'')
    tmp = ubinascii.unhexlify(uuid)
    return bytes(reversed(tmp))

service1_uuid = uuid2bytes("a65d3800-99f5-4e5e-85ab-fdd531c0aafa")
char1_uuid = uuid2bytes("a65d3801-99f5-4e5e-85ab-fdd531c0aafa")
char2_uuid = uuid2bytes("a65d3802-99f5-4e5e-85ab-fdd531c0aafa")

MAGIC_CODE = b'\xca\xfe'
TAILLE_MSG_BLE = 20

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

to_send = []
rx_data = []
poll_again = True
message_sent_to_lora = False

def polling(*arg):
    global message_sent_to_lora
    rliste, wliste, elist = select.select([], [s], [], 0.05)
    if len(wliste) != 0:
    #with mutex_poll:
        s.send(b'\x01')
        message_sent_to_lora = False
        print("sent poll")

    #time.sleep(30)

alarme = Timer.Alarm(handler = polling, s = 30.0, periodic = True)

def write_lora():
    global alarme, poll_again, message_sent_to_lora
    while True:
        rliste, wliste, elist = select.select([], [s], [], 0.05)
        if len(wliste) != 0 and len(to_send) != 0:
            with mutex:
                poll_again = False
                alarme.cancel()
                s.send(bytes(to_send[0]))
                message_sent_to_lora = True
                print("sent = {}".format(to_send[0]))
                del to_send[0]
                alarme = Timer.Alarm(handler = polling, s = 30.0, periodic = True)

def read_lora():
    while True:
        rliste, wliste, elist = select.select([s], [], [], 0.05)
        if len(rliste) != 0:
            rx_data = s.recv(256)
            print("recu {}".format(rx_data))
            rx_data = MAGIC_CODE + bytes([len(rx_data)]) + rx_data
            print("to send to phone = {}".format(rx_data))
            while len(rx_data) > TAILLE_MSG_BLE:
                chr2.value(rx_data[:20])
                rx_data = rx_data[20:]
                #time.sleep(0.5)
            if len(rx_data) <= TAILLE_MSG_BLE:
                chr2.value(rx_data)



# Debut des threads de lecture et ecriture lora
mutex = _thread.allocate_lock()
#mutex_poll = _thread.allocate_lock()
_thread.start_new_thread(write_lora, to_send)
_thread.start_new_thread(read_lora, rx_data)
#_thread.start_new_thread(polling, ())



# Initialisation du bluetooth
bluetooth = Bluetooth()
bluetooth.set_advertisement(name='LoPy', service_uuid=service1_uuid)
bluetooth.advertise(True)

# Definition du service et des caracteristiques
srv1 = bluetooth.service(uuid=service1_uuid, nbr_chars = 2, isprimary=True)
chr1 = srv1.characteristic(uuid=char1_uuid, properties=Bluetooth.PROP_WRITE | Bluetooth.PROP_NOTIFY)
chr2 = srv1.characteristic(uuid=char2_uuid, properties=Bluetooth.PROP_NOTIFY)

def lora_cb(lora):
    global poll_again, message_sent_to_lora
    events = lora.events()
    if events & LoRa.RX_PACKET_EVENT:
        print("received from lora")
        stats = lora.stats()
        if poll_again:
            polling()
    if events & LoRa.TX_PACKET_EVENT:
        print("sent to lora")
        if message_sent_to_lora:
            chr1.value(bytes([True]))
        #else:
        #    chr1.value(bytes([False]))
        poll_again = True
        message_sent_to_lora = False
    if events & LoRa.TX_FAILED_EVENT:
        print("failed to lora")

def conn_cb (bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

msg = b''
cpt = 0
length_totale = 0

def char1_cb_handler(chr):
    #global s
    global to_send, msg, cpt, length_totale
    events = chr.events()


    if events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(chr.value()))
        if chr.value()[:2] == MAGIC_CODE:
            #print("magic code ok")
            length_totale = chr.value()[2]
            #print(length_totale)
            msg = chr.value()[3:]
            #print(msg)
            cpt = len(msg)
            #print(cpt)

        else:
            while cpt + len(chr.value()) <= length_totale:
                #print("ok")
                #print("cpt = {}".format(cpt))
                cpt = cpt + len(chr.value())
                msg = msg + chr.value()
        if cpt == length_totale:
            with mutex:
                to_send = to_send + [msg]
            print("to_send = {}".format(to_send))
            msg = b''
            length_totale = 0
            cpt = 0

    return(chr.value)

lora.callback(trigger=(LoRa.RX_PACKET_EVENT | LoRa.TX_PACKET_EVENT), handler=lora_cb)

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)

char1_cb = chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT, handler=char1_cb_handler)
