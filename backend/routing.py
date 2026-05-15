from django.urls import re_path
from . import chat_consumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room>\w+)/$', chat_consumer.ChatConsumer.as_asgi()),
]
