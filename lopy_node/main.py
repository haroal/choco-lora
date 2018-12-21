from network import Bluetooth
from network import LoRa
from machine import Timer
import socket
import struct
import time
import _thread
import select
from config import *
#from fonctions_lora import *
#from fonctions_ble import *

# Definition des variables globales
to_send = []
rx_data = []
enable_send_to_lora = False
poll_again = True
message_sent_to_lora = False
msg = b''
cpt = 0
length_totale = 0

######################### Initialisation du bluetooth ##########################
bluetooth = Bluetooth()
bluetooth.set_advertisement(name=NAME, service_uuid=service_uuid)
bluetooth.advertise(True)

# Definition du service et des caracteristiques
service = bluetooth.service(uuid=service_uuid, nbr_chars=4, isprimary=True)
char_send = service.characteristic(uuid=char_send_uuid, properties=Bluetooth.PROP_WRITE)
char_sent = service.characteristic(uuid=char_sent_uuid, properties=Bluetooth.PROP_NOTIFY)
char_receive = service.characteristic(uuid=char_receive_uuid, properties=Bluetooth.PROP_NOTIFY)
char_lora_ready = service.characteristic(uuid=char_lora_ready_uuid, properties=Bluetooth.PROP_NOTIFY|Bluetooth.PROP_READ, value=b'\x00')

def test(*arg):
    char_receive.value(b'test')
    print(b'test')

alarme_test = None
def bt_connection_cb(bt_o):
    global enable_send_to_lora, alarme_test
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
        enable_send_to_lora = True
        alarme_test = Timer.Alarm(handler=test, s=2.0, periodic=True)
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")
        enable_send_to_lora = False
        alarme_test.cancel()

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=bt_connection_cb)

############################ Initialisation du LoRa ############################
# Initialize LoRa in LORAWAN mode.
lora = LoRa(mode=LoRa.LORAWAN)

# set the 3 default channels to the same frequency (must be done before sending the OTAA join request)
lora.add_channel(0, frequency=868100000, dr_min=0, dr_max=5)
lora.add_channel(1, frequency=868100000, dr_min=0, dr_max=5)
lora.add_channel(2, frequency=868100000, dr_min=0, dr_max=5)

# join a network using OTAA
lora.join(activation=LoRa.OTAA, auth=(DEV_EUI, APP_EUI, APP_KEY), timeout=0)

# wait until the module has joined the network
while not lora.has_joined():
    time.sleep(2.5)
    print('Not joined yet...')
print("Joined")
char_lora_ready.value(b'\x01')

# remove all the non-default channels
for i in range(3, 16):
    lora.remove_channel(i)

# create a LoRa socket
s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
# set the LoRaWAN data rate
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)
# set acknowledgment
s.setsockopt(socket.SOL_LORA, socket.SO_CONFIRMED, True)
# make the socket non-blocking
s.setblocking(False)

################################### Polling ####################################
def polling(*arg):
    global message_sent_to_lora
    if enable_send_to_lora:
        rliste, wliste, elist = select.select([], [s], [], 0.05)
        if len(wliste) != 0:
            s.send(b'\x01')
            message_sent_to_lora = False
            print("Poll sent")

alarme = Timer.Alarm(handler=polling, s=POLLING_INTERVAL, periodic=True)

############ Ecriture dans la socket loRa des messages recus en BLE ############
def write_lora():
    global alarme, poll_again, message_sent_to_lora
    while True:
        if enable_send_to_lora:
            rliste, wliste, elist = select.select([], [s], [], 0.05)
            if len(wliste) != 0 and len(to_send) != 0:
                with mutex:
                    poll_again = False
                    alarme.cancel()
                    s.send(bytes(to_send[0]))
                    message_sent_to_lora = True
                    print("sent = {}".format(to_send[0]))
                    del to_send[0]
                    alarme = Timer.Alarm(handler=polling, s=POLLING_INTERVAL, periodic=True)

############# Lectrure des messages recus par LoRa et envoi en BLE #############
def read_lora():
    while True:
        rliste, wliste, elist = select.select([s], [], [], 0.05)
        if len(rliste) != 0:
            rx_data = s.recv(256)
            print("recu {}".format(rx_data))
            rx_data = MAGIC_CODE + bytes([len(rx_data)]) + rx_data
            print("to send to phone = {}".format(rx_data))
            while len(rx_data) > TAILLE_MSG_BLE:
                char_receive.value(rx_data[:20])
                rx_data = rx_data[20:]
                #time.sleep(0.5)
            if len(rx_data) <= TAILLE_MSG_BLE:
                char_receive.value(rx_data)

################ Debut des threads de lecture et ecriture lora #################
mutex = _thread.allocate_lock()
_thread.start_new_thread(write_lora, to_send)
_thread.start_new_thread(read_lora, rx_data)

########################### Gestion des events LoRa ############################
def lora_cb(lora):
    global poll_again, message_sent_to_lora
    events = lora.events()
    if events & LoRa.RX_PACKET_EVENT:
        print("received from lora", lora.stats())
        if poll_again:
            polling()
    if events & LoRa.TX_PACKET_EVENT:
        print("sent to lora")
        if message_sent_to_lora:
            char_sent.value(bytes([True]))
        poll_again = True
        message_sent_to_lora = False
    if events & LoRa.TX_FAILED_EVENT:
        print("failed to lora")
        if message_sent_to_lora:
            char_receive.value(b'erreur lors de l\'envoi')

lora.callback(trigger=(LoRa.RX_PACKET_EVENT | LoRa.TX_PACKET_EVENT), handler=lora_cb)

######################### Reception des messages BLE ###########################
def on_send_message(char):
    global to_send, msg, cpt, length_totale

    events = char.events()
    if events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(char.value()))
        if char.value()[:2] == MAGIC_CODE:
            length_totale = char.value()[2]
            msg = char.value()[3:]
            cpt = len(msg)
        else:
            while cpt + len(char.value()) <= length_totale:
                cpt = cpt + len(char.value())
                msg = msg + char.value()
        if cpt == length_totale:
            with mutex:
                to_send = to_send + [msg]
            print("to_send = {}".format(to_send))
            msg = b''
            length_totale = 0
            cpt = 0

    return(char.value)

char_send_cb = char_send.callback(trigger=Bluetooth.CHAR_WRITE_EVENT, handler=on_send_message)
