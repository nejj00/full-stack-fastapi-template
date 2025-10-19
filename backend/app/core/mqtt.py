import json
import random
import ssl
from typing import Any

from paho.mqtt import client as mqtt_client
from sqlmodel import Session

from app.core.config import settings
from app.crud import create_item
from app.core.db import engine
from app.models import ItemCreate
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def on_connect(client: mqtt_client.Client, userdata: Any, flags: dict, rc: int) -> None:
    if rc == 0:
        logger.info("Connected to MQTT Broker!")
        client.subscribe("python/mqtt")
    else:
        logger.error(f"Failed to connect, return code {rc}")


def on_message(client: mqtt_client.Client, userdata: Any, msg: mqtt_client.MQTTMessage) -> None:
    try:
        payload = json.loads(msg.payload.decode())
        item_data = ItemCreate(
            title=payload["title"],
            description=payload["description"]
        )
        owner_id = payload["owner_id"]
        
        with Session(engine) as session:
            create_item(session=session, item_in=item_data, owner_id=owner_id)
            logger.info(f"Successfully created item from MQTT message: {payload['title']}")

    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")


def get_mqtt_client() -> mqtt_client.Client:
    # Generate client ID with pub prefix randomly
    client_id = f'fastapi-mqtt-{random.randint(0, 1000)}'
    
    client = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION1, client_id)
    
    # Set up TLS if certificates are configured
    if hasattr(settings, "MQTT_CA_CERTS"):
        client.tls_set(
            ca_certs=settings.MQTT_CA_CERTS,
            cert_reqs=ssl.CERT_REQUIRED,
            tls_version=ssl.PROTOCOL_TLS,
        )
    
    # Set username and password if configured
    if hasattr(settings, "MQTT_USERNAME") and hasattr(settings, "MQTT_PASSWORD"):
        client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)
    
    # Set callbacks
    client.on_connect = on_connect
    client.on_message = on_message
    
    return client