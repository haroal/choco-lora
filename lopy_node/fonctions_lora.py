from network import LoRa
import select


def write_lora(to_send, s, mutex):
    while True:
        rliste, wliste, elist = select.select([], [s], [], 0.05)
        if len(wliste) != 0:
            with mutex:
                if len(to_send) != 0:
                    s.send(bytes(to_send[0]))
                    print("sent = {}".format(to_send[0]))
                    del to_send[0]


def read_lora(rx_data, s, mutex):
    while True:
        rliste, wliste, elist = select.select([s], [], [], 0.05)
        if len(rliste) != 0:
            rx_data = s.recv(256)
            print("recu {}".format(rx_data))
            chr2.value(rx_data)


def lora_cb(lora):
    events = lora.events()
    if events & LoRa.RX_PACKET_EVENT:
        print("received")
        stats = lora.stats()
    if events & LoRa.TX_PACKET_EVENT:
        print("sent")
        chr1.value(bytes([True]))
    if events & LoRa.TX_FAILED_EVENT:
        print("failed")
