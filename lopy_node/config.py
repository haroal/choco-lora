import ubinascii

# Constantes
MAGIC_CODE = b'\xCA\xFE'
TAILLE_MSG_BLE = 20
NAME = 'Lopy2'
POLLING_INTERVAL = 30

# LoRaWAN OTAA authentication params (these settings can be found from TTN)
APP_EUI = ubinascii.unhexlify('70B3D57ED001572E')
# Lopy-node
DEV_EUI = ubinascii.unhexlify('70B3D5499C9DE16D')
APP_KEY = ubinascii.unhexlify('8F50858456F7AA41D4FE7E1C4093F58A')
# Lopy-node2
# DEV_EUI = ubinascii.unhexlify('70B3D549951B13C3')
# APP_KEY = ubinascii.unhexlify('F9A86DD8B9BFA653E6694BD8FAB8FAD7')

# UUID Bluetooth Low Energy
def uuid2bytes(uuid):
    uuid = uuid.encode().replace(b'-',b'')
    tmp = ubinascii.unhexlify(uuid)
    return bytes(reversed(tmp))

service_uuid = uuid2bytes("a65d3800-99f5-4e5e-85ab-fdd531c0aafa")
char_send_uuid = uuid2bytes("a65d3801-99f5-4e5e-85ab-fdd531c0aafa")
char_sent_uuid = uuid2bytes("a65d3802-99f5-4e5e-85ab-fdd531c0aafa")
char_receive_uuid = uuid2bytes("a65d3803-99f5-4e5e-85ab-fdd531c0aafa")
char_lora_ready_uuid = uuid2bytes("a65d3804-99f5-4e5e-85ab-fdd531c0aafa")
